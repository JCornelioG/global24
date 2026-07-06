import "server-only";
import { unstable_cache } from "next/cache";
import { WORLD_CUP } from "@/data/worldcup";
import type { GroupStanding, RoundId, Team, WCGroup, WCMatch, WorldCupData } from "./types";

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
    next: { revalidate: 600 },
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

  return {
    // Editorial/estático: edición, fases, goleadores, highlights.
    ...WORLD_CUP,
    teams,
    matches,
    groups,
    stats: {
      matchesPlayed,
      goals,
      avgGoals: matchesPlayed ? Number((goals / matchesPlayed).toFixed(2)) : 0,
      avgAttendance: WORLD_CUP.stats.avgAttendance,
    },
  };
}

const cachedLive = unstable_cache((token: string) => buildLiveData(token), ["worldcup-live"], {
  revalidate: 600,
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
