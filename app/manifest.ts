import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EnterMedSchool.org — Open-Source Medical Education",
    short_name: "EnterMedSchool.org",
    id: "/",
    start_url: `/${routing.defaultLocale}`,
    scope: "/",
    display: "standalone",
    background_color: "#F8FAFF",
    theme_color: "#6C5CE7",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education", "medical"],
    lang: routing.defaultLocale,
    orientation: "portrait",
  };
}
