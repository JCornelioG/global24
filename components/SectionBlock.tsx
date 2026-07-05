import HeadlineList from "@/components/HeadlineList";
import NewsCard from "@/components/NewsCard";
import SectionHeading from "@/components/SectionHeading";
import { getDict } from "@/lib/i18n";
import type { Article, Locale } from "@/lib/types";

/**
 * Bloque de sección para la home. `grid`: 4 NewsCard featured.
 * `split`: 1 featured grande + lista de titulares al lado.
 */
export default function SectionBlock({
  title,
  href,
  articles,
  lang,
  layout,
}: {
  title: string;
  href: string;
  articles: Article[];
  lang: Locale;
  layout: "grid" | "split";
}) {
  const dict = getDict(lang);

  return (
    <section>
      <SectionHeading title={title} href={href} cta={dict.common.seeAll} />

      {articles.length === 0 ? (
        <p className="mt-4 text-sm text-faint">{dict.common.noNews}</p>
      ) : layout === "grid" ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {articles.slice(0, 4).map((article) => (
            <NewsCard key={article.id} article={article} lang={lang} variant="featured" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <NewsCard article={articles[0]} lang={lang} variant="featured" />
          <HeadlineList articles={articles.slice(1, 6)} lang={lang} />
        </div>
      )}
    </section>
  );
}
