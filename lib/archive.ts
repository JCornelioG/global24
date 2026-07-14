import "server-only";
import { unstable_cache } from "next/cache";
import type { Article, Locale } from "./types";

/*
 * Archivo permanente de artículos en Upstash Redis (API REST, sin SDK).
 *
 * Las noticias solo viven en los pools mientras están en los feeds RSS: al
 * rotar, sus URLs (/[lang]/a/[id]) devolvían 404 a los pocos días y el SEO
 * acumulado se perdía. Acá se guarda cada artículo visto (sin TTL) para que
 * su página siga viva para siempre.
 *
 * Credenciales: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (la
 * integración de Vercel también puede inyectarlas como KV_REST_API_*). Sin
 * ellas, todo degrada a no-op y el sitio se comporta como antes.
 *
 * Presupuesto de comandos (tier gratis): ~3 por refresco de pool
 * (SMISMEMBER + MSET + SADD) y 1 GET por artículo archivado cada 24 h
 * (las lecturas se cachean en la Data Cache).
 */

function creds(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function pipeline(commands: (string | number)[][]): Promise<{ result: unknown }[]> {
  const c = creds();
  if (!c) throw new Error("archivo sin configurar");
  const res = await fetch(`${c.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return (await res.json()) as { result: unknown }[];
}

const key = (lang: Locale, id: string) => `a:${lang}:${id}`;

/** Archiva los artículos que aún no estén guardados. Nunca lanza. */
export async function archiveArticles(lang: Locale, articles: Article[]): Promise<void> {
  if (!creds() || articles.length === 0) return;
  try {
    const ids = articles.map((a) => a.id);
    const [known] = await pipeline([["SMISMEMBER", `aidx:${lang}`, ...ids]]);
    const flags = known.result as number[];
    const fresh = articles.filter((_, i) => flags[i] === 0);
    if (fresh.length === 0) return;
    await pipeline([
      ["MSET", ...fresh.flatMap((a) => [key(lang, a.id), JSON.stringify(a)])],
      ["SADD", `aidx:${lang}`, ...fresh.map((a) => a.id)],
    ]);
    console.log(`[archive] ${fresh.length} artículos nuevos archivados (${lang})`);
  } catch (error) {
    console.warn(
      `[archive] fallo guardando: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function fetchArchived(lang: Locale, id: string): Promise<Article | null> {
  const [got] = await pipeline([["GET", key(lang, id)]]);
  const raw = got.result as string | null;
  return raw ? (JSON.parse(raw) as Article) : null;
}

// 24 h en la Data Cache: los bots visitan las URLs viejas repetidamente y no
// tiene sentido ir a Redis cada vez; el artículo archivado es inmutable.
const cachedArchived = unstable_cache(fetchArchived, ["article-archive-v1"], {
  revalidate: 86_400,
});

/** Artículo archivado (ya fuera de los pools), o null si no existe. */
export async function getArchivedArticle(lang: Locale, id: string): Promise<Article | null> {
  if (!creds()) return null;
  try {
    return await cachedArchived(lang, id);
  } catch (error) {
    console.warn(
      `[archive] fallo leyendo: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}
