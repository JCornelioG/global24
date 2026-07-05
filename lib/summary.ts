import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
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
 * Devuelve null si no hay proveedor, si SUMMARY_AI=0 o si la generación falla:
 * la página cae a un resumen contextual sin IA.
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
        model: process.env.SUMMARY_MODEL ?? "llama-3.3-70b-versatile",
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

const SYSTEM: Record<Locale, string> = {
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

function buildPrompt(article: Article, related: Article[], lang: Locale): string {
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

/** Parte el texto del modelo en párrafos (máx 3). Lanza si vino vacío. */
function toParagraphs(text: string): string[] {
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3);
  if (paragraphs.length === 0) throw new Error("empty");
  return paragraphs;
}

async function generateAnthropic(prompt: string, lang: Locale, cfg: ProviderConfig): Promise<string[]> {
  const client = new Anthropic({ apiKey: cfg.apiKey, timeout: 25_000, maxRetries: 1 });
  const response = await client.messages.create({
    model: cfg.model,
    max_tokens: 1024,
    system: SYSTEM[lang],
    messages: [{ role: "user", content: prompt }],
  });
  if (response.stop_reason === "refusal") throw new Error("refusal");
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  return toParagraphs(text);
}

/** Chat Completions compatible con OpenAI (DeepSeek, Groq, OpenRouter…). */
async function generateOpenAICompatible(prompt: string, lang: Locale, cfg: ProviderConfig): Promise<string[]> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 512,
      temperature: 0.4,
      stream: false,
      messages: [
        { role: "system", content: SYSTEM[lang] },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`${cfg.model} ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return toParagraphs(data.choices?.[0]?.message?.content ?? "");
}

async function generateBrief(article: Article, related: Article[], lang: Locale): Promise<string[]> {
  const cfg = resolveProvider();
  if (!cfg) throw new Error("no provider");
  const prompt = buildPrompt(article, related, lang);
  return cfg.kind === "anthropic"
    ? generateAnthropic(prompt, lang, cfg)
    : generateOpenAICompatible(prompt, lang, cfg);
}

/* Se cachea 24 h por (lang, artículo). Los relacionados se buscan ADENTRO de
 * la función cacheada: si fueran argumento, su rotación (los pools se
 * revalidan cada 10 min) cambiaría la clave y regeneraría la síntesis —y su
 * costo de API— en cada ciclo. Los fallos lanzan y por eso NO se cachean:
 * el próximo render vuelve a intentar. */
const cachedBrief = unstable_cache(
  async (lang: Locale, article: Article) => {
    const related = await relatedArticles(lang, article, 4);
    return generateBrief(article, related, lang);
  },
  ["article-brief"],
  { revalidate: 86_400 },
);

export async function getArticleBrief(article: Article, lang: Locale): Promise<string[] | null> {
  if (aiUnavailable || process.env.SUMMARY_AI === "0") return null;
  if (!resolveProvider()) return null;
  try {
    return await cachedBrief(lang, article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // 401/403 = credenciales inválidas: dejar de reintentar hasta el próximo deploy.
    if (error instanceof Anthropic.AuthenticationError || /\b(401|403)\b|apiKey/.test(message)) {
      aiUnavailable = true;
    }
    return null;
  }
}
