import "server-only";
import { extractFromHtml } from "@extractus/article-extractor";
import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import { stripHtml, upgradeImageUrl } from "./format";
import { relatedArticles } from "./news";
import type { Article, Locale } from "./types";

/**
 * Síntesis original de un artículo generada por IA. Agnóstica de proveedor:
 *
 *   SUMMARY_PROVIDER=groq       → GROQ_API_KEY (tier gratis con Llama, sin tarjeta)
 *   SUMMARY_PROVIDER=deepseek   → DEEPSEEK_API_KEY (muy económico, compatible OpenAI)
 *   SUMMARY_PROVIDER=anthropic  → ANTHROPIC_API_KEY
 *   SUMMARY_PROVIDER=openai     → SUMMARY_API_KEY + SUMMARY_BASE_URL (OpenRouter,
 *                                 Together, OpenAI… cualquier endpoint compatible)
 *
 * Si no se define SUMMARY_PROVIDER, se detecta según qué key exista
 * (Groq tiene prioridad). SUMMARY_MODEL sobreescribe el modelo.
 *
 * Estrategia de longitud: primero se intenta DESCARGAR el texto del artículo
 * original y hacer un resumen largo (4-6 párrafos) grounded en ese texto. Si la
 * fuente bloquea, es un enlace de Google News (redirect) o devuelve poco texto,
 * se cae a un resumen corto basado solo en el titular y el extracto.
 * Devuelve null si no hay proveedor, si SUMMARY_AI=0 o si todo falla.
 */

interface ProviderConfig {
  kind: "anthropic" | "openai";
  apiKey: string;
  model: string;
  baseUrl?: string;
}

function resolveProvider(): ProviderConfig | null {
  const explicit = (process.env.SUMMARY_PROVIDER ?? "").toLowerCase();
  const provider =
    explicit ||
    (process.env.GROQ_API_KEY
      ? "groq"
      : process.env.DEEPSEEK_API_KEY
        ? "deepseek"
        : process.env.ANTHROPIC_API_KEY
          ? "anthropic"
          : "");

  switch (provider) {
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return null;
      return {
        kind: "openai",
        apiKey,
        baseUrl: "https://api.groq.com/openai/v1",
        // Llama 4 Scout: en el tier gratis de Groq tiene ~5× más presupuesto
        // diario que llama-3.3-70b (cuyos 100k tokens/día se agotaban y las
        // síntesis desaparecían), con muy buena calidad de resumen.
        model: process.env.SUMMARY_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct",
      };
    }
    case "deepseek": {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) return null;
      return {
        kind: "openai",
        apiKey,
        baseUrl: "https://api.deepseek.com",
        model: process.env.SUMMARY_MODEL ?? "deepseek-chat",
      };
    }
    case "anthropic": {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return null;
      return { kind: "anthropic", apiKey, model: process.env.SUMMARY_MODEL ?? "claude-opus-4-8" };
    }
    case "openai": {
      const apiKey = process.env.SUMMARY_API_KEY;
      const baseUrl = process.env.SUMMARY_BASE_URL;
      const model = process.env.SUMMARY_MODEL;
      if (!apiKey || !baseUrl || !model) return null;
      return { kind: "openai", apiKey, baseUrl: baseUrl.replace(/\/$/, ""), model };
    }
    default:
      return null;
  }
}

/* Errores de autenticación se recuerdan para no reintentar en cada render. */
let aiUnavailable = false;

const SYSTEM_SHORT: Record<Locale, string> = {
  es: [
    "Sos redactor de Global24, un agregador de noticias. Escribís síntesis periodísticas ORIGINALES en español neutro.",
    "Formato: exactamente 2 párrafos breves separados por una línea en blanco, máximo 110 palabras en total.",
    "Tono informativo y neutral. Nunca copies frases textuales de los materiales. Nunca inventes datos que no estén en ellos:",
    "si el material es escaso, limitate a describir qué informó la fuente y el contexto general del tema.",
    "Respondé SOLO con los dos párrafos, sin títulos ni comentarios.",
  ].join(" "),
  en: [
    "You are an editor at Global24, a news aggregator. You write ORIGINAL journalistic briefs in English.",
    "Format: exactly 2 short paragraphs separated by a blank line, 110 words maximum in total.",
    "Neutral, informative tone. Never copy phrases verbatim from the materials. Never invent facts not present in them:",
    "if the material is thin, describe what the source reported and the general context of the topic.",
    "Reply ONLY with the two paragraphs, no headings or commentary.",
  ].join(" "),
};

const SYSTEM_LONG: Record<Locale, string> = {
  es: [
    "Sos redactor de Global24, un agregador de noticias. A partir del TEXTO del artículo original que se te entrega, escribí un resumen periodístico ORIGINAL en español neutro.",
    "Extensión: 4 a 6 párrafos, entre 350 y 450 palabras.",
    "Reescribí con tus propias palabras: NO copies frases textuales del original. Incluí el contexto, qué ocurrió, los datos clave y las implicancias,",
    "pero SOLO lo que esté en el texto provisto: no inventes ni agregues información externa. Tono informativo y neutral, sin opinión.",
    "Empezá directo con el contenido, sin título ni encabezados como 'Resumen:'. Separá los párrafos con una línea en blanco.",
  ].join(" "),
  en: [
    "You are an editor at Global24, a news aggregator. From the ORIGINAL article TEXT provided, write an ORIGINAL journalistic summary in English.",
    "Length: 4 to 6 paragraphs, between 350 and 450 words.",
    "Rewrite in your own words: do NOT copy sentences verbatim from the original. Include context, what happened, key facts and implications,",
    "but ONLY what is present in the provided text: never invent or add outside information. Neutral, informative tone, no opinion.",
    "Start directly with the content, no title or headings like 'Summary:'. Separate paragraphs with a blank line.",
  ].join(" "),
};

