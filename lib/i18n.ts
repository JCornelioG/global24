import type { Locale } from "./types";

/**
 * Diccionarios de UI. Objetos planos y serializables: pueden pasarse
 * como props a componentes cliente sin problema.
 */
const es = {
  langName: "Español",
  otherLangName: "English",
  nav: {
    inicio: "Inicio",
    mundial: "Mundial",
    menu: "Menú",
    close: "Cerrar",
  },
  common: {
    breaking: "Última hora",
    latest: "Lo último",
    trending: "Tendencias",
    seeAll: "Ver todo",
    readMore: "Leer más",
    source: "Fuente",
    updated: "Actualizado",
    live: "EN VIVO",
    today: "Hoy",
    share: "Compartir",
    backHome: "Volver al inicio",
    noNews: "No hay noticias disponibles en este momento. Vuelve a intentarlo en unos minutos.",
    externalNote: "Los titulares enlazan al medio original.",
  },
  home: {
    heroKicker: "Portada",
    topStories: "Destacadas",
    moreNews: "Más noticias",
    inBrief: "En breve",
    newsletterTitle: "El mundo en tu correo",
    newsletterBody: "Un resumen diario con lo más importante del día, seleccionado por nuestra redacción.",
    newsletterPlaceholder: "tu@correo.com",
    newsletterCta: "Suscribirme",
    newsletterDone: "¡Listo! Revisa tu correo para confirmar la suscripción.",
    newsletterDisclaimer: "Sin spam. Cancela cuando quieras.",
    mundialPromoKicker: "Copa Mundial de la FIFA · 2026",
    mundialPromoTitle: "Centro del Mundial",
    mundialPromoBody: "Cruces, resultados, goleadores y todos los grupos, actualizado al minuto.",
    mundialPromoCta: "Ir al Centro del Mundial",
    todayMatches: "Partidos de hoy",
  },
  category: {
    updatedNote: "Se actualiza automáticamente durante el día",
    latestIn: "Lo último en",
  },
  mundial: {
    kicker: "Copa Mundial de la FIFA · 2026",
    title: "Centro del Mundial",
    phase: "Fase",
    today: "Hoy",
    liveNow: "En vivo",
    matches: "partidos",
    none: "—",
    tabs: {
      avance: "Avance",
      resumen: "Resumen",
      goleadores: "Goleadores",
      partidos: "Partidos",
      grupos: "Grupos",
    },
    rounds: {
      grupos: "Fase de grupos",
      r32: "Dieciseisavos",
      r16: "Octavos",
      qf: "Cuartos",
      sf: "Semifinales",
      third: "Tercer puesto",
      final: "Final",
    },
    roundsShort: {
      r32: "16vos",
      r16: "8vos",
      qf: "Cuartos",
      sf: "Semis",
      final: "Final",
    },
    inProgress: "En curso",
    finished: "FIN",
    pens: "pen.",
    group: "Grupo",
    table: { pj: "PJ", g: "G", e: "E", p: "P", gf: "GF", gc: "GC", pts: "Pts" },
    advancedNote: "Clasificados a dieciseisavos",
    goals: "Goles",
    assists: "Asist.",
    player: "Jugador",
    team: "Selección",
    upcoming: "Próximos partidos",
    results: "Resultados",
    statsTitle: "El torneo en números",
    statMatches: "Partidos jugados",
    statGoals: "Goles",
    statAvgGoals: "Goles por partido",
    statAttendance: "Asistencia promedio",
    bracketHint: "Desliza para ver el cuadro completo",
    dataNote: "Datos del torneo actualizados por la redacción.",
  },
  article: {
    synthesis: "En síntesis",
    quoteLabel: "Extracto de {source}",
    readOriginal: "Leer el artículo completo en {source}",
    related: "Cobertura relacionada",
    copyLink: "Copiar enlace",
    copied: "¡Enlace copiado!",
    aiNote: "Síntesis generada automáticamente por la redacción digital de Global24 a partir de fuentes públicas.",
    editorialNote: "Resumen contextual elaborado por Global24 a partir de metadatos públicos de la fuente.",
    disclaimer: "El contenido original pertenece a {source}. Global24 es un agregador y siempre enlaza a la fuente.",
    fallbackP1:
      "Esta historia fue publicada por {source} y forma parte de la cobertura de {category} que Global24 monitorea en tiempo real a partir de fuentes públicas.",
    fallbackP2Related:
      "El tema también aparece en la cobertura de otras redacciones: {sources} publicaron notas relacionadas en las últimas horas. Abajo podés compararlas.",
    fallbackP2Solo:
      "Por ahora es la única cobertura destacada sobre el tema en nuestras fuentes; esta página se actualizará a medida que otros medios lo levanten.",
  },
  footer: {
    tagline: "Noticias del mundo, al instante.",
    sections: "Secciones",
    about: "Global24 es un agregador de noticias en tiempo real. Los titulares e imágenes pertenecen a sus medios originales y enlazan a la fuente.",
    sources: "Fuentes: Google News, GDELT Project y feeds RSS de medios internacionales. Datos de mercado: Yahoo Finance.",
    rights: "Todos los derechos reservados.",
  },
  meta: {
    homeTitle: "Global24 — Noticias del mundo, al instante",
    homeDesc:
      "Últimas noticias de internacional, política, negocios, tecnología, ciencia, salud, deportes, artes y entretenimiento. Cobertura especial de la Copa Mundial de la FIFA 2026.",
    mundialTitle: "Centro del Mundial 2026: cruces, resultados y goleadores",
    mundialDesc:
      "Sigue la Copa Mundial de la FIFA 2026 en vivo: cuadro de eliminatorias, resultados, tabla de goleadores, calendario de partidos y todos los grupos.",
    categoryDesc: "Últimas noticias de {category}: titulares, análisis y cobertura en tiempo real en Global24.",
    notFoundTitle: "Página no encontrada",
  },
  notFound: {
    title: "404 — Página no encontrada",
    body: "La página que buscas no existe o fue movida.",
  },
};

