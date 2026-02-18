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

  // Tables
  "prose-table:w-full prose-table:text-sm prose-table:border-collapse",
  "prose-thead:bg-showcase-purple/5 prose-thead:border-b-2 prose-thead:border-showcase-purple/20",
  "prose-th:text-left prose-th:font-bold prose-th:text-ink-dark prose-th:px-4 prose-th:py-3 prose-th:text-sm",
  "prose-td:px-4 prose-td:py-3 prose-td:text-ink-muted prose-td:border-b prose-td:border-showcase-navy/8",
  "prose-tr:transition-colors hover:prose-tr:bg-showcase-purple/[0.02]",

  // Inline code
  "prose-code:bg-showcase-purple/10 prose-code:text-showcase-purple",
  "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm",

  // Images
  "prose-img:rounded-2xl prose-img:border-3 prose-img:border-showcase-navy/10",
  "prose-img:shadow-chunky-sm",
].join(" ");

/** Inline styles for elements that Tailwind prose modifiers can't reach */
const EXTRA_STYLES = `
  <style>
    #article-body table { border-radius: 12px; overflow: hidden; border: 2px solid rgb(var(--color-showcase-navy) / 0.08); }
    #article-body details { border: 2px solid rgb(var(--color-showcase-purple) / 0.15); border-radius: 12px; padding: 0; margin: 1.5rem 0; overflow: hidden; }
    #article-body details summary { cursor: pointer; padding: 0.875rem 1.25rem; font-weight: 700; background: rgb(var(--color-showcase-purple) / 0.04); transition: background 0.15s; }
    #article-body details summary:hover { background: rgb(var(--color-showcase-purple) / 0.08); }
    #article-body details[open] summary { border-bottom: 2px solid rgb(var(--color-showcase-purple) / 0.1); }
    #article-body details > ul, #article-body details > ol { padding: 1rem 1.25rem 1rem 2.5rem; margin: 0; }
    #article-body details li { margin-top: 0.5rem; margin-bottom: 0.5rem; }
    #article-body .article-tip { border-left: 4px solid rgb(var(--color-showcase-teal)); background: rgb(var(--color-showcase-teal) / 0.05); border-radius: 0 12px 12px 0; padding: 1rem 1.25rem; margin: 1.5rem 0; }
    #article-body .article-tip strong:first-child { color: rgb(var(--color-showcase-teal)); }
    #article-body .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 1.5rem 0; }
    #article-body .table-scroll table { margin: 0; }
    @media (max-width: 640px) {
      #article-body th, #article-body td { padding: 0.5rem 0.625rem; font-size: 0.8125rem; }
    }
  </style>
`;

/* ── Component ──────────────────────────────────────────────────────── */

interface ArticleBodyProps {
  html: string;
}

/** Wrap bare <table> elements in a responsive scroll container */
function wrapTablesForScroll(html: string): string {
  return html.replace(
    /(<table[\s\S]*?<\/table>)/gi,
    '<div class="table-scroll">$1</div>',
  );
}

export default function ArticleBody({ html }: ArticleBodyProps) {
  let processedHtml = injectHeadingIds(html);
  processedHtml = wrapTablesForScroll(processedHtml);

  return (
    <div
      id="article-body"
      className={PROSE_CLASSES}
      dangerouslySetInnerHTML={{ __html: EXTRA_STYLES + processedHtml }}
    />
  );
}

/* ── Export slug helper for TOC to reuse ────────────────────────────── */
export { slugify };
