import "server-only";
import type { MarketKind, MarketQuote } from "./types";

interface MarketSymbolDef {
  symbol: string;
  label: { es: string; en: string };
  kind: MarketKind;
  precision: number;
}

/** Orden exacto del contrato: define el orden de render del ticker. */
export const MARKET_SYMBOLS: MarketSymbolDef[] = [
  { symbol: "EURUSD=X", label: { es: "EUR/USD", en: "EUR/USD" }, kind: "fx", precision: 4 },
  { symbol: "BTC-USD", label: { es: "Bitcoin", en: "Bitcoin" }, kind: "crypto", precision: 0 },
  { symbol: "GC=F", label: { es: "Oro", en: "Gold" }, kind: "commodity", precision: 0 },
  { symbol: "^GSPC", label: { es: "S&P 500", en: "S&P 500" }, kind: "index", precision: 0 },
  { symbol: "^IXIC", label: { es: "NASDAQ", en: "NASDAQ" }, kind: "index", precision: 0 },
  { symbol: "^GDAXI", label: { es: "DAX", en: "DAX" }, kind: "index", precision: 0 },
  { symbol: "^N225", label: { es: "NIKKEI", en: "NIKKEI" }, kind: "index", precision: 0 },
  { symbol: "^FTSE", label: { es: "FTSE 100", en: "FTSE 100" }, kind: "index", precision: 0 },
];

/** Snapshot estático por símbolo para cuando Yahoo falla (precios índice aproximados). */
const FALLBACK_SNAPSHOT: Record<string, { price: number; changePct: number }> = {
  "EURUSD=X": { price: 1.1437, changePct: 0.0 },
  "BTC-USD": { price: 62629, changePct: 0.2 },
  "GC=F": { price: 4175, changePct: -0.0 },
  "^GSPC": { price: 6890, changePct: -0.1 },
  "^IXIC": { price: 23150, changePct: -1.7 },
  "^GDAXI": { price: 24500, changePct: 2.7 },
  "^N225": { price: 50100, changePct: 0.1 },
  "^FTSE": { price: 9600, changePct: 2.7 },
};

interface YahooChartResponse {
  chart?: {
    result?: {
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
      };
    }[];
  };
}

function fallbackQuote(def: MarketSymbolDef): MarketQuote {
  const snap = FALLBACK_SNAPSHOT[def.symbol] ?? { price: 0, changePct: 0 };
  return {
    symbol: def.symbol,
    label: def.label,
    price: snap.price,
    changePct: snap.changePct,
    kind: def.kind,
    precision: def.precision,
  };
}

async function fetchQuote(def: MarketSymbolDef): Promise<MarketQuote | null> {
  try {
    // range=1d: con 2d, chartPreviousClose sería el cierre de hace DOS sesiones
    // y el % mostrado no correspondería a la variación diaria.
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(def.symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as YahooChartResponse;
    const meta = data.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    const prevClose = meta?.chartPreviousClose;
    if (typeof price !== "number" || typeof prevClose !== "number" || prevClose === 0) return null;
    return {
      symbol: def.symbol,
      label: def.label,
      price,
      changePct: (price / prevClose - 1) * 100,
      kind: def.kind,
      precision: def.precision,
    };
  } catch {
    return null;
  }
}

/** Cotizaciones en el orden de MARKET_SYMBOLS; nunca lanza: usa fallback por símbolo. */
export async function getMarketQuotes(): Promise<MarketQuote[]> {
  const results = await Promise.allSettled(MARKET_SYMBOLS.map((def) => fetchQuote(def)));
  return results.map((result, i) =>
    result.status === "fulfilled" && result.value !== null
      ? result.value
      : fallbackQuote(MARKET_SYMBOLS[i]),
  );
}
