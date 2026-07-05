import "server-only";
import { XMLParser } from "fast-xml-parser";
import { decodeEntities, upgradeImageUrl } from "./format";

export interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  /** Nombre del medio (tag <source> de Google News o título del canal). */
  source?: string;
  image?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  trimValues: true,
});

/* Los nodos pueden llegar como string, { "#text" }, { "__cdata" } o número.
 * Se decodifican entidades HTML: los feeds doble-codificados (WordPress)
 * dejan literales como "&#8217;" en títulos y descripciones. */
function text(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return decodeEntities(node).trim();
  if (typeof node === "number") return String(node);
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    return text(obj.__cdata ?? obj["#text"]);
  }
  return "";
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

interface MediaNode {
  "@_url"?: string;
  "@_width"?: string;
  "@_type"?: string;
  "@_medium"?: string;
}

/** Elige la imagen de mayor ancho entre media:content, media:thumbnail y enclosure. */
function pickImage(item: Record<string, unknown>): string | undefined {
  const candidates: { url: string; width: number }[] = [];

  for (const key of ["media:content", "media:thumbnail"]) {
    for (const node of asArray(item[key] as MediaNode | MediaNode[] | undefined)) {
      const url = node?.["@_url"];
      const type = node?.["@_type"] ?? "";
      const medium = node?.["@_medium"] ?? "";
      if (!url || !url.startsWith("http")) continue;
      // Se descarta si CUALQUIERA de los dos atributos declara algo no-imagen
      // (algunos feeds anuncian video en media:content sin atributo medium).
      if ((type && !type.startsWith("image")) || (medium && medium !== "image")) continue;
      candidates.push({ url, width: Number(node["@_width"]) || 0 });
    }
  }

  for (const node of asArray(item.enclosure as MediaNode | MediaNode[] | undefined)) {
    const url = node?.["@_url"];
    if (url?.startsWith("http") && (node["@_type"] ?? "image").startsWith("image")) {
      candidates.push({ url, width: Number(node["@_width"]) || 0 });
    }
  }

  if (candidates.length === 0) return undefined;
  candidates.sort((a, b) => b.width - a.width);
  const best = candidates[0].url;
  // Solo https: el sitio se sirve por https y el optimizador rechaza http.
  return best.startsWith("https") ? upgradeImageUrl(best) : undefined;
}

/**
 * Descarga y parsea un feed RSS 2.0. Nunca lanza: ante cualquier error
 * devuelve []. Cachea vía fetch de Next (revalidate en segundos).
 */
export async function fetchRss(url: string, revalidate = 600, maxItems = 25): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Global24/1.0",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = parser.parse(xml) as Record<string, any>;
    const channel = doc?.rss?.channel ?? doc?.feed;
    if (!channel) return [];
    const channelTitle = text(channel.title);

    // RSS 2.0 usa channel.item; Atom usa feed.entry (con published/updated y summary).
    return asArray((channel.item ?? channel.entry) as Record<string, unknown> | Record<string, unknown>[])
      .slice(0, maxItems)
      .map((item): RssItem | null => {
        const title = text(item.title);
        const link =
          text(item.link) || (item.link as Record<string, string> | undefined)?.["@_href"] || "";
        if (!title || !/^https?:\/\//.test(link)) return null;
        return {
          title,
          link,
          pubDate: text(item.pubDate) || text(item.published) || text(item.updated) || undefined,
          description: text(item.description) || text(item.summary) || undefined,
          source: text(item.source) || channelTitle || undefined,
          image: pickImage(item),
        };
      })
      .filter((item): item is RssItem => item !== null);
  } catch {
    return [];
  }
}
