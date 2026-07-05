import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CATEGORIES, googleNewsCategoryFeed, googleNewsHomeFeed } from "./categories";
import { normalizeTitle, stableId, stripHtml } from "./format";
import { fetchGdelt } from "./gdelt";
import { fetchRss, type RssItem } from "./rss";
import { CATEGORY_SLUGS, type Article, type CategorySlug, type Locale } from "./types";

const CATEGORY_LIMIT = 30;

/**
 * Google News entrega los títulos como "Titular - Medio"; se recorta el
 * sufijo solo si deja un titular razonable.
 */
function cleanGoogleTitle(raw: string): string {
  const idx = raw.lastIndexOf(" - ");
  return idx > 20 ? raw.slice(0, idx).trim() : raw.trim();
}

function toArticle(
  item: RssItem,
  category: CategorySlug,
  lang: Locale,
  opts: { fromGoogle?: boolean } = {},
): Article | null {
  if (!item.title || !/^https?:\/\//.test(item.link)) return null;
  const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
  const description = item.description ? stripHtml(item.description).slice(0, 240) : undefined;
  return {
    id: stableId(item.link),
    title: opts.fromGoogle ? cleanGoogleTitle(item.title) : item.title,
    url: item.link,
    source: item.source ?? "",
    publishedAt: (Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt).toISOString(),
    image: item.image,
    // Las descripciones de Google News son HTML de titulares relacionados: se omiten.
    description: opts.fromGoogle ? undefined : description,
    category,
    lang,
  };
}

/** Conserva el primer artículo por título normalizado. */
function dedupe(articles: Article[], seen = new Set<string>()): Article[] {
  const out: Article[] = [];
  for (const a of articles) {
    const key = normalizeTitle(a.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

function byDateDesc(a: Article, b: Article): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** GDELT con tope duro de espera: si la cola/red tarda más, la categoría no lo espera. */
async function gdeltWithBudget(query: string, lang: Locale, budgetMs = 9000): Promise<Article[]> {
  const timeout = new Promise<[]>((resolve) => setTimeout(() => resolve([]), budgetMs));
  const request = fetchGdelt(query, lang).then((articles) =>
    articles.map(
      (a): Article => ({
        id: stableId(a.url),
        title: a.title,
        url: a.url,
        source: a.source ?? "",
        publishedAt: a.publishedAt ?? new Date().toISOString(),
        image: a.image,
        category: "internacional",
        lang,
      }),
    ),
  );
  return Promise.race([request, timeout]);
}

async function buildCategoryNews(lang: Locale, category: CategorySlug): Promise<Article[]> {
  const cfg = CATEGORIES[category];

  const [publisherResults, googleItems, gdeltArticles] = await Promise.all([
    Promise.allSettled(cfg.feeds[lang].map((url) => fetchRss(url))),
    fetchRss(googleNewsCategoryFeed(category, lang)),
    gdeltWithBudget(cfg.gdeltQuery[lang], lang),
  ]);

  const publisherArticles = publisherResults
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .map((item) => toArticle(item, category, lang))
    .filter((a): a is Article => a !== null);

  const googleArticles = googleItems
    .map((item) => toArticle(item, category, lang, { fromGoogle: true }))
    .filter((a): a is Article => a !== null);

  const gdeltCategorized = gdeltArticles.map((a) => ({ ...a, category }));

  // Con imagen primero (tarjetas), luego titulares de Google (listas).
  const seen = new Set<string>();
  const withImage = dedupe(
    [...publisherArticles, ...gdeltCategorized].filter((a) => a.image).sort(byDateDesc),
    seen,
  );
  const withoutImage = dedupe(
    [...googleArticles, ...publisherArticles.filter((a) => !a.image)],
    seen,
  );

  const result = [...withImage, ...withoutImage].slice(0, CATEGORY_LIMIT);
  // Un resultado vacío (fallo total de fuentes) se lanza para NO cachearlo
  // 10 minutos: el caller degrada a [] y el próximo render reintenta.
  if (result.length === 0) throw new Error("sin fuentes disponibles");
  return result;
}

async function buildTopNews(lang: Locale): Promise<Article[]> {
  // Titulares curados de la portada de Google News + lo mejor con imagen
  // de las categorías principales (que ya están cacheadas o se cachean acá).
  const heroCategories: CategorySlug[] = ["internacional", "politica", "negocios", "tecnologia", "deportes"];
  const [homeItems, sectionResults] = await Promise.all([
    fetchRss(googleNewsHomeFeed(lang)),
    Promise.allSettled(heroCategories.map((slug) => categoryNews(lang, slug))),
  ]);

  const headlines = homeItems
    .map((item) => toArticle(item, "internacional", lang, { fromGoogle: true }))
    .filter((a): a is Article => a !== null);

  const imaged = sectionResults
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((a) => a.image)
    .sort(byDateDesc);

  // El set de vistos se siembra SOLO con los 10 que quedan: si se sembrara con
  // todo el pool con imagen, titulares duplicados de artículos descartados por
  // el slice desaparecerían de la portada.
  const topImaged = dedupe(imaged).slice(0, 10);
  const seen = new Set(topImaged.map((a) => normalizeTitle(a.title)));
  const result = [...topImaged, ...dedupe(headlines, seen)].slice(0, 40);
  if (result.length === 0) throw new Error("sin fuentes disponibles");
  return result;
}

const cachedCategory = unstable_cache(buildCategoryNews, ["news-category"], { revalidate: 600 });
const cachedTop = unstable_cache(buildTopNews, ["news-top"], { revalidate: 600 });

/* React cache() deduplica llamadas dentro de un mismo render. */
const categoryNews = cache((lang: Locale, category: CategorySlug) => cachedCategory(lang, category));
const topNews = cache((lang: Locale) => cachedTop(lang));

export async function getNewsByCategory(
  lang: Locale,
  category: CategorySlug,
  limit = CATEGORY_LIMIT,
): Promise<Article[]> {
  try {
    return (await categoryNews(lang, category)).slice(0, limit);
  } catch {
    return [];
  }
}

/** Portada: primeros ~10 con imagen (hero/tarjetas) + titulares sin imagen. */
export async function getTopNews(lang: Locale, limit = 40): Promise<Article[]> {
  try {
    return (await topNews(lang)).slice(0, limit);
  } catch {
    return [];
  }
}

/** Busca un artículo por id en todos los pools cacheados (portada + categorías). */
export async function findArticle(lang: Locale, id: string): Promise<Article | null> {
  const pools = await Promise.allSettled([
    topNews(lang),
    ...CATEGORY_SLUGS.map((slug) => categoryNews(lang, slug)),
  ]);
  for (const pool of pools) {
    if (pool.status !== "fulfilled") continue;
    const hit = pool.value.find((a) => a.id === id);
    if (hit) return hit;
  }
  return null;
}

const STOPWORDS = new Set([
  "para", "por", "con", "las", "los", "una", "del", "que", "este", "esta", "tras", "sobre", "entre",
  "the", "and", "for", "with", "from", "that", "this", "after", "over", "into", "amid",
]);

function titleTokens(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(" ")
      .filter((w) => w.length > 3 && !STOPWORDS.has(w)),
  );
}

/** Cobertura relacionada: solapamiento de palabras del titular; completa con la misma categoría. */
export async function relatedArticles(lang: Locale, article: Article, limit = 6): Promise<Article[]> {
  const pools = await Promise.allSettled([
    categoryNews(lang, article.category),
    topNews(lang),
  ]);
  const candidates = dedupe(
    pools.flatMap((p) => (p.status === "fulfilled" ? p.value : [])).filter((a) => a.id !== article.id),
  );

  const tokens = titleTokens(article.title);
  const scored = candidates
    .map((candidate) => {
      let score = 0;
      for (const token of titleTokens(candidate.title)) {
        if (tokens.has(token)) score++;
      }
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score || byDateDesc(a.candidate, b.candidate));

  const matched = scored.filter((s) => s.score > 0).map((s) => s.candidate);
  const filler = scored.filter((s) => s.score === 0).map((s) => s.candidate);
  return [...matched, ...filler].slice(0, limit);
}

/** Noticias de las 9 categorías para la home; tolera fallos parciales. */
export async function getHomeSections(lang: Locale): Promise<Record<CategorySlug, Article[]>> {
  const results = await Promise.allSettled(
    CATEGORY_SLUGS.map((slug) => categoryNews(lang, slug)),
  );
  const sections = {} as Record<CategorySlug, Article[]>;
  CATEGORY_SLUGS.forEach((slug, i) => {
    const r = results[i];
    sections[slug] = r.status === "fulfilled" ? r.value.slice(0, 12) : [];
  });
  return sections;
}