function buildShortPrompt(article: Article, related: Article[], lang: Locale): string {
  const es = lang === "es";
  const lines = [
    es ? "Materiales sobre una noticia:" : "Materials about a news story:",
    `- ${es ? "Titular" : "Headline"}: ${article.title}`,
    `- ${es ? "Medio" : "Outlet"}: ${article.source}`,
    `- ${es ? "Fecha de publicación" : "Published"}: ${article.publishedAt}`,
  ];
  if (article.description) {
    lines.push(`- ${es ? "Extracto de la fuente" : "Source excerpt"}: ${article.description}`);
  }
  if (related.length > 0) {
    const headlines = related
      .slice(0, 4)
      .map((r) => `"${r.title}" (${r.source})`)
      .join(" | ");
    lines.push(`- ${es ? "Titulares relacionados" : "Related headlines"}: ${headlines}`);
  }
  return lines.join("\n");
}

function buildLongPrompt(article: Article, fullText: string, lang: Locale): string {
  const es = lang === "es";
  return [
    `${es ? "Título" : "Title"}: ${article.title}`,
    `${es ? "Medio" : "Outlet"}: ${article.source}`,
    `${es ? "Fecha" : "Date"}: ${article.publishedAt}`,
    "",
    es ? "Texto del artículo original:" : "Original article text:",
    fullText,
  ].join("\n");
}

/** Parte el texto del modelo en párrafos (máx 6). Lanza si vino vacío. */
function toParagraphs(text: string): string[] {
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (paragraphs.length === 0) throw new Error("empty");
  return paragraphs;
}

interface FetchedArticle {
  text: string;
  /** og:image en alta resolución (o null); mejor que la miniatura del feed. */
  image: string | null;
}

/**
 * Descarga el artículo original y devuelve su texto limpio + su og:image (o null).
 * Salta enlaces de Google News (redirect ofuscado) y cualquier fallo/timeout.
 */
async function fetchArticle(url: string): Promise<FetchedArticle | null> {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  if (/(^|\.)news\.google\.com$/i.test(host)) return null;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Global24/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    if (!(res.headers.get("content-type") ?? "").includes("html")) return null;

    const article = await extractFromHtml(await res.text(), url);
    if (!article?.content) return null;
    const text = stripHtml(article.content);
    // Menos de ~600 caracteres no alcanza para un resumen largo con sustancia.
    if (text.length < 600) return null;
    const image =
      article.image && article.image.startsWith("https") ? upgradeImageUrl(article.image) : null;
    return { text: text.slice(0, 6000), image };
  } catch {
    return null;
  }
}

async function runModel(cfg: ProviderConfig, system: string, userContent: string, maxTokens: number): Promise<string[]> {
  if (cfg.kind === "anthropic") {
    const client = new Anthropic({ apiKey: cfg.apiKey, timeout: 25_000, maxRetries: 1 });
    const response = await client.messages.create({
      model: cfg.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userContent }],
    });
    if (response.stop_reason === "refusal") throw new Error("refusal");
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    return toParagraphs(text);
  }

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: maxTokens,
      temperature: 0.4,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`${cfg.model} ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return toParagraphs(data.choices?.[0]?.message?.content ?? "");
}

export interface ArticleBrief {
  paragraphs: string[];
  /** og:image en alta resolución si se pudo leer el artículo; si no, null. */
  image: string | null;
}

async function generateBrief(article: Article, lang: Locale): Promise<ArticleBrief> {
  const cfg = resolveProvider();
  if (!cfg) throw new Error("no provider");

  // Camino preferido: resumen largo grounded en el texto real del artículo.
  const fetched = await fetchArticle(article.url);
  if (fetched) {
    const paragraphs = await runModel(cfg, SYSTEM_LONG[lang], buildLongPrompt(article, fetched.text, lang), 1300);
    return { paragraphs, image: fetched.image };
  }

  // Fallback: resumen corto desde titular + extracto + titulares relacionados.
  const related = await relatedArticles(lang, article, 4);
  const paragraphs = await runModel(cfg, SYSTEM_SHORT[lang], buildShortPrompt(article, related, lang), 512);
  return { paragraphs, image: null };
}

/* Se cachea 24 h por (lang, artículo): la descarga del artículo y la llamada al
 * modelo ocurren una sola vez. Los fallos lanzan y por eso NO se cachean: el
 * próximo render vuelve a intentar. Clave v3 porque cambió la forma del retorno. */
const cachedBrief = unstable_cache(
  async (lang: Locale, article: Article) => generateBrief(article, lang),
  ["article-brief-v3"],
  { revalidate: 86_400 },
);

export async function getArticleBrief(article: Article, lang: Locale): Promise<ArticleBrief | null> {
  if (aiUnavailable || process.env.SUMMARY_AI === "0") return null;
  if (!resolveProvider()) return null;
  try {
    return await cachedBrief(lang, article);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Log server-side (Vercel) para poder depurar: key inválida, modelo dado de
    // baja, rate limit, etc. Nunca se expone al cliente.
    console.warn(`[summary] generación de síntesis falló: ${message}`);
    // 401/403 = credenciales inválidas: dejar de reintentar hasta el próximo deploy.
    if (error instanceof Anthropic.AuthenticationError || /\b(401|403)\b|apiKey/.test(message)) {
      aiUnavailable = true;
    }
    return null;
  }
}
