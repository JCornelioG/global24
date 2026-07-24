import type { MetadataRoute } from "next";
import { getIndexableSitemapArticles } from "@/lib/indexing";
import { SITE_URL } from "@/lib/site";
import { CATEGORY_SLUGS, LOCALES } from "@/lib/types";

// 1 h: mismo ritmo que los pools de noticias; el sitemap refleja cada tanda nueva.
export const revalidate = 3600;

interface SitemapPath {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}

const PATHS: SitemapPath[] = [
  { path: "", changeFrequency: "hourly", priority: 1 },
  { path: "/mundial", changeFrequency: "hourly", priority: 0.9 },
  ...CATEGORY_SLUGS.map((slug) => ({
    path: `/c/${slug}`,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  })),
  { path: "/contacto", changeFrequency: "monthly", priority: 0.3 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const statics = PATHS.flatMap(({ path, changeFrequency, priority }) => {
    const languages = {
      ...Object.fromEntries(LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])),
      // Igual que el hreflang on-page: x-default apunta a la versión en español.
      "x-default": `${SITE_URL}/es${path}`,
    };
    return LOCALES.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });

  // Recuperación SEO: pocas notas en español, destacadas y confirmadas en el
  // archivo permanente. Si Redis falla, ninguna URL efímera entra al sitemap.
  const indexable = await getIndexableSitemapArticles();
  const articles: MetadataRoute.Sitemap = indexable.map((article) => ({
    url: `${SITE_URL}/es/a/${article.id}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...statics, ...articles];
}
