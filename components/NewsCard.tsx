import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { categoryLabel } from "@/lib/categories";
import { timeAgo } from "@/lib/format";
import { localePath } from "@/lib/site";
import type { Article, Locale } from "@/lib/types";

/** Fila "FUENTE · hace 23 min" compartida por las tres variantes. */
function Meta({ article, lang }: { article: Article; lang: Locale }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px]">
      <span className="font-bold uppercase tracking-wider text-gold">{article.source}</span>
      <span aria-hidden="true" className="text-faint">
        ·
      </span>
      <span className="text-faint">{timeAgo(article.publishedAt, lang)}</span>
    </p>
  );
}

/**
 * Tarjeta de noticia. Toda la tarjeta es un enlace externo al medio original.
 * Variantes: hero (portada), featured (grillas) y compact (thumb + título).
 */
export default function NewsCard({
  article,
  lang,
  variant,
}: {
  article: Article;
  lang: Locale;
  variant: "hero" | "featured" | "compact";
}) {
  const kicker = categoryLabel(article.category, lang);

  if (variant === "compact") {
    return (
      <Link
        href={localePath(lang, `/a/${article.id}`)}
        className="card-hover block overflow-hidden rounded-xl bg-panel"
      >
        <article className="flex items-stretch gap-3 p-2.5">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
            <SmartImage src={article.image} alt={article.title} sizes="96px" />
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-1.5">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{article.title}</h3>
            <Meta article={article} lang={lang} />
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={localePath(lang, `/a/${article.id}`)}
        className="card-hover block h-full overflow-hidden rounded-xl bg-panel"
      >
        <article className="flex h-full flex-col">
          <div className="relative aspect-video w-full overflow-hidden">
            <SmartImage
              src={article.image}
              alt={article.title}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <span className="kicker">{kicker}</span>
            <h3 className="line-clamp-3 font-display text-lg font-semibold leading-snug text-ink">
              {article.title}
            </h3>
            <div className="mt-auto pt-1">
              <Meta article={article} lang={lang} />
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={localePath(lang, `/a/${article.id}`)}
      className="card-hover block h-full overflow-hidden rounded-xl bg-panel"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-video w-full overflow-hidden">
          <SmartImage
            src={article.image}
            alt={article.title}
            sizes="(min-width: 1024px) 60vw, 100vw"
            priority
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <span className="kicker">{kicker}</span>
          <h2 className="line-clamp-4 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl lg:text-4xl">
            {article.title}
          </h2>
          {article.description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted">{article.description}</p>
          )}
          <div className="mt-auto pt-1">
            <Meta article={article} lang={lang} />
          </div>
        </div>
      </article>
    </Link>
  );
}
