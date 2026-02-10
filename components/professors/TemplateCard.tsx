"use client";

import Image from "next/image";
import { Download, Eye, FileSpreadsheet, Presentation, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import StickerBadge from "@/components/shared/StickerBadge";
import type { ProfessorTemplate } from "@/data/professor-templates";

/* ── Format icon mapping ─────────────────────────────────────────── */

const formatIcons: Record<string, React.ElementType> = {
  pptx: Presentation,
  xlsx: FileSpreadsheet,
};

const formatBadgeColors: Record<string, "purple" | "teal" | "orange"> = {
  pptx: "purple",
  xlsx: "teal",
};

/* ── Component ───────────────────────────────────────────────────── */

interface TemplateCardProps {
  template: ProfessorTemplate;
  onPreview: (template: ProfessorTemplate) => void;
  onDownload: (template: ProfessorTemplate) => void;
  index: number;
}

export default function TemplateCard({
  template,
  onPreview,
  onDownload,
}: TemplateCardProps) {
  const t = useTranslations("professors.templates");
  const FormatIcon = formatIcons[template.format] || Layers;
  const badgeColor = formatBadgeColors[template.format] || "purple";

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-chunky-xl">
      {/* ── Thumbnail area ── */}
      <button
        type="button"
        onClick={() => onPreview(template)}
        className="relative block w-full overflow-hidden bg-gradient-to-br from-pastel-lavender via-white to-pastel-sky"
        aria-label={`${t("preview")} ${template.title}`}
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={template.thumbnailPath}
            alt={template.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-showcase-navy/0 transition-colors duration-300 group-hover:bg-showcase-navy/30">
            <div className="flex h-12 w-12 scale-0 items-center justify-center rounded-full border-2 border-white bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-100">
              <Eye className="h-5 w-5 text-showcase-purple" />
            </div>
          </div>
        </div>
      </button>

      {/* ── Content area ── */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Badges row */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StickerBadge color={badgeColor} size="sm">
            {template.formatLabel}
          </StickerBadge>
          {template.featured && (
            <StickerBadge color="coral" size="sm">
              {t("featured")}
            </StickerBadge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold leading-snug text-ink-dark">
          {template.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-3">
          {template.description}
        </p>

        {/* Meta info */}
        {template.slideCount && (
          <p className="mt-2 text-xs text-ink-light">
            {template.slideCount}{" "}
            {template.format === "pptx" ? t("slides") : t("sheets")}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-navy/15 bg-pastel-lavender px-3 py-2 text-xs font-display font-bold text-showcase-purple transition-all hover:-translate-y-0.5 hover:bg-showcase-purple hover:text-white hover:shadow-md"
          >
            <Eye className="h-3.5 w-3.5" />
            {t("preview")}
          </button>

          <button
            type="button"
            onClick={() => onDownload(template)}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-navy/15 bg-showcase-green px-3 py-2 text-xs font-display font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Download className="h-3.5 w-3.5" />
            {t("download")}
          </button>
        </div>
      </div>
    </div>
  );
}
