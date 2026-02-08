"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, CheckCircle2, Loader2, Info, Lightbulb, ChevronDown, ChevronRight } from "lucide-react";

/* ── Pre-process LaTeX for latex.js compatibility ────────── */

/**
 * latex.js only supports a subset of LaTeX. This function rewrites
 * unsupported constructs into ones that latex.js can handle, so the
 * preview renders as much as possible instead of failing entirely.
 */
function preprocessForPreview(source: string): { processed: string; warnings: string[] } {
  let s = source;
  const warnings: string[] = [];

  // Strip \usepackage lines that latex.js doesn't understand
  // (latex.js ignores most of them, but some cause errors)
  const unsupportedPackages = [
    "amsmath", "amssymb", "amsthm", "graphicx", "hyperref",
    "booktabs", "geometry", "setspace", "multicol", "subcaption",
    "float", "xcolor", "tikz", "pgfplots", "natbib", "biblatex",
    "cleveref", "fancyhdr", "listings", "algorithm", "algorithmicx",
    "siunitx", "chemfig", "mhchem",
  ];
  for (const pkg of unsupportedPackages) {
    const re = new RegExp(`\\\\usepackage(\\[[^\\]]*\\])?\\{${pkg}\\}[^\\n]*\\n?`, "g");
    if (re.test(s)) {
      s = s.replace(re, "");
    }
  }

  // Convert \begin{equation}...\end{equation} → $$...$$
  s = s.replace(
    /\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g,
    (_match, body: string) => {
      return `$$${body.trim()}$$`;
    }
  );

  // Convert \begin{align}...\end{align} → $$...$$ (strip & alignment)
  s = s.replace(
    /\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g,
    (_match, body: string) => {
      const lines = body
        .trim()
        .split("\\\\")
        .map((line: string) => line.replace(/&/g, " ").trim())
        .filter(Boolean)
        .join(" \\\\\n");
      return `$$${lines}$$`;
    }
  );

  // Convert \begin{gather}...\end{gather} → $$...$$
  s = s.replace(
    /\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g,
    (_match, body: string) => `$$${body.trim()}$$`
  );

  // Convert \begin{displaymath}...\end{displaymath} → $$...$$
  s = s.replace(
    /\\begin\{displaymath\}([\s\S]*?)\\end\{displaymath\}/g,
    (_match, body: string) => `$$${body.trim()}$$`
  );

  // Convert \begin{math}...\end{math} → $...$
  s = s.replace(
    /\\begin\{math\}([\s\S]*?)\\end\{math\}/g,
    (_match, body: string) => `$${body.trim()}$`
  );

  // \[ ... \] → $$ ... $$
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_match, body: string) => `$$${body.trim()}$$`);

  // Convert booktabs commands to \hline equivalents
  s = s.replace(/\\toprule/g, "\\hline");
  s = s.replace(/\\midrule/g, "\\hline");
  s = s.replace(/\\bottomrule/g, "\\hline");

  // Remove @{} column specifiers that latex.js doesn't handle
  s = s.replace(/\{@\{\}([lcr|]+)@\{\}\}/g, "{$1}");
  s = s.replace(/@\{\}/g, "");

  // Strip \geometry{...} commands
  s = s.replace(/\\geometry\{[^}]*\}/g, "");

  // Strip \singlespacing, \onehalfspacing, \doublespacing
  s = s.replace(/\\(singlespacing|onehalfspacing|doublespacing)/g, "");

  // Strip \tableofcontents and \listoftables / \listoffigures
  s = s.replace(/\\tableofcontents/g, "");
  s = s.replace(/\\listof(tables|figures)/g, "");

  // Strip \newpage, \clearpage, \cleardoublepage
  s = s.replace(/\\(newpage|clearpage|cleardoublepage)/g, "");

  // Strip \pagenumbering{...}
  s = s.replace(/\\pagenumbering\{[^}]*\}/g, "");

  // Convert \href{url}{text} → just the text (latex.js may not handle hyperref)
  s = s.replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1");

  // Strip \label{...} and \ref{...} and \cite{...}
  s = s.replace(/\\label\{[^}]*\}/g, "");
  s = s.replace(/~?\\ref\{[^}]*\}/g, "[ref]");
  s = s.replace(/~?\\cite\{[^}]*\}/g, "[cite]");

  // Convert \begin{figure}...\end{figure} content — strip it but keep caption
  s = s.replace(
    /\\begin\{figure\}(\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/g,
    (_match, _opts, body: string) => {
      const captionMatch = body.match(/\\caption\{([^}]*)\}/);
      const caption = captionMatch ? captionMatch[1] : "Figure";
      return `\n\\textit{[Figure: ${caption}]}\n`;
    }
  );

  // Convert \begin{table}...\end{table} — keep tabular inside but strip the wrapper
  s = s.replace(
    /\\begin\{table\}(\[[^\]]*\])?([\s\S]*?)\\end\{table\}/g,
    (_match, _opts, body: string) => {
      // Extract just the tabular and caption
      const captionMatch = body.match(/\\caption\{([^}]*)\}/);
      const tabularMatch = body.match(/\\begin\{tabular\}[\s\S]*?\\end\{tabular\}/);
      let result = "";
      if (captionMatch) result += `\\textbf{${captionMatch[1]}}\n\n`;
      if (tabularMatch) result += tabularMatch[0] + "\n";
      else result += body;
      return `\n${result}\n`;
    }
  );

  // Strip \centering
  s = s.replace(/\\centering\s*/g, "");

  // Convert beamer-specific commands
  s = s.replace(/\\begin\{frame\}(\{[^}]*\})?/g, (_m, title) => {
    return title ? `\\subsection*${title}\n` : "";
  });
  s = s.replace(/\\end\{frame\}/g, "");
  s = s.replace(/\\titlepage/g, "\\maketitle");
  s = s.replace(/\\begin\{block\}\{([^}]*)\}/g, "\\textbf{$1}\n\\begin{quote}");
  s = s.replace(/\\end\{block\}/g, "\\end{quote}");

  // Convert \begin{columns}...\end{columns} — flatten
  s = s.replace(/\\begin\{columns?\}/g, "");
  s = s.replace(/\\end\{columns?\}/g, "");
  s = s.replace(/\\begin\{column\}\{[^}]*\}/g, "");
  s = s.replace(/\\end\{column\}/g, "");

  // \usetheme, \usecolortheme — strip
  s = s.replace(/\\use(theme|colortheme|fonttheme|innertheme|outertheme)\{[^}]*\}/g, "");

  // \institute{...} — strip
  s = s.replace(/\\institute\{[^}]*\}/g, "");
  s = s.replace(/\\subtitle\{[^}]*\}/g, "");

  // Convert \documentclass{beamer} → \documentclass{article}
  s = s.replace(/\\documentclass(\[[^\]]*\])?\{beamer\}/, "\\documentclass$1{article}");
  s = s.replace(/\\documentclass(\[[^\]]*\])?\{report\}/, "\\documentclass$1{article}");
  s = s.replace(/\\documentclass(\[[^\]]*\])?\{book\}/, "\\documentclass$1{article}");

  // Convert \chapter{...} → \section*{...} (article class has no chapters)
  s = s.replace(/\\chapter\*?\{/g, "\\section*{");

  // Strip \appendix
  s = s.replace(/\\appendix/g, "");

  // Convert \begin{abstract}...\end{abstract} if not natively supported
  // latex.js actually supports abstract, so leave it

  // Strip \begin{multicols}{...}...\end{multicols} wrapper but keep content
  s = s.replace(/\\begin\{multicols\}\{[^}]*\}/g, "");
  s = s.replace(/\\end\{multicols\}/g, "");

  // \section*{} — latex.js supports this, keep it
  // \footnote{} — latex.js supports this, keep it

  // Convert \vspace{...} and \hspace{...} — strip
  s = s.replace(/\\[vh]space\*?\{[^}]*\}/g, "");

  // Strip \setlength, \setcounter
  s = s.replace(/\\set(length|counter)\{[^}]*\}\{[^}]*\}/g, "");

  // Strip \newcommand and \renewcommand definitions
  s = s.replace(/\\(new|renew)command\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}/g, "");

  // Strip \pagestyle{...}
  s = s.replace(/\\pagestyle\{[^}]*\}/g, "");

  // Strip \thispagestyle{...}
  s = s.replace(/\\thispagestyle\{[^}]*\}/g, "");

  // Strip \bibliographystyle{...}
  s = s.replace(/\\bibliographystyle\{[^}]*\}/g, "");
  s = s.replace(/\\bibliography\{[^}]*\}/g, "");

  // Clean up multiple blank lines
  s = s.replace(/\n{4,}/g, "\n\n\n");

  return { processed: s, warnings };
}

