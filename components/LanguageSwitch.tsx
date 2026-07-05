"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { localePath, switchLocalePath } from "@/lib/site";
import { LOCALES, type Locale } from "@/lib/types";

/** Pill ES | EN que conserva la ruta actual al cambiar de idioma. */
export default function LanguageSwitch({ lang }: { lang: Locale }) {
  const pathname = usePathname() ?? localePath(lang);
  const dict = getDict(lang);

  // Los ids de artículo son propios de cada idioma: desde /a/[id] el switch
  // lleva a la portada del otro idioma en lugar de a un id inexistente.
  const targetFor = (loc: Locale) =>
    /\/a\/[^/]+\/?$/.test(pathname) ? localePath(loc) : switchLocalePath(pathname, loc);

  return (
    <div
      className="flex items-center overflow-hidden rounded-full border border-line text-[11px] font-bold uppercase tracking-wider"
      role="group"
      aria-label={`${dict.langName} / ${dict.otherLangName}`}
    >
      {LOCALES.map((loc) =>
        loc === lang ? (
          <span key={loc} aria-current="true" className="bg-gold px-2.5 py-1 text-black">
            {loc.toUpperCase()}
          </span>
        ) : (
          <Link
            key={loc}
            href={targetFor(loc)}
            title={dict.otherLangName}
            className="px-2.5 py-1 text-muted transition-colors hover:text-gold"
          >
            {loc.toUpperCase()}
          </Link>
        ),
      )}
    </div>
  );
}
