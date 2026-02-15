/* ─────────────────────────────────────────────────────────────────
 *  Auto-Link Terms — SEO Internal Linking
 *
 *  Scans text for glossary terms and provides linkable matches.
 *  Used for automatic internal linking to glossary pages.
 * ────────────────────────────────────────────────────────────────── */

import { glossaryTerms } from "@/data/glossary-terms";
import Link from "next/link";

/* ── Build term name → id lookup map ─────────────────────────────── */

const MIN_TERM_LENGTH = 4;

const nameToIdMap = new Map<string, string>();
for (const term of glossaryTerms) {
  const id = term.id;
  const allNames = [
    ...term.names,
    ...(term.aliases || []),
    ...(term.abbr || []).filter((a) => a.length >= MIN_TERM_LENGTH),
  ];
  for (const name of allNames) {
    if (name.length >= MIN_TERM_LENGTH) {
      const key = name.toLowerCase();
      if (!nameToIdMap.has(key)) {
        nameToIdMap.set(key, id);
      }
    }
  }
}

/* Sort by length descending so longer terms match first (avoid "cell" matching inside "stem cell" when both exist) */
const sortedNames = [...nameToIdMap.entries()].sort(
  (a, b) => b[0].length - a[0].length,
);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Finds glossary terms in text and returns them as linkable entries.
 * Uses whole-word matching, case-insensitive. Skips terms shorter than 4 characters.
 *
 * @param text - Text to scan
 * @param locale - Locale for link paths (e.g. "en", "he")
 * @param maxLinks - Maximum number of links to return (default 5)
 */
export function findGlossaryTerms(
  text: string,
  locale: string,
  maxLinks = 5,
): Array<{ term: string; href: string; id: string }> {
  interface Match {
    term: string;
    href: string;
    id: string;
    start: number;
    end: number;
  }

  const matches: Match[] = [];

  for (const [nameLower, id] of sortedNames) {
    const regex = new RegExp(`\\b${escapeRegex(nameLower)}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      matches.push({
        term: m[0],
        href: `/${locale}/resources/glossary/${id}`,
        id,
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const picked: Match[] = [];
  for (const m of matches) {
    if (picked.length >= maxLinks) break;
    const overlaps = picked.some(
      (p) =>
        (m.start >= p.start && m.start < p.end) ||
        (m.end > p.start && m.end <= p.end) ||
        (m.start <= p.start && m.end >= p.end),
    );
    if (!overlaps) {
      picked.push(m);
    }
  }

  return picked.map(({ term, href, id }) => ({ term, href, id }));
}

/* ── React component ────────────────────────────────────────────── */

export interface AutoLinkedTextProps {
  text: string;
  locale: string;
  maxLinks?: number;
  className?: string;
}

/**
 * Renders text with glossary terms as purple underlined links.
 * Server component — no "use client" needed.
 */
export function AutoLinkedText({
  text,
  locale,
  maxLinks = 5,
  className,
}: AutoLinkedTextProps) {
  const links = findGlossaryTerms(text, locale, maxLinks);
  if (links.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const segments: Array<{ type: "text" | "link"; content: string; href?: string; id?: string }> = [];
  let lastEnd = 0;
  const textLower = text.toLowerCase();

  for (const { term, href, id } of links) {
    const idx = textLower.indexOf(term.toLowerCase(), lastEnd);
    if (idx === -1) continue;

    if (idx > lastEnd) {
      segments.push({
        type: "text",
        content: text.slice(lastEnd, idx),
      });
    }
    segments.push({
      type: "link",
      content: text.slice(idx, idx + term.length),
      href,
      id,
    });
    lastEnd = idx + term.length;
  }

  if (lastEnd < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastEnd),
    });
  }

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "link" && seg.href ? (
          <Link
            key={i}
            href={seg.href}
            className="text-purple-600 underline underline-offset-1 hover:text-purple-700"
          >
            {seg.content}
          </Link>
        ) : (
          <span key={i}>{seg.content}</span>
        ),
      )}
    </span>
  );
}
