"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Download,
  Copy,
  Check,
  ChevronDown,
  RectangleHorizontal,
  Square,
  Minus,
  RectangleVertical,
  Palette,
  Sliders,
  User,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import ChunkyButton from "@/components/shared/ChunkyButton";
import { generateQRCodeImage } from "@/lib/qrcode";
import {
  saveAttribution,
  loadAttribution,
  renderBadgeToCanvas,
  generateBadgePngBlob,
  generateAttributionEmbedHtml,
  resolveAccentColor,
  THEME_COLORS,
  DEFAULT_BADGE_PREFS,
  type BadgeShape,
  type BadgeSize,
  type BadgeColorTheme,
  type BadgeBgStyle,
  type BadgePreferences,
} from "@/lib/attribution";

/* ── Collapsible section ── */
function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: typeof User;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border-2 border-showcase-navy/10 bg-white transition-colors hover:border-showcase-navy/15">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start"
      >
        <span className="flex items-center gap-2 font-display text-sm font-bold text-ink-dark">
          <Icon className="h-4 w-4 text-showcase-purple" />
          {title}
        </span>
        <m.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-ink-light" />
        </m.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-showcase-navy/5 px-4 pb-4 pt-3">
              {children}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Shape icon map ── */
const shapeIcons: Record<BadgeShape, typeof Square> = {
  horizontal: RectangleHorizontal,
  square: Square,
  compact: Minus,
  vertical: RectangleVertical,
};

/* ── Theme color swatches ── */
const themeList: BadgeColorTheme[] = ["purple", "teal", "green", "coral", "navy", "custom"];
const sizeList: BadgeSize[] = ["small", "medium", "large"];
const shapeList: BadgeShape[] = ["horizontal", "square", "compact", "vertical"];
const bgStyleList: BadgeBgStyle[] = ["white", "gradient", "dark", "transparent"];

