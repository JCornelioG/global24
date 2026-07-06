import { ADSENSE_CLIENT } from "@/lib/site";

export const dynamic = "force-static";

/**
 * ads.txt declara quién está autorizado a vender el inventario publicitario.
 * Se genera desde NEXT_PUBLIC_ADSENSE_CLIENT: sin ID, el archivo no existe (404).
 */
export function GET() {
  if (!ADSENSE_CLIENT) {
    return new Response("", { status: 404 });
  }
  // El ID de AdSense es "ca-pub-…"; en ads.txt va sin el prefijo "ca-".
  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
