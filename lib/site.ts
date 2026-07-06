import { LOCALES, type Locale } from "./types";

export const SITE_NAME = "Global24";

// Dominio canónico de producción. Se puede sobreescribir con NEXT_PUBLIC_SITE_URL
// (por si cambia el dominio); en desarrollo local se usa localhost.
const PRODUCTION_URL = "https://www.global24.today";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000");

/** Email de contacto público (páginas legales y de contacto). */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@example.com";

/** ID de editor de Google AdSense (ca-pub-XXXX). Vacío = anuncios desactivados. */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

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
