/* ── Author Registry ─────────────────────────────────────────────────
 * Centralized author data for blog articles. Every article references
 * an author by ID, so updating details here propagates to all articles
 * and their JSON-LD structured data automatically.
 *
 * To enrich an author's E-E-A-T signals, add sameAs URLs (social
 * profiles, Google Scholar, ORCID, etc.) and a jobTitle.
 * ──────────────────────────────────────────────────────────────────── */

export interface Author {
  id: string;
  name: string;
  /** Professional title shown in JSON-LD Person schema */
  jobTitle?: string;
  /** Short bio line shown in the author card on articles */
  bio?: string;
  /** Path to avatar image (relative to public/) */
  avatar?: string;
  /** Canonical URL for this author (about page, personal site, etc.) */
  url?: string;
  /** Social/professional profile URLs for JSON-LD sameAs (Twitter, LinkedIn, Scholar, ORCID) */
  sameAs?: string[];
}

/* ── Author entries ─────────────────────────────────────────────────── */

export const authors: Record<string, Author> = {
  "ari-horesh": {
    id: "ari-horesh",
    name: "Ari Horesh",
    jobTitle: "Medical Educator",
    bio: "Medical educator and founder of EnterMedSchool.org",
    url: "https://entermedschool.org/en/about",
    sameAs: [
      // TODO: Fill in with real profile URLs for richer E-E-A-T signals
      // "https://twitter.com/arihoresh",
      // "https://www.linkedin.com/in/arihoresh",
      // "https://scholar.google.com/citations?user=...",
      // "https://orcid.org/...",
    ],
  },
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function getAuthorById(id: string): Author | undefined {
  return authors[id];
}

export function getAuthorJsonLd(author: Author) {
  return {
    "@type": "Person" as const,
    name: author.name,
    ...(author.url && { url: author.url }),
    ...(author.jobTitle && { jobTitle: author.jobTitle }),
    ...(author.sameAs && author.sameAs.length > 0 && { sameAs: author.sameAs }),
  };
}
