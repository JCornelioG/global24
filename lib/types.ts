export type Locale = "es" | "en";

export const LOCALES: readonly Locale[] = ["es", "en"] as const;

export const CATEGORY_SLUGS = [
  "internacional",
  "politica",
  "negocios",
  "tecnologia",
  "ciencia",
  "salud",
  "deportes",
  "artes",
  "entretenimiento",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/* ------------------------------- Noticias ------------------------------- */

export interface Article {
  /** Hash estable derivado de la URL. */
  id: string;
  title: string;
  /** Enlace externo al artículo original. */
  url: string;
  /** Nombre del medio (ej. "BBC Mundo"). */
  source: string;
  /** Fecha de publicación en ISO 8601. */
  publishedAt: string;
  /** URL absoluta https de la imagen; ausente si la fuente no provee una. */
  image?: string;
  description?: string;
  category: CategorySlug;
  lang: Locale;
}

/* ------------------------------- Mercados ------------------------------- */

export type MarketKind = "fx" | "crypto" | "commodity" | "index";

export interface MarketQuote {
  /** Símbolo de Yahoo Finance (ej. "^GSPC", "BTC-USD"). */
  symbol: string;
  label: { es: string; en: string };
  price: number;
  /** Variación porcentual respecto al cierre previo (ej. -1.7). */
  changePct: number;
  kind: MarketKind;
  /** Decimales a mostrar para el precio. */
  precision: number;
}

/* -------------------------------- Mundial ------------------------------- */

export type MatchStatus = "finished" | "live" | "scheduled";

export type RoundId = "r32" | "r16" | "qf" | "sf" | "third" | "final";

export interface Team {
  code: string;
  nameEs: string;
  nameEn: string;
  /** Emoji de bandera. */
  flag: string;
}

export interface WCMatch {
  id: string;
  round: RoundId;
  /** Código de equipo; undefined si aún no está definido. */
  home?: string;
  away?: string;
  /** Etiqueta para cupos por definir (ej. "Gan. 8vos 1"). */
  homePlaceholder?: { es: string; en: string };
  awayPlaceholder?: { es: string; en: string };
  homeScore?: number;
  awayScore?: number;
  /** Definición por penales, si la hubo. */
  homePens?: number;
  awayPens?: number;
  /** Fecha local "YYYY-MM-DD". */
  date: string;
  /** Hora local "HH:mm". */
  time?: string;
  venue?: string;
  city?: string;
  status: MatchStatus;
  /** id del partido de la siguiente ronda al que clasifica el ganador. */
  feedsInto?: string;
}

export interface GroupStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  /** true si clasificó a dieciseisavos. */
  advanced: boolean;
}

export interface WCGroup {
  id: string;
  standings: GroupStanding[];
}

export interface Scorer {
  player: string;
  team: string;
  goals: number;
  assists: number;
}

export interface WCPhase {
  id: string;
  labelEs: string;
  labelEn: string;
  start: string;
  end: string;
}

export interface WCHighlight {
  titleEs: string;
  titleEn: string;
  bodyEs: string;
  bodyEn: string;
}

export interface WorldCupData {
  edition: { es: string; en: string };
  teams: Record<string, Team>;
  matches: WCMatch[];
  groups: WCGroup[];
  scorers: Scorer[];
  phases: WCPhase[];
  highlights: WCHighlight[];
  stats: { matchesPlayed: number; goals: number; avgGoals: number; avgAttendance: number };
}
