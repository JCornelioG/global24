import "server-only";

export interface GdeltArticle {
  title: string;
  url: string;
  image?: string;
  source?: string;
  publishedAt?: string;
}

/*
 * GDELT permite 1 request cada 5 segundos por IP. Cola global module-level:
 * cada llamada espera su turno (5,5 s desde la anterior) antes de tocar la red.
 * El caché de fetch de Next (revalidate) evita repetir requests ya resueltos.
 */
const GAP_MS = 5500;
let queue: Promise<void> = Promise.resolve();
let lastRun = 0;

function throttle(): Promise<void> {
  const turn = queue.then(async () => {
    const wait = lastRun + GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRun = Date.now();
  });
  queue = turn.catch(() => {});
  return turn;
}

/** "20260703T141500Z" → ISO 8601. */
function seendateToIso(seendate: string | undefined): string | undefined {
  if (!seendate) return undefined;
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(seendate);
  if (!m) return undefined;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}

interface GdeltRawArticle {
  title?: string;
  url?: string;
  socialimage?: string;
  domain?: string;
  seendate?: string;
}

/**
 * Consulta GDELT DOC 2.0 (ArtList). Devuelve [] ante rate-limit (la API
 * responde texto plano, no JSON), error de red o GDELT_ENABLED=0.
 */
export async function fetchGdelt(query: string, lang: "es" | "en", max = 20): Promise<GdeltArticle[]> {
  if (process.env.GDELT_ENABLED === "0") return [];
  try {
    await throttle();
    const sourcelang = lang === "es" ? "spa" : "eng";
    const q = encodeURIComponent(`${query} sourcelang:${sourcelang}`);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&format=json&maxrecords=${max}&timespan=1d&sort=hybridrel`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const body = await res.text();
    let data: { articles?: GdeltRawArticle[] };
    try {
      data = JSON.parse(body) as { articles?: GdeltRawArticle[] };
    } catch {
      return []; // respuesta de rate-limit u otro texto no-JSON
    }
    return (data.articles ?? [])
      .map((a): GdeltArticle | null => {
        if (!a.title || !a.url?.startsWith("http")) return null;
        return {
          title: a.title,
          url: a.url,
          image: a.socialimage?.startsWith("https") ? a.socialimage : undefined,
          source: a.domain,
          publishedAt: seendateToIso(a.seendate),
        };
      })
      .filter((a): a is GdeltArticle => a !== null);
  } catch {
    return [];
  }
}
