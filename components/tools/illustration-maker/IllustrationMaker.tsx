"use client";

import { useState, useEffect, useCallback } from "react";
import { IllustrationProvider, useIllustration } from "./IllustrationContext";
import { useHotkeys } from "./useHotkeys";
import CanvasArea from "./CanvasArea";
import AssetPanel from "./AssetPanel";
import Toolbar from "./Toolbar";
import PropertiesPanel from "./PropertiesPanel";
import LayersPanel from "./LayersPanel";
import ContextMenu from "./ContextMenu";
import OnboardingTour from "./OnboardingTour";
import PageTabs from "./PageTabs";
import { Monitor } from "lucide-react";

/**
 * Inner component that uses the illustration context.
 * Separated so we can call hooks that depend on the provider.
 */
function IllustrationMakerInner() {
  useHotkeys();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main area: sidebar + canvas + properties */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Asset library */}
        <AssetPanel />

        {/* Center: Canvas */}
        <CanvasArea />

        {/* Right: Properties + Layers */}
        <div className="hidden flex-col lg:flex">
          <PropertiesPanel />
          <LayersPanel />
        </div>
      </div>

      {/* Page tabs */}
      <PageTabs />

      {/* Bottom status bar */}
      <StatusBar />

      {/* Right-click context menu */}
      <ContextMenu />

      {/* Onboarding tour for first-time users */}
      <OnboardingTour />
    </div>
  );
}

/**
 * Mobile warning screen.
 */
function MobileWarning() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-pastel-lavender via-white to-pastel-mint p-8 text-center">
      <div className="rounded-2xl border-3 border-showcase-purple/20 bg-white p-6 shadow-chunky">
        <Monitor className="mx-auto mb-4 h-12 w-12 text-showcase-purple" />
        <h2 className="font-display text-xl font-bold text-ink-dark">
          Desktop Recommended
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          The Scientific Illustration Maker works best on a desktop or laptop browser.
          Please visit from a computer for the full experience.
        </p>
        <a
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border-3 border-showcase-purple bg-showcase-purple px-6 py-2 text-sm font-bold text-white shadow-chunky-purple transition-all hover:-translate-y-0.5 hover:shadow-chunky-purple-lg"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

/**
 * Enhanced bottom status bar with real-time info.
 */
function StatusBar() {
  const {
    objects,
    selectedObjects,
    canvasSize,
    activeTool,
    zoom,
    canvas,
  } = useIllustration();

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved">("saved");

  // Track cursor position
  useEffect(() => {
    if (!canvas) return;
    const handleMove = (opt: any) => {
      const point = canvas.getScenePoint(opt.e);
      setCursorPos({ x: Math.round(point.x), y: Math.round(point.y) });
    };
    canvas.on("mouse:move", handleMove);
    return () => { canvas.off("mouse:move", handleMove); };
  }, [canvas]);

  // Track save status
  useEffect(() => {
    if (!canvas) return;
    const markUnsaved = () => setSaveStatus("unsaved");
    canvas.on("object:added", markUnsaved);
    canvas.on("object:removed", markUnsaved);
    canvas.on("object:modified", markUnsaved);
    return () => {
      canvas.off("object:added", markUnsaved);
      canvas.off("object:removed", markUnsaved);
      canvas.off("object:modified", markUnsaved);
    };
  }, [canvas]);

  // Auto-save resets status
  useEffect(() => {
    const timer = setInterval(() => setSaveStatus("saved"), 10_500);
    return () => clearInterval(timer);
  }, []);

  const toolLabels: Record<string, string> = {
    select: "Select",
    text: "Text",
    rect: "Rectangle",
    circle: "Circle",
    line: "Line",
    arrow: "Arrow",
    freehand: "Freehand",
    connector: "Connector",
    label: "Label",
    marker: "Marker",
  };

  return (
    <div className="flex items-center justify-between border-t-2 border-showcase-navy/10 bg-white px-4 py-1.5">
      <div className="flex items-center gap-3 text-[10px] text-ink-light">
        {/* Tool indicator */}
        <span className="font-bold text-showcase-purple">
          {toolLabels[activeTool] || activeTool}
        </span>

        <span className="h-3 w-px bg-showcase-navy/10" />

        {/* Object count */}
        <span>
          {objects.length} object{objects.length !== 1 ? "s" : ""}
          {selectedObjects.length > 0 && (
            <span className="text-showcase-purple"> ({selectedObjects.length} selected)</span>
          )}
        </span>

        <span className="h-3 w-px bg-showcase-navy/10" />

        {/* Canvas size */}
        <span>{canvasSize.width} x {canvasSize.height}</span>

        <span className="h-3 w-px bg-showcase-navy/10" />

        {/* Cursor position */}
        <span>
          X: {cursorPos.x} Y: {cursorPos.y}
        </span>

        <span className="h-3 w-px bg-showcase-navy/10" />

        {/* Zoom */}
        <span>{Math.round(zoom * 100)}%</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Save status */}
        <span
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
            saveStatus === "saved"
              ? "bg-showcase-green/10 text-showcase-green"
              : "bg-showcase-yellow/10 text-showcase-yellow"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${
            saveStatus === "saved" ? "bg-showcase-green" : "bg-showcase-yellow animate-pulse"
          }`} />
          {saveStatus === "saved" ? "Saved" : "Unsaved"}
        </span>

        <span className="inline-flex items-center gap-1 rounded-md bg-showcase-green/10 px-1.5 py-0.5 text-[10px] font-bold text-showcase-green">
          Free & Open Source
        </span>
      </div>
    </div>
  );
}

/**
 * Main exported component.
 * Wraps everything in the IllustrationProvider context.
 */
export default function IllustrationMaker() {
  return (
    <IllustrationProvider>
      <IllustrationMakerInner />
    </IllustrationProvider>
  );
}
