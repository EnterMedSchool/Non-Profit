"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Search, X, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import { saveAs } from "file-saver";
import AnimatedSection from "@/components/shared/AnimatedSection";
import TemplateCard from "@/components/professors/TemplateCard";
import TemplatePreviewModal from "@/components/professors/TemplatePreviewModal";
import {
  professorTemplates,
  templateCategories,
  type ProfessorTemplate,
  type TemplateCategory,
} from "@/data/professor-templates";

/* ═══════════════════════════════════════════════════════════════════
   Template Gallery — client component
   Filterable, searchable grid of downloadable template cards.
   ═══════════════════════════════════════════════════════════════════ */

export default function TemplateGallery() {
  const t = useTranslations("professors.templates");

  /* ── State ── */
  const [activeCategory, setActiveCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] =
    useState<ProfessorTemplate | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ── Filtering ── */
  const filteredTemplates = useMemo(() => {
    let results = professorTemplates;

    // Category filter
    if (activeCategory !== "all") {
      results = results.filter((t) => t.category === activeCategory);
    }

    // Search filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.formatLabel.toLowerCase().includes(q),
      );
    }

    return results;
  }, [activeCategory, searchQuery]);

  /* ── Handlers ── */
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  const handlePreview = useCallback((template: ProfessorTemplate) => {
    setPreviewTemplate(template);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewTemplate(null);
  }, []);

  const handleDownload = useCallback(async (template: ProfessorTemplate) => {
    try {
      const response = await fetch(template.downloadPath);
      if (!response.ok) throw new Error(`Download failed (${response.status})`);
      const blob = await response.blob();
      saveAs(blob, `${template.id}.${template.format}`);
    } catch {
      // Fallback: open in new tab
      window.open(template.downloadPath, "_blank");
    }
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      <div className="mt-10">
        {/* ── Search bar ── */}
        <AnimatedSection delay={0.1} animation="fadeUp">
          <div className="relative mx-auto max-w-xl">
            <div className="relative flex items-center overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky transition-all focus-within:shadow-chunky-lg focus-within:-translate-y-0.5">
              <Search className="ms-4 h-5 w-5 flex-shrink-0 text-ink-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent px-3 py-3 text-base font-body text-ink-dark outline-none placeholder:text-ink-light"
                aria-label={t("searchPlaceholder")}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="me-3 flex h-7 w-7 items-center justify-center rounded-lg bg-pastel-lavender text-ink-muted transition-colors hover:bg-showcase-purple hover:text-white"
                  aria-label={t("clearSearch")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* ── Category filter pills ── */}
        <AnimatedSection delay={0.15} animation="fadeUp">
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {/* "All" pill */}
            <button
              onClick={() => setActiveCategory("all")}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-display font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${
                activeCategory === "all"
                  ? "border-showcase-navy bg-showcase-purple text-white shadow-chunky-sm"
                  : "border-showcase-navy/20 bg-white text-ink-dark hover:bg-pastel-lavender"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t("allCategories")}
            </button>

            {templateCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-display font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  activeCategory === cat.id
                    ? "border-showcase-navy bg-showcase-purple text-white shadow-chunky-sm"
                    : "border-showcase-navy/20 bg-white text-ink-dark hover:bg-pastel-lavender"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* ── Result count (when searching) ── */}
        {isSearching && (
          <p className="mt-3 text-center text-xs text-ink-muted">
            {filteredTemplates.length} {t("resultsFor")} &ldquo;{searchQuery}
            &rdquo;
          </p>
        )}

        {/* ── Template grid ── */}
        {filteredTemplates.length === 0 ? (
          <AnimatedSection delay={0.2} animation="fadeIn">
            <div className="mt-12 text-center">
              <p className="font-display text-lg font-bold text-ink-dark">
                {t("noResults")}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {t("noResultsHint")}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-navy/15 bg-pastel-lavender px-4 py-2 text-sm font-display font-bold text-showcase-purple transition-all hover:-translate-y-0.5 hover:bg-showcase-purple hover:text-white hover:shadow-md"
              >
                {t("clearFilters")}
              </button>
            </div>
          </AnimatedSection>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((tmpl, i) => (
              <AnimatedSection
                key={tmpl.id}
                delay={i * 0.06}
                animation="popIn"
                spring
              >
                <TemplateCard
                  template={tmpl}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                  index={i}
                />
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>

      {/* ── Preview modal ── */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={handleClosePreview}
        onDownload={handleDownload}
      />
    </>
  );
}
