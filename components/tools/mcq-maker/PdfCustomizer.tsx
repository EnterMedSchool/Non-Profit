"use client";

import { useRef, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Palette,
  Type,
  FileText,
  Circle,
  SquareCheck,
  AlignLeft,
  Image as ImageIcon,
  X,
  ChevronDown,
  Stamp,
  Ruler,
} from "lucide-react";
import { useMCQ } from "./MCQContext";
import type { MCQPdfTheme } from "./types";
import { DEFAULT_PDF_THEME } from "./types";
import { MAX_LOGO_SIZE_BYTES } from "./constants";

// ── Presets ──────────────────────────────────────────────────────────
const PRESETS: { labelKey: "classicExam" | "modernClean" | "universityStyle" | "medicalBoard"; theme: Partial<MCQPdfTheme> }[] = [
  {
    labelKey: "classicExam",
    theme: {
      primaryColor: "#1a1a2e",
      secondaryColor: "#6C5CE7",
      headerBgColor: "#f5f5f5",
      textColor: "#1a1a2e",
      fontFamily: "times",
      fontSize: 11,
      answerStyle: "bubbles",
    },
  },
  {
    labelKey: "modernClean",
    theme: {
      primaryColor: "#6C5CE7",
      secondaryColor: "#00D9C0",
      headerBgColor: "#f8f7ff",
      textColor: "#1a1a2e",
      fontFamily: "helvetica",
      fontSize: 11,
      answerStyle: "letters",
    },
  },
  {
    labelKey: "universityStyle",
    theme: {
      primaryColor: "#003366",
      secondaryColor: "#CC0000",
      headerBgColor: "#f0f4f8",
      textColor: "#1a1a2e",
      fontFamily: "times",
      fontSize: 12,
      answerStyle: "bubbles",
    },
  },
  {
    labelKey: "medicalBoard",
    theme: {
      primaryColor: "#2E86AB",
      secondaryColor: "#A23B72",
      headerBgColor: "#f0f8ff",
      textColor: "#2d3436",
      fontFamily: "helvetica",
      fontSize: 10,
      answerStyle: "letters",
    },
  },
];

const ANSWER_STYLES: {
  value: MCQPdfTheme["answerStyle"];
  labelKey: "bubbles" | "letters" | "checkboxes" | "lines";
  icon: typeof Circle;
}[] = [
  { value: "bubbles", labelKey: "bubbles", icon: Circle },
  { value: "letters", labelKey: "letters", icon: Type },
  { value: "checkboxes", labelKey: "checkboxes", icon: SquareCheck },
  { value: "lines", labelKey: "lines", icon: AlignLeft },
];