/* ── Preview component ───────────────────────────────────── */

export default function PreviewPanel() {
  const {
    activeDocument,
    setPreviewHtml,
    setIsPreviewLoading,
    isPreviewLoading,
    setCompileErrors,
    compileErrors,
    settings,
  } = useLaTeXEditor();

  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [zoom, setZoom] = useState(100);
  const [lastCompileTime, setLastCompileTime] = useState<number | null>(null);
  const [previewNote, setPreviewNote] = useState<string | null>(null);

  /* ── Compile function ──────────────────────────────────── */
  const compile = useCallback(
    async (source: string) => {
      setIsPreviewLoading(true);
      setPreviewNote(null);
      const startTime = performance.now();

      // Pre-process the source for latex.js compatibility
      const { processed, warnings } = preprocessForPreview(source);

      if (warnings.length > 0) {
        setPreviewNote(warnings.join(" "));
      }

      try {
        // Dynamic import of latex.js
        const { parse, HtmlGenerator } = await import("latex.js");

        const generator = new HtmlGenerator({ hyphenate: false });
        const doc = parse(processed, { generator });
        const htmlDoc = doc.htmlDocument();

        // Serialise to HTML string
        const serializer = new XMLSerializer();
        let html = serializer.serializeToString(htmlDoc);

        // Inject custom styles for nicer rendering
        const customStyles = `
          <style>
            body {
              font-family: 'Computer Modern Serif', 'Latin Modern Roman', 'Georgia', 'Times New Roman', serif;
              line-height: 1.6;
              color: #1a1a2e;
              padding: 2rem 3rem;
              max-width: 100%;
              margin: 0 auto;
              background: white;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #1a1a2e;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            h1 { font-size: 1.8em; }
            h2 { font-size: 1.4em; }
            h3 { font-size: 1.2em; }
            p { margin: 0.8em 0; text-align: justify; }
            .title { text-align: center; font-size: 2em; margin-bottom: 0.3em; }
            .author { text-align: center; font-size: 1.1em; color: #555; }
            .date { text-align: center; color: #777; margin-bottom: 2em; }
            table { border-collapse: collapse; margin: 1em auto; }
            td, th { border: 1px solid #ccc; padding: 0.4em 0.8em; }
            th { background: #f5f5f5; font-weight: bold; }
            ul, ol { margin: 0.5em 0; padding-left: 2em; }
            li { margin: 0.3em 0; }
            blockquote { border-left: 3px solid #7c3aed; padding-left: 1em; margin: 1em 0; color: #555; font-style: italic; }
            a { color: #2563eb; }
            hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
            img { max-width: 100%; height: auto; }
          </style>
        `;

        html = html.replace("</head>", customStyles + "</head>");

        setPreviewHtml(html);
        setCompileErrors([]);

        // Check if preprocessing had to do heavy lifting
        if (source !== processed && !previewNote) {
          setPreviewNote(
            "Some advanced LaTeX features were simplified for the live preview. Your original code will compile perfectly in Overleaf."
          );
        }

        // Render into iframe
        if (iframeRef.current) {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(html);
            iframeDoc.close();
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown compilation error";

        // Try to extract line number
        const lineMatch = errorMessage.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1], 10) : 1;

        // User-friendly error messages
        let friendlyMessage = errorMessage;
        let severity: "error" | "warning" = "warning";

        if (
          errorMessage.includes("unknown") ||
          errorMessage.includes("Undefined")
        ) {
          const cmdMatch = errorMessage.match(/\\(\w+)/);
          const envMatch = errorMessage.match(/environment:\s*(\w+)/i) ||
            errorMessage.match(/unknown.*?(\w+)/i);
          if (envMatch) {
            friendlyMessage = `The environment "${envMatch[1]}" isn't supported in the live preview. It will work in Overleaf.`;
          } else if (cmdMatch) {
            friendlyMessage = `The command \\${cmdMatch[1]} isn't supported in the live preview. It will work in Overleaf.`;
          } else {
            friendlyMessage =
              "A command isn't supported in the live preview, but it will work when you compile in Overleaf.";
          }
          severity = "warning";
        } else if (
          errorMessage.includes("Missing") ||
          errorMessage.includes("Expected")
        ) {
          friendlyMessage =
            "There seems to be a missing brace { } or bracket [ ]. Check that every opening symbol has a matching closing one.";
          severity = "error";
        } else if (errorMessage.includes("Environment")) {
          friendlyMessage =
            "An environment (\\begin{...}/\\end{...}) has an issue. Make sure they match and are properly nested.";
          severity = "error";
        }

        setCompileErrors([
          { line, message: errorMessage, friendlyMessage, severity },
        ]);

        // Render a friendly fallback page
        if (iframeRef.current) {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(`<!DOCTYPE html>
<html><head><style>
  body { font-family: system-ui, sans-serif; padding: 2rem; color: #334155; background: #fff; }
  .card { border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
  .warn { background: #fffbeb; border: 2px solid #fde68a; }
  .err  { background: #fef2f2; border: 2px solid #fca5a5; }
  .title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem; }
  .warn .title { color: #92400e; }
  .err  .title { color: #dc2626; }
  .msg  { font-size: 0.85rem; line-height: 1.6; }
  .warn .msg { color: #78350f; }
  .err  .msg { color: #7f1d1d; }
  .tip  { margin-top: 1rem; padding: 1rem; background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; font-size: 0.8rem; color: #166534; }
</style></head><body>
  <div class="card ${severity === "error" ? "err" : "warn"}">
    <div class="title">${severity === "error" ? "Compilation Error" : "Preview Limitation"}</div>
    <div class="msg">${friendlyMessage}</div>
  </div>
  <div class="tip">
    <strong>Tip:</strong> The live preview supports basic LaTeX. Advanced packages and environments will compile correctly when you export to
    <strong>Overleaf</strong> (click Export in the toolbar). Your code is fine!
  </div>
</body></html>`);
            iframeDoc.close();
          }
        }
      } finally {
        setIsPreviewLoading(false);
        setLastCompileTime(performance.now() - startTime);
      }
    },
    [setPreviewHtml, setIsPreviewLoading, setCompileErrors, previewNote]
  );

  /* ── Debounced auto-compile ────────────────────────────── */
  useEffect(() => {
    if (!settings.autoPreview) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      compile(activeDocument.content);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeDocument.content, settings.autoPreview, compile]);

  /* ── Zoom controls ─────────────────────────────────────── */
  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const resetZoom = () => setZoom(100);

  const errorCount = compileErrors.filter((e) => e.severity === "error").length;
  const warningCount = compileErrors.filter((e) => e.severity === "warning").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Preview header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-ink-dark/10 bg-white/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
          {isPreviewLoading ? (
            <>
              <Loader2 size={12} className="animate-spin text-showcase-purple" />
              <span>Compiling...</span>
            </>
          ) : errorCount > 0 ? (
            <>
              <AlertTriangle size={12} className="text-red-500" />
              <span className="text-red-600">Error</span>
            </>
          ) : warningCount > 0 ? (
            <>
              <Info size={12} className="text-amber-500" />
              <span className="text-amber-600">Preview ready (with notes)</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-green-500" />
              <span className="text-green-600">Preview ready</span>
            </>
          )}
          {lastCompileTime !== null && !isPreviewLoading && (
            <span className="text-ink-light ml-1">({Math.round(lastCompileTime)}ms)</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-1 rounded hover:bg-pastel-cream text-ink-muted" title="Zoom out">
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-medium text-ink-muted w-10 text-center">{zoom}%</span>
          <button onClick={zoomIn} className="p-1 rounded hover:bg-pastel-cream text-ink-muted" title="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button onClick={resetZoom} className="p-1 rounded hover:bg-pastel-cream text-ink-muted ml-1" title="Reset zoom">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Info note about preview limitations */}
      {previewNote && compileErrors.length === 0 && (
        <div className="mx-3 mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-700 flex items-start gap-2">
          <Info size={13} className="mt-0.5 flex-shrink-0 text-blue-400" />
          <span>{previewNote}</span>
        </div>
      )}

      {/* Preview iframe */}
      <div
        ref={previewRef}
        className="flex-1 overflow-auto p-4"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
      >
        <div
          className="bg-white rounded-xl border-2 border-ink-dark/5 shadow-sm mx-auto"
          style={{ width: `${10000 / zoom}%`, minHeight: "100%" }}
        >
          <iframe
            ref={iframeRef}
            className="w-full border-none rounded-xl"
            style={{ minHeight: "600px", height: "100%" }}
            title="LaTeX Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Error/warning panel */}
      {compileErrors.length > 0 && (
        <ErrorPanel
          errors={compileErrors}
          errorCount={errorCount}
        />
      )}
    </div>
  );
}

