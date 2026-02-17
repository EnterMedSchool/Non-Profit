import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/* ── Glossary alias & abbreviation → canonical term redirects ────── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface MinimalTerm {
  id: string;
  aliases?: string[];
  abbr?: string[];
}

function buildGlossaryRedirects() {
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "glossary", "all-terms.json"),
      "utf-8",
    );
    const terms: MinimalTerm[] = JSON.parse(raw);

    const existingSlugs = new Set(terms.map((t) => t.id));
    const seen = new Set<string>();
    const redirects: Array<{
      source: string;
      destination: string;
      permanent: boolean;
    }> = [];

    for (const term of terms) {
      const allAliases = [
        ...(term.aliases || []),
        ...(term.abbr || []),
      ];

      for (const alias of allAliases) {
        const slug = slugify(alias);
        if (!slug || slug === term.id || existingSlugs.has(slug) || seen.has(slug)) {
          continue;
        }
        seen.add(slug);
        redirects.push({
          source: `/:locale/resources/glossary/${slug}`,
          destination: `/:locale/resources/glossary/${term.id}`,
          permanent: true,
        });
      }
    }

    return redirects;
  } catch {
    return [];
  }
}

const glossaryRedirects = buildGlossaryRedirects();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@codemirror/view", "@codemirror/state", "@codemirror/language"],
  },
  async redirects() {
    return glossaryRedirects;
  },
  async headers() {
    return [
      // Default security headers for all NON-embed routes.
      // Uses negative lookahead to exclude /embed/ paths (both /embed/...
      // and /:locale/embed/...) so they never receive X-Frame-Options: DENY,
      // which blocks iframe loading and cannot be reliably overridden.
      {
        source: "/((?!embed/|[a-z]{2}/embed/|[a-z]{2}-[A-Z]{2}/embed/).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Locale-prefixed embed routes (e.g. /en/embed/visuals/...)
      {
        source: "/:locale/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Non-locale embed routes (questions, flashcards, MCQ, tools, glossary)
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff2|woff|ttf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
