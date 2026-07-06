import Flag from "./Flag";
import { formatDateShort } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import type { Locale, WCMatch, WorldCupData } from "@/lib/types";
import { matchWinner, teamFlag, teamName } from "@/lib/worldcup";

function TeamRow({
  match,
  side,
  lang,
  data,
}: {
  match: WCMatch;
  side: "home" | "away";
  lang: Locale;
  data: WorldCupData;
}) {
  const code = match[side];
  const placeholder = side === "home" ? match.homePlaceholder : match.awayPlaceholder;
  const score = side === "home" ? match.homeScore : match.awayScore;
  const pens = side === "home" ? match.homePens : match.awayPens;
  const winner = matchWinner(match);
  const finishedLoser = match.status === "finished" && winner !== undefined && winner !== side;

  if (!code) {
    return (
      <div className="flex h-5 items-center gap-1.5">
        <span aria-hidden className="text-[13px] leading-none opacity-40">⚽</span>
        <span className="truncate text-xs italic text-faint">{placeholder?.[lang] ?? "—"}</span>
      </div>
    );
  }

  return (
    <div className="flex h-5 items-center gap-1.5">
      <Flag flag={teamFlag(data, code)} />
      <span
        className={`min-w-0 flex-1 truncate text-xs ${
          finishedLoser ? "text-faint" : "font-semibold text-ink"
        }`}
      >
        {teamName(data, code, lang)}
      </span>
      {score !== undefined && (
        <span className="flex items-baseline gap-1">
          {pens !== undefined && <span className="text-[9px] tabular-nums text-faint">({pens})</span>}
          <span
            className={`text-xs tabular-nums ${finishedLoser ? "text-faint" : "font-bold text-ink"}`}
          >
            {score}
          </span>
        </span>
      )}
    </div>
  );
}

/** Tarjeta mini de partido para el cuadro de eliminatorias. */
export default function MatchCard({
  match,
  lang,
  data,
  highlight = false,
}: {
  match: WCMatch;
  lang: Locale;
  data: WorldCupData;
  highlight?: boolean;
}) {
  const dict = getDict(lang);
  const footer =
    match.status === "finished"
      ? `${formatDateShort(match.date, lang)} · ${dict.mundial.finished}`
      : match.status === "live"
        ? dict.common.live
        : `${formatDateShort(match.date, lang)}${match.time ? ` · ${match.time}` : ""}`;

  return (
    <div
      className={`w-full rounded-lg border bg-panel px-2.5 py-2 ${
        highlight ? "border-gold-dim shadow-[0_0_18px_rgba(232,193,92,0.12)]" : "border-line-soft"
      }`}
    >
      <div className="flex flex-col gap-1">
        <TeamRow match={match} side="home" lang={lang} data={data} />
        <TeamRow match={match} side="away" lang={lang} data={data} />
      </div>
      <p className={`mt-1.5 text-[10px] ${match.status === "live" ? "font-bold text-down" : "text-faint"}`}>
        {footer}
      </p>
    </div>
  );
}