/* ── Error panel sub-component ────────────────────────────── */

function ErrorPanel({
  errors,
  errorCount,
}: {
  errors: import("./types").CompileError[];
  errorCount: number;
}) {
  const { goToLine } = useLaTeXEditor();
  const [showFixes, setShowFixes] = useState(false);

  const COMMON_FIXES = [
    { tip: "Check every { has a matching }", icon: "{ }" },
    { tip: "Make sure every \\begin{...} has a matching \\end{...}", icon: "↕" },
    { tip: "Put math symbols inside $ signs: $x^2$", icon: "$" },
    { tip: "Escape special characters: use \\% not %, \\& not &, \\_ not _", icon: "%" },
    { tip: "Put \\usepackage commands before \\begin{document}", icon: "↑" },
  ];

  return (
    <div
      className={`border-t px-4 py-2 max-h-48 overflow-auto ${
        errorCount > 0
          ? "border-red-200 bg-red-50/80"
          : "border-amber-200 bg-amber-50/80"
      }`}
    >
      {errors.map((err, i) => (
        <div key={i} className="flex items-start gap-2 py-1 text-xs">
          {err.severity === "error" ? (
            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0 text-red-500" />
          ) : (
            <Info size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
          )}
          <div>
            <button
              onClick={() => goToLine(err.line)}
              className={`font-medium underline decoration-dotted cursor-pointer hover:opacity-70 transition-opacity ${
                err.severity === "error" ? "text-red-700" : "text-amber-700"
              }`}
              title="Click to go to this line in the editor"
            >
              Line {err.line}
            </button>
            <span className={err.severity === "error" ? "text-red-700" : "text-amber-700"}>: </span>
            <span
              className={
                err.severity === "error" ? "text-red-600" : "text-amber-600"
              }
            >
              {err.friendlyMessage}
            </span>
          </div>
        </div>
      ))}

      {/* Common fixes section */}
      <button
        onClick={() => setShowFixes(!showFixes)}
        className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-ink-muted hover:text-ink-dark transition-colors"
      >
        {showFixes ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <Lightbulb size={10} className="text-amber-500" />
        Common fixes
      </button>
      {showFixes && (
        <div className="mt-1.5 space-y-1 pb-1">
          {COMMON_FIXES.map((fix, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[11px] text-ink-muted pl-4"
            >
              <span className="w-4 text-center font-mono text-[10px] text-showcase-purple">
                {fix.icon}
              </span>
              <span>{fix.tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
