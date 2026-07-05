"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { Locale, MarketQuote } from "@/lib/types";

function TickerItem({ quote, lang }: { quote: MarketQuote; lang: Locale }) {
  const up = quote.changePct >= 0;
  const showPrice = quote.kind !== "index";
  const prefix =
    quote.kind === "crypto" || quote.kind === "commodity" ? (lang === "es" ? "US$" : "$") : "";

  return (
    <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
        {quote.label[lang]}
      </span>
      {showPrice && (
        <span className="tabular-nums text-ink">
          {prefix}
          {formatNumber(quote.price, lang, quote.precision)}
        </span>
      )}
      <span className={`tabular-nums ${up ? "text-up" : "text-down"}`}>
        {up ? "▲" : "▼"} {formatNumber(Math.abs(quote.changePct), lang, 1)}%
      </span>
    </span>
  );
}

export default function MarketTicker({
  initial,
  lang,
}: {
  initial: MarketQuote[];
  lang: Locale;
}) {
  const [quotes, setQuotes] = useState<MarketQuote[]>(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/markets", { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return;
        const data = (await res.json()) as { quotes?: MarketQuote[] };
        if (Array.isArray(data.quotes) && data.quotes.length > 0) {
          setQuotes(data.quotes);
        }
      } catch {
        // Ante error de red se conserva el último estado (sin parpadeo).
      }
    }, 120_000);
    return () => clearInterval(id);
  }, []);

  if (quotes.length === 0) return null;

  return (
    <div className="border-b border-line-soft bg-bg-soft text-[11px]">
      {/* Desktop: fila completa distribuida */}
      <div className="container-page hidden h-[34px] items-center justify-between gap-6 lg:flex">
        {quotes.map((quote) => (
          <TickerItem key={quote.symbol} quote={quote} lang={lang} />
        ))}
      </div>

      {/* Mobile: marquesina con contenido duplicado para el loop infinito */}
      <div className="marquee lg:hidden">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex h-[34px] items-center gap-6 pr-6"
            >
              {quotes.map((quote) => (
                <TickerItem key={`${copy}-${quote.symbol}`} quote={quote} lang={lang} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
