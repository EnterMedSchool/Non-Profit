/* ── Blog Post Types & Data ──────────────────────────────────────────
 * Data-driven blog system. Add new posts here and they automatically
 * appear in the listing, sitemap, and RSS feed.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Full article body in HTML (supports inline tags, article-tip/warning/important callouts) */
  body: string;
  author: string;
  datePublished: string; // ISO date
  dateModified: string; // ISO date
  tags: string[];
  /** Category for OG article:section */
  category: string;
  /** Optional cover image path (relative to public/) */
  coverImage?: string;
  /** Reading time in minutes */
  readingTime: number;
  /** Related glossary term IDs for cross-linking */
  relatedTerms?: string[];
  /** Related tool IDs for cross-linking */
  relatedTools?: string[];

  /* ── Enhanced fields for the article hero & author card ────────── */

  /** Tailwind gradient classes for the hero band (e.g. "from-showcase-purple via-showcase-blue to-showcase-teal") */
  coverGradient?: string;
  /** Lucide icon name displayed as a floating decoration in the hero */
  coverIcon?: string;
  /** Path to the author's avatar image (relative to public/) */
  authorAvatar?: string;
  /** Short author bio line shown in the author card */
  authorBio?: string;
  /** When true, the article gets a prominent card on the listing page */
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  // Add real blog posts here. Each post automatically appears in the
  // listing page, sitemap, RSS feed, and gets full Article JSON-LD.
  //
  // Example:
  // {
  //   slug: "your-article-slug",
  //   title: "Your Article Title",
  //   description: "Meta description for search results.",
  //   body: "<p>Full HTML article body...</p>",
  //   author: "Ari Horesh",
  //   datePublished: "2026-02-14",
  //   dateModified: "2026-02-14",
  //   tags: ["tag1", "tag2"],
  //   category: "Study Guides",
  //   readingTime: 5,
  //   relatedTerms: ["glossary-term-id"],
  //   relatedTools: ["flashcard-maker"],
  // },
];

/* ── Helper Functions ───────────────────────────────────────────────── */

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter((p) => p.tags.includes(tag));
}

export function getRecentBlogPosts(limit = 5): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .slice(0, limit);
}
