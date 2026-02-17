/* ── Blog Post Types & Data ──────────────────────────────────────────
 * Data-driven blog system. Add new posts here and they automatically
 * appear in the listing, sitemap, and RSS feed.
 */

import { getAuthorById, type Author } from "@/data/authors";
import { usmleStep1TipsBody } from "@/data/articles/usmle-step-1-tips-body";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Full article body in HTML (supports inline tags, article-tip/warning/important callouts) */
  body: string;
  author: string;
  /** Author registry ID — resolves to full Author object for JSON-LD */
  authorId?: string;
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
  {
    slug: "usmle-step-1-tips-international-students",
    title: "USMLE Step 1 Tips for Non-US Medical Students",
    description:
      "Comprehensive guide for international medical students preparing for USMLE Step 1. Covers study timelines, free resources, scheduling, costs, test-day tips, burnout prevention, and residency advice.",
    body: usmleStep1TipsBody,
    author: "Ari Horesh",
    authorId: "ari-horesh",
    datePublished: "2026-02-17",
    dateModified: "2026-02-17",
    tags: [
      "USMLE Step 1",
      "IMG study guide",
      "international medical students",
      "Step 1 study plan",
      "USMLE resources free",
      "ECFMG registration",
      "Prometric scheduling",
      "Step 1 exam day tips",
      "IMG burnout prevention",
      "Step 1 cost budget",
      "residency timeline",
      "study templates USMLE",
    ],
    category: "Study Guides",
    readingTime: 30,
    featured: true,
    coverGradient: "from-showcase-teal via-showcase-blue to-showcase-purple",
    coverIcon: "BookOpen",
    authorBio: "Medical educator and founder of EnterMedSchool.org",
  },
];

/* ── Helper Functions ───────────────────────────────────────────────── */

/** Resolve the full Author object for a blog post (falls back to undefined) */
export function getPostAuthor(post: BlogPost): Author | undefined {
  return post.authorId ? getAuthorById(post.authorId) : undefined;
}

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
