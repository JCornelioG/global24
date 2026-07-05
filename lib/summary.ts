import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import { relatedArticles } from "./news";
import type { Article, Locale } from "./types";

/**
 * Síntesis original de un artículo generada con la API de Claude.
 * Devuelve null si no hay credenciales (ANTHROPIC_API_KEY), si SUMMARY_AI=0
 * o si la generación falla: la página cae a un resumen contextual sin IA.
 * El modelo se elige con SUMMARY_MODEL (default claude-opus-4-8; para bajar
 * costo en alto volumen puede usarse claude-haiku-4-5).
 */
const MODEL = process.env.SUMMARY_MODEL ?? "claude-opus-4-8";

/* Sin credenciales el SDK falla en el constructor: se recuerda para no
 * reintentar en cada render de página. */
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

async function generateBrief(article: Article, related: Article[], lang: Locale): Promise<string[]> {
  const client = new Anthropic({ timeout: 25_000, maxRetries: 1 });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM[lang],
    messages: [{ role: "user", content: buildPrompt(article, related, lang) }],
  });

  if (response.stop_reason === "refusal") throw new Error("refusal");

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3);
  if (paragraphs.length === 0) throw new Error("empty");
  return paragraphs;
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
  try {
    return await cachedBrief(lang, article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (error instanceof Anthropic.AuthenticationError || message.includes("apiKey")) {
      aiUnavailable = true;
    }
    return null;
  }
}
