import "server-only";
import { createSign } from "node:crypto";
import { unstable_cache } from "next/cache";
import { SITE_URL } from "./site";

/*
 * Google Search Console (Search Analytics API): páginas con clics reales en
 * búsqueda. Suma "tracción real" a la compuerta de síntesis con IA: además de
 * las notas destacadas, generan síntesis las que reciben clics desde Google
 * (aunque ya no estén en portada).
 *
 * Requiere una service account con acceso de lectura a la propiedad:
 * GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY (+ GSC_PROPERTY si difiere de SITE_URL/).
 * Sin credenciales devuelve vacío y la compuerta queda solo en "destacadas".
 * Los datos de GSC llegan con ~1-2 días de retraso: a las notas nuevas las
 * cubre la compuerta de destacadas.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DAYS = 3;

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

/** Access token OAuth2 de la service account (flujo JWT RS256, sin SDK). */
async function accessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  // Vercel guarda la key multilínea tal cual; también se acepta con "\n" escapados.
  const signature = signer.sign(privateKey.replace(/\\n/g, "\n"));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${b64url(signature)}`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

interface GscRow {
  keys: string[];
  clicks: number;
}

async function fetchTopClickedIds(): Promise<string[]> {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY;
  if (!clientEmail || !privateKey) return [];
  const property = process.env.GSC_PROPERTY ?? `${SITE_URL}/`;

  const token = await accessToken(clientEmail, privateKey);
  const day = (offset: number) =>
    new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);

  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: day(DAYS),
        endDate: day(0),
        dimensions: ["page"],
        rowLimit: 250,
      }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!res.ok) throw new Error(`searchAnalytics ${res.status}`);
  const rows = (((await res.json()) as { rows?: GscRow[] }).rows ?? []);

  const ids = new Set<string>();
  for (const row of rows) {
    if (row.clicks < 1) continue;
    const m = /\/a\/([a-z0-9]+)/.exec(row.keys[0] ?? "");
    if (m) ids.add(m[1]);
  }
  console.log(`[gsc] ${ids.size} notas con clics en búsqueda (últimos ${DAYS} días)`);
  return [...ids];
}

// 6 h: los datos de GSC llegan con días de retraso; refrescar más no aporta.
const cachedTopClicked = unstable_cache(fetchTopClickedIds, ["gsc-top-clicked-v1"], {
  revalidate: 21_600,
});

/** ¿Está la nota entre las que reciben clics reales desde Google? */
export async function isTopClicked(articleId: string): Promise<boolean> {
  try {
    return (await cachedTopClicked()).includes(articleId);
  } catch (error) {
    console.warn(
      `[gsc] fallo consultando Search Console: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}