export default function BadgeGenerator() {
  const t = useTranslations("license.generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const qrRef = useRef<HTMLImageElement | null>(null);
  const qrDarkRef = useRef<HTMLImageElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [prefs, setPrefs] = useState<BadgePreferences>(DEFAULT_BADGE_PREFS);
  const [assetsReady, setAssetsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved attribution from localStorage
  useEffect(() => {
    const saved = loadAttribution();
    if (saved) {
      if (saved.name) setName(saved.name);
      if (saved.position) setPosition(saved.position);
    }
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveAttribution({ name, position });
    }, 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [name, position]);

  // Preload logo + QR codes (light & dark)
  useEffect(() => {
    let cancelled = false;
    const loadAssets = async () => {
      const [logoImg, qrLight, qrDark] = await Promise.all([
        new Promise<HTMLImageElement>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = "/logo.png";
        }),
        generateQRCodeImage({
          url: "https://entermedschool.org",
          size: 256,
          foreground: "#1a1a2e",
          background: "#FFFFFF",
          margin: 1,
        }),
        generateQRCodeImage({
          url: "https://entermedschool.org",
          size: 256,
          foreground: "#FFFFFF",
          background: "#1a1a2e",
          margin: 1,
        }),
      ]);
      if (!cancelled) {
        logoRef.current = logoImg;
        qrRef.current = qrLight;
        qrDarkRef.current = qrDark;
        setAssetsReady(true);
      }
    };
    loadAssets();
    return () => { cancelled = true; };
  }, []);

  // ── Redraw badge on any change ──
  const drawBadge = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !assetsReady) return;

    const isDark = prefs.badgeBgStyle === "dark";
    const qrImg = isDark ? qrDarkRef.current : qrRef.current;
    await renderBadgeToCanvas(canvas, { name, position }, prefs, logoRef.current!, qrImg);
  }, [name, position, prefs, assetsReady]);

  useEffect(() => {
    drawBadge();
  }, [drawBadge]);

  // ── Download ──
  const downloadBadge = async () => {
    const blob = await generateBadgePngBlob({ name, position }, prefs);
    const link = document.createElement("a");
    link.download = `entermedschool-badge${name ? "-" + name.replace(/\s+/g, "-").toLowerCase() : ""}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ── Embed code ──
  const embedCode = generateAttributionEmbedHtml({ name, position });

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = embedCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updatePref = <K extends keyof BadgePreferences>(key: K, val: BadgePreferences[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* ── Left: Controls ── */}
      <div className="w-full space-y-3 lg:w-[340px] lg:flex-shrink-0">
        {/* Your Details */}
        <Section title={t("detailsSection")} icon={User} defaultOpen>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">
                {t("nameLabel")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border-2 border-showcase-navy/15 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-showcase-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">
                {t("positionLabel")}
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder={t("positionPlaceholder")}
                className="w-full rounded-lg border-2 border-showcase-navy/15 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-showcase-purple"
              />
            </div>
          </div>
        </Section>

        {/* Badge Style */}
        <Section title={t("styleSection")} icon={Sliders} defaultOpen>
          <div className="space-y-4">
            {/* Shape */}
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-2">
                {t("shapeLabel")}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {shapeList.map((shape) => {
                  const Icon = shapeIcons[shape];
                  const active = prefs.badgeShape === shape;
                  return (
                    <button
                      key={shape}
                      onClick={() => updatePref("badgeShape", shape)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 text-[10px] font-bold transition-all ${
                        active
                          ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                          : "border-showcase-navy/10 text-ink-muted hover:border-showcase-navy/20"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(`shapes.${shape}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-2">
                {t("sizeLabel")}
              </label>
              <div className="flex gap-1.5">
                {sizeList.map((size) => {
                  const active = prefs.badgeSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => updatePref("badgeSize", size)}
                      className={`flex-1 rounded-lg border-2 py-1.5 text-xs font-bold transition-all ${
                        active
                          ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                          : "border-showcase-navy/10 text-ink-muted hover:border-showcase-navy/20"
                      }`}
                    >
                      {t(`sizes.${size}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Colors & Background */}
        <Section title={t("colorsSection")} icon={Palette}>
          <div className="space-y-4">
            {/* Color Theme */}
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-2">
                {t("colorThemeLabel")}
              </label>
              <div className="flex flex-wrap gap-2">
                {themeList.map((theme) => {
                  const active = prefs.badgeColorTheme === theme;
                  const color = theme === "custom" ? prefs.customColor : THEME_COLORS[theme];
                  return (
                    <button
                      key={theme}
                      onClick={() => updatePref("badgeColorTheme", theme)}
                      className={`flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold transition-all ${
                        active
                          ? "border-showcase-purple bg-showcase-purple/5 text-ink-dark"
                          : "border-showcase-navy/10 text-ink-muted hover:border-showcase-navy/20"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                      {t(`themes.${theme}`)}
                    </button>
                  );
                })}
              </div>
              {prefs.badgeColorTheme === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={prefs.customColor}
                    onChange={(e) => updatePref("customColor", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border-2 border-showcase-navy/10"
                  />
                  <input
                    type="text"
                    value={prefs.customColor}
                    onChange={(e) => updatePref("customColor", e.target.value)}
                    className="w-24 rounded-lg border-2 border-showcase-navy/15 px-2 py-1 text-xs font-mono outline-none focus:border-showcase-purple"
                    placeholder="#6C5CE7"
                  />
                </div>
              )}
            </div>

            {/* Background */}
            <div>
              <label className="block text-xs font-bold text-ink-dark mb-2">
                {t("bgStyleLabel")}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {bgStyleList.map((bg) => {
                  const active = prefs.badgeBgStyle === bg;
                  return (
                    <button
                      key={bg}
                      onClick={() => updatePref("badgeBgStyle", bg)}
                      className={`rounded-lg border-2 py-1.5 text-xs font-bold transition-all ${
                        active
                          ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                          : "border-showcase-navy/10 text-ink-muted hover:border-showcase-navy/20"
                      }`}
                    >
                      {t(`bgStyles.${bg}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Options */}
        <Section title={t("optionsSection")} icon={Sliders}>
          <div className="space-y-2.5">
            {([
              { key: "showQR" as const, label: t("showQR") },
              { key: "showFinePrint" as const, label: t("showFinePrint") },
              { key: "showPosition" as const, label: t("showPosition") },
            ]).map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-showcase-navy/8 px-3 py-2 transition-colors hover:bg-gray-50"
              >
                <span className="text-xs font-semibold text-ink-dark">
                  {label}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => updatePref(key, e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-showcase-purple" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                </div>
              </label>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Right: Preview + Actions ── */}
      <div className="flex-1 space-y-5">
        {/* Preview */}
        <div>
          <h3 className="font-display text-sm font-bold text-ink-dark mb-3">
            {t("previewTitle")}
          </h3>
          <div className="overflow-x-auto rounded-2xl border-3 border-showcase-navy/10 bg-pastel-cream p-4 sm:p-6"
            style={{
              backgroundImage: prefs.badgeBgStyle === "transparent"
                ? "repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 0 0 / 16px 16px"
                : undefined,
            }}
          >
            <canvas
              ref={canvasRef}
              className="mx-auto max-w-full h-auto"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <ChunkyButton onClick={downloadBadge} variant="green" size="md">
            <Download className="h-4 w-4" />
            {t("downloadBtn")}
          </ChunkyButton>

          <ChunkyButton
            onClick={copyEmbedCode}
            variant={copied ? "teal" : "primary"}
            size="md"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t("copiedMsg") : t("copyEmbedBtn")}
          </ChunkyButton>
        </div>

        {/* Embed code preview */}
        <div>
          <h3 className="font-display text-sm font-bold text-ink-dark mb-2">
            {t("embedCodeLabel")}
          </h3>
          <p className="text-xs text-ink-muted mb-2">
            {t("embedCodeDescription")}
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-xl border-2 border-showcase-navy/10 bg-gray-50 p-3 text-xs text-ink-muted leading-relaxed whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
