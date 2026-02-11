import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/embed/",
          // Block locale-prefixed embed routes from being crawled
          ...routing.locales.map((l) => `/${l}/embed/`),
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
