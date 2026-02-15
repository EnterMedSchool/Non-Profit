import { mediaAssets } from "@/data/media-assets";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

/**
 * Atom feed for media assets — enables RSS readers and content aggregators
 * to discover new medical illustrations.
 */
export async function GET() {
  const sorted = [...mediaAssets].sort(
    (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
  );

  const latestDate = sorted[0]?.dateModified || new Date().toISOString().split("T")[0];

  const entries = sorted.map((asset) => {
    const url = `${BASE_URL}/en/resources/media/${asset.slug}`;
    const imageUrl = asset.thumbnailPath;

    return `  <entry>
    <title>${escapeXml(asset.name)}</title>
    <link href="${escapeXml(url)}" rel="alternate" type="text/html"/>
    <id>${escapeXml(url)}</id>
    <published>${asset.datePublished}T00:00:00Z</published>
    <updated>${asset.dateModified}T00:00:00Z</updated>
    <summary>${escapeXml(asset.seoDescription)}</summary>
    <content type="html">${escapeXml(
      `<p>${asset.description}</p><p><img src="${imageUrl}" alt="${asset.name}" width="${asset.width}" height="${asset.height}" /></p><p>License: ${asset.license} — Attribution: ${asset.attribution}</p>`,
    )}</content>
    <author>
      <name>EnterMedSchool.org</name>
      <uri>${BASE_URL}</uri>
    </author>${asset.tags.map((tag) => `\n    <category term="${escapeXml(tag)}"/>`).join("")}
  </entry>`;
  });

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>EnterMedSchool — Free Medical Illustrations</title>
  <subtitle>New free medical illustrations for educators — SVGs and PNGs for your lectures and presentations.</subtitle>
  <link href="${BASE_URL}/resources/media/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${BASE_URL}/en/resources/media" rel="alternate" type="text/html"/>
  <id>${BASE_URL}/en/resources/media</id>
  <updated>${latestDate}T00:00:00Z</updated>
  <author>
    <name>EnterMedSchool.org</name>
    <uri>${BASE_URL}</uri>
  </author>
  <rights>Creative Commons Attribution 4.0 International (CC BY 4.0)</rights>
  <icon>${BASE_URL}/favicon.ico</icon>
${entries.join("\n")}
</feed>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
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
