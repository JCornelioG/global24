import { formatDateShort } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { getWorldCup } from "@/lib/worldcup";

/** Línea de fases del torneo con la fase actual resaltada en dorado. */
export default function PhaseTimeline({
  lang,
  currentPhaseId,
}: {
  lang: Locale;
  currentPhaseId: string;
}) {
  const dict = getDict(lang);
  const phases = getWorldCup().phases;
  const currentIdx = phases.findIndex((p) => p.id === currentPhaseId);

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <ol className="flex min-w-[680px] items-start">
        {phases.map((phase, i) => {
          const active = i === currentIdx;
          const past = currentIdx >= 0 && i < currentIdx;
          const isFinal = i === phases.length - 1;
          const label = lang === "es" ? phase.labelEs : phase.labelEn;
          const dates =
            phase.start === phase.end
              ? formatDateShort(phase.start, lang)
              : `${formatDateShort(phase.start, lang)} – ${formatDateShort(phase.end, lang)}`;

          return (
            <li key={phase.id} className="flex-1">
              <div className="flex items-center">
                <span className={`h-px flex-1 ${i === 0 ? "opacity-0" : ""} ${past || active ? "bg-gold-dim" : "bg-line"}`} />
                <span
                  className={`grid size-4 shrink-0 place-items-center rounded-full text-[8px] ${
                    active
                      ? "bg-gold ring-4 ring-gold/20"
                      : past
                        ? "bg-gold-dim"
                        : isFinal
                          ? "border border-gold-dim bg-panel"
                          : "bg-line"
                  }`}
                >
                  {isFinal && <span aria-hidden>🏆</span>}
                </span>
                <span className={`h-px flex-1 ${isFinal ? "opacity-0" : ""} ${past ? "bg-gold-dim" : "bg-line"}`} />
              </div>
              <div className="mt-2 px-1 text-center">
                <p className={`text-xs font-semibold ${active ? "text-gold" : past ? "text-muted" : "text-faint"}`}>
                  {label}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-faint">
                  {active ? `${dict.mundial.inProgress} · ${dates}` : dates}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
