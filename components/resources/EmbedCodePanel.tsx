"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Code, Copy, Check, Download, ExternalLink } from "lucide-react";
import { downloadHtmlFile } from "@/lib/download-html";

export interface EmbedCodePanelProps {
  type: "questions" | "flashcards";
  title: string;
  /** The data to encode into the embed URL */
  embedData: unknown;
}

const DEFAULT_BASE_URL = "https://entermedschool.org";

function encodeEmbedPayload(data: unknown): string {
  try {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return "";
  }
}

export default function EmbedCodePanel({
  type,
  title,
  embedData,
}: EmbedCodePanelProps) {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("560");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setBaseUrl(
      typeof window !== "undefined" ? window.location.origin : DEFAULT_BASE_URL
    );
  }, []);

  const embedPath =
    type === "questions" ? "/embed/questions" : "/embed/flashcards-viewer";
  const payload = encodeEmbedPayload(embedData);

  const embedUrl = useMemo(() => {
    if (!payload) return `${baseUrl}${embedPath}`;
    return `${baseUrl}${embedPath}#${payload}`;
  }, [baseUrl, embedPath, payload]);

  const iframeCode = useMemo(() => {
    return `<!-- ${title} — EnterMedSchool -->\n<div style="max-width:100%;">\n  <iframe\n    src="${embedUrl}"\n    width="${width}" height="${height}"\n    style="border:none;border-radius:12px;overflow:hidden;"\n    title="${title} — EnterMedSchool"\n    loading="lazy"\n  ></iframe>\n  <p style="margin:8px 0 0;font-size:12px;font-family:sans-serif;color:#666;text-align:center;">\n    Powered by <a href="https://entermedschool.org" rel="dofollow" style="color:#6C5CE7;font-weight:600;text-decoration:none;">EnterMedSchool.org</a>\n  </p>\n</div>`;
  }, [embedUrl, width, height, title]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = iframeCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [iframeCode]);

  const handleDownload = useCallback(() => {
    const filename =
      type === "questions"
        ? "entermedschool-quiz-embed.html"
        : "entermedschool-flashcards-embed.html";
    downloadHtmlFile(iframeCode, filename);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }, [iframeCode, type]);

  if (!payload) {
    return (
      <div className="rounded-2xl border-2 border-ink-dark/10 bg-pastel-lavender p-5">
        <p className="text-sm text-ink-muted">No embed data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-ink-dark/10 bg-pastel-lavender p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-purple/20 bg-white">
          <Code className="h-5 w-5 text-showcase-purple" />
        </div>
        <h2 className="font-display text-xl font-bold text-ink-dark">
          Embed on Your Website
        </h2>
      </div>

      {/* Width/Height inputs */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-sm font-medium text-ink-dark">
            Width
          </label>
          <input
            type="text"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full rounded-lg border-2 border-ink-dark/20 bg-white px-3 py-2 text-sm text-ink-dark"
            placeholder="100%"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-sm font-medium text-ink-dark">
            Height
          </label>
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-lg border-2 border-ink-dark/20 bg-white px-3 py-2 text-sm text-ink-dark"
            placeholder="560"
          />
        </div>
      </div>

      {/* Code preview */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-ink-dark">
          Embed code
        </label>
        <pre className="overflow-x-auto rounded-lg border-2 border-ink-dark/20 bg-gray-900 p-4 text-sm text-green-400">
          <code>{iframeCode}</code>
        </pre>
      </div>

      {/* Action buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl bg-showcase-purple px-4 py-2.5 font-display font-semibold text-white transition-all hover:-translate-y-0.5"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-dark/20 bg-white px-4 py-2.5 font-display font-semibold text-ink-dark transition-all hover:border-showcase-purple/30 hover:bg-showcase-purple/5"
        >
          {downloaded ? (
            <Check className="h-4 w-4 text-showcase-green" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloaded ? "Downloaded!" : "Download as HTML"}
        </button>
      </div>

      {/* Preview */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-dark">
          <ExternalLink className="h-4 w-4" />
          Preview
        </label>
        <div className="overflow-hidden rounded-xl border-2 border-ink-dark/20 bg-white">
          <iframe
            src={embedUrl}
            width={width}
            height={height}
            title={`${title} — EnterMedSchool Preview`}
            className="block border-0"
            style={{ minHeight: "320px" }}
          />
        </div>
      </div>
    </div>
  );
}
