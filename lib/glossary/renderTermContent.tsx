/* ─────────────────────────────────────────────────────────────────
 *  renderTermContent — Markdown-like content renderer with
 *  automatic internal term linking for SEO.
 *
 *  Converts:
 *    **bold text**    → <strong>
 *    <u>term</u>      → <a href> to glossary term (if exists)
 *    Known term names → <a href> to glossary term (first occurrence)
 * ────────────────────────────────────────────────────────────────── */

import React from "react";
import Link from "next/link";

interface RenderOptions {
  /** Map of lowercase name/alias → term id */
  termNameMap: Map<string, string>;
  /** Current term id (don't self-link) */
  currentTermId: string;
  /** Locale for link generation */
  locale: string;
}

/**
 * Parse markdown-like content and return React elements with
 * internal term links for SEO cross-linking.
 */
export function renderTermContent(
  text: string,
  options: RenderOptions,
): React.ReactNode {
  const { termNameMap, currentTermId, locale } = options;
  const linkedIds = new Set<string>();

  // Process the text in passes:
  // 1. Split by <u>...</u> tags (explicit term references)
  // 2. Within non-tag segments, handle **bold** and auto-link known terms

  const elements: React.ReactNode[] = [];
  let keyIdx = 0;

  // Split by <u>...</u> and **...** patterns
  const regex = /(<u>(.*?)<\/u>|\*\*(.*?)\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before this match
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      elements.push(
        ...autoLinkPlainText(plainText, options, linkedIds, keyIdx),
      );
      keyIdx += plainText.length;
    }

    if (match[2] !== undefined) {
      // <u>term</u> pattern — link if it's a known term
      const underlined = match[2];
      const termId = termNameMap.get(underlined.toLowerCase());
      if (termId && termId !== currentTermId && !linkedIds.has(termId)) {
        linkedIds.add(termId);
        elements.push(
          <Link
            key={`u-${keyIdx++}`}
            href={`/${locale}/resources/glossary/${termId}`}
            className="text-showcase-purple font-semibold underline decoration-showcase-purple/30 decoration-2 underline-offset-2 hover:decoration-showcase-purple/60 transition-colors"
          >
            {underlined}
          </Link>,
        );
      } else {
        elements.push(
          <span key={`u-${keyIdx++}`} className="underline">
            {underlined}
          </span>,
        );
      }
    } else if (match[3] !== undefined) {
      // **bold** pattern — also check if it's a known term
      const boldText = match[3];
      const termId = termNameMap.get(boldText.toLowerCase());
      if (termId && termId !== currentTermId && !linkedIds.has(termId)) {
        linkedIds.add(termId);
        elements.push(
          <Link
            key={`b-${keyIdx++}`}
            href={`/${locale}/resources/glossary/${termId}`}
            className="font-bold text-showcase-purple underline decoration-showcase-purple/30 decoration-2 underline-offset-2 hover:decoration-showcase-purple/60 transition-colors"
          >
            {boldText}
          </Link>,
        );
      } else {
        elements.push(
          <strong key={`b-${keyIdx++}`}>{boldText}</strong>,
        );
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    elements.push(
      ...autoLinkPlainText(remaining, options, linkedIds, keyIdx),
    );
  }

  return <>{elements}</>;
}

/**
 * Within plain text segments, find and auto-link the first occurrence
 * of known term names. Only links terms that haven't been linked yet.
 */
function autoLinkPlainText(
  text: string,
  options: RenderOptions,
  linkedIds: Set<string>,
  startKey: number,
): React.ReactNode[] {
  const { termNameMap, currentTermId, locale } = options;
  const elements: React.ReactNode[] = [];

  // Build a regex from unlinked term names (sorted by length, longest first)
  const candidates: Array<{ name: string; id: string }> = [];
  for (const [name, id] of termNameMap) {
    if (id === currentTermId || linkedIds.has(id)) continue;
    if (name.length < 4) continue; // Skip very short names to avoid false positives
    candidates.push({ name, id });
  }
  candidates.sort((a, b) => b.name.length - a.name.length);

  // Try to find and link the first occurrence of each candidate
  let remaining = text;
  let keyIdx = startKey;

  // Scale link cap based on text length: 5 for short segments, up to 10 for long ones
  let linksAdded = 0;
  const maxLinks = Math.min(10, Math.max(5, Math.floor(text.length / 200)));

  for (const candidate of candidates) {
    if (linksAdded >= maxLinks) break;

    const idx = remaining.toLowerCase().indexOf(candidate.name);
    if (idx === -1) continue;

    // Check word boundaries
    const before = idx > 0 ? remaining[idx - 1] : " ";
    const after =
      idx + candidate.name.length < remaining.length
        ? remaining[idx + candidate.name.length]
        : " ";
    if (/\w/.test(before) || /\w/.test(after)) continue;

    // Found a match — split and link
    if (idx > 0) {
      elements.push(
        <React.Fragment key={`p-${keyIdx++}`}>
          {remaining.slice(0, idx)}
        </React.Fragment>,
      );
    }

    const matchedText = remaining.slice(idx, idx + candidate.name.length);
    linkedIds.add(candidate.id);
    elements.push(
      <Link
        key={`a-${keyIdx++}`}
        href={`/${locale}/resources/glossary/${candidate.id}`}
        className="text-showcase-purple underline decoration-showcase-purple/20 decoration-1 underline-offset-2 hover:decoration-showcase-purple/50 transition-colors"
      >
        {matchedText}
      </Link>,
    );

    remaining = remaining.slice(idx + candidate.name.length);
    linksAdded++;
  }

  // Add any leftover text
  if (remaining) {
    elements.push(
      <React.Fragment key={`r-${keyIdx++}`}>{remaining}</React.Fragment>,
    );
  }

  return elements;
}

/**
 * Simple renderer for text that only needs bold/underline rendering
 * without term linking (used in embeds, etc.)
 */
export function renderSimpleMarkdown(text: string): React.ReactNode {
  const elements: React.ReactNode[] = [];
  const regex = /(<u>(.*?)<\/u>|\*\*(.*?)\*\*)/g;
  let lastIndex = 0;
  let keyIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <React.Fragment key={`t-${keyIdx++}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>,
      );
    }

    if (match[2] !== undefined) {
      elements.push(
        <span key={`u-${keyIdx++}`} className="underline">
          {match[2]}
        </span>,
      );
    } else if (match[3] !== undefined) {
      elements.push(<strong key={`b-${keyIdx++}`}>{match[3]}</strong>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(
      <React.Fragment key={`e-${keyIdx++}`}>
        {text.slice(lastIndex)}
      </React.Fragment>,
    );
  }

  return <>{elements}</>;
}
