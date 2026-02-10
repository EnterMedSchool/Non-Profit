"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Code, Link2 } from "lucide-react";
import { EXAM_COPY } from "./examChains";

/* ── Constants ── */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

const COLOR_PRESETS = [
  { label: "White", value: "ffffff" },
  { label: "Light Gray", value: "f5f5f5" },
  { label: "Cream", value: "faf8f5" },
  { label: "Dark", value: "1a1a2e" },
  { label: "Slate", value: "1e293b" },
];

const ACCENT_PRESETS = [
  { label: "Purple", value: "6C5CE7" },
  { label: "Green", value: "00b894" },
  { label: "Teal", value: "00cec9" },
  { label: "Coral", value: "ff7675" },
  { label: "Blue", value: "0984e3" },
  { label: "Navy", value: "1a1a2e" },
];

const CELEBRATION_COLORS = [
  "#6C5CE7", "#00D9C0", "#FFD93D", "#FF85A2",
  "#54A0FF", "#2ECC71", "#FF9F43", "#7E22CE",
];

/* ── Hex validation ── */
function isValidHex(hex: string): boolean {
  return /^[0-9a-fA-F]{3,8}$/.test(hex);
}

function sanitizeHex(raw: string): string {
  const cleaned = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  return cleaned || "ffffff";
}

/* ── Tokenize iframe code for syntax highlighting ── */
function tokenize(code: string) {
  const tokens: {
    type: "tag" | "attr" | "string" | "punctuation" | "text";
    value: string;
  }[] = [];
  const regex =
    /(<\/?[a-zA-Z]+)|(\s[a-zA-Z-]+)(?==)|("(?:[^"\\]|\\.)*")|([=>/<\s])|([^<"=>\s/]+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(code)) !== null) {
    if (m[1]) tokens.push({ type: "tag", value: m[1] });
    else if (m[2]) tokens.push({ type: "attr", value: m[2] });
    else if (m[3]) tokens.push({ type: "string", value: m[3] });
    else if (m[4]) tokens.push({ type: "punctuation", value: m[4] });
    else if (m[5]) tokens.push({ type: "text", value: m[5] });
  }
  return tokens;
}

const tokenColors: Record<string, string> = {
  tag: "text-red-400",
  attr: "text-purple-400",
  string: "text-green-400",
  punctuation: "text-gray-400",
  text: "text-gray-300",
};

/* ── Types ── */
type Tab = "embed" | "link";

interface ClinicalSemioticsEmbedConfiguratorProps {
  examType: string;
  onClose: () => void;
}

