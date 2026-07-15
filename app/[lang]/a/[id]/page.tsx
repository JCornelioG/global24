import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import NewsCard from "@/components/NewsCard";
import SectionHeading from "@/components/SectionHeading";
import ShareRow from "@/components/ShareRow";
import SmartImage from "@/components/SmartImage";
import { categoryLabel } from "@/lib/categories";
import { formatDateLong, timeAgo } from "@/lib/format";
import { getDict, t } from "@/lib/i18n";
import { isTopClicked } from "@/lib/gsc";
import { findArticle, isFeaturedArticle, relatedArticles } from "@/lib/news";
import { asLocale, localePath, SITE_NAME, SITE_URL } from "@/lib/site";
import { getArticleBrief } from "@/lib/summary";
import type { Locale } from "@/lib/types";

// 6 h: una nota ya renderizada casi no cambia (solo "relacionadas" y el
// reintento de síntesis). Los bots recorren cientos de URLs de artículo y
// re-renderizarlas cada hora era el mayor consumo de Fluid Active CPU.
export const revalidate = 21600;

interface Params {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang: rawLang, id } = await params;
  const lang = asLocale(rawLang);
  const dict = getDict(lang);
  const article = await findArticle(lang, id);
  if (!article) return { title: dict.meta.notFoundTitle, robots: { index: false } };

  const description = (article.description ?? t(dict.meta.categoryDesc, { category: categoryLabel(article.category, lang) })).slice(0, 160);
  return {
    title: article.title,
    description,
    alternates: { canonical: `/${lang}/a/${id}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `/${lang}/a/${id}`,
      images: article.image ? [article.image] : undefined,
      publishedTime: article.publishedAt,
    },
    twitter: { card: article.image ? "summary_large_image" : "summary" },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { lang: rawLang, id } = await params;
  const lang = asLocale(rawLang) as Locale;
  const dict = getDict(lang);

  const article = await findArticle(lang, id);
  if (!article) notFound();

  const adLabel = lang === "es" ? "Publicidad" : "Advertisement";
  const related = await relatedArticles(lang, article, 6);
  // Síntesis con IA solo para las notas con tracción: destacadas (portada y
  // tarjetas de categoría, cubre lo nuevo al instante) o con clics reales en
  // Google según Search Console (cubre la cola larga con tráfico; dato con
  // ~1-2 días de retraso). El resto usa el resumen contextual.
  // SUMMARY_SCOPE=all habilita la IA para todas.
  const wantAI =
    process.env.SUMMARY_SCOPE === "all" ||
    (await isFeaturedArticle(lang, article)) ||
    (await isTopClicked(article.id));
  const brief = wantAI ? await getArticleBrief(article, lang) : null;

  // La og:image del artículo (alta resolución) es mejor que la miniatura del feed.
  const heroImage = brief?.image ?? article.image;
  const relatedSources = [...new Set(related.map((r) => r.source).filter(Boolean))].slice(0, 3);
  const paragraphs =
    brief?.paragraphs ?? [
      t(dict.article.fallbackP1, {
        source: article.source,
        category: categoryLabel(article.category, lang),
      }),
      relatedSources.length > 0
        ? t(dict.article.fallbackP2Related, { sources: relatedSources.join(", ") })
        : dict.article.fallbackP2Solo,
    ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.publishedAt,
    inLanguage: lang,
    image: heroImage ? [heroImage] : undefined,
    author: { "@type": "Organization", name: article.source || SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    isBasedOn: article.url,
    mainEntityOfPage: `${SITE_URL}/${lang}/a/${article.id}`,
    isAccessibleForFree: true,
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-3xl">
        <Link href={localePath(lang, `/c/${article.category}`)} className="kicker hover:text-gold-bright">
          {categoryLabel(article.category, lang)}
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[13px]">
          <span className="font-bold uppercase tracking-wider text-gold">{article.source}</span>
          <span aria-hidden className="text-faint">·</span>
          <time dateTime={article.publishedAt} className="text-muted">
            {formatDateLong(article.publishedAt, lang)}
          </time>
          <span aria-hidden className="text-faint">·</span>
          <span className="text-faint">{timeAgo(article.publishedAt, lang)}</span>
        </p>

        {heroImage && (
          <figure className="mt-6">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-line-soft">
              <SmartImage src={heroImage} alt={article.title} sizes="(min-width: 768px) 768px, 100vw" priority />
            </div>
            <figcaption className="mt-2 text-[11px] text-faint">
              {t(dict.article.quoteLabel, { source: article.source })}
            </figcaption>
          </figure>
        )}

        <section className="mt-8">
          <h2 className="mb-4 border-l-[3px] border-gold pl-3 font-display text-lg font-bold uppercase tracking-wide">
            {dict.article.synthesis}
          </h2>
          <div className="flex flex-col gap-4">
            {paragraphs.map((paragraph, i) => (
              <Fragment key={i}>
                <p className="text-[15px] leading-relaxed text-ink/90">{paragraph}</p>
                {/* Anuncio in-article tras el 2º párrafo (solo si la síntesis es larga). */}
                {i === 1 && paragraphs.length > 3 && (
                  <AdSlot
                    slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID}
                    label={adLabel}
                    className="my-2"
                  />
                )}
              </Fragment>
            ))}
          </div>
          <p className="mt-4 text-[11px] italic text-faint">
            {brief?.paragraphs ? dict.article.aiNote : dict.article.editorialNote}
          </p>
        </section>

        {article.description && (
          <blockquote className="mt-6 rounded-r-xl border-l-[3px] border-gold-dim bg-panel px-5 py-4">
            <p className="text-sm italic leading-relaxed text-muted">“{article.description}”</p>
            <cite className="mt-2 block text-[11px] not-italic text-faint">
              — {t(dict.article.quoteLabel, { source: article.source })}
            </cite>
          </blockquote>
        )}

        <div className="mt-8 flex flex-col gap-5 border-y border-line-soft py-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-fit rounded-full bg-gold px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-black transition-colors hover:bg-gold-bright"
          >
            {t(dict.article.readOriginal, { source: article.source })} ↗
          </a>
          <ShareRow title={article.title} lang={lang} />
        </div>

        <p className="mt-4 text-[11px] text-faint">{t(dict.article.disclaimer, { source: article.source })}</p>
      </article>

      <div className="mx-auto mt-10 max-w-3xl">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} label={adLabel} />
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl">
          <SectionHeading title={dict.article.related} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} article={item} lang={lang} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
