"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  ChevronLeft,
  ChevronDown,
  RotateCw,
  Move,
  Maximize2,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Minus,
} from "lucide-react";
import { useIllustration } from "./IllustrationContext";

/* ── Font list ──────────────────────────────────────────────────── */

const FONT_FAMILIES = [
  { label: "System Default", value: "system-ui, -apple-system, sans-serif" },
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Lato", value: "Lato" },
  { label: "Source Sans 3", value: "Source Sans 3" },
  { label: "PT Sans", value: "PT Sans" },
  { label: "Noto Sans", value: "Noto Sans" },
  { label: "IBM Plex Sans", value: "IBM Plex Sans" },
  { label: "Fira Sans", value: "Fira Sans" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "Libre Baskerville", value: "Libre Baskerville" },
  { label: "JetBrains Mono", value: "JetBrains Mono" },
];

// Track loaded fonts to avoid re-loading
const loadedFonts = new Set<string>();

function loadGoogleFont(fontFamily: string) {
  if (fontFamily.startsWith("system-ui") || loadedFonts.has(fontFamily)) return;
  loadedFonts.add(fontFamily);
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

/* ── Stroke dash presets ──────────────────────────────────────── */

const DASH_PRESETS = [
  { label: "Solid", value: [] as number[] },
  { label: "Dashed", value: [10, 5] },
  { label: "Dotted", value: [2, 4] },
  { label: "Dash-Dot", value: [10, 5, 2, 5] },
  { label: "Long Dash", value: [20, 8] },
];

/* ── Color palettes ──────────────────────────────────────────── */

const COLOR_PALETTES = [
  {
    name: "Default",
    colors: [
      "#1a1a2e", "#ffffff", "#FF6B6B", "#FFD93D", "#00D9C0",
      "#6C5CE7", "#54A0FF", "#FF85A2", "#00B894", "#F39C12",
      "#2d3436", "#636e72", "#b2bec3", "#dfe6e9",
    ],
  },
  {
    name: "Nature Journal",
    colors: [
      "#E64B35", "#4DBBD5", "#00A087", "#3C5488", "#F39B7F",
      "#8491B4", "#91D1C2", "#DC0000", "#7E6148", "#B09C85",
      "#00468B", "#ED0000", "#42B540", "#0099B4",
    ],
  },
  {
    name: "Cell Press",
    colors: [
      "#3B4992", "#EE0000", "#008B45", "#631879", "#008280",
      "#BB0021", "#5F559B", "#A20056", "#808180", "#1B1919",
      "#0073C2", "#EFC000", "#868686", "#CD534C",
    ],
  },
  {
    name: "Pastel Academic",
    colors: [
      "#A8D8EA", "#AA96DA", "#FCBAD3", "#FFFFD2", "#B5EAD7",
      "#C7CEEA", "#FFB7B2", "#E2F0CB", "#FFDAC1", "#B5B9FF",
      "#957DAD", "#D291BC", "#FEC8D8", "#FFDFD3",
    ],
  },
  {
    name: "High Contrast",
    colors: [
      "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
      "#FFFF00", "#FF00FF", "#00FFFF", "#FF6600", "#6600FF",
      "#009900", "#990000", "#333333", "#CCCCCC",
    ],
  },
];

/* ── Component ──────────────────────────────────────────────────── */

interface ObjectProperties {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDashArray: number[];
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  underline?: boolean;
}

export default function PropertiesPanel() {
  const t = useTranslations("tools.illustrationMaker.ui.properties");
  const { canvas, selectedObjects, pushHistory } = useIllustration();
  const [props, setProps] = useState<ObjectProperties | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [activePalette, setActivePalette] = useState(0);
  const [showFontMenu, setShowFontMenu] = useState(false);

  const obj = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const isText = obj?.type === "textbox" || obj?.type === "text" || obj?.type === "i-text";
  const hasStroke = obj?.type !== "image";

  /* ── Sync properties from selected object ───────────────────── */

  useEffect(() => {
    if (!obj) {
      setProps(null);
      return;
    }

    const updateProps = () => {
      setProps({
        left: Math.round(obj.left || 0),
        top: Math.round(obj.top || 0),
        width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
        height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
        angle: Math.round(obj.angle || 0),
        opacity: Math.round((obj.opacity ?? 1) * 100),
        fill: typeof obj.fill === "string" ? obj.fill : "#000000",
        stroke: typeof obj.stroke === "string" ? obj.stroke : "",
        strokeWidth: obj.strokeWidth || 0,
        strokeDashArray: (obj.strokeDashArray as number[]) || [],
        fontSize: (obj as any).fontSize,
        fontFamily: (obj as any).fontFamily,
        fontWeight: (obj as any).fontWeight,
        fontStyle: (obj as any).fontStyle,
        textAlign: (obj as any).textAlign,
        underline: (obj as any).underline,
      });
    };

    updateProps();

    const c = canvas;
    if (c) {
      c.on("object:modified", updateProps);
      c.on("object:scaling", updateProps);
      c.on("object:moving", updateProps);
      c.on("object:rotating", updateProps);
      return () => {
        c.off("object:modified", updateProps);
        c.off("object:scaling", updateProps);
        c.off("object:moving", updateProps);
        c.off("object:rotating", updateProps);
      };
    }
  }, [obj, canvas]);

  /* ── Update object property ─────────────────────────────────── */

  const updateProp = useCallback(
    (key: string, value: any) => {
      if (!obj || !canvas) return;

      if (key === "width") {
        const scale = value / (obj.width || 1);
        obj.set({ scaleX: scale });
      } else if (key === "height") {
        const scale = value / (obj.height || 1);
        obj.set({ scaleY: scale });
      } else if (key === "opacity") {
        obj.set({ opacity: value / 100 });
      } else if (key === "fontFamily") {
        loadGoogleFont(value);
        obj.set({ fontFamily: value } as any);
      } else {
        obj.set({ [key]: value } as any);
      }

      canvas.renderAll();
      pushHistory();
    },
    [obj, canvas, pushHistory]
  );

  /* ── Number input ───────────────────────────────────────────── */

  const NumInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] font-bold text-ink-light uppercase">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border-2 border-showcase-navy/10 bg-pastel-cream/20 px-2 py-1 text-xs text-ink-dark focus:border-showcase-purple/40 focus:outline-none"
      />
    </div>
  );

  /* ── Collapsed state ────────────────────────────────────────── */

  if (!obj || !props) {
    return (
      <div className="hidden w-10 flex-col items-center border-l-3 border-showcase-navy/10 bg-white py-3 lg:flex">
        <span className="text-[10px] text-ink-light [writing-mode:vertical-rl] rotate-180">{t("title")}</span>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="flex w-10 flex-col items-center border-l-3 border-showcase-navy/10 bg-white py-2">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-pastel-lavender hover:text-showcase-purple"
          title={t("expandProperties")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Find active dash preset
  const activeDash = DASH_PRESETS.findIndex(
    (p) => JSON.stringify(p.value) === JSON.stringify(props.strokeDashArray)
  );

  const paletteLabelKeys: Record<number, string> = {
    0: "paletteDefault",
    1: "paletteNature",
    2: "paletteCellPress",
    3: "palettePastel",
    4: "paletteHighContrast",
  };

  return (
    <div className="hidden w-56 flex-col border-l-3 border-showcase-navy/10 bg-white lg:flex xl:w-64">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-showcase-navy/5 px-3 py-2">
        <h3 className="font-display text-sm font-bold text-ink-dark">{t("title")}</h3>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-pastel-lavender hover:text-showcase-purple"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Position ────────────────────────────────────────── */}
        <div className="border-b border-showcase-navy/5 px-3 py-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Move className="h-3 w-3 text-showcase-purple" />
            <span className="text-[10px] font-bold text-ink-muted">{t("position")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="X" value={props.left} onChange={(v) => updateProp("left", v)} />
            <NumInput label="Y" value={props.top} onChange={(v) => updateProp("top", v)} />
          </div>
        </div>

        {/* ── Size ────────────────────────────────────────────── */}
        <div className="border-b border-showcase-navy/5 px-3 py-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Maximize2 className="h-3 w-3 text-showcase-teal" />
            <span className="text-[10px] font-bold text-ink-muted">{t("size")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="W" value={props.width} onChange={(v) => updateProp("width", v)} min={1} />
            <NumInput label="H" value={props.height} onChange={(v) => updateProp("height", v)} min={1} />
          </div>
        </div>

        {/* ── Rotation & Opacity ──────────────────────────────── */}
        <div className="border-b border-showcase-navy/5 px-3 py-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 flex items-center gap-1">
                <RotateCw className="h-3 w-3 text-showcase-coral" />
                <span className="text-[10px] font-bold text-ink-light uppercase">{t("rotation")}</span>
              </div>
              <input
                type="number"
                value={props.angle}
                onChange={(e) => updateProp("angle", Number(e.target.value))}
                min={0}
                max={360}
                className="w-full rounded-lg border-2 border-showcase-navy/10 bg-pastel-cream/20 px-2 py-1 text-xs text-ink-dark focus:border-showcase-purple/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-ink-light uppercase">Opacity</label>
              <input
                type="range"
                min={0}
                max={100}
                value={props.opacity}
                onChange={(e) => updateProp("opacity", Number(e.target.value))}
                className="w-full accent-showcase-purple"
              />
              <span className="block text-center text-[10px] text-ink-light">{props.opacity}%</span>
            </div>
          </div>
        </div>

        {/* ── Colors ──────────────────────────────────────────── */}
        <div className="border-b border-showcase-navy/5 px-3 py-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Palette className="h-3 w-3 text-showcase-yellow" />
            <span className="text-[10px] font-bold text-ink-muted">{t("colors")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[10px] font-bold text-ink-light uppercase">{t("fill")}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={props.fill || "#000000"}
                  onChange={(e) => updateProp("fill", e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-showcase-navy/10"
                />
                <input
                  type="text"
                  value={props.fill}
                  onChange={(e) => updateProp("fill", e.target.value)}
                  className="flex-1 rounded-lg border-2 border-showcase-navy/10 bg-pastel-cream/20 px-2 py-0.5 text-[10px] text-ink-dark focus:border-showcase-purple/40 focus:outline-none"
                />
              </div>
            </div>
            {hasStroke && (
              <div>
                <label className="mb-0.5 block text-[10px] font-bold text-ink-light uppercase">{t("stroke")}</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={props.stroke || "#000000"}
                    onChange={(e) => updateProp("stroke", e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded border border-showcase-navy/10"
                  />
                  <input
                    type="number"
                    value={props.strokeWidth}
                    onChange={(e) => updateProp("strokeWidth", Number(e.target.value))}
                    min={0}
                    max={50}
                    className="w-12 rounded-lg border-2 border-showcase-navy/10 bg-pastel-cream/20 px-2 py-0.5 text-[10px] text-ink-dark focus:border-showcase-purple/40 focus:outline-none"
                    title={t("strokeWidth")}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Gradient Fill ────────────────────────────────── */}
        {!isText && (
          <GradientSection obj={obj} canvas={canvas} pushHistory={pushHistory} />
        )}

        {/* ── Line Style ─────────────────────────────────────── */}
        {hasStroke && props.strokeWidth > 0 && (
          <div className="border-b border-showcase-navy/5 px-3 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Minus className="h-3 w-3 text-showcase-navy" />
              <span className="text-[10px] font-bold text-ink-muted">{t("lineStyle")}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {DASH_PRESETS.map((preset, i) => (
                <button
                  key={preset.labelKey}
                  onClick={() => updateProp("strokeDashArray", preset.value)}
                  className={`rounded-lg border-2 px-2 py-1 text-[10px] font-bold transition-all ${
                    activeDash === i
                      ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                      : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                  }`}
                >
                  {t(preset.labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Text properties ─────────────────────────────────── */}
        {isText && props.fontSize !== undefined && (
          <div className="border-b border-showcase-navy/5 px-3 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Type className="h-3 w-3 text-showcase-blue" />
              <span className="text-[10px] font-bold text-ink-muted">Text</span>
            </div>

            {/* Font family */}
            <div className="mb-2 relative">
              <label className="mb-0.5 block text-[10px] font-bold text-ink-light uppercase">{t("font")}</label>
              <button
                onClick={() => setShowFontMenu(!showFontMenu)}
                className="flex w-full items-center justify-between rounded-lg border-2 border-showcase-navy/10 bg-pastel-cream/20 px-2 py-1 text-xs text-ink-dark"
                style={{ fontFamily: props.fontFamily }}
              >
                <span className="truncate">
                  {FONT_FAMILIES.find((f) => f.value === props.fontFamily)?.label || t("systemDefault")}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 text-ink-light" />
              </button>
              {showFontMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFontMenu(false)} />
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border-3 border-showcase-navy/10 bg-white p-1 shadow-chunky">
                    {FONT_FAMILIES.map((font) => {
                      // Preload fonts for preview
                      loadGoogleFont(font.value);
                      return (
                        <button
                          key={font.value}
                          onClick={() => {
                            updateProp("fontFamily", font.value);
                            setShowFontMenu(false);
                          }}
                          className={`flex w-full items-center rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-pastel-lavender/50 ${
                            props.fontFamily === font.value
                              ? "font-bold text-showcase-purple"
                              : "text-ink-muted"
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Font size */}
            <NumInput
              label={t("fontSize")}
              value={props.fontSize || 24}
              onChange={(v) => updateProp("fontSize", v)}
              min={8}
              max={200}
            />

            {/* Style buttons */}
            <div className="mt-2 flex gap-1">
              <button
                onClick={() =>
                  updateProp("fontWeight", props.fontWeight === "bold" ? "normal" : "bold")
                }
                className={`rounded-lg border-2 p-1.5 transition-all ${
                  props.fontWeight === "bold"
                    ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                    : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                }`}
                title={t("bold")}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() =>
                  updateProp("fontStyle", props.fontStyle === "italic" ? "normal" : "italic")
                }
                className={`rounded-lg border-2 p-1.5 transition-all ${
                  props.fontStyle === "italic"
                    ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                    : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                }`}
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => updateProp("underline", !props.underline)}
                className={`rounded-lg border-2 p-1.5 transition-all ${
                  props.underline
                    ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                    : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                }`}
                title={t("underline")}
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              <div className="mx-0.5 w-px bg-showcase-navy/10" />
              <button
                onClick={() => updateProp("textAlign", "left")}
                className={`rounded-lg border-2 p-1.5 transition-all ${
                  props.textAlign === "left"
                    ? "border-showcase-teal bg-showcase-teal/10 text-showcase-teal"
                    : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                }`}
                title={t("alignLeft")}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => updateProp("textAlign", "center")}
                className={`rounded-lg border-2 p-1.5 transition-all ${
                  props.textAlign === "center"
                    ? "border-showcase-teal bg-showcase-teal/10 text-showcase-teal"
                    : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                }`}
                title={t("alignCenter")}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => updateProp("textAlign", "right")}
                className={`rounded-lg border-2 p-1.5 transition-all ${
                  props.textAlign === "right"
                    ? "border-showcase-teal bg-showcase-teal/10 text-showcase-teal"
                    : "border-showcase-navy/10 text-ink-muted hover:bg-pastel-lavender/50"
                }`}
                title={t("alignRight")}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Color Palettes ─────────────────────────────────── */}
        <div className="px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-ink-light uppercase">{t("colorPalette")}</span>
            <select
              value={activePalette}
              onChange={(e) => setActivePalette(Number(e.target.value))}
              className="rounded border border-showcase-navy/10 bg-pastel-cream/20 px-1 py-0.5 text-[10px] text-ink-muted focus:outline-none"
            >
              {COLOR_PALETTES.map((p, i) => (
                <option key={p.name} value={i}>{t(paletteLabelKeys[i] ?? "paletteDefault")}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PALETTES[activePalette].colors.map((color) => (
              <button
                key={color}
                onClick={() => updateProp("fill", color)}
                className="h-5 w-5 rounded-md border-2 border-showcase-navy/10 transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Gradient Section sub-component ────────────────────────────── */

const GRADIENT_PRESETS = [
  { label: "None", type: "none" as const, colors: [] },
  { label: "Purple → Blue", type: "linear" as const, colors: ["#6C5CE7", "#54A0FF"] },
  { label: "Teal → Green", type: "linear" as const, colors: ["#00D9C0", "#00B894"] },
  { label: "Coral → Pink", type: "linear" as const, colors: ["#FF6B6B", "#FF85A2"] },
  { label: "Sunset", type: "linear" as const, colors: ["#FFD93D", "#FF6B6B"] },
  { label: "Ocean", type: "linear" as const, colors: ["#0984e3", "#00cec9"] },
  { label: "Radial Purple", type: "radial" as const, colors: ["#6C5CE7", "#a29bfe"] },
  { label: "Radial Blue", type: "radial" as const, colors: ["#0984e3", "#74b9ff"] },
];

function GradientSection({
  obj,
  canvas,
  pushHistory,
}: {
  obj: any;
  canvas: any;
  pushHistory: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const applyGradient = async (preset: typeof GRADIENT_PRESETS[0]) => {
    if (!obj || !canvas) return;

    if (preset.type === "none") {
      // Reset to solid fill
      const currentFill = typeof obj.fill === "string" ? obj.fill : "#6C5CE7";
      obj.set({ fill: currentFill || "#6C5CE7" });
    } else {
      const { Gradient } = await import("fabric");
      const coords = preset.type === "linear"
        ? { x1: 0, y1: 0, x2: obj.width || 100, y2: obj.height || 100 }
        : { r1: 0, r2: Math.max(obj.width || 100, obj.height || 100) / 2, x1: (obj.width || 100) / 2, y1: (obj.height || 100) / 2, x2: (obj.width || 100) / 2, y2: (obj.height || 100) / 2 };

      const gradient = new Gradient({
        type: preset.type,
        coords,
        colorStops: [
          { offset: 0, color: preset.colors[0] },
          { offset: 1, color: preset.colors[1] },
        ],
      });

      obj.set({ fill: gradient });
    }

    canvas.renderAll();
    pushHistory();
  };

  return (
    <div className="border-b border-showcase-navy/5 px-3 py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 flex w-full items-center gap-1.5 text-left"
      >
        <div
          className="h-3 w-3 rounded-sm"
          style={{
            background: "linear-gradient(135deg, #6C5CE7, #54A0FF)",
          }}
        />
        <span className="text-[10px] font-bold text-ink-muted">{t("gradientFill")}</span>
        <ChevronDown className={`ml-auto h-3 w-3 text-ink-light transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="flex flex-wrap gap-1">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyGradient(preset)}
              className="rounded-lg border-2 border-showcase-navy/10 px-2 py-1 text-[10px] font-bold text-ink-muted transition-all hover:border-showcase-purple/30 hover:bg-pastel-lavender/50"
              title={preset.label}
            >
              {preset.type !== "none" && (
                <span
                  className="mr-1 inline-block h-3 w-3 rounded-sm align-middle"
                  style={{
                    background: preset.type === "linear"
                      ? `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`
                      : `radial-gradient(${preset.colors[0]}, ${preset.colors[1]})`,
                  }}
                />
              )}
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
