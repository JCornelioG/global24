# Global24 — Arquitectura y contratos

Sitio de noticias bilingüe (ES por defecto, EN secundario) estilo dark-premium con acento dorado, inspirado en portales editoriales modernos. Next.js 16.2 (App Router, Turbopack), React 19, Tailwind v4, TypeScript.

## Reglas para TODOS los agentes

1. **Next 16 tiene breaking changes**: `params` y `searchParams` son **Promise** (hay que `await`). No usar `middleware.ts` (renombrado a `proxy.ts`; aquí no usamos ninguno). Docs locales en `node_modules/next/dist/docs/` — consúltalas ante cualquier duda de API.
2. **Solo tocá los archivos de tu módulo** (ver mapa de propiedad). Los archivos compartidos (`lib/types.ts`, `lib/i18n.ts`, `lib/categories.ts`, `lib/format.ts`, `lib/site.ts`, `data/worldcup.ts`, `app/globals.css`, `app/[lang]/layout.tsx`, `next.config.ts`) YA EXISTEN y NO se modifican. Leelos antes de escribir tu código.
3. Server Components por defecto; `"use client"` solo donde hay interactividad (tabs, menú móvil, polling, onError de imágenes).
4. Única dependencia extra permitida: `fast-xml-parser` (ya instalada). No agregar ninguna otra.
5. Todo fetch externo: `try/catch`, `AbortSignal.timeout(8000)` y fallback que nunca rompa el render. Ante error, devolver `[]` o el último valor por defecto.
6. ISR clásico (NO usamos `cacheComponents`): en fetch usar `next: { revalidate: N }`; en páginas `export const revalidate = N`.
7. Textos de UI SIEMPRE desde `getDict(lang)` (`lib/i18n.ts`). Nada hardcodeado en un solo idioma.
8. Rutas internas con `localePath(lang, path)` de `lib/site.ts`. Enlaces externos de artículos: `<a target="_blank" rel="noopener noreferrer nofollow">`.
9. Estética (tokens de `globals.css`, Tailwind v4): fondo `bg-bg`, paneles `bg-panel`/`bg-panel-2`, bordes `border-line`/`border-line-soft`, texto `text-ink`/`text-muted`/`text-faint`, acento `text-gold`, alzas/bajas `text-up`/`text-down`. Titulares con `font-display`, cuerpo `font-body`. Clases helper existentes: `.container-page`, `.kicker`, `.card-hover`, `.image-fallback`, `.mundial-glow`, `.marquee`, `.marquee-track`, `.live-dot`, `.scrollbar-thin`. Bordes redondeados `rounded-lg`/`rounded-xl`; nada de blanco puro; alto contraste AA.
10. Responsive mobile-first obligatorio. Elementos anchos (bracket, tablas) dentro de contenedores `overflow-x-auto scrollbar-thin`.
11. Comentarios: pocos y solo para restricciones no evidentes, en español.

## Mapa de propiedad de archivos

| Módulo | Archivos (crear) |
|---|---|
| A · News data | `lib/news.ts`, `lib/rss.ts`, `lib/gdelt.ts`, `app/api/news/route.ts` |
| B · Markets | `lib/markets.ts`, `app/api/markets/route.ts`, `components/ticker/MarketTickerBar.tsx`, `components/ticker/MarketTicker.tsx` |
| C · UI chrome | `components/Header.tsx`, `components/MobileNav.tsx`, `components/LanguageSwitch.tsx`, `components/Footer.tsx`, `components/SmartImage.tsx`, `components/NewsCard.tsx`, `components/HeadlineList.tsx`, `components/SectionBlock.tsx`, `components/TrendingStrip.tsx`, `components/SectionHeading.tsx`, `components/NewsletterBox.tsx` |
| D · Páginas + SEO | `app/[lang]/page.tsx`, `app/[lang]/c/[slug]/page.tsx`, `app/[lang]/not-found.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` |
| E · Mundial | `lib/worldcup.ts`, `app/[lang]/mundial/page.tsx`, `components/mundial/MundialHub.tsx`, `components/mundial/PhaseTimeline.tsx`, `components/mundial/Bracket.tsx`, `components/mundial/MatchCard.tsx`, `components/mundial/GroupsGrid.tsx`, `components/mundial/ScorersTable.tsx`, `components/mundial/MatchList.tsx`, `components/mundial/SummaryPanel.tsx`, `components/mundial/MundialPromo.tsx` |

