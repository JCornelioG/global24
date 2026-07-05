import { formatDateLong } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import type { Locale, WCMatch } from "@/lib/types";
import { getWorldCup, roundLabel, teamFlag, teamName } from "@/lib/worldcup";

function groupByDate(matches: WCMatch[]): [string, WCMatch[]][] {
  const map = new Map<string, WCMatch[]>();
  for (const m of matches) {
    const list = map.get(m.date) ?? [];
    list.push(m);
    map.set(m.date, list);
  }
  return [...map.entries()];
}

function Side({ match, side, lang }: { match: WCMatch; side: "home" | "away"; lang: Locale }) {
  const code = match[side];
  const placeholder = side === "home" ? match.homePlaceholder : match.awayPlaceholder;
  const name = code ? teamName(code, lang) : (placeholder?.[lang] ?? "—");
  return (
    <span
      className={`flex min-w-0 items-center gap-2 ${side === "home" ? "justify-end text-right" : ""} ${
        code ? "text-ink" : "italic text-faint"
      }`}
    >
      {side === "away" && <span aria-hidden className="text-base leading-none">{code ? teamFlag(code) : "⚽"}</span>}
      <span className="truncate text-sm font-medium">{name}</span>
      {side === "home" && <span aria-hidden className="text-base leading-none">{code ? teamFlag(code) : "⚽"}</span>}
    </span>
  );
}

function MatchRow({ match, lang }: { match: WCMatch; lang: Locale }) {
  const dict = getDict(lang);
  const finished = match.status === "finished";
  const pens =
    match.homePens !== undefined && match.awayPens !== undefined
      ? `${match.homePens}-${match.awayPens} ${dict.mundial.pens}`
      : undefined;

  return (
    <li className="rounded-lg border border-line-soft bg-panel px-4 py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Side match={match} side="home" lang={lang} />
        <div className="flex flex-col items-center">
          {finished ? (
            <>
              <span className="font-display text-base font-bold tabular-nums text-ink">
                {match.homeScore} – {match.awayScore}
              </span>
              {pens && <span className="text-[10px] text-faint">({pens})</span>}
            </>
          ) : (
            <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted">
              {match.time ?? "—"}
            </span>
          )}
        </div>
        <Side match={match} side="away" lang={lang} />
      </div>
      <p className="mt-2 text-center text-[11px] text-faint">
        {roundLabel(match.round, lang)}
        {match.venue ? ` · ${match.venue}${match.city ? `, ${match.city}` : ""}` : ""}
      </p>
    </li>
  );
}

/** Calendario y resultados de la fase eliminatoria, agrupados por fecha. */
export default function MatchList({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const matches = getWorldCup().matches;

  const upcoming = matches
    .filter((m) => m.status !== "finished")
    .sort((a, b) => `${a.date}T${a.time ?? ""}`.localeCompare(`${b.date}T${b.time ?? ""}`));
  const finished = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => `${b.date}T${b.time ?? ""}`.localeCompare(`${a.date}T${a.time ?? ""}`));

  const sections: { title: string; groups: [string, WCMatch[]][] }[] = [
    { title: dict.mundial.upcoming, groups: groupByDate(upcoming) },
    { title: dict.mundial.results, groups: groupByDate(finished) },
  ];

  return (
    <div className="flex flex-col gap-10">
      {sections.map(
        (section) =>
          section.groups.length > 0 && (
            <section key={section.title}>
              <h3 className="mb-4 border-l-[3px] border-gold pl-3 font-display text-lg font-bold uppercase tracking-wide">
                {section.title}
              </h3>
              <div className="flex flex-col gap-6">
                {section.groups.map(([date, dayMatches]) => (
                  <div key={date}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">
                      {formatDateLong(date, lang)}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {dayMatches.map((m) => (
                        <MatchRow key={m.id} match={m} lang={lang} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  );
}
