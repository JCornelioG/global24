import type { CategorySlug, Locale } from "./types";

export interface CategoryConfig {
  slug: CategorySlug;
  label: { es: string; en: string };
  /** Topic oficial de Google News (feed headlines/section/topic/...). */
  googleTopic?: string;
  /** Query para el feed de búsqueda de Google News cuando no hay topic. */
  googleQuery?: { es: string; en: string };
  /** Query para GDELT DOC 2.0 (enriquecimiento con imágenes, opcional). */
  gdeltQuery: { es: string; en: string };
  /** Feeds RSS de medios que sí incluyen imágenes (media:content / enclosure). */
  feeds: { es: string[]; en: string[] };
}

const EP = "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section";
const GUARDIAN = "https://www.theguardian.com";
const NYT = "https://rss.nytimes.com/services/xml/rss/nyt";
const BBC = "https://feeds.bbci.co.uk";

export const CATEGORIES: Record<CategorySlug, CategoryConfig> = {
  internacional: {
    slug: "internacional",
    label: { es: "Internacional", en: "World" },
    googleTopic: "WORLD",
    gdeltQuery: { es: "(internacional OR mundo OR conflicto)", en: "(world OR international)" },
    feeds: {
      es: [`${BBC}/mundo/rss.xml`, `${EP}/internacional/portada`],
      en: [`${BBC}/news/world/rss.xml`, `${GUARDIAN}/world/rss`, `${NYT}/World.xml`],
    },
  },
  politica: {
    slug: "politica",
    label: { es: "Política", en: "Politics" },
    googleQuery: { es: "política", en: "politics" },
    gdeltQuery: { es: "(política OR gobierno OR elecciones)", en: "(politics OR government OR elections)" },
    feeds: {
      es: [`${EP}/espana/portada`, `${EP}/america/portada`],
      en: [`${GUARDIAN}/politics/rss`, `${NYT}/Politics.xml`],
    },
  },
  negocios: {
    slug: "negocios",
    label: { es: "Negocios", en: "Business" },
    googleTopic: "BUSINESS",
    gdeltQuery: { es: "(economía OR mercados OR empresas)", en: "(economy OR markets OR business)" },
    feeds: {
      es: [`${EP}/economia/portada`],
      en: [`${GUARDIAN}/business/rss`, `${NYT}/Business.xml`],
    },
  },
  tecnologia: {
    slug: "tecnologia",
    label: { es: "Tecnología", en: "Technology" },
    googleTopic: "TECHNOLOGY",
    gdeltQuery: { es: "(tecnología OR inteligencia artificial)", en: "(technology OR artificial intelligence)" },
    feeds: {
      es: [`${EP}/tecnologia/portada`],
      en: [`${GUARDIAN}/technology/rss`, `${NYT}/Technology.xml`],
    },
  },
  ciencia: {
    slug: "ciencia",
    label: { es: "Ciencia", en: "Science" },
    googleTopic: "SCIENCE",
    gdeltQuery: { es: "(ciencia OR investigación científica)", en: "(science OR research)" },
    feeds: {
      es: [`${EP}/ciencia/portada`],
      en: [`${GUARDIAN}/science/rss`, `${NYT}/Science.xml`],
    },
  },
  salud: {
    slug: "salud",
    label: { es: "Salud", en: "Health" },
    googleTopic: "HEALTH",
    gdeltQuery: { es: "(salud OR medicina)", en: "(health OR medicine)" },
    feeds: {
      es: [`${EP}/salud-y-bienestar/portada`],
      en: [`${BBC}/news/health/rss.xml`, `${NYT}/Health.xml`],
    },
  },
  deportes: {
    slug: "deportes",
    label: { es: "Deportes", en: "Sports" },
    googleTopic: "SPORTS",
    gdeltQuery: { es: "(fútbol OR deportes OR mundial)", en: "(football OR soccer OR sports)" },
    feeds: {
      es: [
        `${EP}/deportes/portada`,
        "https://www.mundodeportivo.com/rss/home.xml",
        "https://e00-marca.uecdn.es/rss/futbol/mundial.xml",
      ],
      en: [`${BBC}/sport/rss.xml`, `${GUARDIAN}/sport/rss`],
    },
  },
  artes: {
    slug: "artes",
    label: { es: "Artes", en: "Arts" },
    googleQuery: { es: "arte OR cultura", en: "arts OR culture" },
    gdeltQuery: { es: "(arte OR cultura OR literatura)", en: "(art OR culture OR literature)" },
    feeds: {
      es: [`${EP}/cultura/portada`],
      en: [`${GUARDIAN}/culture/rss`, `${NYT}/Arts.xml`],
    },
  },
  entretenimiento: {
    slug: "entretenimiento",
    label: { es: "Entretenimiento", en: "Entertainment" },
    googleTopic: "ENTERTAINMENT",
    gdeltQuery: { es: "(cine OR series OR música OR celebridades)", en: "(movies OR series OR music OR celebrities)" },
    feeds: {
      es: [`${EP}/gente/portada`],
      en: [`${BBC}/news/entertainment_and_arts/rss.xml`, "https://variety.com/feed/"],
    },
  },
};

/** Orden del menú de navegación. */
export const NAV_ORDER: CategorySlug[] = [
  "internacional",
  "politica",
  "negocios",
  "tecnologia",
  "ciencia",
  "salud",
  "deportes",
  "artes",
  "entretenimiento",
];

export function categoryLabel(slug: CategorySlug, lang: Locale): string {
  return CATEGORIES[slug].label[lang];
}

/** URL del feed principal de Google News para un idioma. */
export function googleNewsHomeFeed(lang: Locale): string {
  return lang === "es"
    ? "https://news.google.com/rss?hl=es-419&gl=MX&ceid=MX:es-419"
    : "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
}

/** URL del feed de Google News (topic o búsqueda) para una categoría. */
export function googleNewsCategoryFeed(slug: CategorySlug, lang: Locale): string {
  const cfg = CATEGORIES[slug];
  const params =
    lang === "es" ? "hl=es-419&gl=MX&ceid=MX:es-419" : "hl=en-US&gl=US&ceid=US:en";
  if (cfg.googleTopic) {
    return `https://news.google.com/rss/headlines/section/topic/${cfg.googleTopic}?${params}`;
  }
  const q = encodeURIComponent(cfg.googleQuery?.[lang] ?? cfg.label[lang]);
  return `https://news.google.com/rss/search?q=${q}&${params}`;
}
