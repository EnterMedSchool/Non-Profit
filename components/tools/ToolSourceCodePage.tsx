"use client";

import { useState, useMemo, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ClipboardList,
  FileCode,
  PartyPopper,
  Play,
  Github,
  Palette,
  ArrowRight,
  Shield,
  HelpCircle,
  ExternalLink,
  Loader2,
  Download,
} from "lucide-react";
import { downloadHtmlFile } from "@/lib/download-html";
import Link from "next/link";
import { useTranslations } from "next-intl";
/* ── Types ─────────────────────────────────────────────────────────── */

export interface CrossLink {
  id: string;
  title: string;
  href: string;
}

interface ToolSourceCodePageProps {
  /** Display title for the content (e.g. "BMI Calculator", "Achalasia Visual") */
  title: string;
  /** Full production embed URL */
  embedUrl: string;
  /** Iframe height in pixels */
  embedHeight: number;
  /** GitHub source link (optional) */
  sourceUrl?: string;
  /** Canonical page URL (used in attribution link) */
  pageUrl: string;
  locale: string;
  /** Link to the advanced customiser (tool page #embed, or omitted) */
  customizeUrl?: string;
  /** "More embeddable content" cross-links */
  crossLinks: CrossLink[];
}

/* ── Syntax-highlight tokenizer (reused from EmbedCodeGenerator) ──── */

function tokenize(code: string) {
  const tokens: {
    type: "tag" | "attr" | "string" | "punctuation" | "text";
    value: string;
  }[] = [];
  const regex =
    /(<\/?[a-zA-Z]+)|(\s[a-zA-Z-]+)(?==)|("(?:[^"\\]|\\.)*")|([=>/<\s])|([^<"=>\s/]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) tokens.push({ type: "tag", value: match[1] });
    else if (match[2]) tokens.push({ type: "attr", value: match[2] });
    else if (match[3]) tokens.push({ type: "string", value: match[3] });
    else if (match[4]) tokens.push({ type: "punctuation", value: match[4] });
    else if (match[5]) tokens.push({ type: "text", value: match[5] });
  }
  return tokens;
}

