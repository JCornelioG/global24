import { formatNumber } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import type { Locale, WorldCupData } from "@/lib/types";

/** Resumen editorial del torneo: momentos destacados + números clave. */
export default function SummaryPanel({ lang, data }: { lang: Locale; data: WorldCupData }) {
  const dict = getDict(lang);
  const { highlights, stats } = data;

  const statCards = [
    { label: dict.mundial.statMatches, value: formatNumber(stats.matchesPlayed, lang, 0) },
    { label: dict.mundial.statGoals, value: formatNumber(stats.goals, lang, 0) },
    { label: dict.mundial.statAvgGoals, value: formatNumber(stats.avgGoals, lang, 2) },
    { label: dict.mundial.statAttendance, value: formatNumber(stats.avgAttendance, lang, 0) },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-4 md:grid-cols-2">
        {highlights.map((h) => {
          const title = lang === "es" ? h.titleEs : h.titleEn;
          const body = lang === "es" ? h.bodyEs : h.bodyEn;
          return (
            <article key={h.titleEs} className="card-hover rounded-xl bg-panel p-5">
              <h3 className="font-display text-lg font-bold leading-snug text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          );
        })}
      </div>

      <section>
        <h3 className="mb-4 border-l-[3px] border-gold pl-3 font-display text-lg font-bold uppercase tracking-wide">
          {dict.mundial.statsTitle}
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line-soft bg-panel p-5 text-center">
              <p className="font-display text-3xl font-extrabold tabular-nums text-gold">{stat.value}</p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-faint">{dict.mundial.dataNote}</p>
      </section>
    </div>
  );
}
