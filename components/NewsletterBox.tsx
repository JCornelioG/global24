"use client";

import { useState } from "react";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/** CTA de suscripción (solo front-end: no hay backend de correo todavía). */
export default function NewsletterBox({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const [done, setDone] = useState(false);

  return (
    <section className="rounded-xl border border-line bg-gradient-to-br from-panel to-panel-2 p-6 sm:p-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
        <span aria-hidden className="text-2xl">✉️</span>
        <h2 className="font-display text-2xl font-bold text-ink">{dict.home.newsletterTitle}</h2>
        <p className="text-sm text-muted">{dict.home.newsletterBody}</p>

        {done ? (
          <p className="mt-2 rounded-full border border-gold-dim bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold">
            {dict.home.newsletterDone}
          </p>
        ) : (
          <form
            className="mt-2 flex w-full flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <input
              type="email"
              required
              placeholder={dict.home.newsletterPlaceholder}
              className="h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm text-ink placeholder:text-faint focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-gold px-6 text-sm font-extrabold uppercase tracking-wide text-black transition-colors hover:bg-gold-bright"
            >
              {dict.home.newsletterCta}
            </button>
          </form>
        )}
        <p className="text-[11px] text-faint">{dict.home.newsletterDisclaimer}</p>
      </div>
    </section>
  );
}
