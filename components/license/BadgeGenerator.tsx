"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Download, Copy, Check } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";
import { generateQRCodeImage } from "@/lib/qrcode";
import { saveAttribution, loadAttribution } from "@/lib/attribution";

export default function BadgeGenerator() {
  const t = useTranslations("license.generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const qrRef = useRef<HTMLImageElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [assetsReady, setAssetsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved attribution from localStorage on mount
  useEffect(() => {
    const saved = loadAttribution();
    if (saved) {
      if (saved.name) setName(saved.name);
      if (saved.position) setPosition(saved.position);
    }
  }, []);

  // Debounced save to localStorage on input change
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveAttribution({ name, position });
    }, 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [name, position]);

  // Preload logo + QR code
  useEffect(() => {
    let cancelled = false;
    const loadAssets = async () => {
      const [logoImg, qrImg] = await Promise.all([
        new Promise<HTMLImageElement>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img); // still resolve so we can fall back
          img.src = "/logo.png";
        }),
        generateQRCodeImage({
          url: "https://entermedschool.org",
          size: 256,
          foreground: "#1a1a2e",
          background: "#FFFFFF",
          margin: 1,
        }),
      ]);
      if (!cancelled) {
        logoRef.current = logoImg;
        qrRef.current = qrImg;
        setAssetsReady(true);
      }
    };
    loadAssets();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Canvas drawing ─────────────────────────────────────────────
  const drawBadge = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1000;
    const H = 150;
    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    // ── Rounded-rect background ──
    const r = 16;
    const drawRoundedRect = () => {
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(W - r, 0);
      ctx.quadraticCurveTo(W, 0, W, r);
      ctx.lineTo(W, H - r);
      ctx.quadraticCurveTo(W, H, W - r, H);
      ctx.lineTo(r, H);
      ctx.quadraticCurveTo(0, H, 0, H - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
    };

    // White fill
    drawRoundedRect();
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Clip so everything stays inside rounded corners
    ctx.save();
    drawRoundedRect();
    ctx.clip();

    // ── Left purple accent bar ──
    ctx.fillStyle = "#6C5CE7";
    ctx.fillRect(0, 0, 8, H);

    // ── QR code ──
    const qrSize = 100;
    const qrX = 28;
    const qrY = Math.round((H - qrSize) / 2);
    if (qrRef.current) {
      ctx.drawImage(qrRef.current, qrX, qrY, qrSize, qrSize);
    }

    // ── Subtle divider ──
    ctx.strokeStyle = "#e8e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(148, 20);
    ctx.lineTo(148, H - 20);
    ctx.stroke();

    // ── Logo ──
    const textStartX = 168;
    const logoSize = 30;
    const logoY = 22;
    if (logoRef.current && logoRef.current.naturalWidth > 0) {
      ctx.drawImage(logoRef.current, textStartX, logoY, logoSize, logoSize);
    }

    // ── "EnterMedSchool" + ".org" ──
    const brandX = textStartX + logoSize + 10;
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("EnterMedSchool", brandX, logoY + logoSize / 2);
    ctx.fillStyle = "#6C5CE7";
    const orgX = brandX + ctx.measureText("EnterMedSchool").width;
    ctx.fillText(".org", orgX, logoY + logoSize / 2);

    // ── User name ──
    const displayName = name.trim() || "Prof. Your Name";
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "middle";

    const nameY = position.trim() ? 78 : 88;
    ctx.fillText(displayName, textStartX, nameY);

    // ── Position / institution ──
    if (position.trim()) {
      ctx.fillStyle = "#6a6a8a";
      ctx.font = "500 14px system-ui, -apple-system, sans-serif";
      ctx.fillText(position, textStartX, 104);
    }

    // ── Fine print ──
    ctx.fillStyle = "#9999b0";
    ctx.font = "400 11px system-ui, -apple-system, sans-serif";
    ctx.fillText("Free for non-commercial educational use", textStartX, 132);

    // ── Right-side branding ──
    ctx.fillStyle = "#6C5CE7";
    ctx.font = "600 12px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("entermedschool.org", W - 24, H / 2);

    ctx.restore();

    // ── Border ──
    drawRoundedRect();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [name, position, assetsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    drawBadge();
  }, [drawBadge]);

  // ─── Download PNG ───────────────────────────────────────────────
  const downloadBadge = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `entermedschool-badge${name ? "-" + name.replace(/\s+/g, "-").toLowerCase() : ""}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ─── Embed code generation ─────────────────────────────────────
  const generateEmbedCode = () => {
    const displayName = name.trim() || "Your Name";
    const parts = [
      `<div style="display:inline-block;padding:6px 14px;border:1px solid #e2e2e2;border-radius:8px;font-family:system-ui,sans-serif;font-size:13px;color:#4a4a6a;background:#fafafa;line-height:1.6;">`,
      `  Resource by <strong>${escapeHtml(displayName)}</strong>`,
      position.trim() ? ` · ${escapeHtml(position.trim())}` : "",
      ` · <a href="https://entermedschool.com" style="color:#6C5CE7;text-decoration:none;font-weight:600;">EnterMedSchool</a>`,
      ` · <a href="https://entermedschool.org" style="color:#6C5CE7;text-decoration:none;font-weight:600;">entermedschool.org</a>`,
      `</div>`,
    ];
    return parts.join("");
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = generateEmbedCode();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-bold text-ink-dark mb-1.5">
            {t("nameLabel")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full rounded-xl border-3 border-showcase-navy/20 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-showcase-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink-dark mb-1.5">
            {t("positionLabel")}
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder={t("positionPlaceholder")}
            className="w-full rounded-xl border-3 border-showcase-navy/20 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-showcase-purple"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-display text-base font-bold text-ink-dark mb-3">
          {t("previewTitle")}
        </h3>
        <div className="overflow-x-auto rounded-2xl border-3 border-showcase-navy/10 bg-pastel-cream p-4">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto"
            style={{ imageRendering: "auto" }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ChunkyButton
          onClick={downloadBadge}
          variant="green"
          size="md"
        >
          <Download className="h-4 w-4" />
          {t("downloadBtn")}
        </ChunkyButton>

        <ChunkyButton
          onClick={copyEmbedCode}
          variant={copied ? "teal" : "primary"}
          size="md"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
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
            {generateEmbedCode()}
          </pre>
        </div>
      </div>
    </div>
  );
}

/** Escape HTML entities to prevent XSS in embed code */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
