import { mediaAssets } from "@/data/media-assets";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/**
 * Image Sitemap — helps Google Images discover and index all media assets
 * with rich metadata (title, caption, license).
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 */
export async function GET() {
  const entries = mediaAssets.map((asset) => {
    const pageUrl = `${BASE_URL}/en/resources/media/${asset.slug}`;
    const imageUrl = `${BASE_URL}${asset.imagePath}`;
    const licenseUrl =
      asset.license === "CC BY 4.0"
        ? "https://creativecommons.org/licenses/by/4.0/"
        : `${BASE_URL}/en/license`;

    return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(asset.name)}</image:title>
      <image:caption>${escapeXml(asset.seoDescription)}</image:caption>
      <image:license>${escapeXml(licenseUrl)}</image:license>
    </image:image>
  </url>`;
  });

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