const en: typeof es = {
  langName: "English",
  otherLangName: "Español",
  nav: {
    inicio: "Home",
    mundial: "World Cup",
    menu: "Menu",
    close: "Close",
  },
  common: {
    breaking: "Breaking",
    latest: "Latest",
    trending: "Trending",
    seeAll: "See all",
    readMore: "Read more",
    source: "Source",
    updated: "Updated",
    live: "LIVE",
    today: "Today",
    share: "Share",
    backHome: "Back to home",
    noNews: "No news available right now. Please try again in a few minutes.",
    externalNote: "Headlines link to the original outlet.",
  },
  home: {
    heroKicker: "Front page",
    topStories: "Top stories",
    moreNews: "More news",
    inBrief: "In brief",
    newsletterTitle: "The world in your inbox",
    newsletterBody: "A daily briefing with the day's most important stories, curated by our newsroom.",
    newsletterPlaceholder: "you@email.com",
    newsletterCta: "Subscribe",
    newsletterDone: "Done! Check your inbox to confirm your subscription.",
    newsletterDisclaimer: "No spam. Unsubscribe anytime.",
    mundialPromoKicker: "FIFA World Cup · 2026",
    mundialPromoTitle: "World Cup Center",
    mundialPromoBody: "Bracket, results, top scorers and every group, updated to the minute.",
    mundialPromoCta: "Go to the World Cup Center",
    todayMatches: "Today's matches",
  },
  category: {
    updatedNote: "Automatically updated throughout the day",
    latestIn: "Latest in",
  },
  mundial: {
    kicker: "FIFA World Cup · 2026",
    title: "World Cup Center",
    phase: "Stage",
    today: "Today",
    liveNow: "Live",
    matches: "matches",
    none: "—",
    tabs: {
      avance: "Bracket",
      resumen: "Overview",
      goleadores: "Top scorers",
      partidos: "Matches",
      grupos: "Groups",
    },
    rounds: {
      grupos: "Group stage",
      r32: "Round of 32",
      r16: "Round of 16",
      qf: "Quarter-finals",
      sf: "Semi-finals",
      third: "Third place",
      final: "Final",
    },
    roundsShort: {
      r32: "R32",
      r16: "R16",
      qf: "QF",
      sf: "SF",
      final: "Final",
    },
    inProgress: "In progress",
    finished: "FT",
    pens: "pens",
    group: "Group",
    table: { pj: "P", g: "W", e: "D", p: "L", gf: "GF", gc: "GA", pts: "Pts" },
    advancedNote: "Qualified for the round of 32",
    goals: "Goals",
    assists: "Assists",
    player: "Player",
    team: "Team",
    upcoming: "Upcoming matches",
    results: "Results",
    statsTitle: "The tournament in numbers",
    statMatches: "Matches played",
    statGoals: "Goals",
    statAvgGoals: "Goals per match",
    statAttendance: "Average attendance",
    bracketHint: "Swipe to see the full bracket",
    dataNote: "Tournament data curated by our newsroom.",
  },
  article: {
    synthesis: "In brief",
    quoteLabel: "Excerpt from {source}",
    readOriginal: "Read the full article at {source}",
    related: "Related coverage",
    copyLink: "Copy link",
    copied: "Link copied!",
    aiNote: "Brief generated automatically by Global24's digital newsroom from public sources.",
    editorialNote: "Contextual summary produced by Global24 from the source's public metadata.",
    disclaimer: "The original content belongs to {source}. Global24 is an aggregator and always links to the source.",
    fallbackP1:
      "This story was published by {source} and is part of the {category} coverage that Global24 monitors in real time from public sources.",
    fallbackP2Related:
      "The topic also appears in other newsrooms' coverage: {sources} published related stories in the last few hours. You can compare them below.",
    fallbackP2Solo:
      "For now this is the only highlighted coverage of the topic among our sources; this page will update as other outlets pick it up.",
  },
  footer: {
    tagline: "World news, in real time.",
    sections: "Sections",
    about: "Global24 is a real-time news aggregator. Headlines and images belong to their original outlets and link to the source.",
    sources: "Sources: Google News, GDELT Project and RSS feeds from international outlets. Market data: Yahoo Finance.",
    rights: "All rights reserved.",
  },
  meta: {
    homeTitle: "Global24 — World news, in real time",
    homeDesc:
      "Breaking news in world, politics, business, technology, science, health, sports, arts and entertainment. Special coverage of the 2026 FIFA World Cup.",
    mundialTitle: "2026 World Cup Center: bracket, results and top scorers",
    mundialDesc:
      "Follow the 2026 FIFA World Cup live: knockout bracket, results, top scorers table, match schedule and every group.",
    categoryDesc: "Latest {category} news: headlines, analysis and real-time coverage on Global24.",
    notFoundTitle: "Page not found",
  },
  notFound: {
    title: "404 — Page not found",
    body: "The page you are looking for does not exist or was moved.",
  },
};

export type Dict = typeof es;

const dicts: Record<Locale, Dict> = { es, en };

export function getDict(lang: Locale): Dict {
  return dicts[lang] ?? dicts.es;
}

/** Reemplaza placeholders {clave} en textos del diccionario. */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}
