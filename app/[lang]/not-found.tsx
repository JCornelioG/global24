import Link from "next/link";
import { getDict } from "@/lib/i18n";

// not-found no recibe params, así que la página es bilingüe (ES y EN juntos).
export default function NotFound() {
  const es = getDict("es");
  const en = getDict("en");

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-8 py-16 text-center">
      <p className="font-display text-7xl font-bold text-gold sm:text-8xl" aria-hidden="true">
        404
      </p>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          {es.notFound.title}
        </h1>
        <p className="text-lg text-muted">{en.notFound.title}</p>
      </div>

      <div className="flex max-w-md flex-col gap-1">
        <p className="text-muted">{es.notFound.body}</p>
        <p className="text-sm text-faint">{en.notFound.body}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/es"
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-[#171307] transition-colors hover:bg-gold-bright"
        >
          {es.common.backHome}
        </Link>
        <Link
          href="/en"
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-gold-dim"
        >
          {en.common.backHome}
        </Link>
      </div>
    </div>
  );
}
