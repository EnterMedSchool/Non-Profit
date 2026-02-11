"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { generateQRCodeDataURL } from "@/lib/qrcode";

interface EmbedAttributionProps {
  toolId: string;
  locale: string;
  /** "full" shows logo + QR + links; "compact" shows logo + link only */
  variant?: "full" | "compact";
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
const COM_URL = "https://entermedschool.com";

/**
 * Attribution footer rendered inside every embedded tool iframe.
 *
 * - Cannot be removed by the embedder (it's inside the iframe)
 * - All links are dofollow (no "nofollow") for SEO backlink value; noopener noreferrer added for security
 * - QR code points to the locale-specific tool page on entermedschool.org
 * - Links open in _blank so they escape the iframe
 */
export default function EmbedAttribution({
  toolId,
  locale,
  variant = "full",
}: EmbedAttributionProps) {
  const t = useTranslations("tools.embed");
  const toolUrl = `${BASE_URL}/${locale}/tools/${toolId}`;
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  // Set the correct lang on the html element for embed pages
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Only generate QR for the full variant
  useEffect(() => {
    if (variant !== "full") return;
    generateQRCodeDataURL({
      url: toolUrl,
      size: 120,
      foreground: "#1a1a2e",
      background: "#FFFFFF",
      margin: 1,
    }).then(setQrSrc);
  }, [toolUrl, variant]);

  // ── Compact variant ────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div className="mt-auto border-t border-showcase-navy/10 bg-white px-4 py-2">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Image
            src={`${BASE_URL}/logo.png`}
            alt="EnterMedSchool"
            width={16}
            height={16}
            className="shrink-0"
            unoptimized
          />
          <span className="text-[11px] text-ink-muted">{t("poweredBy")}</span>
          <a
            href={COM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-showcase-purple hover:underline"
          >
            EnterMedSchool
          </a>
          <span className="text-[10px] text-ink-light">·</span>
          <a
            href={toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] text-showcase-purple hover:underline"
          >
            {t("viewFullTool")}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    );
  }

  // ── Full variant (default) ─────────────────────────────────────────
  return (
    <div className="mt-auto border-t-3 border-showcase-navy/10 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {/* QR Code */}
        {qrSrc && (
          <a href={toolUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Image
              src={qrSrc}
              alt={`QR code for ${toolUrl}`}
              width={52}
              height={52}
              className="rounded-md border border-gray-200"
              unoptimized
            />
          </a>
        )}

        {/* Text & links */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Logo */}
            <Image
              src={`${BASE_URL}/logo.png`}
              alt="EnterMedSchool"
              width={20}
              height={20}
              className="shrink-0"
              unoptimized
            />
            <span className="text-xs text-ink-muted">{t("poweredBy")}</span>
            {/* Dofollow link to .com (main SEO backlink) */}
            <a
              href={COM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-showcase-purple hover:underline"
            >
              EnterMedSchool
            </a>
            <span className="text-[10px] text-ink-light">|</span>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
              {t("freeOpenSource")}
            </span>
          </div>
          {/* Dofollow link to .org tool page (locale-aware) */}
          <a
            href={toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-showcase-purple hover:underline"
          >
            {t("viewFullTool")} entermedschool.org
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
