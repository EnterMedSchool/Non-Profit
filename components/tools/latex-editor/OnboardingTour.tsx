"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { TOUR_STORAGE_KEY } from "./types";
import {
  FileText,
  Eye,
  Puzzle,
  BookOpen,
  GraduationCap,
  Download,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  MousePointerClick,
  Check,
} from "lucide-react";

/* ── Tour step definitions ────────────────────────────────── */

interface TourStep {
  titleKey: string;
  descKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  targetSelector?: string;
  position?: "bottom" | "top" | "left" | "right" | "center";
  task?: {
    instructionKey: string;
    clickTarget?: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  { titleKey: "tourWelcomeTitle", descKey: "tourWelcomeDesc", icon: Sparkles, position: "center" },
  { titleKey: "tourEditorTitle", descKey: "tourEditorDesc", icon: FileText, targetSelector: "[data-tour='editor-panel']", position: "right" },
  { titleKey: "tourPreviewTitle", descKey: "tourPreviewDesc", icon: Eye, targetSelector: "[data-tour='preview-panel']", position: "left" },
  {
    titleKey: "tourToolbarTitle",
    descKey: "tourToolbarDesc",
    icon: MousePointerClick,
    targetSelector: "[data-tour='format-toolbar']",
    position: "bottom",
    task: { instructionKey: "tourToolbarTask", clickTarget: "[data-tour='btn-bold']" },
  },
  {
    titleKey: "tourSnippetsTitle",
    descKey: "tourSnippetsDesc",
    icon: Puzzle,
    targetSelector: "[data-tour='btn-snippets']",
    position: "bottom",
    task: { instructionKey: "tourSnippetsTask", clickTarget: "[data-tour='btn-snippets']" },
  },
  { titleKey: "tourTemplatesTitle", descKey: "tourTemplatesDesc", icon: BookOpen, targetSelector: "[data-tour='btn-templates']", position: "bottom" },
  { titleKey: "tourLearnTitle", descKey: "tourLearnDesc", icon: GraduationCap, targetSelector: "[data-tour='btn-learn']", position: "bottom" },
  { titleKey: "tourExportTitle", descKey: "tourExportDesc", icon: Download, targetSelector: "[data-tour='btn-export']", position: "bottom" },
];

/* ── Spotlight overlay ────────────────────────────────────── */

function SpotlightOverlay({ rect }: { rect: DOMRect | null }) {
  if (!rect) {
    return (
      <div className="fixed inset-0 z-[99] bg-black/60 transition-all duration-300" />
    );
  }

  const padding = 8;
  const x = rect.left - padding;
  const y = rect.top - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;

  return (
    <div className="fixed inset-0 z-[99] pointer-events-auto transition-all duration-300">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.60)"
          mask="url(#spotlight-mask)"
        />
      </svg>
      {/* Highlight ring around target */}
      <div
        className="absolute border-2 border-showcase-purple rounded-xl pointer-events-none animate-pulse"
        style={{ left: x, top: y, width: w, height: h }}
      />
    </div>
  );
}

/* ── Main tour component ──────────────────────────────────── */

export default function OnboardingTour() {
  const t = useTranslations("tools.latexEditor.ui");
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if tour should show on mount
  useEffect(() => {
    try {
      const completed = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!completed) {
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      /* noop */
    }
  }, []);

  // Update spotlight target when step changes
  const updateTargetRect = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (step?.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        return;
      }
    }
    setTargetRect(null);
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    setTaskCompleted(false);
    updateTargetRect();

    // Update rect on resize/scroll
    const handleUpdate = () => updateTargetRect();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isOpen, currentStep, updateTargetRect]);

  // Listen for task completion (click on target)
  useEffect(() => {
    if (!isOpen) return;
    const step = TOUR_STEPS[currentStep];
    if (!step?.task?.clickTarget) return;

    const handleClick = (e: MouseEvent) => {
      const target = document.querySelector(step.task!.clickTarget!);
      if (target && (target === e.target || target.contains(e.target as Node))) {
        setTaskCompleted(true);
      }
    };

    // Small delay so the tour UI settles first
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick, true);
    }, 500);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isOpen, currentStep]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      /* noop */
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const stepTitle = t(step.titleKey);
  const stepDesc = t(step.descKey);
  const taskInstruction = step.task ? t(step.task.instructionKey) : null;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isCenter = step.position === "center" || !step.targetSelector;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCenter || !targetRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const margin = 16;
    const tooltipWidth = 420;

    switch (step.position) {
      case "bottom":
        return {
          position: "fixed",
          top: targetRect.bottom + margin,
          left: Math.max(margin, Math.min(targetRect.left, window.innerWidth - tooltipWidth - margin)),
          maxWidth: tooltipWidth,
        };
      case "top":
        return {
          position: "fixed",
          bottom: window.innerHeight - targetRect.top + margin,
          left: Math.max(margin, Math.min(targetRect.left, window.innerWidth - tooltipWidth - margin)),
          maxWidth: tooltipWidth,
        };
      case "left":
        return {
          position: "fixed",
          top: Math.max(margin, targetRect.top),
          right: window.innerWidth - targetRect.left + margin,
          maxWidth: tooltipWidth,
        };
      case "right":
        return {
          position: "fixed",
          top: Math.max(margin, targetRect.top),
          left: targetRect.right + margin,
          maxWidth: tooltipWidth,
        };
      default:
        return {
          position: "fixed",
          top: targetRect.bottom + margin,
          left: Math.max(margin, targetRect.left),
          maxWidth: tooltipWidth,
        };
    }
  };

  return (
    <>
      {/* Spotlight overlay */}
      <SpotlightOverlay rect={isCenter ? null : targetRect} />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="z-[100] bg-white rounded-2xl border-2 border-ink-dark/10 shadow-2xl max-w-md w-full overflow-hidden"
        style={getTooltipStyle()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-pastel-cream">
          <div
            className="h-full bg-showcase-purple transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-showcase-purple/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-showcase-purple" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-showcase-purple uppercase tracking-wider">
                  {t("tourStepOf", { current: currentStep + 1, total: TOUR_STEPS.length })}
                </p>
                <h2 className="text-base font-bold text-ink-dark mt-0.5">
                  {stepTitle}
                </h2>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-ink-light hover:text-ink-muted hover:bg-pastel-cream transition-colors"
              title={t("skipTour")}
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm text-ink-muted leading-relaxed mb-4">
            {stepDesc}
          </p>

          {/* Interactive task */}
          {step.task && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-medium transition-colors ${
                taskCompleted
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-amber-50 border border-amber-200 text-amber-700"
              }`}
            >
              {taskCompleted ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span>{t("niceWork")}</span>
                </>
              ) : (
                <>
                  <MousePointerClick size={14} className="text-amber-500 animate-bounce" />
                  <span>{taskInstruction!}</span>
                </>
              )}
            </div>
          )}

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === currentStep
                    ? "bg-showcase-purple w-5"
                    : i < currentStep
                    ? "bg-showcase-purple/40 w-2"
                    : "bg-ink-dark/10 w-2"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="text-xs text-ink-muted hover:text-ink-dark transition-colors"
            >
              {t("skipTour")}
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-ink-muted hover:bg-pastel-cream transition-colors"
                >
                  <ArrowLeft size={12} />
                  {t("back")}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-showcase-purple text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                {isLast ? t("getStarted") : t("next")}
                {!isLast && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
