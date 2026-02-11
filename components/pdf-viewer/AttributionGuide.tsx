"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Shield, Copy, Check, ExternalLink, Download } from "lucide-react";
import { downloadHtmlFile } from "@/lib/download-html";
import type { PDFBook } from "@/data/pdf-books";

interface AttributionGuideProps {
  book: PDFBook;
}

export default function AttributionGuide({ book }: AttributionGuideProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [copied, setCopied] = useState<string | null>(null);

  const attributionText = `"${book.title}" by ${book.authors.map((a) => a.name).join(", ")} — EnterMedSchool.org. ${book.license.type}. https://entermedschool.org/${locale}/resources/pdfs/${book.slug}`;

  const attributionHtml = `<p>"<a href="https://entermedschool.org/${locale}/resources/pdfs/${book.slug}" rel="dofollow">${book.title}</a>" by ${book.authors.map((a) => a.name).join(", ")} — <a href="https://entermedschool.org" rel="dofollow">EnterMedSchool.org</a>. ${book.license.type}.</p>`;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <section className="rounded-2xl border-3 border-showcase-teal/20 bg-showcase-teal/5 p-6 sm:p-8">
      <div className="flex items-start gap-3 sm:items-center">
        <Shield className="h-5 w-5 shrink-0 text-showcase-teal" />
        <div>
          <h3 className="font-display text-lg font-bold text-ink-dark">
            How to Attribute This Work
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Copy one of the attribution snippets below when using this material.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Plain text */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink-muted">
            Plain Text
          </label>
          <div className="group relative">
            <pre className="overflow-x-auto rounded-xl border-2 border-showcase-navy/10 bg-white p-3 text-xs text-ink-muted leading-relaxed">
              {attributionText}
            </pre>
            <button
              onClick={() => handleCopy(attributionText, "text")}
              className="absolute end-2 top-2 flex h-7 items-center gap-1 rounded-lg bg-gray-100 px-2 text-xs font-semibold text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200"
            >
              {copied === "text" ? (
                <>
                  <Check className="h-3 w-3 text-showcase-green" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* HTML */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink-muted">
            HTML (with dofollow links)
          </label>
          <div className="group relative">
            <pre className="overflow-x-auto rounded-xl border-2 border-showcase-navy/10 bg-white p-3 text-xs text-ink-muted leading-relaxed">
              {attributionHtml}
            </pre>
            <div className="absolute end-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => {
                  downloadHtmlFile(attributionHtml, "attribution.html");
                  setCopied("html-dl");
                  setTimeout(() => setCopied(null), 2000);
                }}
                className="flex h-7 items-center gap-1 rounded-lg bg-gray-100 px-2 text-xs font-semibold text-ink-muted hover:bg-gray-200"
              >
                {copied === "html-dl" ? (
                  <>
                    <Check className="h-3 w-3 text-showcase-green" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3" />
                    Download
                  </>
                )}
              </button>
              <button
                onClick={() => handleCopy(attributionHtml, "html")}
                className="flex h-7 items-center gap-1 rounded-lg bg-gray-100 px-2 text-xs font-semibold text-ink-muted hover:bg-gray-200"
              >
                {copied === "html" ? (
                  <>
                    <Check className="h-3 w-3 text-showcase-green" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <a
          href={`/${locale}/license`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-teal hover:underline"
        >
          Full License Details
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`/${locale}/license#generator`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-purple hover:underline"
        >
          Badge Generator
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
