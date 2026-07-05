import Link from "next/link";
import { localePath } from "@/lib/site";
import type { Article, Locale } from "@/lib/types";

/**
 * Franja "ÚLTIMA HORA": chip rojo con punto en vivo + marquesina de titulares.
 * La lista se duplica porque `.marquee-track` se desplaza -50% en bucle.
 */
export default function TrendingStrip({
  articles,
  lang,
  label,
}: {
  articles: Article[];
  lang: Locale;
  label: string;
}) {
  if (articles.length === 0) return null;

  const items = (hidden: boolean) =>
    articles.map((article) => (
      <span
        key={hidden ? `dup-${article.id}` : article.id}
        aria-hidden={hidden || undefined}
        className="flex items-center"
      >
        <Link
          href={localePath(lang, `/a/${article.id}`)}
          tabIndex={hidden ? -1 : undefined}
          className="whitespace-nowrap text-[13px] text-muted transition-colors hover:text-gold"
          lang={article.lang !== lang ? article.lang : undefined}
        >
          {article.title}
        </Link>
        <span aria-hidden="true" className="mx-4 text-[9px] text-gold">
          ◆
        </span>
      </span>
    ));

  return (
    <div className="border-y border-line-soft bg-bg-soft">
      <div className="container-page flex items-center gap-3 py-2">
        <span className="flex shrink-0 items-center gap-2 rounded-full bg-down/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-down">
          <span className="live-dot" aria-hidden="true" />
          {label}
        </span>
        <div className="marquee min-w-0 flex-1">
          <div className="marquee-track items-center">
            {items(false)}
            {items(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
