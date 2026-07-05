import type { Metadata } from "next";
import HeadlineList from "@/components/HeadlineList";
import NewsCard from "@/components/NewsCard";
import NewsletterBox from "@/components/NewsletterBox";
import SectionBlock from "@/components/SectionBlock";
import SectionHeading from "@/components/SectionHeading";
import TrendingStrip from "@/components/TrendingStrip";
import MundialPromo from "@/components/mundial/MundialPromo";
import { categoryLabel } from "@/lib/categories";
import { getDict } from "@/lib/i18n";
import { getHomeSections, getTopNews } from "@/lib/news";
import { localePath } from "@/lib/site";
import { LOCALES, type Article, type CategorySlug, type Locale } from "@/lib/types";

export const revalidate = 600;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

function asLocale(raw: string): Locale {
  return (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : "es";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = asLocale((await params).lang);
  const dict = getDict(lang);
  return {
    title: { absolute: dict.meta.homeTitle },
    description: dict.meta.homeDesc,
    alternates: {
      canonical: `/${lang}`,
      languages: { es: "/es", en: "/en", "x-default": "/es" },
    },
  };
}

const GRID_SECTIONS: CategorySlug[] = ["internacional", "politica", "negocios", "tecnologia"];
const SPLIT_SECTIONS: CategorySlug[] = ["ciencia", "salud", "deportes", "artes", "entretenimiento"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = asLocale((await params).lang);
  const dict = getDict(lang);

  let top: Article[] = [];
  let sections: Partial<Record<CategorySlug, Article[]>> = {};
  try {
    [top, sections] = await Promise.all([getTopNews(lang, 24), getHomeSections(lang)]);
  } catch {
    // lib/news ya degrada a []; esto cubre cualquier fallo inesperado sin romper el render.
  }

  // Hero y destacadas solo entre artículos con imagen; los titulares sin imagen van a "En breve".
  const withImage = top.filter((a) => a.image);
  const hero: Article | undefined = withImage[0] ?? top[0];
  const featured = withImage.filter((a) => a.id !== hero?.id).slice(0, 2);
  const usedIds = new Set([hero?.id, ...featured.map((a) => a.id)]);
  const briefPool = top.filter((a) => !usedIds.has(a.id));
  const brief = [...briefPool.filter((a) => !a.image), ...briefPool.filter((a) => a.image)].slice(0, 8);

  return (
    <>
      {top.length > 0 && (
        <TrendingStrip articles={top.slice(0, 10)} lang={lang} label={dict.common.breaking} />
      )}

      <div className="container-page flex flex-col gap-10 py-8 sm:gap-14 sm:py-10">
        {hero ? (
          <section className="grid gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <NewsCard article={hero} lang={lang} variant="hero" />
              {featured.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {featured.map((a) => (
                    <NewsCard key={a.id} article={a} lang={lang} variant="featured" />
                  ))}
                </div>
              )}
            </div>
            <aside className="flex flex-col gap-4">
              <SectionHeading title={dict.home.inBrief} />
              <HeadlineList articles={brief} lang={lang} showCategory />
            </aside>
          </section>
        ) : (
          <p className="rounded-xl border border-line bg-panel p-6 text-center text-muted">
            {dict.common.noNews}
          </p>
        )}

        <MundialPromo lang={lang} />

        {GRID_SECTIONS.map((slug) => {
          const articles = sections[slug] ?? [];
          if (articles.length === 0) return null;
          return (
            <SectionBlock
              key={slug}
              title={categoryLabel(slug, lang)}
              href={localePath(lang, `/c/${slug}`)}
              articles={articles}
              lang={lang}
              layout="grid"
            />
          );
        })}

        <div className="grid gap-10 sm:gap-14 xl:grid-cols-2 xl:gap-x-8">
          {SPLIT_SECTIONS.map((slug) => {
            const articles = sections[slug] ?? [];
            if (articles.length === 0) return null;
            return (
              <SectionBlock
                key={slug}
                title={categoryLabel(slug, lang)}
                href={localePath(lang, `/c/${slug}`)}
                articles={articles}
                lang={lang}
                layout="split"
              />
            );
          })}
        </div>

        <NewsletterBox lang={lang} />
      </div>
    </>
  );
}
