"use client";

import { useState } from "react";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/** Botones de compartir (X, WhatsApp, Facebook y copiar enlace). */
export default function ShareRow({ title, lang }: { title: string; lang: Locale }) {
  const dict = getDict(lang);
  const [copied, setCopied] = useState(false);

  const open = (buildUrl: (url: string, text: string) => string) => {
    const url = window.location.href;
    window.open(buildUrl(encodeURIComponent(url), encodeURIComponent(title)), "_blank", "noopener");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // portapapeles no disponible: se ignora
    }
  };

  const buttonClass =
    "rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-gold-dim hover:text-ink";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
        {dict.common.share}
      </span>
      <button type="button" className={buttonClass} onClick={() => open((u, t) => `https://twitter.com/intent/tweet?text=${t}&url=${u}`)}>
        X
      </button>
      <button type="button" className={buttonClass} onClick={() => open((u, t) => `https://wa.me/?text=${t}%20${u}`)}>
        WhatsApp
      </button>
      <button type="button" className={buttonClass} onClick={() => open((u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`)}>
        Facebook
      </button>
      <button type="button" className={buttonClass} onClick={copy} aria-live="polite">
        {copied ? dict.article.copied : dict.article.copyLink}
      </button>
    </div>
  );
}
