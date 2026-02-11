"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Code2,
  Copy,
  Check,
  Monitor,
  BookOpen,
  ClipboardList,
  HelpCircle,
  ChevronDown,
  Info,
  Download,
} from "lucide-react";
import { downloadHtmlFile } from "@/lib/download-html";
import { m, AnimatePresence } from "framer-motion";
import { useMCQ } from "./MCQContext";
import type { MCQEmbedTheme } from "./types";
import { DEFAULT_EMBED_THEME } from "./types";

// ── Presets ──────────────────────────────────────────────────────────
const BG_PRESETS = [
  { label: "White", value: "#ffffff" },
  { label: "Light Gray", value: "#f5f5f5" },
  { label: "Cream", value: "#faf8f5" },
  { label: "Dark", value: "#1a1a2e" },
  { label: "Slate", value: "#1e293b" },
];

const ACCENT_PRESETS = [
  { label: "Purple", value: "#6C5CE7" },
  { label: "Green", value: "#00b894" },
  { label: "Teal", value: "#00cec9" },
  { label: "Coral", value: "#ff7675" },
  { label: "Blue", value: "#0984e3" },
  { label: "Navy", value: "#1a1a2e" },
];

// ── Tokenize iframe code for syntax highlighting ── */
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

// ── Component ────────────────────────────────────────────────────────
export default function EmbedPanel() {
  const t = useTranslations("tools.mcqMaker.ui");
  const { questions, exams } = useMCQ();

  const [embedTheme, setEmbedTheme] = useState<MCQEmbedTheme>(DEFAULT_EMBED_THEME);
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("600");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copiedRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(celebrationRef.current);
      clearTimeout(copiedRef.current);
    };
  }, []);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [embedTitle, setEmbedTitle] = useState("Quiz");

  // Build the questions list for embedding
  const embedQuestions = useMemo(() => {
    if (selectedExamId) {
      const exam = exams.find((e) => e.id === selectedExamId);
      if (exam) {
        const ids = exam.sections.flatMap((s) => s.questionIds);
        return ids
          .map((id) => questions.find((q) => q.id === id))
          .filter(Boolean) as typeof questions;
      }
    }
    return questions;
  }, [questions, exams, selectedExamId]);

  // Build embed payload
  const embedPayload = useMemo(() => {
    if (embedQuestions.length === 0) return "";
    // Strip unneeded fields to minimize payload
    const stripped = embedQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      difficulty: q.difficulty,
      category: q.category,
      points: q.points,
      imageUrl: q.imageUrl,
    }));

    const data = {
      questions: stripped,
      theme: embedTheme,
      title: embedTitle || undefined,
    };

    try {
      const json = JSON.stringify(data);
      return btoa(unescape(encodeURIComponent(json)));
    } catch {
      return "";
    }
  }, [embedQuestions, embedTheme, embedTitle]);

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://entermedschool.org";

  const embedUrl = `${siteUrl}/embed/mcq#${embedPayload}`;

  const iframeCode = useMemo(() => {
    if (!embedPayload) return "";
    return `<!-- EnterMedSchool MCQ Quiz: ${embedTitle} -->\n<div style="max-width:100%;">\n  <iframe\n    src="${embedUrl}"\n    width="${width}" height="${height}"\n    style="border:none;border-radius:${embedTheme.borderRadius}px;"\n    title="${embedTitle} - EnterMedSchool Quiz"\n    allow="clipboard-write"\n  ></iframe>\n  <p style="margin:8px 0 0;font-size:12px;font-family:sans-serif;color:#666;text-align:center;">\n    Created with <a href="https://entermedschool.org" rel="dofollow" style="color:${embedTheme.accent};font-weight:600;text-decoration:none;">EnterMedSchool.org</a>\n  </p>\n</div>`;
  }, [embedPayload, embedUrl, width, height, embedTheme, embedTitle]);

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
    clearTimeout(copiedRef.current);
    clearTimeout(celebrationRef.current);
    copiedRef.current = setTimeout(() => setCopied(false), 2500);
    celebrationRef.current = setTimeout(() => setShowCelebration(false), 1200);
  }, [iframeCode]);

  const handleDownload = useCallback(() => {
    downloadHtmlFile(iframeCode, "mcq-embed.html");
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }, [iframeCode]);

  const updateTheme = useCallback(
    (patch: Partial<MCQEmbedTheme>) => {
      setEmbedTheme((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  // ── Empty state ────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-lavender/60 mb-3">
          <Code2 className="h-8 w-8 text-showcase-purple/30" />
        </div>
        <p className="font-display text-lg font-bold text-ink-dark">
          {t("embedPanel")}
        </p>
        <p className="mt-1 text-sm text-ink-muted max-w-xs">
          {t("embedPanelDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pe-1">
      <h2 className="font-display text-lg font-bold text-ink-dark flex items-center gap-2">
        <Code2 className="h-5 w-5 text-showcase-purple" />
        {t("embedQuiz")}
      </h2>

      <p className="text-xs text-ink-muted flex items-center gap-1">
        <Info className="h-3 w-3 shrink-0" />
        {t("embedHint")}
      </p>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-1">
          {t("quizTitle")}
        </label>
        <input
          type="text"
          value={embedTitle}
          onChange={(e) => setEmbedTitle(e.target.value)}
          placeholder={t("quizTitlePlaceholder")}
          className="w-full rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 text-sm text-ink-dark focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10"
        />
      </div>

      {/* Source selection */}
      {exams.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-ink-dark mb-1">
            {t("questionsSource")}
          </label>
          <div className="relative">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full appearance-none rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 pe-7 text-xs font-bold text-ink-dark focus:border-showcase-purple focus:outline-none"
            >
              <option value="">{t("allQuestionsCount", { count: questions.length })}</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} (
                  {exam.sections.reduce(
                    (sum, s) => sum + s.questionIds.length,
                    0,
                  )}
                  )
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light pointer-events-none" />
          </div>
        </div>
      )}

      {/* Mode */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-2">
          {t("mode")}
        </label>
        <div className="flex gap-2">
          {(
            [
              {
                id: "practice" as const,
                label: t("practice"),
                desc: t("instantFeedback"),
                icon: BookOpen,
              },
              {
                id: "quiz" as const,
                label: t("quiz"),
                desc: t("scoreAtEnd"),
                icon: ClipboardList,
              },
            ] as const
          ).map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => updateTheme({ mode: mode.id })}
                className={`flex-1 flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-start transition-all ${
                  embedTheme.mode === mode.id
                    ? "border-showcase-purple bg-showcase-purple/5"
                    : "border-ink-light/20 bg-white hover:border-showcase-purple/30"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    embedTheme.mode === mode.id
                      ? "text-showcase-purple"
                      : "text-ink-muted"
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-ink-dark">
                    {mode.label}
                  </p>
                  <p className="text-[10px] text-ink-muted">{mode.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-2">
          {t("theme")}
        </label>
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((themeVal) => (
            <button
              key={themeVal}
              onClick={() => updateTheme({ theme: themeVal })}
              className={`flex-1 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all ${
                embedTheme.theme === themeVal
                  ? "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm"
                  : "border-ink-light/15 bg-white text-ink-muted hover:bg-gray-50"
              }`}
            >
              {themeVal === "light" ? t("light") : t("dark")}
            </button>
          ))}
        </div>
      </div>

      {/* Background color */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-2">
          {t("background")}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {BG_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => updateTheme({ bg: p.value })}
              className={`relative h-8 w-8 rounded-xl border-2 transition-all ${
                embedTheme.bg === p.value
                  ? "border-showcase-navy scale-110 shadow-md ring-2 ring-showcase-navy/20"
                  : "border-gray-200 hover:border-gray-400 hover:scale-105"
              }`}
              style={{ backgroundColor: p.value }}
              title={p.label}
              aria-label={`Background: ${p.label}`}
              aria-pressed={embedTheme.bg === p.value}
            >
              {embedTheme.bg === p.value && (
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check
                    className={`h-3.5 w-3.5 ${
                      p.value < "#888888" ? "text-white" : "text-showcase-navy"
                    }`}
                  />
                </m.div>
              )}
            </button>
          ))}
        </div>
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
              onClick={() => updateTheme({ accent: p.value })}
              className={`relative h-8 w-8 rounded-xl border-2 transition-all ${
                embedTheme.accent === p.value
                  ? "border-showcase-navy scale-110 shadow-md ring-2 ring-showcase-navy/20"
                  : "border-gray-200 hover:border-gray-400 hover:scale-105"
              }`}
              style={{ backgroundColor: p.value }}
              title={p.label}
              aria-label={t("accentAria", { label: p.label })}
              aria-pressed={embedTheme.accent === p.value}
            >
              {embedTheme.accent === p.value && (
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check className="h-3.5 w-3.5 text-white" />
                </m.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Options toggles */}
      <div className="flex flex-col gap-2">
        {[
          { key: "showProgress" as const, label: t("showProgressBar") },
          { key: "showScore" as const, label: t("showScore") },
          {
            key: "showExplanations" as const,
            label: t("showExplanations"),
          },
          { key: "animation" as const, label: t("animations") },
        ].map((opt) => (
          <label
            key={opt.key}
            className="flex items-center gap-2 text-xs text-ink-dark"
          >
            <input
              type="checkbox"
              checked={embedTheme[opt.key]}
              onChange={(e) => updateTheme({ [opt.key]: e.target.checked })}
              className="accent-showcase-purple"
            />
            <span className="font-bold">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-ink-dark mb-1">
            {t("width")}
          </label>
          <input
            type="text"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full rounded-lg border-2 border-ink-light/15 px-3 py-1.5 text-xs focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink-dark mb-1">
            {t("height")}
          </label>
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-lg border-2 border-ink-light/15 px-3 py-1.5 text-xs focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10"
          />
        </div>
      </div>

      {/* Border radius */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-1">
          {t("borderRadius")}{" "}
          <span className="text-showcase-purple">
            {embedTheme.borderRadius}px
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="24"
          value={embedTheme.borderRadius}
          onChange={(e) =>
            updateTheme({ borderRadius: Number(e.target.value) })
          }
          className="w-full accent-showcase-purple"
        />
      </div>

      {/* Embed code */}
      {embedPayload && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-ink-dark">
              {t("embedCode")}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  downloaded
                    ? "bg-showcase-green text-white shadow-sm scale-105"
                    : "bg-showcase-purple/10 text-showcase-purple hover:bg-showcase-purple/20 hover:shadow-sm"
                }`}
              >
                {downloaded ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {downloaded ? t("downloaded") : t("downloadHtml")}
              </button>
              <div className="relative">
              <button
                onClick={handleCopy}
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
                {copied ? t("copied") : t("copyCode")}
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
                        style={{
                          backgroundColor: [
                            "#6C5CE7",
                            "#00D9C0",
                            "#FFD93D",
                            "#FF85A2",
                            "#54A0FF",
                            "#2ECC71",
                            "#FF9F43",
                            "#7E22CE",
                          ][i],
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-showcase-navy bg-showcase-navy p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all max-h-40">
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
            {t("questionsEmbedded", { count: embedQuestions.length })}
            {embedPayload.length > 50000 && ` ${t("largePayload")}`}
          </p>
        </div>
      )}

      {/* Platform hints */}
      <div className="rounded-xl border-2 border-ink-light/15 bg-pastel-cream/20 p-3 mt-1">
        <p className="text-xs font-bold text-ink-dark mb-1.5">
          {t("platformInstructions")}
        </p>
        <ul className="text-[10px] text-ink-muted space-y-1">
          <li>
            <strong>HTML:</strong> {t("platformHtml")}
          </li>
          <li>
            <strong>WordPress:</strong> {t("platformWordPress")}
          </li>
          <li>
            <strong>Notion:</strong> {t("platformNotion")}
          </li>
          <li>
            <strong>Wix:</strong> {t("platformWix")}
          </li>
          <li>
            <strong>Squarespace:</strong> {t("platformSquarespace")}
          </li>
        </ul>
      </div>
    </div>
  );
}
