import MarketTicker from "@/components/ticker/MarketTicker";
import { getMarketQuotes } from "@/lib/markets";
import type { Locale } from "@/lib/types";

export default async function MarketTickerBar({ lang }: { lang: Locale }) {
  const quotes = await getMarketQuotes();
  return <MarketTicker initial={quotes} lang={lang} />;
}
