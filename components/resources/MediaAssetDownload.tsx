"use client";

import { useState, useCallback } from "react";
import { Download, Copy, Check, Shield } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";
import type { MediaAsset } from "@/data/media-assets";

interface MediaAssetDownloadProps {
  asset: MediaAsset;
}

export default function MediaAssetDownload({ asset }: MediaAssetDownloadProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const attributionText = `"${asset.name}" by ${asset.attribution} — Licensed under ${asset.license}. https://entermedschool.org`;

  /* ── Copy attribution to clipboard ─────────────────────────── */
  const handleCopyAttribution = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(attributionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = attributionText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [attributionText]);

  /* ── Download the asset ────────────────────────────────────── */
  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const response = await fetch(asset.imagePath);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${asset.slug}.${asset.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Direct fallback
      const link = document.createElement("a");
      link.href = asset.imagePath;
      link.download = `${asset.slug}.${asset.format}`;
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [asset]);

  return (
    <div className="space-y-4">
      {/* Download button */}
      <ChunkyButton
        variant="primary"
        size="lg"
        onClick={handleDownload}
        className="w-full justify-center"
      >
        <Download className="h-5 w-5" />
        {downloading ? "Downloading..." : `Download ${asset.format.toUpperCase()}`}
      </ChunkyButton>

      {/* Copy attribution button */}
      <ChunkyButton
        variant="teal"
        size="md"
        onClick={handleCopyAttribution}
        className="w-full justify-center"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Attribution
          </>
        )}
      </ChunkyButton>

      {/* Attribution preview */}
      <div className="rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 p-3">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-showcase-teal" />
          <div>
            <p className="text-xs font-semibold text-showcase-teal">Attribution Required</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {attributionText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
