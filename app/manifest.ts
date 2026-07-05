import type { MetadataRoute } from "next";
import { getDict } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const dict = getDict("es");
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: dict.meta.homeDesc,
    start_url: "/es",
    display: "standalone",
    background_color: "#0a0906",
    theme_color: "#e8c15c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
