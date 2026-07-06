import MatchCard from "./MatchCard";
import { getDict } from "@/lib/i18n";
import type { Locale, WCMatch, WorldCupData } from "@/lib/types";
import { matchesByRound } from "@/lib/worldcup";

function Column({
  header,
  gold = false,
  matches,
  lang,
  data,
}: {
  header: string;
  gold?: boolean;
  matches: WCMatch[];
  lang: Locale;
  data: WorldCupData;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p
        className={`mb-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] ${
          gold ? "text-gold" : "text-faint"
        }`}
      >
        {header}
      </p>
      <div className="flex flex-1 flex-col justify-around gap-3 py-1">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} lang={lang} data={data} />
        ))}
      </div>
    </div>
  );
}

/**
 * Cuadro de eliminatorias simétrico (9 columnas, final al centro).
 * En pantallas chicas se desplaza horizontalmente.
 */
export default function Bracket({ lang, data }: { lang: Locale; data: WorldCupData }) {
  const dict = getDict(lang);
  const short = dict.mundial.roundsShort;
  const r32 = matchesByRound(data, "r32");
  const r16 = matchesByRound(data, "r16");
  const qf = matchesByRound(data, "qf");
  const sf = matchesByRound(data, "sf");
  const final = data.matches.find((m) => m.round === "final");
  const third = data.matches.find((m) => m.round === "third");

  return (
    <div>
      <p className="mb-3 text-center text-[11px] text-faint sm:hidden">{dict.mundial.bracketHint}</p>
      <div className="overflow-x-auto pb-3 scrollbar-thin">
        <div className="flex min-w-[1380px] items-stretch gap-3">
          <Column header={short.r32} matches={r32.slice(0, 8)} lang={lang} data={data} />
          <Column header={short.r16} matches={r16.slice(0, 4)} lang={lang} data={data} />
          <Column header={short.qf} matches={qf.slice(0, 2)} lang={lang} data={data} />
          <Column header={short.sf} matches={sf.slice(0, 1)} lang={lang} data={data} />

          {/* Columna central: la final y el tercer puesto */}
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              {short.final}
            </p>
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              <div className="w-full">
                <p aria-hidden className="mb-2 text-center text-2xl">🏆</p>
                {final && <MatchCard match={final} lang={lang} data={data} highlight />}
              </div>
              {third && (
                <div className="w-full">
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                    {dict.mundial.rounds.third}
                  </p>
                  <MatchCard match={third} lang={lang} data={data} />
                </div>
              )}
            </div>
          </div>

          <Column header={short.sf} matches={sf.slice(1, 2)} lang={lang} data={data} />
          <Column header={short.qf} matches={qf.slice(2, 4)} lang={lang} data={data} />
          <Column header={short.r16} matches={r16.slice(4, 8)} lang={lang} data={data} />
          <Column header={short.r32} matches={r32.slice(8, 16)} lang={lang} data={data} />
        </div>
      </div>
    </div>
  );
}
