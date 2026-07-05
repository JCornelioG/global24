"use client";

import { useState } from "react";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type Status = "idle" | "sending" | "done" | "already" | "error";

/** CTA de suscripción conectada a /api/subscribe (proveedor vía env). */
export default function NewsletterBox({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
        signal: AbortSignal.timeout(12_000),
      });
      const data = (await res.json().catch(() => ({}))) as { outcome?: string };
      // "not_configured" se trata como éxito visual: sin proveedor aún no se
      // guarda nada, pero no mostramos un error al visitante.
      if (data.outcome === "ok" || data.outcome === "not_configured") setStatus("done");
      else if (data.outcome === "already") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const message =
    status === "done"
      ? { text: dict.home.newsletterDone, tone: "success" as const }
      : status === "already"
        ? { text: dict.home.newsletterAlready, tone: "success" as const }
        : status === "error"
          ? { text: dict.home.newsletterError, tone: "error" as const }
          : null;

  return (
    <section className="rounded-xl border border-line bg-gradient-to-br from-panel to-panel-2 p-6 sm:p-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
        <span aria-hidden className="text-2xl">✉️</span>
        <h2 className="font-display text-2xl font-bold text-ink">{dict.home.newsletterTitle}</h2>
        <p className="text-sm text-muted">{dict.home.newsletterBody}</p>

        {status === "done" || status === "already" ? (
          <p className="mt-2 rounded-full border border-gold-dim bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold">
            {message?.text}
          </p>
        ) : (
          <form className="mt-2 flex w-full flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "sending"}
              placeholder={dict.home.newsletterPlaceholder}
              aria-label={dict.home.newsletterPlaceholder}
              className="h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm text-ink placeholder:text-faint focus:border-gold focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-11 rounded-full bg-gold px-6 text-sm font-extrabold uppercase tracking-wide text-black transition-colors hover:bg-gold-bright disabled:opacity-60"
            >
              {status === "sending" ? dict.home.newsletterSending : dict.home.newsletterCta}
            </button>
          </form>
        )}

        {message?.tone === "error" && <p className="text-xs font-semibold text-down">{message.text}</p>}
        <p className="text-[11px] text-faint">{dict.home.newsletterDisclaimer}</p>
      </div>
    </section>
  );
}
