import type { WorldCupData } from "@/lib/types";

/**
 * Datos del torneo (editables por la redacción).
 *
 * No existe una API pública gratuita y estable con los datos en vivo del
 * Mundial 2026, así que este archivo actúa como fuente de verdad editable.
 * La estructura está pensada para poder reemplazarse por una API en el
 * futuro sin tocar la UI: basta con producir un objeto `WorldCupData`.
 */
export const WORLD_CUP: WorldCupData = {
  edition: { es: "Copa Mundial de la FIFA · 2026", en: "FIFA World Cup · 2026" },

  teams: {
    GER: { code: "GER", nameEs: "Alemania", nameEn: "Germany", flag: "🇩🇪" },
    PAR: { code: "PAR", nameEs: "Paraguay", nameEn: "Paraguay", flag: "🇵🇾" },
    FRA: { code: "FRA", nameEs: "Francia", nameEn: "France", flag: "🇫🇷" },
    SWE: { code: "SWE", nameEs: "Suecia", nameEn: "Sweden", flag: "🇸🇪" },
    RSA: { code: "RSA", nameEs: "Sudáfrica", nameEn: "South Africa", flag: "🇿🇦" },
    CAN: { code: "CAN", nameEs: "Canadá", nameEn: "Canada", flag: "🇨🇦" },
    NED: { code: "NED", nameEs: "P. Bajos", nameEn: "Netherlands", flag: "🇳🇱" },
    MAR: { code: "MAR", nameEs: "Marruecos", nameEn: "Morocco", flag: "🇲🇦" },
    POR: { code: "POR", nameEs: "Portugal", nameEn: "Portugal", flag: "🇵🇹" },
    CRO: { code: "CRO", nameEs: "Croacia", nameEn: "Croatia", flag: "🇭🇷" },
    ESP: { code: "ESP", nameEs: "España", nameEn: "Spain", flag: "🇪🇸" },
    AUT: { code: "AUT", nameEs: "Austria", nameEn: "Austria", flag: "🇦🇹" },
    USA: { code: "USA", nameEs: "EE.UU.", nameEn: "USA", flag: "🇺🇸" },
    BIH: { code: "BIH", nameEs: "Bosnia", nameEn: "Bosnia", flag: "🇧🇦" },
    BEL: { code: "BEL", nameEs: "Bélgica", nameEn: "Belgium", flag: "🇧🇪" },
    SEN: { code: "SEN", nameEs: "Senegal", nameEn: "Senegal", flag: "🇸🇳" },
    BRA: { code: "BRA", nameEs: "Brasil", nameEn: "Brazil", flag: "🇧🇷" },
    JPN: { code: "JPN", nameEs: "Japón", nameEn: "Japan", flag: "🇯🇵" },
    CIV: { code: "CIV", nameEs: "C. Marfil", nameEn: "Ivory Coast", flag: "🇨🇮" },
    NOR: { code: "NOR", nameEs: "Noruega", nameEn: "Norway", flag: "🇳🇴" },
    MEX: { code: "MEX", nameEs: "México", nameEn: "Mexico", flag: "🇲🇽" },
    ECU: { code: "ECU", nameEs: "Ecuador", nameEn: "Ecuador", flag: "🇪🇨" },
    ENG: { code: "ENG", nameEs: "Inglaterra", nameEn: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    COD: { code: "COD", nameEs: "RD Congo", nameEn: "DR Congo", flag: "🇨🇩" },
    ARG: { code: "ARG", nameEs: "Argentina", nameEn: "Argentina", flag: "🇦🇷" },
    CPV: { code: "CPV", nameEs: "C. Verde", nameEn: "Cape Verde", flag: "🇨🇻" },
    AUS: { code: "AUS", nameEs: "Australia", nameEn: "Australia", flag: "🇦🇺" },
    EGY: { code: "EGY", nameEs: "Egipto", nameEn: "Egypt", flag: "🇪🇬" },
    SUI: { code: "SUI", nameEs: "Suiza", nameEn: "Switzerland", flag: "🇨🇭" },
    ALG: { code: "ALG", nameEs: "Argelia", nameEn: "Algeria", flag: "🇩🇿" },
    COL: { code: "COL", nameEs: "Colombia", nameEn: "Colombia", flag: "🇨🇴" },
    GHA: { code: "GHA", nameEs: "Ghana", nameEn: "Ghana", flag: "🇬🇭" },
    KOR: { code: "KOR", nameEs: "Corea del Sur", nameEn: "South Korea", flag: "🇰🇷" },
    TUN: { code: "TUN", nameEs: "Túnez", nameEn: "Tunisia", flag: "🇹🇳" },
    JOR: { code: "JOR", nameEs: "Jordania", nameEn: "Jordan", flag: "🇯🇴" },
    SCO: { code: "SCO", nameEs: "Escocia", nameEn: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    HAI: { code: "HAI", nameEs: "Haití", nameEn: "Haiti", flag: "🇭🇹" },
    UZB: { code: "UZB", nameEs: "Uzbekistán", nameEn: "Uzbekistan", flag: "🇺🇿" },
    NZL: { code: "NZL", nameEs: "N. Zelanda", nameEn: "New Zealand", flag: "🇳🇿" },
    ITA: { code: "ITA", nameEs: "Italia", nameEn: "Italy", flag: "🇮🇹" },
    QAT: { code: "QAT", nameEs: "Catar", nameEn: "Qatar", flag: "🇶🇦" },
    URU: { code: "URU", nameEs: "Uruguay", nameEn: "Uruguay", flag: "🇺🇾" },
    PAN: { code: "PAN", nameEs: "Panamá", nameEn: "Panama", flag: "🇵🇦" },
    CRC: { code: "CRC", nameEs: "Costa Rica", nameEn: "Costa Rica", flag: "🇨🇷" },
    CUW: { code: "CUW", nameEs: "Curazao", nameEn: "Curaçao", flag: "🇨🇼" },
    KSA: { code: "KSA", nameEs: "A. Saudita", nameEn: "Saudi Arabia", flag: "🇸🇦" },
    IRN: { code: "IRN", nameEs: "Irán", nameEn: "Iran", flag: "🇮🇷" },
    JAM: { code: "JAM", nameEs: "Jamaica", nameEn: "Jamaica", flag: "🇯🇲" },
  },

  phases: [
    { id: "grupos", labelEs: "Fase de grupos", labelEn: "Group stage", start: "2026-06-11", end: "2026-06-27" },
    { id: "r32", labelEs: "Dieciseisavos", labelEn: "Round of 32", start: "2026-06-28", end: "2026-07-03" },
    { id: "r16", labelEs: "Octavos", labelEn: "Round of 16", start: "2026-07-04", end: "2026-07-07" },
    { id: "qf", labelEs: "Cuartos", labelEn: "Quarter-finals", start: "2026-07-09", end: "2026-07-11" },
    { id: "sf", labelEs: "Semifinales", labelEn: "Semi-finals", start: "2026-07-14", end: "2026-07-15" },
    { id: "final", labelEs: "Final", labelEn: "Final", start: "2026-07-19", end: "2026-07-19" },
  ],

  matches: [
    /* ------------------------- Dieciseisavos (R32) ------------------------ */
    // Lado izquierdo del cuadro
    { id: "r32-1", round: "r32", home: "GER", away: "PAR", homeScore: 1, awayScore: 1, homePens: 3, awayPens: 4, date: "2026-06-29", time: "16:00", venue: "Estadio Azteca", city: "Ciudad de México", status: "finished", feedsInto: "r16-1" },
    { id: "r32-2", round: "r32", home: "FRA", away: "SWE", homeScore: 3, awayScore: 0, date: "2026-06-30", time: "18:00", venue: "MetLife Stadium", city: "Nueva York", status: "finished", feedsInto: "r16-1" },
    { id: "r32-3", round: "r32", home: "RSA", away: "CAN", homeScore: 0, awayScore: 1, date: "2026-06-28", time: "13:00", venue: "BC Place", city: "Vancouver", status: "finished", feedsInto: "r16-2" },
    { id: "r32-4", round: "r32", home: "NED", away: "MAR", homeScore: 1, awayScore: 1, homePens: 2, awayPens: 4, date: "2026-06-29", time: "12:00", venue: "AT&T Stadium", city: "Dallas", status: "finished", feedsInto: "r16-2" },
    { id: "r32-5", round: "r32", home: "POR", away: "CRO", homeScore: 2, awayScore: 1, date: "2026-07-02", time: "17:00", venue: "SoFi Stadium", city: "Los Ángeles", status: "finished", feedsInto: "r16-3" },
    { id: "r32-6", round: "r32", home: "ESP", away: "AUT", homeScore: 3, awayScore: 0, date: "2026-07-02", time: "14:00", venue: "NRG Stadium", city: "Houston", status: "finished", feedsInto: "r16-3" },
    { id: "r32-7", round: "r32", home: "USA", away: "BIH", homeScore: 2, awayScore: 0, date: "2026-07-01", time: "19:00", venue: "Lincoln Financial Field", city: "Filadelfia", status: "finished", feedsInto: "r16-4" },
    { id: "r32-8", round: "r32", home: "BEL", away: "SEN", homeScore: 3, awayScore: 2, date: "2026-07-01", time: "15:00", venue: "Gillette Stadium", city: "Boston", status: "finished", feedsInto: "r16-4" },
    // Lado derecho del cuadro
    { id: "r32-9", round: "r32", home: "BRA", away: "JPN", homeScore: 2, awayScore: 1, date: "2026-06-29", time: "20:00", venue: "Hard Rock Stadium", city: "Miami", status: "finished", feedsInto: "r16-5" },
    { id: "r32-10", round: "r32", home: "CIV", away: "NOR", homeScore: 1, awayScore: 2, date: "2026-06-30", time: "14:00", venue: "Lumen Field", city: "Seattle", status: "finished", feedsInto: "r16-5" },
    { id: "r32-11", round: "r32", home: "MEX", away: "ECU", homeScore: 2, awayScore: 0, date: "2026-06-30", time: "20:00", venue: "Estadio Akron", city: "Guadalajara", status: "finished", feedsInto: "r16-6" },
    { id: "r32-12", round: "r32", home: "ENG", away: "COD", homeScore: 2, awayScore: 1, date: "2026-07-01", time: "12:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: "finished", feedsInto: "r16-6" },
    { id: "r32-13", round: "r32", home: "ARG", away: "CPV", homeScore: 3, awayScore: 2, date: "2026-07-03", time: "16:00", venue: "MetLife Stadium", city: "Nueva York", status: "finished", feedsInto: "r16-7" },
    { id: "r32-14", round: "r32", home: "AUS", away: "EGY", homeScore: 1, awayScore: 1, homePens: 2, awayPens: 4, date: "2026-07-03", time: "13:00", venue: "Levi's Stadium", city: "San Francisco", status: "finished", feedsInto: "r16-7" },
    { id: "r32-15", round: "r32", home: "SUI", away: "ALG", homeScore: 2, awayScore: 0, date: "2026-07-02", time: "11:00", venue: "Arrowhead Stadium", city: "Kansas City", status: "finished", feedsInto: "r16-8" },
    { id: "r32-16", round: "r32", home: "COL", away: "GHA", homeScore: 1, awayScore: 0, date: "2026-07-03", time: "19:00", venue: "Estadio BBVA", city: "Monterrey", status: "finished", feedsInto: "r16-8" },

    /* ---------------------------- Octavos (R16) --------------------------- */
    { id: "r16-1", round: "r16", home: "PAR", away: "FRA", date: "2026-07-04", time: "16:00", venue: "Estadio Azteca", city: "Ciudad de México", status: "scheduled", feedsInto: "qf-1" },
    { id: "r16-2", round: "r16", home: "CAN", away: "MAR", date: "2026-07-04", time: "12:00", venue: "BMO Field", city: "Toronto", status: "scheduled", feedsInto: "qf-1" },
    { id: "r16-3", round: "r16", home: "POR", away: "ESP", date: "2026-07-06", time: "14:00", venue: "AT&T Stadium", city: "Dallas", status: "scheduled", feedsInto: "qf-2" },
    { id: "r16-4", round: "r16", home: "USA", away: "BEL", date: "2026-07-06", time: "19:00", venue: "MetLife Stadium", city: "Nueva York", status: "scheduled", feedsInto: "qf-2" },
    { id: "r16-5", round: "r16", home: "BRA", away: "NOR", date: "2026-07-05", time: "15:00", venue: "Hard Rock Stadium", city: "Miami", status: "scheduled", feedsInto: "qf-3" },
    { id: "r16-6", round: "r16", home: "MEX", away: "ENG", date: "2026-07-05", time: "19:00", venue: "Estadio Azteca", city: "Ciudad de México", status: "scheduled", feedsInto: "qf-3" },
    { id: "r16-7", round: "r16", home: "ARG", away: "EGY", date: "2026-07-07", time: "11:00", venue: "SoFi Stadium", city: "Los Ángeles", status: "scheduled", feedsInto: "qf-4" },
    { id: "r16-8", round: "r16", home: "SUI", away: "COL", date: "2026-07-07", time: "15:00", venue: "NRG Stadium", city: "Houston", status: "scheduled", feedsInto: "qf-4" },

    /* ------------------------------- Cuartos ------------------------------ */
    { id: "qf-1", round: "qf", homePlaceholder: { es: "Gan. 8vos 1", en: "R16 winner 1" }, awayPlaceholder: { es: "Gan. 8vos 2", en: "R16 winner 2" }, date: "2026-07-09", time: "15:00", venue: "Estadio Azteca", city: "Ciudad de México", status: "scheduled", feedsInto: "sf-1" },
    { id: "qf-2", round: "qf", homePlaceholder: { es: "Gan. 8vos 3", en: "R16 winner 3" }, awayPlaceholder: { es: "Gan. 8vos 4", en: "R16 winner 4" }, date: "2026-07-10", time: "14:00", venue: "MetLife Stadium", city: "Nueva York", status: "scheduled", feedsInto: "sf-1" },
    { id: "qf-3", round: "qf", homePlaceholder: { es: "Gan. 8vos 5", en: "R16 winner 5" }, awayPlaceholder: { es: "Gan. 8vos 6", en: "R16 winner 6" }, date: "2026-07-11", time: "16:00", venue: "AT&T Stadium", city: "Dallas", status: "scheduled", feedsInto: "sf-2" },
    { id: "qf-4", round: "qf", homePlaceholder: { es: "Gan. 8vos 7", en: "R16 winner 7" }, awayPlaceholder: { es: "Gan. 8vos 8", en: "R16 winner 8" }, date: "2026-07-11", time: "20:00", venue: "SoFi Stadium", city: "Los Ángeles", status: "scheduled", feedsInto: "sf-2" },

    /* ----------------------------- Semifinales ---------------------------- */
    { id: "sf-1", round: "sf", homePlaceholder: { es: "Gan. 4tos 1", en: "QF winner 1" }, awayPlaceholder: { es: "Gan. 4tos 2", en: "QF winner 2" }, date: "2026-07-14", time: "14:00", venue: "AT&T Stadium", city: "Dallas", status: "scheduled", feedsInto: "final" },
    { id: "sf-2", round: "sf", homePlaceholder: { es: "Gan. 4tos 3", en: "QF winner 3" }, awayPlaceholder: { es: "Gan. 4tos 4", en: "QF winner 4" }, date: "2026-07-15", time: "14:00", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: "scheduled", feedsInto: "final" },

    /* -------------------------- Tercer puesto y final --------------------- */
    { id: "third", round: "third", homePlaceholder: { es: "Perd. Semis 1", en: "SF loser 1" }, awayPlaceholder: { es: "Perd. Semis 2", en: "SF loser 2" }, date: "2026-07-18", time: "16:00", venue: "Hard Rock Stadium", city: "Miami", status: "scheduled" },
    { id: "final", round: "final", homePlaceholder: { es: "Gan. Semis 1", en: "SF winner 1" }, awayPlaceholder: { es: "Gan. Semis 2", en: "SF winner 2" }, date: "2026-07-19", time: "16:00", venue: "MetLife Stadium", city: "Nueva York", status: "scheduled" },
  ],

  groups: [
    { id: "A", standings: [
      { team: "MEX", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, points: 7, advanced: true },
      { team: "SWE", played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 2, points: 5, advanced: true },
      { team: "RSA", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, points: 4, advanced: true },
      { team: "KOR", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, points: 0, advanced: false },
    ]},
    { id: "B", standings: [
      { team: "CAN", played: 3, won: 3, drawn: 0, lost: 0, gf: 7, ga: 1, points: 9, advanced: true },
      { team: "CRO", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, points: 6, advanced: true },
      { team: "TUN", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 5, points: 3, advanced: false },
      { team: "JOR", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 6, points: 0, advanced: false },
    ]},
    { id: "C", standings: [
      { team: "BRA", played: 3, won: 2, drawn: 1, lost: 0, gf: 8, ga: 2, points: 7, advanced: true },
      { team: "NOR", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 1, points: 7, advanced: true },
      { team: "SCO", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 6, points: 3, advanced: false },
      { team: "HAI", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 8, points: 0, advanced: false },
    ]},
    { id: "D", standings: [
      { team: "USA", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 1, points: 7, advanced: true },
      { team: "PAR", played: 3, won: 1, drawn: 2, lost: 0, gf: 3, ga: 1, points: 5, advanced: true },
      { team: "CIV", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, points: 4, advanced: true },
      { team: "UZB", played: 3, won: 0, drawn: 0, lost: 3, gf: 0, ga: 5, points: 0, advanced: false },
    ]},
    { id: "E", standings: [
      { team: "FRA", played: 3, won: 3, drawn: 0, lost: 0, gf: 9, ga: 1, points: 9, advanced: true },
      { team: "SEN", played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, points: 6, advanced: true },
      { team: "BIH", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 5, points: 3, advanced: true },
      { team: "NZL", played: 3, won: 0, drawn: 0, lost: 3, gf: 0, ga: 6, points: 0, advanced: false },
    ]},
    { id: "F", standings: [
      { team: "ARG", played: 3, won: 3, drawn: 0, lost: 0, gf: 7, ga: 1, points: 9, advanced: true },
      { team: "AUS", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, points: 4, advanced: true },
      { team: "ALG", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 5, points: 4, advanced: true },
      { team: "ITA", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 4, points: 0, advanced: false },
    ]},
    { id: "G", standings: [
      { team: "ESP", played: 3, won: 3, drawn: 0, lost: 0, gf: 8, ga: 0, points: 9, advanced: true },
      { team: "ECU", played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, points: 6, advanced: true },
      { team: "CPV", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 6, points: 3, advanced: true },
      { team: "QAT", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, points: 0, advanced: false },
    ]},
    { id: "H", standings: [
      { team: "ENG", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, points: 7, advanced: true },
      { team: "EGY", played: 3, won: 1, drawn: 2, lost: 0, gf: 3, ga: 2, points: 5, advanced: true },
      { team: "URU", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 6, points: 3, advanced: false },
      { team: "PAN", played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 4, points: 1, advanced: false },
    ]},
    { id: "I", standings: [
      { team: "POR", played: 3, won: 3, drawn: 0, lost: 0, gf: 6, ga: 1, points: 9, advanced: true },
      { team: "MAR", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 2, points: 6, advanced: true },
      { team: "CRC", played: 3, won: 1, drawn: 0, lost: 2, gf: 1, ga: 4, points: 3, advanced: false },
      { team: "CUW", played: 3, won: 0, drawn: 0, lost: 3, gf: 0, ga: 5, points: 0, advanced: false },
    ]},
    { id: "J", standings: [
      { team: "GER", played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 3, points: 7, advanced: true },
      { team: "JPN", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, points: 4, advanced: true },
      { team: "GHA", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, points: 4, advanced: true },
      { team: "KSA", played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 5, points: 1, advanced: false },
    ]},
    { id: "K", standings: [
      { team: "NED", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, points: 7, advanced: true },
      { team: "COL", played: 3, won: 2, drawn: 1, lost: 0, gf: 4, ga: 1, points: 7, advanced: true },
      { team: "AUT", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, points: 3, advanced: true },
      { team: "IRN", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 5, points: 0, advanced: false },
    ]},
    { id: "L", standings: [
      { team: "BEL", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, points: 7, advanced: true },
      { team: "SUI", played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 2, points: 5, advanced: true },
      { team: "COD", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, points: 4, advanced: true },
      { team: "JAM", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 6, points: 0, advanced: false },
    ]},
  ],

  scorers: [
    { player: "Kylian Mbappé", team: "FRA", goals: 5, assists: 2 },
    { player: "Erling Haaland", team: "NOR", goals: 4, assists: 1 },
    { player: "Lautaro Martínez", team: "ARG", goals: 4, assists: 0 },
    { player: "Lamine Yamal", team: "ESP", goals: 3, assists: 3 },
    { player: "Harry Kane", team: "ENG", goals: 3, assists: 1 },
    { player: "Vinícius Júnior", team: "BRA", goals: 3, assists: 2 },
    { player: "Santiago Giménez", team: "MEX", goals: 3, assists: 0 },
    { player: "Cristiano Ronaldo", team: "POR", goals: 3, assists: 0 },
    { player: "Jonathan David", team: "CAN", goals: 2, assists: 2 },
    { player: "Mohamed Salah", team: "EGY", goals: 2, assists: 1 },
  ],

  highlights: [
    {
      titleEs: "Alemania, eliminada en los penales",
      titleEn: "Germany knocked out on penalties",
      bodyEs: "Paraguay resistió 120 minutos con un bloque bajo impecable y eliminó a Alemania 4-3 en la tanda de penales del Estadio Azteca. Es la sorpresa más grande del torneo hasta ahora.",
      bodyEn: "Paraguay held out for 120 minutes with an impeccable low block and eliminated Germany 4-3 in the shootout at Estadio Azteca. It is the biggest upset of the tournament so far.",
    },
    {
      titleEs: "Marruecos repite la hazaña de 2022",
      titleEn: "Morocco repeats its 2022 feat",
      bodyEs: "Los Leones del Atlas volvieron a sacar a Países Bajos de un Mundial, esta vez por penales, y enfrentarán a Canadá en octavos con la ilusión intacta.",
      bodyEn: "The Atlas Lions once again knocked the Netherlands out of a World Cup, this time on penalties, and will face Canada in the round of 16.",
    },
    {
      titleEs: "Italia y Uruguay, fuera en la fase de grupos",
      titleEn: "Italy and Uruguay out in the group stage",
      bodyEs: "Las dos históricas quedaron eliminadas antes de los cruces: Italia no ganó ningún partido en el grupo F y Uruguay cayó en el grupo H frente a Inglaterra y Egipto.",
      bodyEn: "Two historic sides went home before the knockouts: Italy failed to win a match in Group F and Uruguay fell short in Group H behind England and Egypt.",
    },
    {
      titleEs: "Los tres anfitriones siguen vivos",
      titleEn: "All three hosts are still alive",
      bodyEs: "México, Estados Unidos y Canadá clasificaron a octavos por primera vez en simultáneo. El Azteca recibirá el México–Inglaterra, el partido más esperado de la ronda.",
      bodyEn: "Mexico, the United States and Canada all reached the round of 16. The Azteca will host Mexico–England, the most anticipated match of the round.",
    },
    {
      titleEs: "Mbappé manda en la tabla de goleadores",
      titleEn: "Mbappé leads the scoring chart",
      bodyEs: "Con cinco goles y dos asistencias, el francés llega lanzado al cruce con Paraguay. Haaland y Lautaro Martínez lo siguen con cuatro.",
      bodyEn: "With five goals and two assists, the Frenchman heads into the Paraguay tie in top form. Haaland and Lautaro Martínez follow with four each.",
    },
  ],

  stats: { matchesPlayed: 88, goals: 227, avgGoals: 2.58, avgAttendance: 61400 },
};
