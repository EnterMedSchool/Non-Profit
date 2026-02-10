"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import TemplateCard from "./TemplateCard";
import type { LaTeXTemplate, TemplateCategory } from "./types";
import { X, Search, Eye, Code2 } from "lucide-react";

const CATEGORIES: { key: TemplateCategory | "all"; label: string }[] = [
  { key: "all", label: "All Templates" },
  { key: "getting-started", label: "Getting Started" },
  { key: "notes", label: "Notes & Study" },
  { key: "essay", label: "Essays & Reports" },
  { key: "research", label: "Research" },
  { key: "thesis", label: "Thesis" },
  { key: "presentation", label: "Presentations" },
  { key: "cv", label: "CV & Letters" },
];

export default function TemplateBrowser() {
  const { setIsTemplateBrowserOpen, loadTemplate } = useLaTeXEditor();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<LaTeXTemplate | null>(null);
  const [latexTemplates, setLatexTemplates] = useState<LaTeXTemplate[]>([]);

  useEffect(() => {
    import("@/data/latex-templates").then((mod) => setLatexTemplates(mod.latexTemplates));
  }, []);

  const filtered = useMemo(() => {
    let result = latexTemplates;
    if (activeCategory !== "all") {
      result = result.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeCategory, searchQuery, latexTemplates]);

  const handleUse = (template: LaTeXTemplate) => {
    const docs = template.files.map((f) => ({
      id: f.name.replace(/\.[^.]+$/, ""),
      name: f.name,
      content: f.content,
      isMain: f.isMain,
    }));
    loadTemplate(docs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-2 border-ink-dark/10 shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-dark/5">
          <div>
            <h2 className="text-lg font-bold text-ink-dark">Template Gallery</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Choose a template to get started quickly. Every template is designed for medical students.
            </p>
          </div>
          <button
            onClick={() => setIsTemplateBrowserOpen(false)}
            className="p-2 rounded-lg hover:bg-pastel-cream text-ink-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search + categories */}
        <div className="px-6 py-3 border-b border-ink-dark/5 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border-2 border-ink-dark/10 text-sm focus:outline-none focus:border-showcase-purple/40"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.key
                    ? "bg-showcase-purple text-white"
                    : "bg-pastel-cream text-ink-muted hover:text-ink-dark"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-auto p-6">
          {previewTemplate ? (
            <TemplatePreview
              template={previewTemplate}
              onBack={() => setPreviewTemplate(null)}
              onUse={() => {
                handleUse(previewTemplate);
                setPreviewTemplate(null);
              }}
            />
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-ink-muted">
                  <p className="text-sm">No templates found matching your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      onUse={handleUse}
                      onPreview={setPreviewTemplate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Preview sub-component ───────────────────────────────── */

function TemplatePreview({
  template,
  onBack,
  onUse,
}: {
  template: LaTeXTemplate;
  onBack: () => void;
  onUse: () => void;
}) {
  const mainFile = template.files.find((f) => f.isMain) ?? template.files[0];
  const [viewMode, setViewMode] = useState<"code" | "preview">("preview");
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [previewReady, setPreviewReady] = useState(false);

  // Render the template preview using latex.js
  React.useEffect(() => {
    if (viewMode !== "preview" || !iframeRef.current) return;
    setPreviewReady(false);

    const renderPreview = async () => {
      try {
        const { parse, HtmlGenerator } = await import("latex.js");
        // Basic preprocessing (reuse logic from PreviewPanel)
        let source = mainFile.content;
        const unsupported = ["amsmath", "amssymb", "amsthm", "graphicx", "hyperref", "booktabs", "geometry", "setspace", "multicol", "float", "xcolor", "tikz", "natbib", "biblatex", "fancyhdr", "listings", "siunitx"];
        for (const pkg of unsupported) {
          source = source.replace(new RegExp(`\\\\usepackage(\\[[^\\]]*\\])?\\{${pkg}\\}[^\\n]*\\n?`, "g"), "");
        }
        source = source.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, (_, b: string) => `$$${b.trim()}$$`);
        source = source.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (_, b: string) => `$$${b.trim().replace(/&/g, " ").replace(/\\\\/g, "\\\\")}$$`);
        source = source.replace(/\\documentclass(\[[^\]]*\])?\{beamer\}/, "\\documentclass$1{article}");
        source = source.replace(/\\documentclass(\[[^\]]*\])?\{report\}/, "\\documentclass$1{article}");
        source = source.replace(/\\begin\{frame\}(\{[^}]*\})?/g, (_, t) => t ? `\\subsection*${t}\n` : "");
        source = source.replace(/\\end\{frame\}/g, "");
        source = source.replace(/\\geometry\{[^}]*\}/g, "");
        source = source.replace(/\\label\{[^}]*\}/g, "");
        source = source.replace(/~?\\ref\{[^}]*\}/g, "[ref]");
        source = source.replace(/~?\\cite\{[^}]*\}/g, "[cite]");
        source = source.replace(/\\centering\s*/g, "");
        source = source.replace(/\\begin\{figure\}(\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/g, (_, __, b: string) => {
          const c = b.match(/\\caption\{([^}]*)\}/);
          return `\n\\textit{[Figure: ${c ? c[1] : "Figure"}]}\n`;
        });
        source = source.replace(/\\tableofcontents/g, "");
        source = source.replace(/\\(newpage|clearpage)/g, "");
        source = source.replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1");
        source = source.replace(/\\pagestyle\{[^}]*\}/g, "");
        source = source.replace(/\\thispagestyle\{[^}]*\}/g, "");
        source = source.replace(/\\bibliographystyle\{[^}]*\}/g, "");
        source = source.replace(/\\bibliography\{[^}]*\}/g, "");
        source = source.replace(/\\set(length|counter)\{[^}]*\}\{[^}]*\}/g, "");
        source = source.replace(/\\[vh]space\*?\{[^}]*\}/g, "");
        source = source.replace(/\\use(theme|colortheme|fonttheme|innertheme|outertheme)\{[^}]*\}/g, "");
        source = source.replace(/\\institute\{[^}]*\}/g, "");
        source = source.replace(/\\subtitle\{[^}]*\}/g, "");
        source = source.replace(/\\toprule/g, "\\hline");
        source = source.replace(/\\midrule/g, "\\hline");
        source = source.replace(/\\bottomrule/g, "\\hline");

        const gen = new HtmlGenerator({ hyphenate: false });
        const doc = parse(source, { generator: gen });
        const htmlDoc = doc.htmlDocument();
        const serializer = new XMLSerializer();
        let html = serializer.serializeToString(htmlDoc);
        html = html.replace("</head>", `<style>
          body { font-family: Georgia, serif; line-height: 1.6; padding: 1.5rem 2rem; color: #1a1a2e; max-width: 100%; background: white; font-size: 12px; }
          h1,h2,h3 { color: #1a1a2e; margin-top: 1em; }
          h1 { font-size: 1.5em; } h2 { font-size: 1.2em; }
          p { margin: 0.5em 0; text-align: justify; }
          table { border-collapse: collapse; margin: 0.5em auto; font-size: 11px; }
          td, th { border: 1px solid #ccc; padding: 0.3em 0.5em; }
          ul, ol { padding-left: 1.5em; }
        </style></head>`);

        if (iframeRef.current) {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(html);
            iframeDoc.close();
          }
        }
        setPreviewReady(true);
      } catch {
        // Fallback to showing a message
        if (iframeRef.current) {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(`<html><body style="font-family:system-ui;padding:2rem;color:#666;text-align:center">
              <p>Preview unavailable for this template.</p>
              <p style="font-size:12px">Switch to Code view to see the LaTeX source, or click "Use This Template" to load it into the editor.</p>
            </body></html>`);
            iframeDoc.close();
          }
        }
        setPreviewReady(true);
      }
    };

    renderPreview();
  }, [viewMode, mainFile.content]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-showcase-purple font-medium hover:underline"
        >
          &larr; Back to templates
        </button>
        <button
          onClick={onUse}
          className="px-4 py-2 rounded-lg bg-showcase-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Use This Template
        </button>
      </div>

      <div>
        <h3 className="text-lg font-bold text-ink-dark">{template.title}</h3>
        <p className="text-sm text-ink-muted mt-1">{template.previewDescription}</p>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-1 bg-pastel-cream/50 p-0.5 rounded-lg w-fit">
        <button
          onClick={() => setViewMode("preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === "preview"
              ? "bg-white shadow-sm text-showcase-purple"
              : "text-ink-muted hover:text-ink-dark"
          }`}
        >
          <Eye size={12} />
          Preview
        </button>
        <button
          onClick={() => setViewMode("code")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === "code"
              ? "bg-white shadow-sm text-showcase-purple"
              : "text-ink-muted hover:text-ink-dark"
          }`}
        >
          <Code2 size={12} />
          Code
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-xl border-2 border-ink-dark/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-ink-dark/5 bg-white/80">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            {viewMode === "preview" ? <Eye size={12} /> : <Code2 size={12} />}
            <span>{mainFile.name}</span>
          </div>
          <span className="text-[10px] text-ink-light">
            {mainFile.content.split("\n").length} lines
          </span>
        </div>
        {viewMode === "code" ? (
          <pre className="p-4 text-xs font-mono text-ink-dark overflow-auto max-h-[50vh] leading-relaxed">
            {mainFile.content}
          </pre>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full border-none bg-white"
            style={{ minHeight: "400px", maxHeight: "50vh" }}
            title="Template Preview"
            sandbox="allow-same-origin"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