## Contratos entre módulos (respetar EXACTAMENTE)

### A · lib/news.ts (server-only)

```ts
import "server-only";
// Agrega Google News RSS (titulares curados, sin imagen) + feeds RSS de medios
// con imágenes (lib/categories.ts CATEGORIES[slug].feeds) + GDELT opcional.
// Dedupe por normalizeTitle(). Ordena por relevancia/fecha. Cachea con
// unstable_cache (revalidate: 600) por (lang, category).

export async function getNewsByCategory(lang: Locale, category: CategorySlug, limit?: number): Promise<Article[]>;
export async function getTopNews(lang: Locale, limit?: number): Promise<Article[]>;      // portada general
export async function getHomeSections(lang: Locale): Promise<Record<CategorySlug, Article[]>>; // ~8 por categoría
```

Detalles:
- Google News RSS: URLs desde `googleNewsHomeFeed(lang)` / `googleNewsCategoryFeed(slug, lang)`. El `<source>` del item es el nombre del medio; título viene como "Titular - Medio" → recortar el sufijo del medio.
- Feeds de medios: parsear `media:content`/`media:thumbnail`/`enclosure` para `image` (elegir la URL de mayor width disponible). `fast-xml-parser` con `ignoreAttributes: false`.
- GDELT (`lib/gdelt.ts`): DOC 2.0 `mode=ArtList&format=json`, `sourcelang:spa|eng`, usar `socialimage` como imagen. Respetar rate-limit: limitador global en módulo (1 req cada 5,5 s, cola por promesa) + si la respuesta no es JSON válido (texto de rate-limit) devolver `[]` sin lanzar. Env `GDELT_ENABLED=0` lo desactiva.
- Mezcla final por categoría: primero artículos CON imagen (para tarjetas), luego sin imagen (para listas de titulares). `getTopNews` = mezcla del feed principal de Google News + mejores con imagen de todas las categorías.
- `Article.id` = `stableId(url)`. `publishedAt` ISO. Filtrar items sin título o sin URL http(s).

### A · app/api/news/route.ts
`GET /api/news?lang=es&category=negocios&limit=12` → `{ articles: Article[] }`. Validar params contra `LOCALES`/`CATEGORY_SLUGS`; sin category → top news. `export const revalidate = 600`.

### B · lib/markets.ts (server-only)

```ts
export const MARKET_SYMBOLS: { symbol: string; label: {es,en}; kind: MarketKind; precision: number }[];
// Orden EXACTO: EURUSD=X (EUR/USD, fx, 4) · BTC-USD (Bitcoin, crypto, 0) · GC=F (Oro/Gold, commodity, 0)
// · ^GSPC (S&P 500, index, 0) · ^IXIC (NASDAQ, index, 0) · ^GDAXI (DAX, index, 0)
// · ^N225 (NIKKEI, index, 0) · ^FTSE (FTSE 100, index, 0)
export async function getMarketQuotes(): Promise<MarketQuote[]>;
```

- Yahoo v8: `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}?interval=1d&range=2d` con header `User-Agent: Mozilla/5.0`. `price = meta.regularMarketPrice`, `changePct = (price/meta.chartPreviousClose - 1) * 100`. `next: { revalidate: 300 }`. Fetches en paralelo (`Promise.allSettled`).
- Fallback estático si falla un símbolo (snapshot hardcodeado: EUR/USD 1.1437 +0.0 · BTC 62629 +0.2 · Oro 4175 -0.0 · S&P -0.1 · NASDAQ -1.7 · DAX +2.7 · NIKKEI +0.1 · FTSE +2.7; precios índice aproximados OK).

