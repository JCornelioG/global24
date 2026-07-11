import "server-only";
import { unstable_cache } from "next/cache";
import { WORLD_CUP } from "@/data/worldcup";
import type { GroupStanding, RoundId, Scorer, Team, WCGroup, WCHighlight, WCMatch, WorldCupData } from "./types";

/*
 * Datos en vivo del Mundial desde worldcup26.ir (API REST gratuita, token JWT
 * en WORLDCUP_API_TOKEN, válido ~84 días). Se mapea a la estructura WorldCupData
 * del sitio. Los campos editoriales (fases, goleadores, highlights, edición) se
 * mantienen del archivo estático. Ante falta de token o error, se devuelve null
 * y la app cae al bracket estático (data/worldcup.ts).
 */

const API_BASE = "https://worldcup26.ir";
const KNOCKOUT_ROUNDS = new Set<string>(["r32", "r16", "qf", "sf", "third", "final"]);
const TBD = { es: "Por definir", en: "TBD" };

interface ApiTeam {
  id: string;
  name_en: string;
  fifa_code: string;
  flag: string;
}
interface ApiGame {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  local_date: string;
  finished: string;
  time_elapsed: string;
  type: string;
}
interface ApiGroupTeam {
  team_id: string;
  mp: string;
  w: string;
  l: string;
  d: string;
  pts: string;
  gf: string;
  ga: string;
}
interface ApiGroup {
  name: string;
  teams: ApiGroupTeam[];
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return (await res.json()) as T;
}

/** "MM/DD/YYYY HH:mm" → { date: "YYYY-MM-DD", time: "HH:mm" }. */
function toIso(local: string): { date: string; time?: string } {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}:\d{2}))?/.exec(local);
  return m ? { date: `${m[3]}-${m[1]}-${m[2]}`, time: m[4] } : { date: local };
}

function num(v: string): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/*
 * Los goleadores que devuelve la API vienen a veces mal transliterados
 * (p. ej. "Hri Kin" = Harry Kane) y hasta partidos en varias grafías, lo que
 * descuadra el conteo. Este mapa normaliza las grafías conocidas a un nombre
 * canónico y fusiona los goles; las no mapeadas pasan tal cual. Al avanzar el
 * torneo puede requerir sumar goleadores nuevos.
 */
const SCORER_CANON: Record<string, string> = {
  "Hri Kin": "Harry Kane",
  "H. Kane": "Harry Kane",
  "K. Mbappé": "Kylian Mbappé",
  "Jvd Blingham": "Jude Bellingham",
  "Kvdi Khakpv": "Cody Gakpo",
  "Jvlian Kviinvnz": "Julián Quiñones",
  "Sharl D Ktlar": "Charles De Ketelaere",
  "Dniz Avndav": "Deniz Undav",
  "K. Havertz": "Kai Havertz",
  "Nikvlas Ph Ph": "Nicolas Pépé",
  "Svfian Rhimi": "Soufiane Rahimi",
  "Azdin Avnahi": "Azzedine Ounahi",
  "Jvhan Mnzambi": "Johan Manzambi",
  "Y.Ayari": "Yasin Ayari",
  "F. Balogun": "Folarin Balogun",
  "Dnil Mvnvz": "Daniel Muñoz",
  "Paph Gviih": "Pape Gueye",
  "Aiash Ivida": "Ayase Ueda",
  "Asmaail Saibari": "Ismael Saibari",
};

/** Nombres de goleadores de un campo home_scorers/away_scorers ('{"Kane 27\'",...}'). */
function parseGoalscorers(raw: string | undefined): string[] {
  if (!raw || raw === "null") return [];
  return [...raw.matchAll(/"([^"]*)"/g)]
    .map((m) => m[1])
    .filter((it) => !/\(og\)/i.test(it)) // autogol: no se acredita al jugador
    .map((it) => {
      const m = it.match(/^(.+?)\s+\d/); // nombre = texto antes del minuto
      const name = (m ? m[1] : it).replace(/\(p\)/gi, "").trim();
      return SCORER_CANON[name] ?? name;
    })
    .filter(Boolean);
}

