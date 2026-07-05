import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { getWorldCup, teamFlag, teamName } from "@/lib/worldcup";

/** Tabla de goleadores del torneo. */
export default function ScorersTable({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const scorers = getWorldCup().scorers;

  return (
    <div className="overflow-hidden rounded-xl border border-line-soft bg-panel">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-[10px] uppercase tracking-wide text-faint">
            <th className="px-4 py-3 text-left font-semibold">#</th>
            <th className="px-2 py-3 text-left font-semibold">{dict.mundial.player}</th>
            <th className="hidden px-2 py-3 text-left font-semibold sm:table-cell">{dict.mundial.team}</th>
            <th className="px-2 py-3 text-center font-semibold">{dict.mundial.goals}</th>
            <th className="px-4 py-3 text-center font-semibold">{dict.mundial.assists}</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((scorer, i) => (
            <tr
              key={scorer.player}
              className={`border-b border-line-soft last:border-b-0 ${i === 0 ? "bg-panel-2" : ""}`}
            >
              <td className={`px-4 py-3 tabular-nums ${i === 0 ? "font-bold text-gold" : "text-faint"}`}>
                {i + 1}
              </td>
              <td className="px-2 py-3">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="text-base leading-none">{teamFlag(scorer.team)}</span>
                  <span className={`${i === 0 ? "font-bold" : "font-medium"} text-ink`}>{scorer.player}</span>
                </span>
              </td>
              <td className="hidden px-2 py-3 text-muted sm:table-cell">{teamName(scorer.team, lang)}</td>
              <td className="px-2 py-3 text-center font-display text-base font-bold tabular-nums text-gold">
                {scorer.goals}
              </td>
              <td className="px-4 py-3 text-center tabular-nums text-muted">{scorer.assists}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
