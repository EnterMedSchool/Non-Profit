"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Download, FileImage } from "lucide-react";
import StickerBadge from "@/components/shared/StickerBadge";
import type { MediaAsset } from "@/data/media-assets";

/* ── Category → badge colour map ───────────────────────────────── */

const categoryBadgeColor: Record<string, "coral" | "teal" | "purple" | "pink" | "green" | "orange"> = {
  anatomy:   "coral",
  cells:     "teal",
  molecules: "purple",
  organs:    "pink",
  equipment: "orange",
  diagrams:  "green",
};

/* ── Component ─────────────────────────────────────────────────── */

interface MediaAssetCardProps {
  asset: MediaAsset;
}

export default function MediaAssetCard({ asset }: MediaAssetCardProps) {
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/resources/media/${asset.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-chunky-xl active:translate-y-0.5 active:shadow-chunky-sm"
    >
      {/* ── Image preview ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-pastel-cream">
        <Image
          src={asset.imagePath}
          alt={asset.name}
          fill
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Format badge (top-right) */}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border-2 border-showcase-navy bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted shadow-[1px_1px_0_#1a1a2e]">
          <FileImage className="h-3 w-3" />
          {asset.format.toUpperCase()}
        </span>
      </div>

      {/* ── Info section ── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category badge */}
        <StickerBadge
          color={categoryBadgeColor[asset.category] ?? "purple"}
          size="sm"
        >
          {asset.category}
        </StickerBadge>

        {/* Name */}
        <h3 className="mt-2 font-display text-base font-bold text-ink-dark line-clamp-2 group-hover:text-showcase-purple transition-colors">
          {asset.name}
        </h3>

        {/* Short description (first sentence) */}
        <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-2">
          {asset.seoDescription}
        </p>

        {/* Bottom row */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-showcase-teal">{asset.license}</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-showcase-purple opacity-0 transition-opacity group-hover:opacity-100">
            <Download className="h-3.5 w-3.5" />
            View &amp; Download
          </span>
        </div>
      </div>
    </Link>
  );
}
