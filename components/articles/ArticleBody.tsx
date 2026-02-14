/* ── ArticleBody ─────────────────────────────────────────────────────
 * Server component that pre-processes the article HTML to:
 * 1. Inject `id` attributes on <h2> and <h3> headings for TOC anchors
 * 2. Render with enhanced Tailwind Typography prose classes
 * ──────────────────────────────────────────────────────────────────── */

/** Slugify a heading string into a URL-safe id */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[^;]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Inject id attributes on <h2> and <h3> tags so TOC anchors work */
function injectHeadingIds(html: string): string {
  return html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, content: string) => {
      // Skip if it already has an id
      if (/\bid\s*=/i.test(attrs)) return _match;
      const id = slugify(content);
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    },
  );
}

/* ── Prose classes ──────────────────────────────────────────────────── */

const PROSE_CLASSES = [
  "prose prose-lg max-w-none",

  // Headings
  "prose-headings:font-display prose-headings:font-extrabold prose-headings:text-ink-dark",
  "prose-headings:scroll-mt-24",
  "prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4",
  "prose-h2:border-b-2 prose-h2:border-showcase-purple/10 prose-h2:pb-3",
  "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",

  // Body text
  "prose-p:text-ink-muted prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg",

  // Links
  "prose-a:text-showcase-purple prose-a:font-semibold prose-a:underline-offset-2",
  "prose-a:decoration-showcase-purple/30 hover:prose-a:decoration-showcase-purple",

  // Strong & lists
  "prose-strong:text-ink-dark prose-strong:font-bold",
  "prose-li:text-ink-muted prose-li:marker:text-showcase-purple",

  // Blockquotes
  "prose-blockquote:border-l-4 prose-blockquote:border-showcase-purple",
  "prose-blockquote:bg-showcase-purple/5 prose-blockquote:rounded-r-xl",
  "prose-blockquote:py-1 prose-blockquote:px-6",
  "prose-blockquote:not-italic prose-blockquote:text-ink-muted",

  // Inline code
  "prose-code:bg-showcase-purple/10 prose-code:text-showcase-purple",
  "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm",

  // Images
  "prose-img:rounded-2xl prose-img:border-3 prose-img:border-showcase-navy/10",
  "prose-img:shadow-chunky-sm",
].join(" ");

/* ── Component ──────────────────────────────────────────────────────── */

interface ArticleBodyProps {
  html: string;
}

export default function ArticleBody({ html }: ArticleBodyProps) {
  const processedHtml = injectHeadingIds(html);

  return (
    <div
      id="article-body"
      className={PROSE_CLASSES}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}

/* ── Export slug helper for TOC to reuse ────────────────────────────── */
export { slugify };
