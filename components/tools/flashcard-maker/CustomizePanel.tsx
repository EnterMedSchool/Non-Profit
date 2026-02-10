"use client";

import { useCallback } from "react";
import {
  Palette,
  Type,
  Frame,
  Sticker,
  RotateCcw,
} from "lucide-react";
import { useFlashcards } from "./FlashcardContext";
import { solidBackgrounds, backgrounds, decorations, getDecorationById } from "@/data/flashcard-assets";
import type { DecorationPlacement, FlashcardTheme } from "./types";
import { DEFAULT_THEME } from "./types";

// ── Font options ─────────────────────────────────────────────────────
const FONT_OPTIONS = [
  { value: "DM Sans", label: "DM Sans" },
  { value: "Bricolage Grotesque", label: "Bricolage Grotesque" },
  { value: "Caveat", label: "Caveat (handwritten)" },
  { value: "Georgia", label: "Georgia (serif)" },
  { value: "Arial", label: "Arial" },
  { value: "Courier New", label: "Courier New (mono)" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
];

// ── Decoration position options ──────────────────────────────────────
const POSITION_OPTIONS: DecorationPlacement["position"][] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "center",
];

// ── Component ────────────────────────────────────────────────────────
export default function CustomizePanel() {
  const { theme, setTheme, updateTheme } = useFlashcards();

  const resetTheme = useCallback(() => {
    // Use setTheme for a clean replace (not merge) to ensure all fields are reset
    setTheme(DEFAULT_THEME);
  }, [setTheme]);

  const addDecoration = useCallback(
    (assetId: string) => {
      const newDeco: DecorationPlacement = {
        assetId,
        position: "top-right",
        scale: 1,
      };
      updateTheme({ decorations: [...theme.decorations, newDeco] });
    },
    [theme.decorations, updateTheme],
  );

  const removeDecoration = useCallback(
    (index: number) => {
      updateTheme({
        decorations: theme.decorations.filter((_, i) => i !== index),
      });
    },
    [theme.decorations, updateTheme],
  );

  const updateDecoration = useCallback(
    (index: number, patch: Partial<DecorationPlacement>) => {
      updateTheme({
        decorations: theme.decorations.map((d, i) =>
          i === index ? { ...d, ...patch } : d,
        ),
      });
    },
    [theme.decorations, updateTheme],
  );

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink-dark">
          Customize
        </h2>
        <button
          onClick={resetTheme}
          className="inline-flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-showcase-purple"
          title="Reset to defaults"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* ── Background ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-ink-dark">
          <Palette className="h-4 w-4 text-showcase-purple" />
          Background
        </div>

        {/* Solid colors */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          <button
            onClick={() => updateTheme({ backgroundId: null })}
            className={`h-10 rounded-lg border-2 transition-all ${
              theme.backgroundId === null
                ? "border-showcase-teal shadow-chunky-sm scale-105"
                : "border-ink-light/20 hover:border-showcase-teal/40"
            } bg-white`}
            aria-label="No background"
            aria-pressed={theme.backgroundId === null}
            title="None"
          >
            <span className="text-xs text-ink-muted">None</span>
          </button>
          {solidBackgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => updateTheme({ backgroundId: bg.id })}
              className={`h-10 rounded-lg border-2 transition-all ${
                theme.backgroundId === bg.id
                  ? "border-showcase-teal shadow-chunky-sm scale-105"
                  : "border-ink-light/20 hover:border-showcase-teal/40"
              }`}
              style={{ backgroundColor: bg.color }}
              aria-label={`Set background to ${bg.label}`}
              aria-pressed={theme.backgroundId === bg.id}
              title={bg.label}
            />
          ))}
        </div>

        {/* Image backgrounds (when user adds PNGs) */}
        {backgrounds.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-1">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => updateTheme({ backgroundId: bg.id })}
                className={`h-16 rounded-lg border-2 bg-cover bg-center transition-all ${
                  theme.backgroundId === bg.id
                    ? "border-showcase-teal shadow-chunky-sm scale-105"
                    : "border-ink-light/20 hover:border-showcase-teal/40"
                }`}
                style={{
                  backgroundImage: `url(${bg.thumbnail ?? bg.src})`,
                }}
                title={bg.label}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Typography ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-ink-dark">
          <Type className="h-4 w-4 text-showcase-teal" />
          Typography
        </div>

        {/* Font family */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-muted">Font</span>
          <select
            value={theme.fontFamily}
            onChange={(e) => updateTheme({ fontFamily: e.target.value })}
            className="rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
            style={{ fontFamily: theme.fontFamily }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        {/* Font sizes */}
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">Front size</span>
            <input
              type="range"
              min={10}
              max={32}
              value={theme.frontFontSize}
              onChange={(e) =>
                updateTheme({ frontFontSize: Number(e.target.value) })
              }
              aria-valuetext={`${theme.frontFontSize} pixels`}
              className="accent-showcase-teal"
            />
            <span className="text-xs text-ink-muted text-center">
              {theme.frontFontSize}px
            </span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">Back size</span>
            <input
              type="range"
              min={10}
              max={32}
              value={theme.backFontSize}
              onChange={(e) =>
                updateTheme({ backFontSize: Number(e.target.value) })
              }
              aria-valuetext={`${theme.backFontSize} pixels`}
              className="accent-showcase-teal"
            />
            <span className="text-xs text-ink-muted text-center">
              {theme.backFontSize}px
            </span>
          </label>
        </div>

        {/* Text color */}
        <label className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Text color</span>
          <input
            type="color"
            value={theme.textColor}
            onChange={(e) => updateTheme({ textColor: e.target.value })}
            aria-label="Text color picker"
            className="h-8 w-8 cursor-pointer rounded-lg border-2 border-ink-light/20"
          />
          <span className="text-xs font-mono text-ink-muted">
            {theme.textColor}
          </span>
        </label>
      </section>

      {/* ── Border ──────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-ink-dark">
          <Frame className="h-4 w-4 text-showcase-coral" />
          Border
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">Style</span>
            <select
              value={theme.borderStyle}
              onChange={(e) =>
                updateTheme({
                  borderStyle: e.target.value as FlashcardTheme["borderStyle"],
                })
              }
              className="rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none"
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">Width</span>
            <input
              type="range"
              min={0}
              max={6}
              value={theme.borderWidth}
              onChange={(e) =>
                updateTheme({ borderWidth: Number(e.target.value) })
              }
              aria-valuetext={`${theme.borderWidth} pixels`}
              className="accent-showcase-coral"
            />
            <span className="text-xs text-ink-muted text-center">
              {theme.borderWidth}px
            </span>
          </label>
        </div>

        <label className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Border color</span>
          <input
            type="color"
            value={theme.borderColor}
            onChange={(e) => updateTheme({ borderColor: e.target.value })}
            aria-label="Border color picker"
            className="h-8 w-8 cursor-pointer rounded-lg border-2 border-ink-light/20"
          />
          <span className="text-xs font-mono text-ink-muted">
            {theme.borderColor}
          </span>
        </label>
      </section>

      {/* ── Decorations ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-ink-dark">
          <Sticker className="h-4 w-4 text-showcase-yellow" />
          Decorations
        </div>

        {decorations.length === 0 && theme.decorations.length === 0 && (
          <p className="text-xs text-ink-muted rounded-xl border-2 border-dashed border-ink-light/20 p-3 text-center">
            No decorations available.
          </p>
        )}

        {/* Available decorations to add */}
        {decorations.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {decorations.map((deco) => (
              <button
                key={deco.id}
                onClick={() => addDecoration(deco.id)}
                className="flex h-12 items-center justify-center rounded-lg border-2 border-ink-light/20 bg-white transition-all hover:border-showcase-yellow/50 hover:scale-105"
                title={`Add ${deco.label}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deco.thumbnail ?? deco.src}
                  alt={deco.label}
                  className="h-8 w-8 object-contain"
                />
              </button>
            ))}
          </div>
        )}

        {/* Active decorations */}
        {theme.decorations.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {theme.decorations.map((deco, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border-2 border-ink-light/20 bg-white px-3 py-2"
              >
                <span className="text-xs font-bold text-ink-dark flex-1 truncate">
                  {getDecorationById(deco.assetId)?.label ?? deco.assetId}
                </span>
                <select
                  value={deco.position}
                  onChange={(e) =>
                    updateDecoration(i, {
                      position: e.target.value as DecorationPlacement["position"],
                    })
                  }
                  className="rounded-lg border border-ink-light/20 px-1.5 py-1 text-[10px] text-ink-muted"
                >
                  {POSITION_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeDecoration(i)}
                  className="text-red-400 hover:text-red-600 text-xs font-bold"
                  aria-label={`Remove decoration ${getDecorationById(deco.assetId)?.label ?? deco.assetId}`}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
