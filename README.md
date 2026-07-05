# Global24 — Noticias del mundo, al instante

Portal de noticias bilingüe (**español** por defecto, **inglés** con un clic) construido con **Next.js 16** (App Router + Turbopack), **React 19**, **Tailwind CSS v4** y **TypeScript**. Estética oscura premium con acento dorado, optimizado para SEO, escritorio y móvil.

## Características

- **Noticias en tiempo real** agregadas de fuentes públicas:
  - **Google News RSS** (titulares curados por categoría e idioma).
  - **Feeds RSS de medios** con imágenes de calidad (BBC, The Guardian, NYT, El País, Marca, etc.).
  - **GDELT Project** como enriquecimiento opcional de imágenes (respetando su rate-limit; se desactiva con `GDELT_ENABLED=0`).
- **Actualización periódica automática** vía ISR: noticias cada 10 min, mercados cada 5 min (sin redeploys).
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
| `ANTHROPIC_API_KEY` | Habilita la síntesis con IA en páginas de artículo | — (fallback sin IA) |
| `SUMMARY_MODEL` | Modelo para las síntesis (`claude-haiku-4-5` = económico) | `claude-opus-4-8` |
| `SUMMARY_AI` | `0` desactiva la síntesis con IA | activado |

Las síntesis se cachean 24 h por artículo e idioma, así el costo por noticia es una sola llamada corta (~500 tokens).

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
