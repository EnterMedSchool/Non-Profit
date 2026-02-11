"use client";

import { useState, useMemo, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { m, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Monitor, Info, Lock } from "lucide-react";
import type { VisualLesson } from "@/data/visuals";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface EmbedConfiguratorProps {
  lesson: VisualLesson | null;
  onClose: () => void;
}

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

/* ── Tokenize iframe code for syntax highlighting ── */
function tokenize(code: string) {
  const tokens: { type: "tag" | "attr" | "string" | "punctuation" | "text"; value: string }[] = [];
  const regex = /(<\/?[a-zA-Z]+)|(\s[a-zA-Z-]+)(?==)|("(?:[^"\\]|\\.)*")|([=>/<\s])|([^<"=>\s/]+)/g;
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

export default function EmbedConfigurator({ lesson, onClose }: EmbedConfiguratorProps) {
  const locale = useLocale();
  const t = useTranslations("resources.embedConfigurator");
  const [bg, setBg] = useState("ffffff");
  const [accent, setAccent] = useState(() => {
    if (!lesson) return "6C5CE7";
    if (lesson.category === "GI") return "00b894";
    if (lesson.category === "Pharmacology") return "6C5CE7";
    if (lesson.category === "Hematology") return "ff7675";
    return "6C5CE7";
  });
  const [radius, setRadius] = useState(12);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("500");
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : BASE_URL;

  const embedUrl = useMemo(() => {
    if (!lesson) return "";
    return `${siteUrl}/${locale}/embed/visuals/${lesson.embedId}?bg=${bg}&accent=${accent}&radius=${radius}&theme=${theme}`;
  }, [lesson, siteUrl, locale, bg, accent, radius, theme]);

  const lessonPageUrl = `${BASE_URL}/${locale}/resources/visuals`;

  const iframeCode = useMemo(() => {
    if (!lesson) return "";
    const accentHex = `#${accent}`;
    return `<!-- EnterMedSchool Visual: ${lesson.title} -->\n<div style="max-width:100%;">\n  <iframe\n    src="${embedUrl}"\n    width="${width}" height="${height}"\n    style="border:none;border-radius:${radius}px;"\n    title="${lesson.title} - EnterMedSchool"\n    allow="autoplay"\n    loading="lazy"\n  ></iframe>\n  <p style="margin:8px 0 0;font-size:12px;font-family:sans-serif;color:#666;text-align:center;">\n    ${t("createdBy")} <a href="${BASE_URL}" rel="dofollow" style="color:${accentHex};font-weight:600;text-decoration:none;">Ari Horesh</a>\n    &middot; <a href="${BASE_URL}" rel="dofollow" style="color:${accentHex};font-weight:600;text-decoration:none;">EnterMedSchool.org</a>\n    &middot; <a href="${lessonPageUrl}" rel="dofollow" style="color:${accentHex};text-decoration:none;">${t("originalLesson")}</a>\n  </p>\n</div>`;
  }, [lesson, embedUrl, width, height, radius, accent, lessonPageUrl, t]);

  const tokens = useMemo(() => tokenize(iframeCode), [iframeCode]);

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
    setShowCelebration(true);
    setTimeout(() => setCopied(false), 2500);
    setTimeout(() => setShowCelebration(false), 1200);
  }, [iframeCode]);

  return (
    <AnimatePresence>
      {lesson && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-showcase-navy/50 backdrop-blur-md"
            onClick={onClose}
          />

          <m.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 30 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 z-[101] flex flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg sm:inset-8 lg:inset-12"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-3 border-showcase-navy/10 bg-gradient-to-r from-showcase-purple/5 to-showcase-teal/5 px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-showcase-purple to-showcase-teal shadow-sm">
                  <Monitor className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-dark">
                    Embed: {lesson.title}
                  </h3>
                  <p className="text-[11px] text-ink-light flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Served from your domain with attribution built in
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-showcase-navy/10 text-ink-muted hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
              {/* Left: Controls */}
              <div className="w-full overflow-y-auto border-b-2 border-showcase-navy/10 p-6 lg:w-80 lg:border-b-0 lg:border-r-2 lg:flex-shrink-0">
                <div className="space-y-5">
                  {/* Background color */}
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-2">
                      {t("backgroundColor")}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setBg(p.value)}
                          className={`relative h-9 w-9 rounded-xl border-2 transition-all ${
                            bg === p.value
                              ? "border-showcase-navy scale-110 shadow-md ring-2 ring-showcase-navy/20"
                              : "border-gray-200 hover:border-gray-400 hover:scale-105"
                          }`}
                          style={{ backgroundColor: `#${p.value}` }}
                          title={p.label}
                        >
                          {bg === p.value && (
                            <m.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check className={`h-4 w-4 ${parseInt(p.value, 16) < 0x888888 ? "text-white" : "text-showcase-navy"}`} />
                            </m.div>
                          )}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={bg}
                      onChange={(e) => setBg(e.target.value.replace("#", ""))}
                      className="w-full rounded-lg border-2 border-showcase-navy/15 px-3 py-1.5 text-xs font-mono focus:border-showcase-purple focus:ring-1 focus:ring-showcase-purple/20 transition-all outline-none"
                      placeholder={t("hexColorPlaceholder")}
                    />
                  </div>

                  {/* Accent color */}
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-2">
                      {t("accentColor")}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ACCENT_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setAccent(p.value)}
                          className={`relative h-9 w-9 rounded-xl border-2 transition-all ${
                            accent === p.value
                              ? "border-showcase-navy scale-110 shadow-md ring-2 ring-showcase-navy/20"
                              : "border-gray-200 hover:border-gray-400 hover:scale-105"
                          }`}
                          style={{ backgroundColor: `#${p.value}` }}
                          title={p.label}
                        >
                          {accent === p.value && (
                            <m.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check className="h-4 w-4 text-white" />
                            </m.div>
                          )}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value.replace("#", ""))}
                      className="w-full rounded-lg border-2 border-showcase-navy/15 px-3 py-1.5 text-xs font-mono focus:border-showcase-purple focus:ring-1 focus:ring-showcase-purple/20 transition-all outline-none"
                      placeholder={t("hexColorPlaceholder")}
                    />
                  </div>

                  {/* Border radius */}
                  <div>
                    <label className="block text-xs font-bold text-ink-dark mb-2">
                      {t("borderRadius")}: <span className="text-showcase-purple">{radius}px</span>
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
                          {t === "light" ? "☀️ Light" : "🌙 Dark"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink-dark mb-1">Width</label>
                      <input
                        type="text"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full rounded-lg border-2 border-showcase-navy/15 px-3 py-1.5 text-xs focus:border-showcase-purple outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-dark mb-1">{t("height")}</label>
                      <input
                        type="text"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full rounded-lg border-2 border-showcase-navy/15 px-3 py-1.5 text-xs focus:border-showcase-purple outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Embed Code with syntax highlighting ── */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-ink-dark">Embed Code</label>
                    <div className="relative">
                      <button
                        onClick={handleCopy}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          copied
                            ? "bg-showcase-green text-white shadow-chunky-green scale-105"
                            : "bg-showcase-purple/10 text-showcase-purple hover:bg-showcase-purple/20 hover:shadow-sm"
                        }`}
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? t("copied") : t("copyCode")}
                      </button>
                      {/* Celebration burst */}
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
                                style={{
                                  backgroundColor: [
                                    "#6C5CE7", "#00D9C0", "#FFD93D", "#FF85A2",
                                    "#54A0FF", "#2ECC71", "#FF9F43", "#7E22CE",
                                  ][i],
                                }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {/* Dark code block with colored tokens */}
                  <div className="overflow-x-auto rounded-xl border-2 border-showcase-navy bg-showcase-navy p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all">
                    {tokens.map((tok, i) => (
                      <span key={i} className={tokenColors[tok.type] || "text-gray-300"}>
                        {tok.value}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-ink-light flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {t("worksWith")}
                  </p>
                </div>
              </div>

              {/* Right: Live Preview with browser chrome */}
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 p-6">
                <p className="mb-3 text-xs font-bold text-ink-light uppercase tracking-wider text-center">
                  {t("livePreview")}
                </p>
                {/* Browser chrome mockup */}
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
                  <div className="flex-1 overflow-hidden" style={{ background: `#${bg}` }}>
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: "none", borderRadius: `${radius}px`, minHeight: "300px" }}
                      title={`${lesson.title} - Preview`}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