// ── Component ────────────────────────────────────────────────────────
const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export default function PdfCustomizer() {
  const t = useTranslations("tools.mcqMaker.ui");
  const { pdfTheme, updatePdfTheme, setPdfTheme } = useMCQ();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLogoError(null);

      if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
        setLogoError(t("invalidFileType"));
        e.target.value = "";
        return;
      }

      if (file.size > MAX_LOGO_SIZE_BYTES) {
        setLogoError(
          t("logoTooLarge", { size: (file.size / 1024 / 1024).toFixed(1) }),
        );
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        updatePdfTheme({
          logoDataUrl: reader.result as string,
          showLogo: true,
        });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [updatePdfTheme, t],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Template presets */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-2">
          <Palette className="inline h-3.5 w-3.5 me-1" />
          {t("templatePresets")}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.labelKey}
              onClick={() =>
                setPdfTheme({ ...DEFAULT_PDF_THEME, ...preset.theme })
              }
              className="rounded-lg border-2 border-ink-light/20 bg-white px-2.5 py-2 text-xs font-bold text-ink-dark hover:border-showcase-purple/50 hover:bg-showcase-purple/5 transition-all text-start"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: preset.theme.primaryColor }}
                />
                <div
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: preset.theme.secondaryColor }}
                />
              </div>
              {t(preset.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-2">
          {t("colors")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2">
            <input
              type="color"
              value={pdfTheme.primaryColor}
              onChange={(e) =>
                updatePdfTheme({ primaryColor: e.target.value })
              }
              className="h-7 w-7 rounded border cursor-pointer"
            />
            <span className="text-xs text-ink-muted">{t("primary")}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="color"
              value={pdfTheme.secondaryColor}
              onChange={(e) =>
                updatePdfTheme({ secondaryColor: e.target.value })
              }
              className="h-7 w-7 rounded border cursor-pointer"
            />
            <span className="text-xs text-ink-muted">{t("secondary")}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="color"
              value={pdfTheme.headerBgColor}
              onChange={(e) =>
                updatePdfTheme({ headerBgColor: e.target.value })
              }
              className="h-7 w-7 rounded border cursor-pointer"
            />
            <span className="text-xs text-ink-muted">{t("headerBg")}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="color"
              value={pdfTheme.textColor}
              onChange={(e) =>
                updatePdfTheme({ textColor: e.target.value })
              }
              className="h-7 w-7 rounded border cursor-pointer"
            />
            <span className="text-xs text-ink-muted">{t("text")}</span>
          </label>
        </div>
      </div>

      {/* Font & Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-ink-dark mb-1">
            {t("font")}
          </label>
          <div className="relative">
            <select
              value={pdfTheme.fontFamily}
              onChange={(e) =>
                updatePdfTheme({
                  fontFamily: e.target.value as MCQPdfTheme["fontFamily"],
                })
              }
              className="w-full appearance-none rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 pe-7 text-xs font-bold text-ink-dark focus:border-showcase-purple focus:outline-none"
            >
              <option value="helvetica">Helvetica</option>
              <option value="times">Times</option>
              <option value="courier">Courier</option>
            </select>
            <ChevronDown className="absolute end-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-ink-dark mb-1">
            {t("fontSize")}
          </label>
          <input
            type="number"
            min={8}
            max={16}
            value={pdfTheme.fontSize}
            onChange={(e) =>
              updatePdfTheme({ fontSize: parseInt(e.target.value) || 11 })
            }
            className="w-full rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 text-xs text-ink-dark focus:border-showcase-purple focus:outline-none"
          />
        </div>
      </div>

      {/* Paper size */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-1">
          <FileText className="inline h-3.5 w-3.5 me-1" />
          {t("paperSize")}
        </label>
        <div className="flex gap-2">
          {(["a4", "letter"] as const).map((size) => (
            <button
              key={size}
              onClick={() => updatePdfTheme({ paperSize: size })}
              className={`flex-1 rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                pdfTheme.paperSize === size
                  ? "border-showcase-navy bg-showcase-navy text-white"
                  : "border-ink-light/20 bg-white text-ink-muted hover:bg-gray-50"
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Page Margins */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-2">
          <Ruler className="inline h-3.5 w-3.5 me-1" />
          {t("pageMargins")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <div key={side} className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-ink-muted w-10">
                {t(side === "top" ? "marginTop" : side === "right" ? "marginRight" : side === "bottom" ? "marginBottom" : "marginLeft")}
              </span>
              <input
                type="number"
                min={5}
                max={40}
                value={pdfTheme.pageMargins[side]}
                onChange={(e) =>
                  updatePdfTheme({
                    pageMargins: {
                      ...pdfTheme.pageMargins,
                      [side]: Math.max(5, Math.min(40, parseInt(e.target.value) || 15)),
                    },
                  })
                }
                className="w-full rounded-lg border-2 border-ink-light/20 bg-white px-2 py-1 text-xs text-ink-dark focus:border-showcase-purple focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Answer style */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-2">
          {t("answerStyle")}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ANSWER_STYLES.map((style) => {
            const Icon = style.icon;
            return (
              <button
                key={style.value}
                onClick={() => updatePdfTheme({ answerStyle: style.value })}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold transition-all ${
                  pdfTheme.answerStyle === style.value
                    ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                    : "border-ink-light/20 bg-white text-ink-muted hover:bg-gray-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(style.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header/Footer */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-1">
          {t("headerText")}
        </label>
        <input
          type="text"
          value={pdfTheme.headerTemplate}
          onChange={(e) =>
            updatePdfTheme({ headerTemplate: e.target.value })
          }
          placeholder={t("headerPlaceholder")}
          className="w-full rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 text-xs text-ink-dark focus:border-showcase-purple focus:outline-none"
        />
      </div>

      {/* Watermark */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-1">
          <Stamp className="inline h-3.5 w-3.5 me-1" />
          {t("watermark")}
        </label>
        <input
          type="text"
          value={pdfTheme.watermarkText}
          onChange={(e) =>
            updatePdfTheme({ watermarkText: e.target.value })
          }
          placeholder={t("watermarkPlaceholder")}
          className="w-full rounded-lg border-2 border-ink-light/20 bg-white px-3 py-1.5 text-xs text-ink-dark focus:border-showcase-purple focus:outline-none"
        />
        {pdfTheme.watermarkText && (
          <p className="mt-1 text-[10px] text-ink-light">
            {t("watermarkHint")}
          </p>
        )}
      </div>

      {/* Options toggles */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs text-ink-dark">
          <input
            type="checkbox"
            checked={pdfTheme.showQuestionNumbers}
            onChange={(e) =>
              updatePdfTheme({ showQuestionNumbers: e.target.checked })
            }
            className="rounded accent-showcase-purple"
          />
          <span className="font-bold">{t("showQuestionNumbers")}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-ink-dark">
          <input
            type="checkbox"
            checked={pdfTheme.showPointValues}
            onChange={(e) =>
              updatePdfTheme({ showPointValues: e.target.checked })
            }
            className="rounded accent-showcase-purple"
          />
          <span className="font-bold">{t("showPointValues")}</span>
        </label>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-xs font-bold text-ink-dark mb-1">
          <ImageIcon className="inline h-3.5 w-3.5 me-1" />
          {t("logoOptional")}
        </label>
        {logoError && (
          <p className="text-xs text-red-600 mb-1">{logoError}</p>
        )}
        {pdfTheme.logoDataUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={pdfTheme.logoDataUrl}
              alt={t("logoAlt")}
              className="h-8 w-8 rounded border object-contain"
            />
            {/* Logo position selector */}
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => updatePdfTheme({ logoPosition: pos })}
                  className={`rounded-md px-2 py-1 text-[10px] font-bold capitalize transition-all ${
                    pdfTheme.logoPosition === pos
                      ? "bg-showcase-purple text-white"
                      : "bg-gray-100 text-ink-muted hover:bg-gray-200"
                  }`}
                >
                  {t(pos === "left" ? "positionLeft" : pos === "center" ? "positionCenter" : "positionRight")}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                updatePdfTheme({ logoDataUrl: undefined, showLogo: false })
              }
              className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              {t("remove")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="text-xs font-bold text-showcase-purple hover:underline"
          >
            {t("uploadLogo")}
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>
    </div>
  );
}
