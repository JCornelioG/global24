import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { getWorldCup, teamFlag, teamName } from "@/lib/worldcup";

/** Tablas de posiciones de los 12 grupos (A–L). */
export default function GroupsGrid({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const t = dict.mundial.table;
  const groups = getWorldCup().groups;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="rounded-xl border border-line-soft bg-panel p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold">
              {dict.mundial.group} {group.id}
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-faint">
                  <th className="pb-2 text-left font-semibold">{dict.mundial.team}</th>
                  {[t.pj, t.g, t.e, t.p, t.gf, t.gc, t.pts].map((h, i) => (
                    <th key={i} className="pb-2 text-center font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.standings.map((row) => (
                  <tr key={row.team} className="border-t border-line-soft">
                    <td className="py-1.5 pr-2">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden className="text-[13px] leading-none">{teamFlag(row.team)}</span>
                        <span className={`truncate ${row.advanced ? "font-semibold text-ink" : "text-muted"}`}>
                          {teamName(row.team, lang)}
                        </span>
                        {row.advanced && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-gold" />}
                      </span>
                    </td>
                    {[row.played, row.won, row.drawn, row.lost, row.gf, row.ga].map((n, i) => (
                      <td key={i} className="py-1.5 text-center tabular-nums text-muted">
                        {n}
                      </td>
                    ))}
                    <td className="py-1.5 text-center font-bold tabular-nums text-ink">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-[11px] text-faint">
        <span aria-hidden className="size-1.5 rounded-full bg-gold" />
        {dict.mundial.advancedNote}
      </p>
    </div>
  );
}