/* ── Color swatch with native picker ── */
function ColorField({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-dark mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`relative h-9 w-9 rounded-xl border-2 transition-all ${
              value === p.value
                ? "border-showcase-navy scale-110 shadow-md ring-2 ring-showcase-navy/20"
                : "border-gray-200 hover:border-gray-400 hover:scale-105"
            }`}
            style={{ backgroundColor: `#${p.value}` }}
            title={p.label}
          >
            {value === p.value && (
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check
                  className={`h-4 w-4 ${
                    parseInt(p.value, 16) < 0x888888
                      ? "text-white"
                      : "text-showcase-navy"
                  }`}
                />
              </m.div>
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(sanitizeHex(e.target.value))}
          className={`flex-1 rounded-lg border-2 px-3 py-1.5 text-xs font-mono transition-all outline-none ${
            isValidHex(value)
              ? "border-showcase-navy/15 focus:border-showcase-purple focus:ring-1 focus:ring-showcase-purple/20"
              : "border-red-300 focus:border-red-400"
          }`}
          placeholder="hex color"
          maxLength={6}
        />
        <label
          className="relative h-[30px] w-[30px] rounded-lg border-2 border-showcase-navy/15 overflow-hidden cursor-pointer flex-shrink-0"
          title="Pick color"
        >
          <input
            type="color"
            value={`#${isValidHex(value) ? value : "ffffff"}`}
            onChange={(e) => onChange(e.target.value.replace("#", ""))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full"
            style={{
              backgroundColor: `#${isValidHex(value) ? value : "ffffff"}`,
            }}
          />
        </label>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ClinicalSemioticsEmbedConfigurator({
  examType,
  onClose,
}: ClinicalSemioticsEmbedConfiguratorProps) {
  const [bg, setBg] = useState("ffffff");
  const [accent, setAccent] = useState("6C5CE7");
  const [radius, setRadius] = useState(12);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("600");
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("embed");
  const [previewLoading, setPreviewLoading] = useState(true);

  // Use current origin for preview, SITE_URL for generated code
  const [origin, setOrigin] = useState(SITE_URL);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const examCopy = EXAM_COPY[examType];
  const examTitle = examCopy?.title ?? examType;

  // Embed URL for generated code (always uses production domain)
  const embedUrl = useMemo(
    () =>
      `${SITE_URL}/en/embed/clinical-semiotics/${examType}?bg=${bg}&accent=${accent}&radius=${radius}&theme=${theme}`,
    [examType, bg, accent, radius, theme],
  );

  // Preview URL uses current origin so it works in dev
  const previewUrl = useMemo(
    () =>
      `${origin}/en/embed/clinical-semiotics/${examType}?bg=${bg}&accent=${accent}&radius=${radius}&theme=${theme}`,
    [origin, examType, bg, accent, radius, theme],
  );

  // Direct share link (to the main page, not the embed)
  const shareUrl = useMemo(
    () => `${SITE_URL}/en/clinical-semiotics`,
    [],
  );

  const lessonPageUrl = `${SITE_URL}/en/clinical-semiotics`;

  const iframeCode = useMemo(() => {
    const accentHex = `#${accent}`;
    return `<!-- EnterMedSchool Clinical Semiotics: ${examTitle} -->\n<div style="max-width:100%;">\n  <iframe\n    src="${embedUrl}"\n    width="${width}" height="${height}"\n    style="border:none;border-radius:${radius}px;"\n    title="${examTitle} - EnterMedSchool"\n    allow="autoplay"\n  ></iframe>\n  <p style="margin:8px 0 0;font-size:12px;font-family:sans-serif;color:#666;text-align:center;">\n    Created by <a href="https://entermedschool.com" rel="dofollow" style="color:${accentHex};font-weight:600;text-decoration:none;">Ari Horesh</a>\n    &middot; <a href="https://entermedschool.org" rel="dofollow" style="color:${accentHex};font-weight:600;text-decoration:none;">EnterMedSchool.org</a>\n    &middot; <a href="${lessonPageUrl}" rel="dofollow" style="color:${accentHex};text-decoration:none;">Original Lesson</a>\n  </p>\n</div>`;
  }, [examTitle, embedUrl, width, height, radius, accent, lessonPageUrl]);

  const tokens = useMemo(() => tokenize(iframeCode), [iframeCode]);

  // Reset preview loading when URL changes
  useEffect(() => {
    setPreviewLoading(true);
  }, [previewUrl]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setShowCelebration(true);
    setTimeout(() => setCopied(false), 2500);
    setTimeout(() => setShowCelebration(false), 1200);
  }, []);

  const handleCopyEmbed = useCallback(() => {
    copyToClipboard(iframeCode);
  }, [iframeCode, copyToClipboard]);

  const handleCopyLink = useCallback(() => {
    copyToClipboard(shareUrl);
  }, [shareUrl, copyToClipboard]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-showcase-navy/50 backdrop-blur-md"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close embed configurator"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      />

      {/* Modal */}
      <m.div
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 30 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-3 z-[101] flex flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg sm:inset-6 lg:inset-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-showcase-navy/10 bg-gradient-to-r from-showcase-purple/5 to-showcase-teal/5 px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-showcase-purple to-showcase-teal shadow-sm flex-shrink-0">
              <Code className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base sm:text-lg font-bold text-ink-dark truncate">
                Embed &amp; Share: {examTitle}
              </h3>
              <p className="text-[11px] text-ink-light hidden sm:block">
                Embed on your site, or copy a direct link for slides and LMS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-showcase-navy/10 text-ink-muted hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Left: Controls */}
          <div className="w-full overflow-y-auto border-b-2 border-showcase-navy/10 p-4 sm:p-6 lg:w-80 lg:border-b-0 lg:border-r-2 lg:flex-shrink-0">
            {/* Tab switcher */}
            <div className="flex gap-1 mb-5 rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab("embed")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  activeTab === "embed"
                    ? "bg-white text-ink-dark shadow-sm"
                    : "text-ink-muted hover:text-ink-dark"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                Embed Code
              </button>
              <button
                onClick={() => setActiveTab("link")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  activeTab === "link"
                    ? "bg-white text-ink-dark shadow-sm"
                    : "text-ink-muted hover:text-ink-dark"
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                Share Link
              </button>
            </div>

            {activeTab === "embed" ? (
              /* ── Embed tab ── */
              <div className="space-y-5">
                <ColorField
                  label="Background Color"
                  value={bg}
                  onChange={setBg}
                  presets={COLOR_PRESETS}
                />
                <ColorField
                  label="Accent Color"
                  value={accent}
                  onChange={setAccent}
                  presets={ACCENT_PRESETS}
                />

                {/* Border radius */}
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-2">
                    Border Radius:{" "}
                    <span className="text-showcase-purple">{radius}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-showcase-purple"
                  />
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-2">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    {(["light", "dark"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all ${
                          theme === t
                            ? "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm"
                            : "border-showcase-navy/15 bg-white text-ink-muted hover:bg-gray-50"
                        }`}
                      >
                        {t === "light" ? "Light" : "Dark"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">
                      Width
                    </label>
                    <input
                      type="text"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full rounded-lg border-2 border-showcase-navy/15 px-3 py-1.5 text-xs focus:border-showcase-purple outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-1">
                      Height
                    </label>
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded-lg border-2 border-showcase-navy/15 px-3 py-1.5 text-xs focus:border-showcase-purple outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Embed Code with syntax highlighting */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-ink-dark">
                      Embed Code
                    </label>
                    <div className="relative">
                      <button
                        onClick={handleCopyEmbed}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          copied
                            ? "bg-showcase-green text-white shadow-chunky-green scale-105"
                            : "bg-showcase-purple/10 text-showcase-purple hover:bg-showcase-purple/20 hover:shadow-sm"
                        }`}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copied ? "Copied!" : "Copy Code"}
                      </button>
                      <AnimatePresence>
                        {showCelebration && (
                          <>
                            {[...Array(8)].map((_, i) => (
                              <m.div
                                key={i}
                                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                                animate={{
                                  opacity: 0,
                                  scale: 1,
                                  x: Math.cos((i / 8) * Math.PI * 2) * 40,
                                  y: Math.sin((i / 8) * Math.PI * 2) * 40,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full pointer-events-none"
                                style={{ backgroundColor: CELEBRATION_COLORS[i] }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border-2 border-showcase-navy bg-showcase-navy p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {tokens.map((tok, i) => (
                      <span
                        key={i}
                        className={tokenColors[tok.type] || "text-gray-300"}
                      >
                        {tok.value}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-ink-light">
                    Works with Notion, WordPress, Squarespace, Wix, and any HTML
                    page.
                  </p>
                </div>
              </div>
            ) : (
              /* ── Share Link tab ── */
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-2">
                    Direct Link
                  </label>
                  <p className="text-[11px] text-ink-muted mb-3">
                    Copy this URL to paste into slides, share in a group chat, or
                    add to your LMS. Students will land on the exam selection
                    page.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg border-2 border-showcase-navy/15 bg-gray-50 px-3 py-2 text-xs font-mono text-ink-muted truncate">
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all flex-shrink-0 ${
                        copied
                          ? "bg-showcase-green text-white"
                          : "bg-showcase-purple text-white hover:bg-showcase-purple/90"
                      }`}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-showcase-navy/10 bg-showcase-purple/5 p-4">
                  <h4 className="text-xs font-bold text-ink-dark mb-2">
                    How to use
                  </h4>
                  <ul className="space-y-2 text-[11px] text-ink-muted">
                    <li className="flex gap-2">
                      <span className="font-bold text-showcase-purple">1.</span>
                      <span>
                        <strong>In slides:</strong> Paste the link on a slide.
                        Students click to open.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-showcase-purple">2.</span>
                      <span>
                        <strong>In LMS:</strong> Add as an external resource or
                        hyperlink.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-showcase-purple">3.</span>
                      <span>
                        <strong>On a website:</strong> Switch to the Embed Code
                        tab for an iframe snippet.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Preview with browser chrome */}
          <div className="flex-1 hidden lg:flex flex-col overflow-hidden bg-gray-100 p-6">
            <p className="mb-3 text-xs font-bold text-ink-light uppercase tracking-wider text-center">
              Live Preview
            </p>
            <div className="mx-auto w-full max-w-2xl flex-1 flex flex-col rounded-xl border-2 border-gray-300 bg-white shadow-lg overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-2 rounded-md bg-white border border-gray-200 px-3 py-1 text-[10px] text-ink-light font-mono truncate">
                  {embedUrl}
                </div>
              </div>
              {/* iframe preview */}
              <div
                className="flex-1 overflow-hidden relative"
                style={{ background: `#${isValidHex(bg) ? bg : "ffffff"}` }}
              >
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-purple-500" />
                      <p className="text-[11px] text-ink-muted">
                        Loading preview...
                      </p>
                    </div>
                  </div>
                )}
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: "none",
                    borderRadius: `${radius}px`,
                    minHeight: "300px",
                  }}
                  title={`${examTitle} - Preview`}
                  onLoad={() => setPreviewLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </m.div>
    </AnimatePresence>
  );
}
