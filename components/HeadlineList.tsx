import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { timeAgo } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { localePath } from "@/lib/site";
import type { Article, Locale } from "@/lib/types";

/** Lista de titulares sin imagen: bullet dorado, título y fuente · timeAgo. */
export default function HeadlineList({
  articles,
  lang,
  showCategory,
}: {
  articles: Article[];
  lang: Locale;
  showCategory?: boolean;
}) {
  if (articles.length === 0) {
    const dict = getDict(lang);
    return <p className="py-3 text-sm text-faint">{dict.common.noNews}</p>;
  }

  return (
    <ul className="divide-y divide-line-soft">
      {articles.map((article) => (
        <li key={article.id}>
          <Link
            href={localePath(lang, `/a/${article.id}`)}
            className="group flex gap-2.5 py-3"
          >
            <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            <div className="min-w-0">
              <h3 className="text-sm font-medium leading-snug text-ink transition-colors group-hover:text-gold">
                {article.title}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                {showCategory && (
                  <>
                    <span className="font-bold uppercase tracking-wider text-gold-dim">
                      {categoryLabel(article.category, lang)}
                    </span>
                    <span aria-hidden="true" className="text-faint">
                      ·
                    </span>
                  </>
                )}
                <span className="font-bold uppercase tracking-wider text-gold">{article.source}</span>
                <span aria-hidden="true" className="text-faint">
                  ·
                </span>
                <span className="text-faint">{timeAgo(article.publishedAt, lang)}</span>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