### B · Ticker UI
- `MarketTickerBar` (server, async): fetch inicial y renderiza `<MarketTicker initial={quotes} lang={lang} />`.
- `MarketTicker` (client): barra superior fina (~34px) fondo `bg-bg-soft` borde inferior `border-line-soft`. Desktop: fila con todos los valores; mobile: usa `.marquee`/`.marquee-track` (duplicar contenido para el loop). Cada item: etiqueta `text-faint` uppercase 10-11px + valor `text-ink` tabular + flecha/% en `text-up`/`text-down` (▲/▼). fx/crypto/commodity muestran precio con `formatNumber(price, lang, precision)` y prefijo `US$` (es) / `$` (en) para BTC y Oro; índices muestran solo el %. Polling: `setInterval` 120 s a `/api/markets`, sin parpadeo (mantener estado previo ante error). `%` con 1 decimal y coma decimal en ES (`formatNumber`).

### B · app/api/markets/route.ts
`GET /api/markets` → `{ quotes: MarketQuote[] }`, `export const revalidate = 300`.

### C · Componentes (props exactas)

```tsx
Header({ lang }: { lang: Locale })                 // server; logo "G24 GLOBAL24" (cuadrado dorado con G24 + wordmark),
                                                   // nav desktop desde NAV_ORDER + botón Mundial dorado destacado a la derecha,
                                                   // LanguageSwitch, y MobileNav en < lg. Sticky top-0 z-40, bg-bg/90 backdrop-blur.
MobileNav({ lang, labels }: { lang: Locale; labels: { slug: string; label: string; href: string }[] })  // client, hamburguesa → panel deslizante
LanguageSwitch({ lang }: { lang: Locale })         // client; usa usePathname() + switchLocalePath(); pill ES | EN
Footer({ lang }: { lang: Locale })                 // server; 3 columnas: marca+tagline+about, Secciones (links), nota de fuentes + © año
SmartImage(props: { src?: string; alt: string; className?: string; sizes?: string; priority?: boolean })
   // client; next/image fill dentro de contenedor relativo; onError → div `.image-fallback` con inicial del alt en dorado gigante;
   // si !src renderiza el fallback directamente.
NewsCard({ article, lang, variant }: { article: Article; lang: Locale; variant: "hero" | "featured" | "compact" })
   // hero: imagen 16/9 grande, kicker categoría, título display 2xl-4xl, descripción, fuente + timeAgo
   // featured: imagen 16/9, título lg, fuente + timeAgo · compact: thumb 96px izquierda + título sm
   // Toda la tarjeta es <a> externo al artículo (target _blank). Fuente en text-gold text-xs uppercase. Usa .card-hover, rounded-xl, overflow-hidden.
HeadlineList({ articles, lang, showCategory }: { articles: Article[]; lang: Locale; showCategory?: boolean })
   // lista de titulares sin imagen: bullet dorado, título, fuente · timeAgo; divide-y divide-line-soft
SectionBlock({ title, href, articles, lang, layout }: { title: string; href: string; articles: Article[]; lang: Locale; layout: "grid" | "split" })
   // header con SectionHeading + "Ver todo →"; grid: 4 NewsCard featured; split: 1 featured grande + HeadlineList al lado
SectionHeading({ title, href, cta }: { title: string; href?: string; cta?: string })  // barra dorada 3px izquierda + título display uppercase
TrendingStrip({ articles, lang, label }: { articles: Article[]; lang: Locale; label: string })
   // franja "ÚLTIMA HORA" bajo el header: chip rojo con .live-dot + label, y marquee de titulares enlazados separados por ◆ dorado
NewsletterBox({ lang }: { lang: Locale })          // client; email input + CTA dorado; al enviar muestra newsletterDone (solo front)
```

### D · Páginas

