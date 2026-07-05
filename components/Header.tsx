import Link from "next/link";
import LanguageSwitch from "@/components/LanguageSwitch";
import MobileNav from "@/components/MobileNav";
import { categoryLabel, NAV_ORDER } from "@/lib/categories";
import { getDict } from "@/lib/i18n";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

/** Cabecera sticky con logo, navegación por categorías, Mundial y switch de idioma. */
export default function Header({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const navItems = NAV_ORDER.map((slug) => ({
    slug: slug as string,
    label: categoryLabel(slug, lang),
    href: localePath(lang, `/c/${slug}`),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-bg/90 backdrop-blur">
      <div className="container-page flex h-14 items-center gap-4 sm:h-16">
        <Link href={localePath(lang)} className="flex shrink-0 items-center gap-2.5" aria-label="Global24">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-gold font-display text-[11px] font-extrabold text-black">
            G24
          </span>
          <span className="hidden font-display text-lg font-bold tracking-wide text-ink min-[420px]:inline">
            GLOBAL24
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-4 lg:flex xl:gap-5" aria-label={dict.nav.menu}>
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="whitespace-nowrap text-[13px] font-medium text-muted transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href={localePath(lang, "/mundial")}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-gold-bright"
          >
            <span aria-hidden="true">🏆</span>
            {dict.nav.mundial}
          </Link>
          <LanguageSwitch lang={lang} />
          <MobileNav lang={lang} labels={navItems} />
        </div>
      </div>
    </header>
  );
}
