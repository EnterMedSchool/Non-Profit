"use client";

import { Component, useState, useCallback, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  PenLine,
  List,
  Upload,
  ClipboardList,
  FileDown,
  Code2,
  ArrowLeft,
  HelpCircle,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { MCQProvider, useMCQ } from "./MCQContext";
import QuestionEditor from "./QuestionEditor";
import QuestionBank from "./QuestionBank";
import QuestionPreview from "./QuestionPreview";
import ImportPanel from "./ImportPanel";
import ExamBuilder from "./ExamBuilder";
import ExportPanel from "./ExportPanel";
import EmbedPanel from "./EmbedPanel";
import type { MCQPanel } from "./types";

// ── Tab config (labels filled in MCQMakerInner) ─────────────────────
const TAB_IDS = [
  { id: "editor" as const, key: "tabCreate", icon: PenLine },
  { id: "bank" as const, key: "tabQuestions", icon: List },
  { id: "import" as const, key: "tabImport", icon: Upload },
  { id: "exam" as const, key: "tabExam", icon: ClipboardList },
  { id: "export" as const, key: "tabExport", icon: FileDown },
  { id: "embed" as const, key: "tabEmbed", icon: Code2 },
];

// ── Error Boundary ──────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MCQErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-dvh flex-col items-center justify-center bg-white p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-dark mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-ink-muted max-w-md mb-4">
            The MCQ Maker encountered an unexpected error. Your data is
            auto-saved and should be recovered on reload.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-6 py-2.5 font-display font-bold text-white shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky transition-all"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Mobile Preview Modal ────────────────────────────────────────────
function MobilePreviewSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white">
      <div className="flex items-center justify-between border-b-2 border-ink-light/10 px-4 py-3">
        <h2 className="font-display text-base font-bold text-ink-dark">
          Question Preview
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink-light/20 text-ink-muted hover:text-ink-dark transition-colors"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <QuestionPreview />
      </div>
    </div>
  );
}

// ── Inner layout (needs context) ─────────────────────────────────────
function MCQMakerInner() {
  const t = useTranslations("tools.mcqMaker.ui");
  const { activePanel, setActivePanel, questions, storageWarning, clearStorageWarning } =
    useMCQ();
  const [mobilePreview, setMobilePreview] = useState(false);
  const tabListRef = useRef<HTMLElement>(null);

  // Determine if the right panel (preview) should show for the current tab
  const showPreview = activePanel === "editor" || activePanel === "bank";

  // Keyboard navigation for tabs (Phase 5.2)
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      let nextIdx = idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIdx = (idx + 1) % TAB_IDS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIdx = (idx - 1 + TAB_IDS.length) % TAB_IDS.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIdx = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIdx = TAB_IDS.length - 1;
      } else {
        return;
      }
        setActivePanel(TAB_IDS[nextIdx]!.id);
      // Focus the new tab button
      const tabList = tabListRef.current;
      if (tabList) {
        const buttons = tabList.querySelectorAll<HTMLButtonElement>(
          '[role="tab"]',
        );
        buttons[nextIdx]?.focus();
      }
    },
    [setActivePanel],
  );

  return (
    <div className="flex h-dvh flex-col bg-gradient-to-br from-pastel-cream/40 via-white to-pastel-lavender/30">
      {/* ── Storage warning ─────────────────────────────────── */}
      {storageWarning && (
        <div className="flex items-center gap-2 bg-yellow-50 border-b-2 border-yellow-300 px-4 py-2 text-xs text-yellow-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{storageWarning}</span>
          <button
            onClick={clearStorageWarning}
            className="font-bold hover:underline"
            aria-label={t("dismiss")}
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b-3 border-showcase-navy bg-white px-4 py-3 shadow-chunky-sm z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink-light/20 bg-white text-ink-muted hover:border-showcase-purple hover:text-showcase-purple transition-colors"
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/10">
              <HelpCircle className="h-5 w-5 text-showcase-purple" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-ink-dark leading-tight">
                {t("mcqMaker")}
              </h1>
              <p className="text-[11px] text-ink-muted leading-tight hidden sm:block">
                {t("mcqMakerDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile preview button */}
          {showPreview && (
            <button
              onClick={() => setMobilePreview(true)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink-light/20 bg-white text-ink-muted hover:border-showcase-purple hover:text-showcase-purple transition-colors"
              aria-label={t("previewQuestion")}
            >
              <Eye className="h-4 w-4" />
            </button>
          )}

          {questions.length > 0 && (
            <span
              className="rounded-lg bg-pastel-lavender px-2.5 py-1 text-xs font-bold text-showcase-purple border border-showcase-purple/20"
              aria-live="polite"
            >
              {questions.length === 1 ? t("questionCount", { count: 1 }) : t("questionsCount", { count: questions.length })}
            </span>
          )}
        </div>
      </header>

      {/* ── Mobile tab bar ───────────────────────────────────── */}
      <nav
        className="flex lg:hidden border-b-2 border-ink-light/10 bg-white overflow-x-auto"
        role="tablist"
        aria-label="MCQ Maker tools"
      >
        {TAB_IDS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`mcq-tab-mobile-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`mcq-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActivePanel(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`flex flex-1 min-w-[64px] flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors ${
                isActive
                  ? "text-showcase-purple border-b-3 border-showcase-purple"
                  : "text-ink-muted hover:text-ink-dark"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(tab.key)}
            </button>
          );
        })}
      </nav>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar tabs */}
        <nav
          ref={tabListRef}
          className="hidden lg:flex flex-col gap-1 border-r-2 border-ink-light/10 bg-white px-2 py-3 w-16"
          role="tablist"
          aria-label="MCQ Maker tools"
          aria-orientation="vertical"
        >
          {TAB_IDS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`mcq-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`mcq-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActivePanel(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2.5 text-[10px] font-bold transition-all ${
                  isActive
                    ? "bg-showcase-purple/10 text-showcase-purple"
                    : "text-ink-muted hover:text-ink-dark hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Left panel — active tool panel (the main content) */}
        <main
          id={`mcq-panel-${activePanel}`}
          role="tabpanel"
          aria-labelledby={`mcq-tab-${activePanel}`}
          className={`
            w-full lg:w-80 xl:w-96 shrink-0 border-r-2 border-ink-light/10 bg-white overflow-y-auto p-4
            ${!showPreview ? "lg:flex-1 lg:max-w-none" : ""}
          `}
        >
          {activePanel === "editor" && <QuestionEditor />}
          {activePanel === "bank" && <QuestionBank />}
          {activePanel === "import" && <ImportPanel />}
          {activePanel === "exam" && <ExamBuilder />}
          {activePanel === "export" && <ExportPanel />}
          {activePanel === "embed" && <EmbedPanel />}
        </main>

        {/* Right panel — Preview (supplementary, only for editor & bank) */}
        {showPreview && (
          <aside className="hidden lg:flex flex-1 overflow-hidden items-center justify-center p-4 lg:p-8">
            <div className="w-full h-full max-w-lg mx-auto">
              <QuestionPreview />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile preview sheet */}
      <MobilePreviewSheet
        open={mobilePreview}
        onClose={() => setMobilePreview(false)}
        t={t}
      />
    </div>
  );
}

// ── Root export ──────────────────────────────────────────────────────
function MCQMakerWithTranslations() {
  const t = useTranslations("tools.mcqMaker.ui");
  return (
    <MCQErrorBoundary t={t}>
      <MCQMakerInner />
    </MCQErrorBoundary>
  );
}

export default function MCQMaker() {
  return (
    <MCQProvider>
      <MCQMakerWithTranslations />
    </MCQProvider>
  );
}
