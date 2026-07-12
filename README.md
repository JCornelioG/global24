# Global24 — Noticias del mundo, al instante

Portal de noticias bilingüe (**español** por defecto, **inglés** con un clic) construido con **Next.js 16** (App Router + Turbopack), **React 19**, **Tailwind CSS v4** y **TypeScript**. Estética oscura premium con acento dorado, optimizado para SEO, escritorio y móvil.

## Características

- **Noticias en tiempo real** agregadas de fuentes públicas:
  - **Google News RSS** (titulares curados por categoría e idioma).
  - **Feeds RSS de medios** con imágenes de calidad (BBC, The Guardian, NYT, El País, Marca, etc.).
  - **GDELT Project** como enriquecimiento opcional de imágenes (respetando su rate-limit; se desactiva con `GDELT_ENABLED=0`).
- **Actualización periódica automática** vía ISR: noticias cada 60 min, Mundial cada 30 min, mercados cada 5 min (sin redeploys). Intervalos elegidos para equilibrar frescura y consumo de cómputo (Vercel Fluid Active CPU).
- **Ticker financiero** (EUR/USD, Bitcoin, Oro, S&P 500, NASDAQ, DAX, NIKKEI, FTSE 100) con datos de Yahoo Finance y refresco en vivo cada 2 min en el cliente.
- **Centro del Mundial 2026**: cuadro de eliminatorias interactivo, resumen, goleadores, calendario y grupos. Datos editables en [`data/worldcup.ts`](data/worldcup.ts) (estructura lista para conectar una API en el futuro).
- **Páginas de artículo propias** (`/es/a/[id]`): síntesis original de cada noticia (generada con la API de Claude si hay `ANTHROPIC_API_KEY`; sin ella, resumen contextual automático), extracto breve atribuido, cobertura relacionada de otras fuentes, botones de compartir y CTA "leer en la fuente". El clic en cualquier tarjeta queda dentro del sitio.
- **Bilingüe con SEO correcto**: rutas `/es/...` y `/en/...`, `hreflang`, canonical, sitemap, robots, manifest, Open Graph, JSON-LD (NewsMediaOrganization, WebSite, ItemList, SportsEvent, NewsArticle).
- **Responsive** total: menú móvil, ticker en marquesina, bracket con scroll horizontal.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000  (/" redirige a /es)
```

## Producción

```bash
npm run build
npm start
```

Variables de entorno:

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (canonical/sitemap/OG) | `http://localhost:3000` |
| `GDELT_ENABLED` | `0` desactiva el enriquecimiento GDELT | activado |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email mostrado en /contacto y páginas legales | `contacto@example.com` |
| `NEWSLETTER_PROVIDER` | Proveedor del boletín: `buttondown`, `mailchimp`, `resend` o `webhook` | — (caja visual sin guardar) |

**Boletín**: elegí un proveedor en `NEWSLETTER_PROVIDER` y completá sus variables (ver `.env.example`):
- **Buttondown** → `BUTTONDOWN_API_KEY` (lo más simple).
- **Mailchimp** → `MAILCHIMP_API_KEY` + `MAILCHIMP_LIST_ID` (doble opt-in automático).
- **Resend** → `RESEND_API_KEY` + `RESEND_AUDIENCE_ID`.
- **Webhook** → `NEWSLETTER_WEBHOOK_URL` (reenvía `{ email, locale }` a Zapier/Make/Kit/MailerLite…).

Sin proveedor configurado la caja de suscripción muestra éxito pero no almacena correos. La ruta es [app/api/subscribe/route.ts](app/api/subscribe/route.ts).
| `SUMMARY_PROVIDER` | Proveedor de IA: `groq`, `deepseek`, `anthropic` u `openai` | autodetección por key |
| `GROQ_API_KEY` | Síntesis con Groq/Llama (tier gratis, sin tarjeta) | — |
| `DEEPSEEK_API_KEY` | Síntesis con DeepSeek (muy económico) | — |
| `ANTHROPIC_API_KEY` | Síntesis con Claude | — |
| `SUMMARY_API_KEY` + `SUMMARY_BASE_URL` | Endpoint OpenAI-compatible genérico (OpenRouter, Together…) | — |
| `SUMMARY_MODEL` | Sobreescribe el modelo del proveedor | según proveedor |
| `SUMMARY_AI` | `0` desactiva la síntesis con IA | activado |
| `SUMMARY_SCOPE` | `all` genera síntesis con IA para todas las notas; por defecto solo las con tracción (destacadas + clics en Google) | tracción |
| `GSC_CLIENT_EMAIL` / `GSC_PRIVATE_KEY` / `GSC_PROPERTY` | Service account de Search Console: notas con clics reales en Google también generan síntesis | — (solo destacadas) |
| `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` | Verificación de propiedad en Search Console / Bing (meta tag) | — |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | ID de editor AdSense (`ca-pub-…`): carga el script, la meta de verificación y genera `/ads.txt` | — (sin anuncios) |
| `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE` | Bloque al pie del artículo (post-aprobación) | — |
| `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID` | Bloque dentro del artículo, tras el 2º párrafo | — |
| `NEXT_PUBLIC_ADSENSE_SLOT_FEED` | Bloque in-feed en home y categorías | — |
| `WORLDCUP_API_TOKEN` | Token JWT de worldcup26.ir para datos en vivo del Mundial | — (usa bracket estático) |

**Centro del Mundial**: con `WORLDCUP_API_TOKEN` definido, resultados, cruces y grupos se traen en vivo de [worldcup26.ir](https://worldcup26.ir) (API gratuita, token ~84 días) y se cachean 30 min; las banderas son imágenes de flagcdn. Sin token, o si la API falla, cae automáticamente al bracket estático de [data/worldcup.ts](data/worldcup.ts) (goleadores y highlights son editoriales, siempre de ese archivo).

**Síntesis con IA**: elegí un proveedor. Sin ninguna key configurada, las páginas de artículo usan un resumen contextual automático (costo cero). Las síntesis se cachean 24 h por artículo e idioma y, por defecto, **solo se generan para las notas con tracción**: destacadas (portada + tarjetas con imagen de cada categoría, cubre lo nuevo al instante) o con clics reales en Google según la API de Search Console (cubre la cola larga con tráfico; requiere `GSC_CLIENT_EMAIL`/`GSC_PRIVATE_KEY`). El resto —visitado sobre todo por crawlers— usa el resumen contextual. `SUMMARY_SCOPE=all` habilita la IA para todas.

- **Groq** (recomendado para empezar): `SUMMARY_PROVIDER=groq` + `GROQ_API_KEY`. Tier gratis con Llama, sin tarjeta; modelo por defecto `meta-llama/llama-4-scout-17b-16e-instruct` (~5× más presupuesto diario gratis que el 70B, cuyo límite de 100k tokens/día se quedaba corto).
- **DeepSeek**: `SUMMARY_PROVIDER=deepseek` + `DEEPSEEK_API_KEY` (≈ US$1,10 por 1M tokens de salida).
- **Claude**: `SUMMARY_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` (Haiku US$5 · Opus US$25 por 1M).

Para desplegar en Vercel basta con importar el repo y definir `NEXT_PUBLIC_SITE_URL`. En cualquier otro host: `npm run build && npm start`.

## Estructura

```
app/[lang]/           páginas (home, c/[slug], mundial) — lang: es | en
app/api/              /api/news y /api/markets (JSON con revalidación)
components/           UI (header, tarjetas, ticker, mundial/*)
lib/                  agregación de noticias, mercados, i18n, helpers
data/worldcup.ts      datos del torneo (editables por la redacción)
docs/ARCHITECTURE.md  contratos y decisiones de diseño
```

## Cómo actualizar el Mundial

Editá [`data/worldcup.ts`](data/worldcup.ts): resultados (`homeScore`/`awayScore`, `homePens`/`awayPens`, `status`), cruces (`home`/`away` con el código del equipo), goleadores y grupos. La página se regenera sola (ISR, 1 h) o al redeploy.

## Fuentes y atribución

Los titulares e imágenes pertenecen a sus medios originales; cada tarjeta enlaza a la fuente (`rel="nofollow noopener"`). Datos de mercado: Yahoo Finance (uso informativo). Este proyecto es un agregador y no republica contenido completo.
