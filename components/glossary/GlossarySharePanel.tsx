"use client";

import { useState } from "react";
import { Link2, QrCode, Code2, Share2, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface GlossarySharePanelProps {
  termName: string;
  termUrl: string;
  definition: string;
}

export default function GlossarySharePanel({
  termName,
  termUrl,
  definition,
}: GlossarySharePanelProps) {
  const t = useTranslations("glossary.share");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  async function copyLink() {
    await navigator.clipboard.writeText(termUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function copyAsText() {
    const cleanDef = definition
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/<u>(.*?)<\/u>/g, "$1")
      .replace(/<[^>]+>/g, "");
    await navigator.clipboard.writeText(
      `${termName}\n\n${cleanDef}\n\nSource: ${termUrl}`,
    );
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }

  async function generateQR() {
    if (qrDataUrl) {
      setShowQR(!showQR);
      return;
    }
    try {
      const { generateQRCodeDataURL } = await import("@/lib/qrcode");
      const dataUrl = await generateQRCodeDataURL({
        url: termUrl,
        size: 200,
        foreground: "#1a1a2e",
      });
      setQrDataUrl(dataUrl);
      setShowQR(true);
    } catch {
      // QR generation failed silently
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Copy link */}
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/10 bg-white px-3 py-2 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-chunky"
      >
        {copiedLink ? (
          <Check className="h-4 w-4 text-showcase-green" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {copiedLink ? t("copied") : t("copyLink")}
      </button>

      {/* Copy as text */}
      <button
        onClick={copyAsText}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/10 bg-white px-3 py-2 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:border-showcase-teal/30 hover:shadow-chunky"
      >
        {copiedText ? (
          <Check className="h-4 w-4 text-showcase-green" />
        ) : (
          <Code2 className="h-4 w-4" />
        )}
        {copiedText ? t("copied") : t("copyText")}
      </button>

      {/* QR code */}
      <button
        onClick={generateQR}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/10 bg-white px-3 py-2 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:border-showcase-yellow/30 hover:shadow-chunky"
      >
        <QrCode className="h-4 w-4" />
        {t("qrCode")}
      </button>

      {/* Share */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: termName,
              text: `${termName} — Medical Glossary`,
              url: termUrl,
            });
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-dark/10 bg-white px-3 py-2 text-sm font-semibold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:border-showcase-pink/30 hover:shadow-chunky"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {/* QR Code popup */}
      {showQR && qrDataUrl && (
        <div className="mt-3 w-full rounded-2xl border-3 border-ink-dark/10 bg-white p-4 shadow-chunky text-center">
          <img
            src={qrDataUrl}
            alt={`QR code for ${termName}`}
            className="mx-auto"
            width={200}
            height={200}
          />
          <p className="mt-2 text-xs text-ink-muted">
            Scan to open this term on any device
          </p>
        </div>
      )}
    </div>
  );
}