async function buildLiveData(token: string): Promise<WorldCupData> {
  const [teamsRes, gamesRes, groupsRes] = await Promise.all([
    apiGet<{ teams: ApiTeam[] }>("/get/teams", token),
    apiGet<{ games: ApiGame[] }>("/get/games", token),
    apiGet<{ groups: ApiGroup[] }>("/get/groups", token),
  ]);

  const idToCode: Record<string, string> = {};
  const teams: Record<string, Team> = {};
  for (const t of teamsRes.teams) {
    if (!t.fifa_code) continue;
    idToCode[t.id] = t.fifa_code;
    teams[t.fifa_code] = {
      code: t.fifa_code,
      nameEn: t.name_en,
      // Nombre en español desde el archivo estático; si falta, el inglés.
      nameEs: WORLD_CUP.teams[t.fifa_code]?.nameEs ?? t.name_en,
      flag: t.flag,
    };
  }

  // Los equipos que llegan a dieciseisavos (r32) son los clasificados de grupos.
  const advanced = new Set<string>();
  for (const g of gamesRes.games) {
    if (g.type !== "r32") continue;
    const h = idToCode[g.home_team_id];
    const a = idToCode[g.away_team_id];
    if (h) advanced.add(h);
    if (a) advanced.add(a);
  }

  const matches: WCMatch[] = gamesRes.games
    .filter((g) => KNOCKOUT_ROUNDS.has(g.type))
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((g): WCMatch => {
      const { date, time } = toIso(g.local_date);
      const finished = g.finished === "TRUE";
      const live = !finished && /^\d+$/.test(g.time_elapsed);
      const home = idToCode[g.home_team_id] || undefined;
      const away = idToCode[g.away_team_id] || undefined;
      const showScore = finished || live;
      return {
        id: `g${g.id}`,
        round: g.type as RoundId,
        home,
        away,
        homePlaceholder: home ? undefined : TBD,
        awayPlaceholder: away ? undefined : TBD,
        homeScore: showScore ? num(g.home_score) : undefined,
        awayScore: showScore ? num(g.away_score) : undefined,
        date,
        time,
        status: finished ? "finished" : live ? "live" : "scheduled",
      };
    });

  // La numeración FIFA alterna mitades en cuartos (id 97,99 = izquierda;
  // 98,100 = derecha). El cuadro divide izquierda/derecha por orden, así que se
  // reordenan a [izq-arriba, izq-abajo, der-arriba, der-abajo] para que cada
  // cuarto quede junto a los octavos que lo alimentan.
  const qfStart = matches.findIndex((m) => m.round === "qf");
  if (qfStart >= 0 && matches[qfStart + 3]?.round === "qf") {
    const [a, b, c, d] = matches.slice(qfStart, qfStart + 4);
    matches.splice(qfStart, 4, a, c, b, d);
  }

  const groups: WCGroup[] = groupsRes.groups
    .map((gr): WCGroup => ({
      id: gr.name,
      standings: gr.teams
        .map((s): GroupStanding => {
          const code = idToCode[s.team_id] ?? s.team_id;
          return {
            team: code,
            played: num(s.mp) ?? 0,
            won: num(s.w) ?? 0,
            drawn: num(s.d) ?? 0,
            lost: num(s.l) ?? 0,
            gf: num(s.gf) ?? 0,
            ga: num(s.ga) ?? 0,
            points: num(s.pts) ?? 0,
            advanced: advanced.has(code),
          };
        })
        .sort((a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const finishedGames = gamesRes.games.filter((g) => g.finished === "TRUE");
  const goals = finishedGames.reduce((sum, g) => sum + (num(g.home_score) ?? 0) + (num(g.away_score) ?? 0), 0);
  const matchesPlayed = finishedGames.length;

  // Goleadores en vivo: se suman los goleadores de cada partido finalizado.
  const scorerTally = new Map<string, Scorer>();
  for (const g of finishedGames) {
    const sides: [string, string | undefined][] = [
      [g.home_scorers, idToCode[g.home_team_id]],
      [g.away_scorers, idToCode[g.away_team_id]],
    ];
    for (const [raw, code] of sides) {
      if (!code) continue;
      for (const player of parseGoalscorers(raw)) {
        const cur = scorerTally.get(`${player}|${code}`);
        if (cur) cur.goals += 1;
        else scorerTally.set(`${player}|${code}`, { player, team: code, goals: 1, assists: 0 });
      }
    }
  }
  const scorers = [...scorerTally.values()]
    .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player))
    .slice(0, 12);

  const highlights = buildHighlights(matches, scorers, teams);

  return {
    // Editorial/estático: edición, fases (goleadores y resumen ahora en vivo).
    ...WORLD_CUP,
    teams,
    matches,
    groups,
    scorers,
    highlights,
    stats: {
      matchesPlayed,
      goals,
      avgGoals: matchesPlayed ? Number((goals / matchesPlayed).toFixed(2)) : 0,
      avgAttendance: WORLD_CUP.stats.avgAttendance,
    },
  };
}

const ROUND_LABEL: Record<string, { es: string; en: string }> = {
  r32: { es: "Dieciseisavos", en: "Round of 32" },
  r16: { es: "Octavos de final", en: "Round of 16" },
  qf: { es: "Cuartos de final", en: "Quarter-finals" },
  sf: { es: "Semifinales", en: "Semi-finals" },
  third: { es: "Tercer puesto", en: "Third place" },
  final: { es: "La final", en: "The final" },
};

/*
 * Resumen editorial derivado de los resultados en vivo. Usa nombres de equipos
 * (limpios en la fuente) y evita apoyarse en nombres de jugadores salvo el líder
 * de goleadores (ya normalizado). Se adapta solo a la ronda vigente.
 */
function buildHighlights(matches: WCMatch[], scorers: Scorer[], teams: Record<string, Team>): WCHighlight[] {
  const nEs = (code?: string) => (code ? teams[code]?.nameEs ?? code : "");
  const nEn = (code?: string) => (code ? teams[code]?.nameEn ?? code : "");
  const out: WCHighlight[] = [];

  // 1. Líder de la tabla de goleadores (Bota de Oro).
  const top = scorers[0];
  if (top) {
    out.push({
      titleEs: `${top.player} lidera la tabla de goleadores`,
      titleEn: `${top.player} leads the scoring charts`,
      bodyEs: `El goleador de ${nEs(top.team)} acumula ${top.goals} goles y encabeza la pelea por la Bota de Oro del Mundial 2026.`,
      bodyEn: `${nEn(top.team)}'s top scorer has ${top.goals} goals and leads the race for the 2026 World Cup Golden Boot.`,
    });
  }

  // 2. Cruces de la próxima ronda con equipos ya definidos.
  const order: RoundId[] = ["r32", "r16", "qf", "sf", "third", "final"];
  for (const r of order) {
    const upcoming = matches.filter((m) => m.round === r && m.status !== "finished" && m.home && m.away);
    if (upcoming.length) {
      out.push({
        titleEs: `${ROUND_LABEL[r].es}: los cruces`,
        titleEn: `${ROUND_LABEL[r].en}: the matchups`,
        bodyEs: `Duelos definidos: ${upcoming.map((m) => `${nEs(m.home)}–${nEs(m.away)}`).join(" · ")}.`,
        bodyEn: `Confirmed ties: ${upcoming.map((m) => `${nEn(m.home)}–${nEn(m.away)}`).join(" · ")}.`,
      });
      break;
    }
  }

  // 3. Mayor goleada de la fase eliminatoria.
  const ko = matches.filter(
    (m) => m.status === "finished" && m.home && m.away && m.homeScore != null && m.awayScore != null,
  );
  if (ko.length) {
    const big = ko.reduce((best, m) => {
      const d = Math.abs((m.homeScore ?? 0) - (m.awayScore ?? 0));
      const bd = Math.abs((best.homeScore ?? 0) - (best.awayScore ?? 0));
      const t = (m.homeScore ?? 0) + (m.awayScore ?? 0);
      const bt = (best.homeScore ?? 0) + (best.awayScore ?? 0);
      return d > bd || (d === bd && t > bt) ? m : best;
    });
    out.push({
      titleEs: `Goleada en ${ROUND_LABEL[big.round]?.es.toLowerCase() ?? "la eliminatoria"}`,
      titleEn: `Rout in the ${ROUND_LABEL[big.round]?.en.toLowerCase() ?? "knockouts"}`,
      bodyEs: `${nEs(big.home)} ${big.homeScore}–${big.awayScore} ${nEs(big.away)}, el resultado más abultado de la fase eliminatoria hasta ahora.`,
      bodyEn: `${nEn(big.home)} ${big.homeScore}–${big.awayScore} ${nEn(big.away)}, the most emphatic knockout result so far.`,
    });
  }

  // 4. Situación de los tres anfitriones (México, EE. UU., Canadá).
  const alive = new Set<string>();
  for (const m of matches) {
    if (m.status !== "finished") {
      if (m.home) alive.add(m.home);
      if (m.away) alive.add(m.away);
    }
  }
  const hostsAlive = (["MEX", "USA", "CAN"] as const).filter((h) => alive.has(h));
  if (hostsAlive.length === 0) {
    out.push({
      titleEs: "Los tres anfitriones, eliminados",
      titleEn: "All three hosts are out",
      bodyEs: "México, Estados Unidos y Canadá quedaron fuera de su propio Mundial antes de los cuartos de final.",
      bodyEn: "Mexico, the United States and Canada exited their home World Cup before the quarter-finals.",
    });
  } else if (hostsAlive.length === 3) {
    out.push({
      titleEs: "Los tres anfitriones siguen vivos",
      titleEn: "All three hosts are still alive",
      bodyEs: "México, Estados Unidos y Canadá avanzaron y mantienen viva la ilusión local en el Mundial 2026.",
      bodyEn: "Mexico, the United States and Canada advanced and keep the home dream alive at the 2026 World Cup.",
    });
  } else {
    const es = hostsAlive.map(nEs).join(" y ");
    const en = hostsAlive.map(nEn).join(" and ");
    out.push({
      titleEs: `Anfitriones en carrera: ${es}`,
      titleEn: `Hosts still standing: ${en}`,
      bodyEs: `${es} mantiene(n) viva la bandera local en el Mundial 2026.`,
      bodyEn: `${en} keep the host nations' hopes alive at the 2026 World Cup.`,
    });
  }

  return out;
}

const cachedLive = unstable_cache((token: string) => buildLiveData(token), ["worldcup-live-v3"], {
  revalidate: 1800,
});

export async function fetchLiveWorldCup(): Promise<WorldCupData | null> {
  const token = process.env.WORLDCUP_API_TOKEN;
  if (!token) return null;
  try {
    return await cachedLive(token);
  } catch {
    return null;
  }
}

/** Datos del Mundial: en vivo desde la API si hay token, si no el estático. */
export async function getWorldCupData(): Promise<WorldCupData> {
  return (await fetchLiveWorldCup()) ?? WORLD_CUP;
}
