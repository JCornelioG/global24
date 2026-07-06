import Link from "next/link";
import Flag from "./Flag";
import { getDict } from "@/lib/i18n";
import { localePath } from "@/lib/site";
import type { Locale, WCMatch, WorldCupData } from "@/lib/types";
import { getWorldCupData } from "@/lib/worldcupApi";
import { todayMatches } from "@/lib/worldcup";

function MatchChip({ match, data }: { match: WCMatch; data: WorldCupData }) {
  const finished = match.status === "finished";
  return (
    <span className="flex items-center gap-2 rounded-full border border-line bg-bg-soft px-3.5 py-1.5 text-xs font-semibold">
      <Flag flag={data.teams[match.home ?? ""]?.flag} />
      <span className="text-ink">{match.home ?? "—"}</span>
      <span className="tabular-nums text-gold">
        {finished ? `${match.homeScore}–${match.awayScore}` : (match.time ?? "vs")}
      </span>
      <span className="text-ink">{match.away ?? "—"}</span>
      <Flag flag={data.teams[match.away ?? ""]?.flag} />
    </span>
  );
}

/** Banner del Mundial para la portada, con los partidos del día. */
export default async function MundialPromo({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  const data = await getWorldCupData();
  const today = todayMatches(data);

  return (
    <section className="mundial-glow overflow-hidden rounded-xl border border-line">
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-xl">
          <p className="kicker flex items-center gap-2">
            <span aria-hidden>🏆</span>
            {dict.home.mundialPromoKicker}
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            {dict.home.mundialPromoTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{dict.home.mundialPromoBody}</p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          {today.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                {dict.home.todayMatches}
              </p>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {today.slice(0, 3).map((m) => (
                  <MatchChip key={m.id} match={m} data={data} />
                ))}
              </div>
            </>
          )}
          <Link
            href={localePath(lang, "/mundial")}
            className="mt-1 w-fit rounded-full bg-gold px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-black transition-colors hover:bg-gold-bright"
          >
            {dict.home.mundialPromoCta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
