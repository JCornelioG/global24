import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import HeadlineList from "@/components/HeadlineList";
import NewsCard from "@/components/NewsCard";
import SectionHeading from "@/components/SectionHeading";
import { categoryLabel } from "@/lib/categories";
import { formatDateLong } from "@/lib/format";
import { getDict, t } from "@/lib/i18n";
import { getNewsByCategory } from "@/lib/news";
import { localePath, SITE_URL } from "@/lib/site";
import { CATEGORY_SLUGS, LOCALES, type Article, type CategorySlug, type Locale } from "@/lib/types";

export const revalidate = 1800;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => CATEGORY_SLUGS.map((slug) => ({ lang, slug })));
}

function asLocale(raw: string): Locale {
  return (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : "es";
}

function isCategory(raw: string): raw is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(raw);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!isCategory(slug)) return {};
  const lang = asLocale(rawLang);
  const dict = getDict(lang);
  const label = categoryLabel(slug, lang);
  return {
    title: label,
    description: t(dict.meta.categoryDesc, { category: label }),
    alternates: {
      canonical: `/${lang}/c/${slug}`,
      languages: {
        es: `/es/c/${slug}`,
        en: `/en/c/${slug}`,
        "x-default": `/es/c/${slug}`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  if (!isCategory(slug)) notFound();
  const lang = asLocale(rawLang);
  const dict = getDict(lang);
  const label = categoryLabel(slug, lang);

  let articles: Article[] = [];
  try {
    articles = await getNewsByCategory(lang, slug, 36);
  } catch {
    // lib/news ya degrada a []; nunca rompemos el render de la página.
  }

  const featured = articles.filter((a) => a.image).slice(0, 9);
  const featuredIds = new Set(featured.map((a) => a.id));
  const rest = articles.filter((a) => !featuredIds.has(a.id)).slice(0, 14);
  const listed = [...featured, ...rest];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: label,
    itemListElement: listed.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      // URL interna: debe coincidir con los enlaces reales de las tarjetas.
      url: `${SITE_URL}${localePath(lang, `/a/${a.id}`)}`,
      name: a.title,
    })),
  };

  return (
    <div className="container-page flex flex-col gap-8 py-8 sm:gap-10 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="flex flex-col gap-2 border-b border-line pb-6">
        <p className="kicker">{dict.category.latestIn}</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">{label}</h1>
        <p className="text-sm text-muted">
          {dict.category.updatedNote} ·{" "}
          <time dateTime={new Date().toISOString()}>
            {formatDateLong(new Date().toISOString(), lang)}
          </time>
        </p>
      </header>

      {listed.length === 0 ? (
        <p className="rounded-xl border border-line bg-panel p-6 text-center text-muted">
          {dict.common.noNews}
        </p>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((a) => (
                <NewsCard key={a.id} article={a} lang={lang} variant="featured" />
              ))}
            </section>
          )}

          <AdSlot
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED}
            label={lang === "es" ? "Publicidad" : "Advertisement"}
          />

          {rest.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeading title={dict.home.moreNews} />
              <HeadlineList articles={rest} lang={lang} />
            </section>
          )}

          <p className="text-xs text-faint">{dict.common.externalNote}</p>
        </>
      )}
    </div>
  );
}
