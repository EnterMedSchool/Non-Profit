"use client";

import { useState, useEffect } from "react";
import {
  GripHorizontal,
  MousePointer2,
  Download,
  Keyboard,
  Palette,
  Layers,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";

const STORAGE_KEY = "ems-illustration-tour-completed";

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: "left" | "center" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Asset Library",
    description: "Browse scientific illustrations by category. Drag assets onto the canvas or click to add them. Star your favorites for quick access.",
    icon: GripHorizontal,
    position: "left",
  },
  {
    title: "Drawing Tools",
    description: "Use the toolbar to select tools: shapes, text, freehand drawing, labels, and numbered markers. Each tool has a keyboard shortcut.",
    icon: MousePointer2,
    position: "center",
  },
  {
    title: "Properties Panel",
    description: "Select any object to edit its position, size, colors, fonts, and line styles. Choose from curated academic color palettes.",
    icon: Palette,
    position: "right",
  },
  {
    title: "Layers Panel",
    description: "Manage object ordering, visibility, and locking. Double-click to rename layers. Drag to reorder.",
    icon: Layers,
    position: "right",
  },
  {
    title: "Export Options",
    description: "Export as PNG, JPEG, SVG, or PDF. Copy directly to clipboard for pasting into presentations. SVG export gives you publication-quality scalable figures.",
    icon: Download,
    position: "center",
  },
  {
    title: "Keyboard Shortcuts",
    description: "Press ? to see all shortcuts. Use V for select, T for text, R for rectangle, Space+drag to pan, scroll to zoom. Right-click for context menu.",
    icon: Keyboard,
    position: "center",
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        // Show tour after a brief delay
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch { /* noop */ }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch { /* noop */ }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border-3 border-showcase-purple bg-white p-6 shadow-chunky-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-showcase-purple" />
            <span className="text-xs font-bold text-showcase-purple">
              Welcome Tour ({currentStep + 1}/{TOUR_STEPS.length})
            </span>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1 hover:bg-pastel-lavender">
            <X className="h-4 w-4 text-ink-muted" />
          </button>
        </div>

        {/* Step content */}
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-showcase-purple/10">
            <Icon className="h-6 w-6 text-showcase-purple" />
          </div>
          <h3 className="font-display text-lg font-bold text-ink-dark mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentStep
                  ? "w-6 bg-showcase-purple"
                  : i < currentStep
                    ? "w-2 bg-showcase-purple/40"
                    : "w-2 bg-showcase-navy/10"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-xs text-ink-light hover:text-ink-muted"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="rounded-lg border-2 border-showcase-navy/10 px-4 py-2 text-xs font-bold text-ink-muted hover:bg-pastel-lavender/50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-lg border-2 border-showcase-purple bg-showcase-purple px-4 py-2 text-xs font-bold text-white transition-all hover:bg-showcase-purple/90"
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ArrowRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
