import { WORLD_CUP } from "@/data/worldcup";
import type { Locale, RoundId, WCMatch, WCPhase, WorldCupData } from "./types";

export function getWorldCup(): WorldCupData {
  return WORLD_CUP;
}

export function teamName(code: string | undefined, lang: Locale): string {
  const team = code ? WORLD_CUP.teams[code] : undefined;
  if (!team) return "";
  return lang === "es" ? team.nameEs : team.nameEn;
}

export function teamFlag(code: string | undefined): string {
  return (code && WORLD_CUP.teams[code]?.flag) || "⚽";
}

export function matchesByRound(round: RoundId): WCMatch[] {
  return WORLD_CUP.matches.filter((m) => m.round === round);
}

/** Fecha local "YYYY-MM-DD" (sin depender de la zona UTC). */
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function matchesOn(date: string): WCMatch[] {
  return WORLD_CUP.matches.filter((m) => m.date === date);
}

export function todayMatches(now: Date = new Date()): WCMatch[] {
  return matchesOn(isoDate(now));
}

/** Fase en curso; si el torneo no empezó devuelve la primera, si terminó la última. */
export function currentPhase(now: Date = new Date()): WCPhase {
  const today = isoDate(now);
  const phases = WORLD_CUP.phases;
  for (const phase of phases) {
    if (today >= phase.start && today <= phase.end) return phase;
  }
  const upcoming = phases.find((phase) => today < phase.start);
  return upcoming ?? phases[phases.length - 1];
}

/**
 * Partidos en vivo: los marcados "live" y, como aproximación, los de hoy
 * cuya hora de inicio quedó dentro de las últimas 2 horas.
 */
export function liveMatches(now: Date = new Date()): WCMatch[] {
  const today = isoDate(now);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return WORLD_CUP.matches.filter((m) => {
    if (m.status === "live") return true;
    if (m.status !== "scheduled" || m.date !== today || !m.time) return false;
    const [h, min] = m.time.split(":").map(Number);
    const start = h * 60 + (min || 0);
    return minutesNow >= start && minutesNow <= start + 120;
  });
}

const ROUND_LABELS: Record<RoundId, { es: string; en: string }> = {
  r32: { es: "Dieciseisavos", en: "Round of 32" },
  r16: { es: "Octavos", en: "Round of 16" },
  qf: { es: "Cuartos", en: "Quarter-finals" },
  sf: { es: "Semifinales", en: "Semi-finals" },
  third: { es: "Tercer puesto", en: "Third place" },
  final: { es: "Final", en: "Final" },
};

export function roundLabel(round: RoundId, lang: Locale): string {
  return ROUND_LABELS[round][lang];
}

/** Ganador de un partido finalizado (por goles o penales). */
export function matchWinner(m: WCMatch): "home" | "away" | undefined {
  if (m.status !== "finished" || m.homeScore === undefined || m.awayScore === undefined) {
    return undefined;
  }
  if (m.homeScore !== m.awayScore) return m.homeScore > m.awayScore ? "home" : "away";
  if (m.homePens !== undefined && m.awayPens !== undefined) {
    return m.homePens > m.awayPens ? "home" : "away";
  }
  return undefined;
}
