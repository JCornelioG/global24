import Link from "next/link";
import { categoryLabel, NAV_ORDER } from "@/lib/categories";
import { getDict } from "@/lib/i18n";
import { localePath, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/lib/types";

/** Pie de página con marca, secciones y nota de fuentes. */
export default function Footer({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-line bg-bg-soft">
      <div className="container-page grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link href={localePath(lang)} className="flex items-center gap-2.5" aria-label={SITE_NAME}>
            <span className="flex h-8 w-8 items-center justify-center rounded bg-gold font-display text-[11px] font-extrabold text-black">
              G24
            </span>
            <span className="font-display text-lg font-bold tracking-wide text-ink">GLOBAL24</span>
          </Link>
          <p className="mt-3 text-sm font-medium text-gold">{dict.footer.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{dict.footer.about}</p>
        </div>

        <div>
          <h2 className="kicker">{dict.footer.sections}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {NAV_ORDER.map((slug) => (
              <li key={slug}>
                <Link
                  href={localePath(lang, `/c/${slug}`)}
                  className="text-sm text-muted transition-colors hover:text-gold"
                >
                  {categoryLabel(slug, lang)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={localePath(lang, "/mundial")}
                className="text-sm font-semibold text-gold transition-colors hover:text-gold-bright"
              >
                🏆 {dict.nav.mundial}
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <p className="text-xs leading-relaxed text-faint">{dict.footer.sources}</p>
          <p className="text-xs leading-relaxed text-faint">{dict.common.externalNote}</p>
          <p className="mt-auto text-xs text-faint">
            © {year} {SITE_NAME}. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
