import { mediaAssets } from "@/data/media-assets";
import { visualLessons } from "@/data/visuals";
import { pdfBooks } from "@/data/pdf-books";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
const defaultLocale = routing.defaultLocale;
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";

/**
 * Image Sitemap — helps Google Images discover and index all visual content
 * (media assets, visual lesson thumbnails, PDF book covers) with rich metadata.
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 */
export async function GET() {
  const entries: string[] = [];

  /* ── Media assets ────────────────────────────────────────────────── */
  for (const asset of mediaAssets) {
    const pageUrl = `${BASE_URL}/${defaultLocale}/resources/media/${asset.slug}`;
    const imageUrl = `${BASE_URL}${asset.imagePath}`;
    const licenseUrl =
      asset.license === "CC BY 4.0"
        ? LICENSE_URL
        : `${BASE_URL}/${defaultLocale}/license`;

    entries.push(`  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(asset.name)}</image:title>
      <image:caption>${escapeXml(asset.seoDescription)}</image:caption>
      <image:license>${escapeXml(licenseUrl)}</image:license>
    </image:image>
  </url>`);
  }

  /* ── Visual lesson thumbnails ────────────────────────────────────── */
  for (const lesson of visualLessons) {
    const pageUrl = `${BASE_URL}/${defaultLocale}/resources/visuals/${lesson.id}`;
    const imageUrl = `${BASE_URL}${lesson.thumbnailPath}`;

    entries.push(`  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(lesson.title)}</image:title>
      <image:caption>${escapeXml(lesson.description)}</image:caption>
      <image:license>${escapeXml(LICENSE_URL)}</image:license>
    </image:image>
  </url>`);
  }

  /* ── PDF book covers ─────────────────────────────────────────────── */
  for (const book of pdfBooks) {
    const pageUrl = `${BASE_URL}/${defaultLocale}/resources/pdfs/${book.slug}`;
    const imageUrl = `${BASE_URL}${book.coverImage}`;

    entries.push(`  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(book.title)}</image:title>
      <image:caption>${escapeXml(book.description)}</image:caption>
      <image:license>${escapeXml(LICENSE_URL)}</image:license>
    </image:image>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