const TOKEN_COLORS: Record<string, string> = {
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

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
const COM_URL = "https://entermedschool.com";

/* ── Component ─────────────────────────────────────────────────────── */

export default function ToolSourceCodePage({
  title: toolTitle,
  embedUrl,
  embedHeight,
  sourceUrl,
  pageUrl,
  locale,
  customizeUrl,
  crossLinks,
}: ToolSourceCodePageProps) {
  const t = useTranslations("toolCode");

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Build the embed HTML snippet
  const iframeCode = useMemo(() => {
    return `<!-- ${toolTitle} — EnterMedSchool -->\n<div style="max-width:100%;">\n  <iframe\n    src="${embedUrl}"\n    width="100%" height="${embedHeight}"\n    style="border:none;border-radius:12px;overflow:hidden;"\n    title="${toolTitle} — EnterMedSchool"\n    loading="lazy"\n    allow="clipboard-write"\n  ></iframe>\n  <p style="margin:8px 0 0;font-size:12px;font-family:sans-serif;color:#666;text-align:center;">\n    Created by <a href="${COM_URL}" rel="dofollow" style="color:#6C5CE7;font-weight:600;text-decoration:none;">Ari Horesh</a>\n    &middot; <a href="${BASE_URL}" rel="dofollow" style="color:#6C5CE7;font-weight:600;text-decoration:none;">EnterMedSchool.org</a>\n    &middot; <a href="${pageUrl}" rel="dofollow" style="color:#6C5CE7;text-decoration:none;">Original Tool</a>\n  </p>\n</div>`;
  }, [embedUrl, embedHeight, toolTitle, pageUrl]);

  const tokens = useMemo(() => tokenize(iframeCode), [iframeCode]);

  const copyToClipboard = useCallback(async () => {
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

  const handleDownloadHtml = useCallback(() => {
    downloadHtmlFile(iframeCode, "entermedschool-embed.html");
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }, [iframeCode]);

  // Preview uses current origin for dev support
  const previewOrigin =
    typeof window !== "undefined" ? window.location.origin : BASE_URL;
  // Derive preview URL by replacing the production origin with the current origin
  const previewUrl = embedUrl.replace(BASE_URL, previewOrigin);

  // FAQ items (interpolated by next-intl)
  const faqItems = [
    { q: t("faq.q1", { toolName: toolTitle }), a: t("faq.a1", { toolName: toolTitle }) },
    { q: t("faq.q2", { toolName: toolTitle }), a: t("faq.a2", { toolName: toolTitle }) },
    { q: t("faq.q3", { toolName: toolTitle }), a: t("faq.a3", { toolName: toolTitle }) },
    { q: t("faq.q4", { toolName: toolTitle }), a: t("faq.a4", { toolName: toolTitle }) },
    { q: t("faq.q5", { toolName: toolTitle }), a: t("faq.a5", { toolName: toolTitle }) },
  ];

  return (
    <div className="space-y-10">
      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink-dark sm:text-4xl">
          <span className="bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green bg-clip-text text-transparent">
            {t("heroTitle", { toolName: toolTitle })}
          </span>
        </h1>
        <p className="mt-3 text-base text-ink-muted max-w-2xl mx-auto">
          {t("heroSubtitle")}
        </p>
      </div>

      {/* ── 2. Code Block (first thing visible!) ──────────────── */}
      <div className="rounded-2xl border-3 border-showcase-navy bg-white p-5 sm:p-6 shadow-chunky">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-showcase-purple" />
            <span className="font-display text-sm font-bold text-ink-dark">
              {t("codeBlockLabel")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-display font-bold transition-all ${
                downloaded
                  ? "bg-showcase-green text-white shadow-sm scale-105"
                  : "bg-white text-showcase-purple hover:bg-showcase-purple/10 shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none border-3 border-showcase-navy"
              }`}
            >
              {downloaded ? (
                <Check className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloaded ? t("downloaded") : t("downloadHtml")}
            </button>
            <div className="relative">
            <button
              type="button"
              onClick={copyToClipboard}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-display font-bold transition-all ${
                copied
                  ? "bg-showcase-green text-white shadow-sm scale-105"
                  : "bg-showcase-purple text-white hover:bg-showcase-purple/90 shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none border-3 border-showcase-navy"
              }`}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
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
                      style={{ backgroundColor: CELEBRATION_COLORS[i] }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>

        {/* Syntax-highlighted code */}
        <div className="overflow-x-auto rounded-xl border-2 border-showcase-navy bg-showcase-navy p-4 font-mono text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap break-all">
          {tokens.map((tok, i) => (
            <span key={i} className={TOKEN_COLORS[tok.type] || "text-gray-300"}>
              {tok.value}
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. Three-Step Guide ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            num: "1",
            icon: <ClipboardList className="h-5 w-5" />,
            title: t("step1Title"),
            desc: t("step1Desc"),
            color: "showcase-purple",
          },
          {
            num: "2",
            icon: <FileCode className="h-5 w-5" />,
            title: t("step2Title"),
            desc: t("step2Desc"),
            color: "showcase-teal",
          },
          {
            num: "3",
            icon: <PartyPopper className="h-5 w-5" />,
            title: t("step3Title"),
            desc: t("step3Desc"),
            color: "showcase-green",
          },
        ].map((step, i) => (
          <div
            key={i}
            className={`relative rounded-2xl border-3 border-showcase-navy/10 bg-${step.color}/5 p-5 transition-all hover:border-showcase-navy/20 hover:shadow-chunky-sm`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${step.color} text-sm font-extrabold text-white shadow-sm`}
              >
                {step.num}
              </div>
              <span className={`text-${step.color}`}>{step.icon}</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-ink-dark">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              {step.desc}
            </p>
            {i < 2 && (
              <ArrowRight className="absolute -end-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-ink-light/30 sm:block rtl:-scale-x-100" />
            )}
          </div>
        ))}
      </div>

      {/* ── 4. Live Preview ───────────────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-bold text-ink-light uppercase tracking-wider">
          {t("previewTitle")}
        </p>
        <p className="mb-4 text-sm text-ink-muted">{t("previewDesc")}</p>
        <div className="rounded-xl border-2 border-gray-300 bg-white shadow-lg overflow-hidden">
          {/* Browser chrome */}
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
          {/* Iframe */}
          <div className="relative overflow-hidden bg-white">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-10">
                <Loader2 className="h-6 w-6 text-showcase-purple animate-spin" />
                <p className="mt-2 text-xs text-ink-muted">
                  {t("previewLoading")}
                </p>
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

      {/* ── 5. Attribution Notice ─────────────────────────────── */}
      <div className="rounded-2xl border-3 border-showcase-teal/30 bg-showcase-teal/5 p-5 sm:p-6 flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-showcase-teal/15">
          <Shield className="h-5 w-5 text-showcase-teal" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-ink-dark">
            {t("attributionTitle")}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {t("attributionDesc")}
          </p>
        </div>
      </div>

      {/* ── 6. Video Tutorial Placeholder ─────────────────────── */}
      <div className="rounded-2xl border-3 border-dashed border-showcase-navy/15 bg-pastel-cream/30 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-showcase-purple/10">
          <Play className="h-8 w-8 text-showcase-purple" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-ink-dark">
          {t("videoTitle")}
        </h3>
        <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
          {t("videoComingSoon")}
        </p>
      </div>

      {/* ── 7. View on GitHub ─────────────────────────────────── */}
      {sourceUrl && (
        <div className="rounded-2xl border-3 border-showcase-navy/10 bg-white p-5 sm:p-6 shadow-chunky-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-showcase-navy/5">
            <Github className="h-6 w-6 text-ink-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-ink-dark">
              {t("githubTitle")}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {t("githubDesc")}
            </p>
          </div>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-white px-5 py-2.5 font-display text-sm font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none"
          >
            <Github className="h-4 w-4" />
            {t("githubBtn")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* ── 8. Advanced Customizer CTA ────────────────────────── */}
      {customizeUrl && (
        <div className="rounded-2xl border-3 border-showcase-purple/20 bg-showcase-purple/5 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-showcase-purple/15">
            <Palette className="h-5 w-5 text-showcase-purple" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-ink-dark">
              {t("customizeTitle")}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {t("customizeDesc")}
            </p>
          </div>
          <Link
            href={customizeUrl}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-5 py-2.5 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none"
          >
            <Palette className="h-4 w-4" />
            {t("customizeBtn")}
          </Link>
        </div>
      )}

      {/* ── 9. FAQ Section ────────────────────────────────────── */}
      <div className="rounded-2xl border-3 border-showcase-navy/10 bg-white p-6 sm:p-8 shadow-chunky-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-showcase-green/10">
            <HelpCircle className="h-5 w-5 text-showcase-green" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink-dark">
            {t("faq.title")}
          </h2>
        </div>
        <div className="space-y-5">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-ink-dark">{faq.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 10. More Embeddable Content ─────────────────────── */}
      {crossLinks.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-ink-dark">
            {t("moreContentTitle")}
          </h2>
          <p className="mt-1 text-sm text-ink-muted mb-6">
            {t("moreContentDesc")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {crossLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="group rounded-xl border-3 border-showcase-navy/10 bg-white p-5 transition-all hover:border-showcase-purple/30 hover:shadow-chunky-sm"
              >
                <h3 className="font-display text-base font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
                  {link.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple">
                  {t("moreToolsBtn")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
