import { LOCALES, type Locale } from "./types";

export const SITE_NAME = "Global24";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

// Sin URL pública, canonicals/sitemap/robots/JSON-LD salen apuntando a
// localhost. Se advierte fuerte en el build de producción sin cortar el build
// local. (Solo en servidor: este módulo también se importa desde el cliente.)
if (!rawSiteUrl && process.env.NODE_ENV === "production" && typeof window === "undefined") {
  console.warn(
    "\n⚠  NEXT_PUBLIC_SITE_URL no está definida: canonicals, sitemap, robots y JSON-LD " +
      "usarán http://localhost:3000. Definila antes de desplegar a producción.\n",
  );
}

export const SITE_URL = rawSiteUrl ?? "http://localhost:3000";

/** Email de contacto público (páginas legales y de contacto). */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@example.com";

/** Valida un segmento de idioma de la URL; cae a "es" si no es válido. */
export function asLocale(raw: string): Locale {
  return (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : "es";
}

/** Prefija una ruta con el idioma: localePath("es", "/mundial") → "/es/mundial". */
export function localePath(lang: Locale, path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** Devuelve la misma ruta en el otro idioma, para el switch ES/EN. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const rest = pathname.replace(/^\/(es|en)(?=\/|$)/, "");
  return localePath(target, rest || "/");
}
