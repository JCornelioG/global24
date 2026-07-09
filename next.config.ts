import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes de noticias provienen de cientos de dominios de medios
    // distintos, por eso se permite cualquier host https.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    minimumCacheTTL: 14400,
    // Agregador de noticias: las imágenes ya vienen optimizadas de los CDN de
    // cada medio (y subimos la resolución en upgradeImageUrl). Optimizarlas en
    // Vercel no aporta y agota el cupo del plan gratis (5.000 transformaciones/
    // mes) → imágenes rotas. Con `unoptimized` se sirven directas: costo cero,
    // sin límite. next/image conserva layout, fallback y lazy-load.
    unoptimized: true,
  },
  async redirects() {
    return [{ source: "/", destination: "/es", permanent: false }];
  },
};

export default nextConfig;
