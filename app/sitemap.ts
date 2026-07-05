import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { CATEGORY_SLUGS, LOCALES } from "@/lib/types";

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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.flatMap(({ path, changeFrequency, priority }) => {
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
}
