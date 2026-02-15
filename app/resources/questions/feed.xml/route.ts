import {
  practiceDecks,
  practiceCategories,
} from "@/data/practice-categories";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
const LOCALE = "en";

/**
 * RSS 2.0 feed for practice question decks — enables RSS readers and
 * content aggregators to discover new question decks.
 */
export async function GET() {
  const categoryById = new Map(practiceCategories.map((c) => [c.id, c]));

  const sortedDecks = [...practiceDecks].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const items = sortedDecks
    .map((deck) => {
      const categoryId =
        deck.primaryCategoryId ?? deck.categoryIds?.[0];
      const category = categoryId ? categoryById.get(categoryId) : undefined;
      const categorySlug = category?.slug;

      if (!categorySlug) return null;

      const link = `${BASE_URL}/${LOCALE}/resources/questions/${categorySlug}/${deck.slug}`;
      const pubDate = new Date(deck.updatedAt).toUTCString();

      return `  <item>
    <title>${escapeXml(deck.title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(deck.description || deck.title)}</description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
  </item>`;
    })
    .filter(Boolean);

  const latestDate =
    sortedDecks[0]?.updatedAt || new Date().toISOString();
  const channelLink = `${BASE_URL}/${LOCALE}/resources/questions`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>EnterMedSchool.org — Practice Questions</title>
    <link>${escapeXml(channelLink)}</link>
    <description>Free medical practice questions and MCQs</description>
    <lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/resources/questions/feed.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
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
