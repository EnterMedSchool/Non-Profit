"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import {
  Upload,
  Palette,
  FileDown,
  ArrowLeft,
  Layers,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { FlashcardProvider, useFlashcards } from "./FlashcardContext";
import ImportPanel from "./ImportPanel";
import CustomizePanel from "./CustomizePanel";
import CardPreview from "./CardPreview";
import ExportPanel from "./ExportPanel";

// ── Error Boundary ───────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class FlashcardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Flashcard Maker error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-br from-pastel-cream/40 via-white to-pastel-lavender/30 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-red-200 bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink-dark">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-ink-muted max-w-md">
              The Flashcard Maker encountered an unexpected error. Your data
              may have been saved automatically.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-teal px-5 py-2.5 font-display font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/en/tools"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-light/30 px-5 py-2.5 font-display font-bold text-ink-dark hover:border-ink-light/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── Tab config ───────────────────────────────────────────────────────
const TABS = [
  { id: "import" as const, label: "Import", icon: Upload },
  { id: "customize" as const, label: "Customize", icon: Palette },
  { id: "export" as const, label: "Export", icon: FileDown },
];

// ── Inner layout (needs context) ─────────────────────────────────────
function FlashcardMakerInner() {
  const { activePanel, setActivePanel, cards } = useFlashcards();

  return (
    <div className="flex h-dvh flex-col bg-gradient-to-br from-pastel-cream/40 via-white to-pastel-lavender/30">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b-3 border-showcase-navy bg-white px-4 py-3 shadow-chunky-sm z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/en/tools"
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-ink-light/20 bg-white text-ink-muted hover:border-showcase-teal hover:text-showcase-teal transition-colors"
            aria-label="Back to Tools"
            title="Back to Tools"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-showcase-teal/30 bg-showcase-teal/10">
              <Layers className="h-5 w-5 text-showcase-teal" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-ink-dark leading-tight">
                Flashcard Maker
              </h1>
              <p className="text-[11px] text-ink-muted leading-tight hidden sm:block">
                Import, customize, and print physical flashcards
              </p>
            </div>
          </div>
        </div>

        {cards.length > 0 && (
          <span className="rounded-lg bg-pastel-mint px-2.5 py-1 text-xs font-bold text-showcase-teal border border-showcase-teal/20">
            {cards.length} card{cards.length !== 1 ? "s" : ""}
          </span>
        )}
      </header>

      {/* ── Mobile tab bar ───────────────────────────────────── */}
      <nav
        className="flex lg:hidden border-b-2 border-ink-light/10 bg-white"
        role="tablist"
        aria-label="Flashcard maker panels"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors ${
                isActive
                  ? "text-showcase-teal border-b-3 border-showcase-teal"
                  : "text-ink-muted hover:text-ink-dark"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar -- Import (desktop always visible, mobile conditional) */}
        <aside
          id="panel-import"
          role="tabpanel"
          aria-label="Import cards"
          className={`
            w-full lg:w-72 xl:w-80 shrink-0 border-r-2 border-ink-light/10 bg-white overflow-y-auto p-4
            ${activePanel === "import" ? "block" : "hidden lg:block"}
          `}
        >
          <ImportPanel />
        </aside>

        {/* Center -- Card Preview (hidden on mobile where tabs control panels) */}
        <main
          role="main"
          aria-label="Card preview"
          className={`
            flex-1 overflow-hidden p-4 lg:p-8
            hidden lg:flex items-center justify-center
          `}
        >
          <div className="w-full h-full max-w-lg mx-auto">
            <CardPreview />
          </div>
        </main>

        {/* Right sidebar -- Customize / Export (desktop always visible, mobile conditional) */}
        <aside
          id="panel-customize"
          role="tabpanel"
          aria-label="Customize and export"
          className={`
            w-full lg:w-72 xl:w-80 shrink-0 border-l-2 border-ink-light/10 bg-white overflow-y-auto p-4
            ${activePanel === "customize" || activePanel === "export" ? "block" : "hidden lg:block"}
          `}
        >
          {/* Desktop: Show both customize and export stacked */}
          <div className="hidden lg:flex flex-col gap-6 h-full">
            <div className="flex-1 overflow-y-auto">
              <CustomizePanel />
            </div>
            <div className="border-t-2 border-ink-light/10 pt-4">
              <ExportPanel />
            </div>
          </div>

          {/* Mobile: Show active panel */}
          <div className="lg:hidden">
            {activePanel === "customize" && <CustomizePanel />}
            {activePanel === "export" && <ExportPanel />}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Root export (wraps in provider + error boundary) ────────────────
export default function FlashcardMaker() {
  return (
    <FlashcardErrorBoundary>
      <FlashcardProvider>
        <FlashcardMakerInner />
      </FlashcardProvider>
    </FlashcardErrorBoundary>
  );
}
