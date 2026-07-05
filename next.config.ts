import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes de noticias provienen de cientos de dominios de medios
    // distintos, por eso se permite cualquier host https.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    minimumCacheTTL: 14400,
  },
  async redirects() {
    return [{ source: "/", destination: "/es", permanent: false }];
  },
};

export default nextConfig;