- `app/[lang]/page.tsx` (home, `export const revalidate = 600`): usa `getTopNews` + `getHomeSections`. Estructura: TrendingStrip → hero (1 NewsCard hero + 2 featured + HeadlineList "En breve" en columna derecha) → `<MundialPromo lang />` (módulo E) → SectionBlock por categoría alternando `grid`/`split` (internacional, política, negocios, tecnología grid; resto split de a pares en 2 columnas donde quede bien) → NewsletterBox. `generateMetadata` con canonical `/{lang}` + hreflang (`/es` ↔ `/en`).
- `app/[lang]/c/[slug]/page.tsx` (`revalidate = 600`): `generateStaticParams` = LOCALES × CATEGORY_SLUGS; slug inválido → `notFound()`. H1 = label de categoría, nota `updatedNote`, grid de NewsCards con imagen + HeadlineList con el resto, JSON-LD `ItemList` de los artículos. Metadata: title = label, description = `t(dict.meta.categoryDesc, { category: label })`, canonical `/{lang}/c/{slug}` + hreflang.
- `app/[lang]/not-found.tsx`: 404 bilingüe simple (usa dict vía params si es posible; si no, ES+EN juntos).
- `app/sitemap.ts`: home, mundial y las 9 categorías × 2 idiomas con `alternates.languages`. `app/robots.ts`: allow all + sitemap. `app/manifest.ts`: nombre, colores (#0a0906 / #e8c15c), icons `/icon.svg`.

### E · Mundial

- `lib/worldcup.ts` (helpers puros sobre `data/worldcup.ts`): `getWorldCup()`, `teamName(code, lang)`, `matchesByRound(round)`, `matchesOn(date)`, `todayMatches(now)`, `currentPhase(now)`, `liveMatches(now)` (status "live" o partidos de hoy cuya hora ± 2h contenga `now` — cálculo simple), `roundLabel(round, lang)`.
- `app/[lang]/mundial/page.tsx` (`revalidate = 3600`): hero `.mundial-glow` con kicker dorado "COPA MUNDIAL DE LA FIFA · 2026", H1 "Centro del Mundial" (dict), chips FASE / HOY (n partidos) / EN VIVO como en la referencia; luego `<MundialHub lang />`. Metadata propia + JSON-LD `SportsEvent` (FIFA World Cup 2026, startDate 2026-06-11, endDate 2026-07-19).
- `MundialHub` (client): tabs pill (Avance · Resumen · Goleadores · Partidos · Grupos) — estado local, scrollable en mobile. Recibe TODOS los datos ya serializados como props desde la página (no importa `data/` directamente en el cliente si infla el bundle: pasar por props).
  - **Avance**: `PhaseTimeline` (6 fases con puntos, la actual resaltada en dorado y "EN CURSO · fechas") + `Bracket`.
  - **Bracket**: grid de 9 columnas (16vos·8vos·Cuartos·Semis·FINAL·Semis·Cuartos·8vos·16vos) con `min-width` ~1400px dentro de `overflow-x-auto scrollbar-thin`; hint `bracketHint` visible solo en mobile. Cada `MatchCard` mini: filas de equipo (bandera emoji + nombre + score a la derecha; ganador `text-ink`, perdedor `text-faint`; pens "(4-3 pen.)" pequeño), fecha/hora `text-faint` 10px debajo ("4 jul · 16:00" con `formatDateShort`, o "FIN"). Partidos TBD: placeholder `text-faint` + icono ⚽ apagado. Final al centro con 🏆 y borde dorado; debajo "TERCER PUESTO" con su MatchCard. Conexiones: bordes sutiles (no hace falta SVG perfecto).
  - **Resumen**: tarjetas de `highlights` (título display + body `text-muted`) + fila de 4 stats grandes (`statsTitle`, números en dorado `font-display`).
  - **Goleadores**: tabla `#, Jugador (bandera + nombre), Selección, Goles (dorado bold), Asist.`; primera fila destacada con fondo `bg-panel-2`.
  - **Partidos**: agrupados por fecha (`formatDateLong`), `results` (finalizados, más recientes primero) y `upcoming` (próximos); cada fila: banderas + nombres + marcador o hora, sede `text-faint`.
  - **Grupos**: grid responsive 1/2/3 columnas de tablas A–L (`dict.mundial.table` headers); equipos `advanced` con punto dorado y nota `advancedNote` al pie.
- `MundialPromo({ lang })` (server): banner para la home `.mundial-glow` border-line rounded-xl: kicker + título + body + partidos de HOY en chips (bandera vs bandera + hora o marcador) + CTA dorado a `/{lang}/mundial`.

## Verificación local

`npm run dev` en `global24/` (puerto 3000). El agente NO ejecuta build ni dev server; el integrador lo hace después.
