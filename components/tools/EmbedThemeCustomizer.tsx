"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, RotateCcw, Palette } from "lucide-react";
import {
  type EmbedTheme,
  DEFAULT_THEME,
  FONT_OPTIONS,
} from "@/lib/embedTheme";

interface EmbedThemeCustomizerProps {
  theme: EmbedTheme;
  onChange: (theme: EmbedTheme) => void;
}

// ── Section wrapper (collapsible) ────────────────────────────────────

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-showcase-navy/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 px-1 text-sm font-bold text-ink-dark hover:text-showcase-purple transition-colors"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4 px-1 space-y-3">{children}</div>}
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────

function Toggle({
  label,
  description,
  checked,
  onChange,
  onLabel,
  offLabel,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-ink-dark">{label}</p>
        {description && (
          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors ${
          checked
            ? "border-showcase-purple bg-showcase-purple"
            : "border-showcase-navy/20 bg-gray-200"
        }`}
      >
        <span className="sr-only">
          {checked ? onLabel : offLabel}
        </span>
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
            checked ? "translate-x-5 ml-0" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// ── Color picker row ─────────────────────────────────────────────────

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-dark">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-muted font-mono uppercase">
          {value}
        </span>
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
          />
          <div
            className="h-8 w-8 rounded-lg border-2 border-showcase-navy/20 shadow-sm"
            style={{ backgroundColor: value }}
          />
        </label>
      </div>
    </div>
  );
}

// ── Main customizer component ────────────────────────────────────────

export default function EmbedThemeCustomizer({
  theme,
  onChange,
}: EmbedThemeCustomizerProps) {
  const t = useTranslations("tools.embed.customizer");
  const [expanded, setExpanded] = useState(false);

  const update = <K extends keyof EmbedTheme>(key: K, val: EmbedTheme[K]) => {
    onChange({ ...theme, [key]: val });
  };

  const isDefault =
    JSON.stringify(theme) === JSON.stringify(DEFAULT_THEME);

  // Preview dots showing the current palette
  const previewDots = [theme.bg, theme.ac, theme.tx, theme.mt];

  return (
    <div className="rounded-xl border-2 border-showcase-navy/10 bg-pastel-cream/30 overflow-hidden">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-pastel-cream/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Palette className="h-4 w-4 text-showcase-purple" />
          <div>
            <p className="text-sm font-bold text-ink-dark">{t("title")}</p>
            <p className="text-xs text-ink-muted">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Palette preview dots */}
          {!expanded && (
            <div className="flex gap-1">
              {previewDots.map((color, i) => (
                <div
                  key={i}
                  className="h-4 w-4 rounded-full border border-showcase-navy/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
          <ChevronDown
            className={`h-4 w-4 text-ink-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded customizer */}
      {expanded && (
        <div className="border-t border-showcase-navy/10 px-4 pb-4">
          {/* Reset button */}
          {!isDefault && (
            <div className="pt-3 pb-1 flex justify-end">
              <button
                type="button"
                onClick={() => onChange({ ...DEFAULT_THEME })}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-showcase-purple transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                {t("reset")}
              </button>
            </div>
          )}

          {/* ── Colors ─────────────────────────────────────────── */}
          <Section title={t("colorsSection")} defaultOpen>
            <ColorPicker
              label={t("bgColor")}
              value={theme.bg}
              onChange={(v) => update("bg", v)}
            />
            <ColorPicker
              label={t("accentColor")}
              value={theme.ac}
              onChange={(v) => update("ac", v)}
            />
            <ColorPicker
              label={t("textColor")}
              value={theme.tx}
              onChange={(v) => update("tx", v)}
            />
            <ColorPicker
              label={t("mutedColor")}
              value={theme.mt}
              onChange={(v) => update("mt", v)}
            />
            {/* Dark mode quick-toggle */}
            <Toggle
              label={t("darkMode")}
              checked={theme.dk}
              onChange={(v) => {
                if (v) {
                  // Apply dark defaults when toggling on
                  onChange({
                    ...theme,
                    dk: true,
                    bg: "#1a1a2e",
                    tx: "#e8e8f0",
                    mt: "#9a9ab8",
                  });
                } else {
                  // Revert to light defaults when toggling off
                  onChange({
                    ...theme,
                    dk: false,
                    bg: DEFAULT_THEME.bg,
                    tx: DEFAULT_THEME.tx,
                    mt: DEFAULT_THEME.mt,
                  });
                }
              }}
              onLabel={t("on")}
              offLabel={t("off")}
            />
          </Section>

          {/* ── Typography ──────────────────────────────────────── */}
          <Section title={t("typographySection")}>
            {/* Font family */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-dark">{t("fontFamily")}</span>
              <select
                value={theme.ff}
                onChange={(e) => update("ff", e.target.value)}
                className="rounded-lg border-2 border-showcase-navy/20 bg-white px-3 py-1.5 text-sm text-ink-dark outline-none focus:border-showcase-purple"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Font size */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-sm text-ink-dark">{t("fontSize")}</span>
                <span className="text-xs text-ink-muted font-mono">
                  {theme.fs}{t("px")}
                </span>
              </div>
              <input
                type="range"
                min={13}
                max={16}
                step={1}
                value={theme.fs}
                onChange={(e) => update("fs", parseInt(e.target.value))}
                className="w-full accent-showcase-purple"
              />
              <div className="flex justify-between text-[10px] text-ink-muted mt-0.5">
                <span>13{t("px")}</span>
                <span>16{t("px")}</span>
              </div>
            </div>
          </Section>

          {/* ── Layout ──────────────────────────────────────────── */}
          <Section title={t("layoutSection")}>
            {/* Border radius */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-sm text-ink-dark">{t("borderRadius")}</span>
                <span className="text-xs text-ink-muted font-mono">
                  {theme.br}{t("px")}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={4}
                value={theme.br}
                onChange={(e) => update("br", parseInt(e.target.value))}
                className="w-full accent-showcase-purple"
              />
              <div className="flex justify-between text-[10px] text-ink-muted mt-0.5">
                <span>0{t("px")}</span>
                <span>24{t("px")}</span>
              </div>
            </div>

            {/* Border style */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-dark">{t("borderStyle")}</span>
              <div className="flex gap-1 rounded-lg border-2 border-showcase-navy/10 bg-white p-0.5">
                {(["chunky", "thin", "none"] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => update("bs", style)}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      theme.bs === style
                        ? "bg-showcase-purple text-white"
                        : "text-ink-muted hover:text-ink-dark"
                    }`}
                  >
                    {t(`border${style.charAt(0).toUpperCase() + style.slice(1)}` as "borderChunky" | "borderThin" | "borderNone")}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow */}
            <Toggle
              label={t("cardShadow")}
              checked={theme.sh}
              onChange={(v) => update("sh", v)}
              onLabel={t("on")}
              offLabel={t("off")}
            />

            {/* Compact mode */}
            <Toggle
              label={t("compactMode")}
              description={t("compactModeDesc")}
              checked={theme.cp}
              onChange={(v) => update("cp", v)}
              onLabel={t("on")}
              offLabel={t("off")}
            />
          </Section>

          {/* ── Sections ────────────────────────────────────────── */}
          {!theme.cp && (
            <Section title={t("sectionsSection")}>
              <Toggle
                label={t("showBmiPrime")}
                checked={theme.sp}
                onChange={(v) => update("sp", v)}
                onLabel={t("on")}
                offLabel={t("off")}
              />
              <Toggle
                label={t("showPonderalIndex")}
                checked={theme.si}
                onChange={(v) => update("si", v)}
                onLabel={t("on")}
                offLabel={t("off")}
              />
              <Toggle
                label={t("showWaistGuidance")}
                checked={theme.sw}
                onChange={(v) => update("sw", v)}
                onLabel={t("on")}
                offLabel={t("off")}
              />
              <Toggle
                label={t("showAgeContext")}
                checked={theme.sa}
                onChange={(v) => update("sa", v)}
                onLabel={t("on")}
                offLabel={t("off")}
              />
              <Toggle
                label={t("showDisclaimer")}
                checked={theme.sd}
                onChange={(v) => update("sd", v)}
                onLabel={t("on")}
                offLabel={t("off")}
              />
            </Section>
          )}

          {/* ── Attribution ──────────────────────────────────────── */}
          <Section title={t("attributionSection")}>
            <div className="flex gap-2">
              {(["full", "compact"] as const).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => update("ab", variant)}
                  className={`flex-1 rounded-lg border-2 px-3 py-2 text-xs font-bold transition-all ${
                    theme.ab === variant
                      ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                      : "border-showcase-navy/10 bg-white text-ink-muted hover:bg-pastel-lavender"
                  }`}
                >
                  {t(variant === "full" ? "attributionFull" : "attributionCompact")}
                </button>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
