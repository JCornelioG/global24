"use client";

import { useState } from "react";
import Bracket from "./Bracket";
import GroupsGrid from "./GroupsGrid";
import MatchList from "./MatchList";
import PhaseTimeline from "./PhaseTimeline";
import ScorersTable from "./ScorersTable";
import SummaryPanel from "./SummaryPanel";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const TABS = ["avance", "resumen", "goleadores", "partidos", "grupos"] as const;
type TabId = (typeof TABS)[number];

/** Hub con pestañas del Centro del Mundial. */
export default function MundialHub({
  lang,
  currentPhaseId,
}: {
  lang: Locale;
  currentPhaseId: string;
}) {
  const dict = getDict(lang);
  const [tab, setTab] = useState<TabId>("avance");

  return (
    <div>
      <div
        role="tablist"
        aria-label={dict.mundial.title}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
      >
        {TABS.map((id) => {
          const active = id === tab;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors ${
                active
                  ? "bg-gold text-black"
                  : "border border-line bg-panel text-muted hover:border-gold-dim hover:text-ink"
              }`}
            >
              {dict.mundial.tabs[id]}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "avance" && (
          <div className="flex flex-col gap-10">
            <PhaseTimeline lang={lang} currentPhaseId={currentPhaseId} />
            <Bracket lang={lang} />
          </div>
        )}
        {tab === "resumen" && <SummaryPanel lang={lang} />}
        {tab === "goleadores" && <ScorersTable lang={lang} />}
        {tab === "partidos" && <MatchList lang={lang} />}
        {tab === "grupos" && <GroupsGrid lang={lang} />}
      </div>
    </div>
  );
}
