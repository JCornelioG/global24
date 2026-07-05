import "server-only";
import type { Locale } from "./types";

/**
 * Alta de suscriptores al boletín, agnóstica de proveedor. El proveedor se
 * elige con NEWSLETTER_PROVIDER; cada uno usa sus propias variables de entorno.
 * Sin proveedor configurado devuelve "not_configured" (la caja muestra éxito
 * igual, como antes, pero no guarda nada hasta que definas uno).
 */
export type SubscribeOutcome = "ok" | "already" | "invalid" | "error" | "not_configured";

export interface SubscribeResult {
  outcome: SubscribeOutcome;
}

const TIMEOUT_MS = 10_000;

function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Log server-side (visible en los logs de Vercel, nunca en el navegador) para
 * poder depurar una conexión mal configurada: key de otro datacenter, list id
 * equivocado, permisos, etc. */
function logProviderError(provider: string, status: number, body: string): void {
  console.warn(`[newsletter:${provider}] respondió ${status}: ${body.slice(0, 300)}`);
}

/* --------------------------- Adaptadores ---------------------------------- */

async function subscribeButtondown(email: string): Promise<SubscribeResult> {
  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) return { outcome: "not_configured" };
  const res = await fetch("https://api.buttondown.com/v1/subscribers", {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email_address: email }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.ok) return { outcome: "ok" };
  // Buttondown responde 400 al reintentar un correo existente.
  const body = await res.text();
  if (res.status === 400 && /already|exists|duplicate/i.test(body)) return { outcome: "already" };
  logProviderError("buttondown", res.status, body);
  return { outcome: "error" };
}

async function subscribeMailchimp(email: string): Promise<SubscribeResult> {
  const key = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!key || !listId) return { outcome: "not_configured" };
  // El datacenter va en el sufijo de la key: "xxxxxxxx-us5" → "us5".
  const dc = key.split("-")[1];
  if (!dc) return { outcome: "error" };
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    // status "pending" → doble opt-in: Mailchimp envía el correo de confirmación.
    body: JSON.stringify({ email_address: email, status: "pending" }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.ok) return { outcome: "ok" };
  const body = await res.text();
  if (/member exists|already a list member/i.test(body)) return { outcome: "already" };
  logProviderError("mailchimp", res.status, body);
  return { outcome: "error" };
}

async function subscribeResend(email: string): Promise<SubscribeResult> {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) return { outcome: "not_configured" };
  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, unsubscribed: false }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // Resend hace upsert: un contacto existente también responde 2xx.
  if (res.ok) return { outcome: "ok" };
  logProviderError("resend", res.status, await res.text());
  return { outcome: "error" };
}

/** Modo genérico: reenvía { email, locale } a cualquier URL (Zapier, Make, Kit…). */
async function subscribeWebhook(email: string, locale: Locale): Promise<SubscribeResult> {
  const url = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!url) return { outcome: "not_configured" };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, locale }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.ok) return { outcome: "ok" };
  logProviderError("webhook", res.status, await res.text());
  return { outcome: "error" };
}

/* ------------------------------ Fachada ----------------------------------- */

export async function subscribeEmail(rawEmail: string, locale: Locale): Promise<SubscribeResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) return { outcome: "invalid" };

  const provider = (process.env.NEWSLETTER_PROVIDER ?? "").toLowerCase();
  try {
    switch (provider) {
      case "buttondown":
        return await subscribeButtondown(email);
      case "mailchimp":
        return await subscribeMailchimp(email);
      case "resend":
        return await subscribeResend(email);
      case "webhook":
        return await subscribeWebhook(email, locale);
      default:
        return { outcome: "not_configured" };
    }
  } catch {
    // Timeout o error de red: nunca lanzamos hacia la ruta.
    return { outcome: "error" };
  }
}
