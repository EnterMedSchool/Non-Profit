"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Copy, Check, Download, Link as LinkIcon, Monitor, StickyNote, GraduationCap, Presentation, Lock, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { generateQRCodeDataURL } from "@/lib/qrcode";
import EmbedThemeCustomizer from "./EmbedThemeCustomizer";
import {
  type EmbedTheme,
  DEFAULT_THEME,
  encodeTheme,
} from "@/lib/embedTheme";

interface EmbedCodeGeneratorProps {
  toolId: string;
  toolTitle: string;
  locale: string;
  embedHeight?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
const COM_URL = "https://entermedschool.com";

type Tab = "website" | "notion" | "lms" | "slides";

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

const CELEBRATION_COLORS = [
  "#6C5CE7", "#00D9C0", "#FFD93D", "#FF85A2",
  "#54A0FF", "#2ECC71", "#FF9F43", "#7E22CE",
];

export default function EmbedCodeGenerator({
  toolId,
  toolTitle,
  locale,
  embedHeight = 520,
}: EmbedCodeGeneratorProps) {
  const t = useTranslations("tools.embed");
  const [activeTab, setActiveTab] = useState<Tab>("website");
  const [copied, setCopied] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [theme, setTheme] = useState<EmbedTheme>({ ...DEFAULT_THEME });
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Current origin for the live preview (works on localhost in dev)
  const previewOrigin = typeof window !== "undefined" ? window.location.origin : BASE_URL;

  // Build embed URL for the generated code (always uses production BASE_URL)
  const embedUrl = useMemo(() => {
    const base = `${BASE_URL}/embed/${locale}/${toolId}`;
    const encoded = encodeTheme(theme);
    return encoded ? `${base}?theme=${encoded}` : base;
  }, [locale, toolId, theme]);

  // Build preview URL for the live iframe (uses current origin so it works in dev)
  const previewUrl = useMemo(() => {
    const base = `${previewOrigin}/embed/${locale}/${toolId}`;
    const encoded = encodeTheme(theme);
    return encoded ? `${base}?theme=${encoded}` : base;
  }, [previewOrigin, locale, toolId, theme]);

  const fullUrl = `${BASE_URL}/${locale}/tools/${toolId}`;

  // Reset loading state when preview URL changes
  useEffect(() => {
    setIframeLoaded(false);
  }, [previewUrl]);

  // Wrap iframe in a div with dofollow attribution links for SEO backlinks
  const iframeCode = useMemo(() => {
    const createdBy = t("embedCode.createdBy");
    const originalTool = t("embedCode.originalTool");
    return `<!-- ${toolTitle} — EnterMedSchool -->\n<div style="max-width:100%;">\n  <iframe\n    src="${embedUrl}"\n    width="100%" height="${embedHeight}"\n    style="border:none;border-radius:12px;overflow:hidden;"\n    title="${toolTitle} — EnterMedSchool"\n    loading="lazy"\n    allow="clipboard-write"\n  ></iframe>\n  <p style="margin:8px 0 0;font-size:12px;font-family:sans-serif;color:#666;text-align:center;">\n    ${createdBy} <a href="${COM_URL}" rel="dofollow" style="color:#6C5CE7;font-weight:600;text-decoration:none;">Ari Horesh</a>\n    &middot; <a href="${BASE_URL}" rel="dofollow" style="color:#6C5CE7;font-weight:600;text-decoration:none;">EnterMedSchool.org</a>\n    &middot; <a href="${fullUrl}" rel="dofollow" style="color:#6C5CE7;text-decoration:none;">${originalTool}</a>\n  </p>\n</div>`;
  }, [embedUrl, embedHeight, toolTitle, fullUrl, t]);

  // Tokenize for syntax highlighting
  const tokens = useMemo(() => tokenize(iframeCode), [iframeCode]);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(id);
    setShowCelebration(true);
    setTimeout(() => setCopied(null), 2500);
    setTimeout(() => setShowCelebration(false), 1200);
  }, []);

  const downloadQRCode = async () => {
    const dataUrl = await generateQRCodeDataURL({
      url: fullUrl,
      size: 512,
      foreground: "#1a1a2e",
      background: "#FFFFFF",
      margin: 2,
      errorCorrectionLevel: "H",
    });
    const link = document.createElement("a");
    link.download = `entermedschool-${toolId}-qr.png`;
    link.href = dataUrl;
    link.click();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "website", label: t("tabWebsite"), icon: <Monitor className="h-3.5 w-3.5" /> },
    { id: "notion", label: t("tabNotion"), icon: <StickyNote className="h-3.5 w-3.5" /> },
    { id: "lms", label: t("tabLMS"), icon: <GraduationCap className="h-3.5 w-3.5" /> },
    { id: "slides", label: t("tabSlides"), icon: <Presentation className="h-3.5 w-3.5" /> },
  ];

  // Render the syntax-highlighted code block used by website & LMS tabs
  const renderCodeBlock = (copyId: string) => (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-ink-dark">{t("embedCodeLabel")}</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => copyToClipboard(iframeCode, copyId)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              copied === copyId
                ? "bg-showcase-green text-white shadow-sm scale-105"
                : "bg-showcase-purple/10 text-showcase-purple hover:bg-showcase-purple/20 hover:shadow-sm"
            }`}
          >
            {copied === copyId ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === copyId ? t("copied") : t("copyIframe")}
          </button>
          {/* Celebration burst */}
          <AnimatePresence>
            {showCelebration && copied === copyId && (
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
      {/* Dark code block with syntax-highlighted tokens */}
      <div className="overflow-x-auto rounded-xl border-2 border-showcase-navy bg-showcase-navy p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all">
        {tokens.map((tok, i) => (
          <span key={i} className={tokenColors[tok.type] || "text-gray-300"}>
            {tok.value}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-ink-light flex items-center gap-1">
        <Lock className="h-3 w-3" />
        {t("embedCompatibility")}
      </p>
    </div>
  );

  return (
    <div className="rounded-2xl border-3 border-showcase-navy bg-white p-5 sm:p-6 shadow-chunky">
      <h3 className="font-display text-lg font-bold text-ink-dark">{t("embedTitle")}</h3>
      <p className="mt-1 text-sm text-ink-muted">{t("embedDescription")}</p>

      {/* ── Theme customizer ─────────────────────────────────── */}
      <div className="mt-4">
        <EmbedThemeCustomizer theme={theme} onChange={setTheme} />
      </div>

      {/* Tab bar */}
      <div className="mt-4 flex flex-wrap gap-1 rounded-xl border-2 border-showcase-navy/10 bg-pastel-cream/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-ink-dark shadow-sm border border-showcase-navy/10"
                : "text-ink-muted hover:text-ink-dark hover:bg-white/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {/* ── Website / HTML ──────────────────────────────────────── */}
        {activeTab === "website" && (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">{t("iframeInstructions")}</p>
            {renderCodeBlock("iframe")}
          </div>
        )}

        {/* ── Notion ──────────────────────────────────────────────── */}
        {activeTab === "notion" && (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">{t("notionInstructions")}</p>
            <div className="relative flex items-center gap-2 rounded-xl border-2 border-showcase-navy/10 bg-gray-50 p-3">
              <LinkIcon className="h-4 w-4 shrink-0 text-ink-muted" />
              <code className="flex-1 text-sm text-ink-dark break-all">{embedUrl}</code>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => copyToClipboard(embedUrl, "notion")}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold transition-all ${
                    copied === "notion"
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-showcase-navy/10 bg-white text-ink-muted hover:border-showcase-purple hover:text-showcase-purple"
                  }`}
                >
                  {copied === "notion" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "notion" ? t("copied") : t("notionCopyUrl")}
                </button>
                <AnimatePresence>
                  {showCelebration && copied === "notion" && (
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
          </div>
        )}

        {/* ── LMS ─────────────────────────────────────────────────── */}
        {activeTab === "lms" && (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">{t("lmsInstructions")}</p>
            {renderCodeBlock("lms")}
          </div>
        )}

        {/* ── Presentations ───────────────────────────────────────── */}
        {activeTab === "slides" && (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">{t("slidesInstructions")}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={downloadQRCode}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-5 py-3 text-sm font-display font-bold text-white shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg active:translate-y-0.5 active:shadow-chunky-sm"
              >
                <Download className="h-4 w-4" />
                {t("slidesDownloadQR")}
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(fullUrl, "slides-link")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy/20 bg-white px-5 py-3 text-sm font-bold text-ink-dark shadow-chunky-sm transition-all hover:bg-pastel-lavender"
              >
                {copied === "slides-link" ? <Check className="h-4 w-4 text-green-600" /> : <LinkIcon className="h-4 w-4" />}
                {copied === "slides-link" ? t("copied") : t("slidesCopyLink")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Live embed preview with browser chrome ────────────── */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-bold text-ink-light uppercase tracking-wider">
          {t("previewTitle")}
        </p>
        {/* Browser chrome mockup */}
        <div className="rounded-xl border-2 border-gray-300 bg-white shadow-lg overflow-hidden">
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
          {/* iframe preview — uses previewUrl (current origin) so it works in dev */}
          <div className="relative overflow-hidden bg-white">
            {/* Loading skeleton */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-10">
                <Loader2 className="h-6 w-6 text-showcase-purple animate-spin" />
                <p className="mt-2 text-xs text-ink-muted">{t("previewLoading")}</p>
              </div>
            )}
            <iframe
              key={previewUrl}
              src={previewUrl}
              width="100%"
              height={Math.max(embedHeight, 550)}
              style={{ border: "none" }}
              title={`${toolTitle} preview`}
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
