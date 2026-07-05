"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getDict } from "@/lib/i18n";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

/** Hamburguesa (< lg) que abre un panel a pantalla completa con la navegación. */
export default function MobileNav({
  lang,
  labels,
}: {
  lang: Locale;
  labels: { slug: string; label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const dict = getDict(lang);

  // Bloquea el scroll del body mientras el panel está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={dict.nav.menu}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-line-soft transition-colors hover:border-gold-dim"
      >
        <span className="h-[2px] w-4 rounded bg-ink" />
        <span className="h-[2px] w-4 rounded bg-ink" />
        <span className="h-[2px] w-4 rounded bg-ink" />
      </button>

      {/* Portal a <body>: el backdrop-blur del header crea un containing block
          que rompería el posicionamiento de un `fixed inset-0` anidado. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur">
          <div className="container-page flex h-14 items-center justify-between border-b border-line-soft sm:h-16">
            <Link
              href={localePath(lang)}
              onClick={close}
              className="flex items-center gap-2.5"
              aria-label="Global24"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-gold font-display text-[11px] font-extrabold text-black">
                G24
              </span>
              <span className="font-display text-lg font-bold tracking-wide text-ink">GLOBAL24</span>
            </Link>
            <button
              type="button"
              aria-label={dict.nav.close}
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft text-lg text-muted transition-colors hover:border-gold-dim hover:text-gold"
            >
              ✕
            </button>
          </div>

          <nav className="container-page flex-1 overflow-y-auto py-6 scrollbar-thin">
            <ul className="divide-y divide-line-soft">
              <li>
                <Link
                  href={localePath(lang)}
                  onClick={close}
                  className="block py-3.5 font-display text-2xl font-bold text-ink transition-colors hover:text-gold"
                >
                  {dict.nav.inicio}
                </Link>
              </li>
              {labels.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block py-3.5 font-display text-2xl font-bold text-ink transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={localePath(lang, "/mundial")}
              onClick={close}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-display text-sm font-bold text-black transition-colors hover:bg-gold-bright"
            >
              <span aria-hidden="true">🏆</span>
              {dict.nav.mundial}
            </Link>
          </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
