"use client";

import { useState } from "react";
import { Copy, Check, Code, FileText } from "lucide-react";

interface Props {
  imgEmbedCode: string;
  markdownCode: string;
  assetName: string;
}

type Tab = "html" | "markdown";

export default function MediaEmbedCodeSnippets({
  imgEmbedCode,
  markdownCode,
  assetName,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [copied, setCopied] = useState(false);

  const code = activeTab === "html" ? imgEmbedCode : markdownCode;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink-dark">
          Embed Code
        </h2>
        {/* Tab switcher */}
        <div className="flex rounded-lg border-2 border-showcase-navy/15 bg-white overflow-hidden">
          <button
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "html"
                ? "bg-showcase-purple text-white"
                : "text-ink-muted hover:bg-pastel-lavender/50"
            }`}
          >
            <Code className="h-3 w-3" />
            HTML
          </button>
          <button
            onClick={() => setActiveTab("markdown")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "markdown"
                ? "bg-showcase-purple text-white"
                : "text-ink-muted hover:bg-pastel-lavender/50"
            }`}
          >
            <FileText className="h-3 w-3" />
            Markdown
          </button>
        </div>
      </div>

      {/* Code block */}
      <div className="relative rounded-2xl border-3 border-showcase-navy bg-[#1a1a2e] shadow-chunky-lg">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
            {activeTab === "html" ? "HTML" : "Markdown"} — {assetName}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              copied
                ? "bg-showcase-green/20 text-showcase-green"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Code
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-white/80">
          <code>{code}</code>
        </pre>
      </div>

      <p className="text-xs text-ink-muted leading-relaxed">
        Paste this code into your website, blog, or LMS (Moodle, Canvas, etc.).
        The attribution link is required under the{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-showcase-purple hover:underline"
        >
          CC BY 4.0
        </a>{" "}
        license.
      </p>
    </div>
  );
}
