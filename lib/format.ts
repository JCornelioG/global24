import type { Locale } from "./types";

const INTL_LOCALE: Record<Locale, string> = { es: "es", en: "en-US" };

/** "hace 23 min" / "23 min ago". Cae a fecha corta pasadas 24 h. */
export function timeAgo(iso: string, lang: Locale, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((then - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs >= 86400) return formatDateShort(iso, lang);

  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[lang], { numeric: "always", style: "narrow" });
  if (abs < 60) return rtf.format(Math.trunc(diffSec / 1), "second");
  if (abs < 3600) return rtf.format(Math.trunc(diffSec / 60), "minute");
  return rtf.format(Math.trunc(diffSec / 3600), "hour");
}

export function formatNumber(value: number, lang: Locale, decimals = 2): string {
  return new Intl.NumberFormat(INTL_LOCALE[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** "4 jul" / "Jul 4". Acepta ISO o "YYYY-MM-DD". */
export function formatDateShort(iso: string, lang: Locale): string {
  const d = parseDate(iso);
  if (!d) return "";
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: "numeric", month: "short" }).format(d);
}

/** "viernes, 3 de julio de 2026" / "Friday, July 3, 2026". */
export function formatDateLong(iso: string, lang: Locale): string {
  const d = parseDate(iso);
  if (!d) return "";
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function parseDate(value: string): Date | null {
  // Las fechas "YYYY-MM-DD" se interpretan a mediodía UTC para evitar
  // corrimientos de día por zona horaria.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Hash djb2 en hex, para ids estables de artículos. */
export function stableId(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}

/** Quita etiquetas HTML y entidades comunes de descripciones RSS. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    // &amp; al final: si fuera primero, "&amp;lt;" se decodificaría dos veces.
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normaliza títulos para deduplicar (minúsculas, sin acentos ni signos). */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
