"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Presentation,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import { useTranslations } from "next-intl";
import StickerBadge from "@/components/shared/StickerBadge";
import ChunkyButton from "@/components/shared/ChunkyButton";
import type { ProfessorTemplate } from "@/data/professor-templates";

/* ── Format icon mapping ─────────────────────────────────────────── */

const formatIcons: Record<string, React.ElementType> = {
  pptx: Presentation,
  xlsx: FileSpreadsheet,
};

/* ── Component ───────────────────────────────────────────────────── */

interface TemplatePreviewModalProps {
  template: ProfessorTemplate | null;
  onClose: () => void;
  onDownload: (template: ProfessorTemplate) => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  onDownload,
}: TemplatePreviewModalProps) {
  const t = useTranslations("professors.templates");

  /* Close on Escape key */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!template) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [template, handleKeyDown]);

  const FormatIcon = template
    ? formatIcons[template.format] || Layers
    : Layers;

  return (
    <AnimatePresence>
      {template && (
        <m.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <m.div
            className="absolute inset-0 bg-showcase-navy/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal panel */}
          <m.div
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-label={template.title}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-showcase-navy/15 bg-white/90 text-ink-muted shadow-sm backdrop-blur-sm transition-all hover:bg-showcase-purple hover:text-white hover:shadow-md"
              aria-label={t("close")}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Thumbnail area */}
            <div className="relative w-full bg-gradient-to-br from-pastel-lavender via-pastel-sky to-pastel-mint">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={template.thumbnailPath}
                  alt={template.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            </div>

            {/* Info area */}
            <div className="p-5 sm:p-6">
              {/* Badges */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StickerBadge
                  color={template.format === "pptx" ? "purple" : "teal"}
                  size="sm"
                >
                  {template.formatLabel}
                </StickerBadge>
                {template.featured && (
                  <StickerBadge color="coral" size="sm">
                    {t("featured")}
                  </StickerBadge>
                )}
                {template.slideCount && (
                  <span className="text-xs text-ink-muted">
                    {template.slideCount}{" "}
                    {template.format === "pptx" ? t("slides") : t("sheets")}
                  </span>
                )}
              </div>

              {/* Title & description */}
              <h2 className="font-display text-xl font-extrabold text-ink-dark sm:text-2xl">
                {template.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {template.description}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-pastel-lavender/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-showcase-purple/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Download action */}
              <div className="mt-5 flex items-center gap-3">
                <ChunkyButton
                  variant="green"
                  size="md"
                  onClick={() => onDownload(template)}
                >
                  <Download className="h-4 w-4" />
                  {`${t("download")} .${template.format}`}
                </ChunkyButton>

                <ChunkyButton variant="ghost" size="md" onClick={onClose}>
                  {t("close")}
                </ChunkyButton>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
