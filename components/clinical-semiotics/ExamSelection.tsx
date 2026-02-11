"use client";

import { useState, useMemo, useEffect } from "react";
import { m } from "framer-motion";
import { Search, Star, Code, FileCode, Download } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type ExamType = string;

export type Exam = {
  type: ExamType;
  label: string;
  description: string;
  category: ExamCategory;
  featured: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
};

export type ExamCategory =
  | "all"
  | "cardiac"
  | "thoracic"
  | "vital-signs"
  | "neurological";

/* ------------------------------------------------------------------ */
/*  Exam data                                                          */
/* ------------------------------------------------------------------ */
const EXAMS: Exam[] = [
  {
    type: "cardiac",
    label: "Cardiac Examination",
    description:
      "Master cardiac auscultation and examination skills with interactive video walkthrough.",
    category: "cardiac",
    featured: true,
    difficulty: "intermediate",
  },
  {
    type: "thoracic",
    label: "Thoracic Examination Essentials",
    description:
      "Follow the inspection, palpation, and auscultation flow end to end.",
    category: "thoracic",
    featured: false,
    difficulty: "intermediate",
  },
  {
    type: "manual-bp",
    label: "Manual Blood Pressure Examination",
    description:
      "Practice accurate manual blood pressure measurement with Italian medical language.",
    category: "vital-signs",
    featured: true,
    difficulty: "beginner",
  },
];

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */
const CATEGORIES: { key: ExamCategory; label: string }[] = [
  { key: "all", label: "All Exams" },
  { key: "cardiac", label: "Cardiac" },
  { key: "thoracic", label: "Thoracic" },
  { key: "vital-signs", label: "Vital Signs" },
];

/* ------------------------------------------------------------------ */
/*  Difficulty badge colors                                            */
/* ------------------------------------------------------------------ */
const DIFFICULTY_STYLE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  beginner: {
    bg: "var(--cs-bg-mint)",
    text: "var(--cs-green)",
    border: "var(--cs-green)",
  },
  intermediate: {
    bg: "var(--cs-bg-lavender)",
    text: "var(--cs-purple)",
    border: "var(--cs-purple)",
  },
  advanced: {
    bg: "var(--cs-bg-peach)",
    text: "var(--cs-red)",
    border: "var(--cs-red)",
  },
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface ExamSelectionProps {
  onSelect: (examType: ExamType) => void;
  showTitle?: boolean;
  className?: string;
  unlockedExams?: ExamType[];
  onOpenEmbed?: (examType: ExamType) => void;
  onDownload?: (examType: ExamType) => void;
}

/* ------------------------------------------------------------------ */
/*  ExamCard sub-component                                             */
/* ------------------------------------------------------------------ */
function ExamCard({
  exam,
  onSelect,
  onOpenEmbed,
  onDownload,
  locale,
  t,
}: {
  exam: Exam;
  onSelect: (examType: ExamType) => void;
  onOpenEmbed?: (examType: ExamType) => void;
  onDownload?: (examType: ExamType) => void;
  locale: string;
  t: (key: string) => string;
}) {
  const diffStyle = DIFFICULTY_STYLE[exam.difficulty] ?? DIFFICULTY_STYLE.beginner;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn(
        "cs-exam-card",
        exam.featured && "featured",
      )}
      onClick={() => onSelect(exam.type)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(exam.type);
        }
      }}
    >
      {/* Top row: badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {exam.featured && (
          <span className="cs-badge-sticker cs-badge-yellow flex items-center gap-1">
            <Star className="w-3 h-3" />
            {t("featured")}
          </span>
        )}
        <span
          className="cs-badge-sticker text-[10px]"
          style={{
            backgroundColor: diffStyle.bg,
            color: diffStyle.text,
            borderColor: diffStyle.border,
          }}
        >
          {exam.difficulty}
        </span>
      </div>

      {/* Label */}
      <h3
        className="cs-font-display text-lg font-bold mb-1"
        style={{ color: "var(--cs-text-dark)" }}
      >
        {exam.label}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "var(--cs-text-muted)" }}
      >
        {exam.description}
      </p>

      {/* Action buttons — embed/share first, preview second */}
      <div
        className="flex items-center gap-2 flex-wrap"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {onOpenEmbed && (
          <button
            className="cs-btn cs-btn-primary cs-btn-sm flex items-center gap-1"
            onClick={() => onOpenEmbed(exam.type)}
          >
            <Code className="w-3.5 h-3.5" />
            {t("embedShare")}
          </button>
        )}

        <button
          className="cs-btn cs-btn-ghost cs-btn-sm"
          onClick={() => onSelect(exam.type)}
        >
          {t("preview")}
        </button>

        {onDownload && (
          <button
            className="cs-btn cs-btn-ghost cs-btn-sm flex items-center gap-1"
            onClick={() => onDownload(exam.type)}
          >
            <Download className="w-3.5 h-3.5" />
            {t("assets")}
          </button>
        )}

        <Link
          href={`/${locale}/clinical-semiotics/${exam.type}/embed-code`}
          className="cs-btn cs-btn-ghost cs-btn-sm flex items-center gap-1"
        >
          <FileCode className="w-3.5 h-3.5" />
          {t("getCode")}
        </Link>
      </div>
    </m.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ExamSelection({
  onSelect,
  showTitle = true,
  className,
  unlockedExams,
  onOpenEmbed,
  onDownload,
}: ExamSelectionProps) {
  const t = useTranslations("clinicalSemiotics.examSelection");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ExamCategory>("all");

  /* ---- Build exams with translations ---- */
  const exams: Exam[] = useMemo(() => {
    return EXAMS.map((s) => ({
      ...s,
      label: t(`exams.${s.type}.label`),
      description: t(`exams.${s.type}.description`),
    }));
  }, [t]);

  const categories = useMemo(
    () => CATEGORIES.map((c) => ({ key: c.key, label: t(`categories.${c.key}`) })),
    [t],
  );

  /* ---- Reset search when category changes ---- */
  useEffect(() => {
    setSearch("");
  }, [activeCategory]);

  /* ---- Filter exams ---- */
  const filteredExams = useMemo(() => {
    let list = exams;

    // Category filter
    if (activeCategory !== "all") {
      list = list.filter((e) => e.category === activeCategory);
    }

    // If unlockedExams is provided, only show unlocked exams
    if (unlockedExams) {
      list = list.filter((e) => unlockedExams.includes(e.type));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      );
    }

    // Sort: featured first, then alphabetical
    return [...list].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
  }, [search, activeCategory, unlockedExams, exams]);

  return (
    <div className={cn("cs-intro-bg min-h-screen", className)}>
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        {/* ---- Title ---- */}
        {showTitle && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h2 className="cs-font-display text-3xl md:text-4xl font-extrabold mb-2">
              {t("libraryTitle")}{" "}
              <span className="cs-underline-hand">{t("libraryHighlight")}</span>
            </h2>
            <p
              className="text-base md:text-lg"
              style={{ color: "var(--cs-text-muted)" }}
            >
              {t("subtitle")}
            </p>
          </m.div>
        )}

        {/* ---- Search ---- */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="cs-input-wrapper">
            <span className="cs-input-icon">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cs-input cs-input-with-icon"
            />
          </div>
        </m.div>

        {/* ---- Category pills ---- */}
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "cs-category-pill",
                activeCategory === cat.key && "active",
              )}
            >
              {cat.label}
            </button>
          ))}
        </m.div>

        {/* ---- Exam grid ---- */}
        {filteredExams.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.type}
                exam={exam}
                onSelect={onSelect}
                onOpenEmbed={onOpenEmbed}
                onDownload={onDownload}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        ) : (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cs-card-chunky p-8 text-center"
          >
            <p
              className="cs-font-display text-lg font-bold mb-1"
              style={{ color: "var(--cs-text-dark)" }}
            >
              {t("noExamsFound")}
            </p>
            <p className="text-sm" style={{ color: "var(--cs-text-muted)" }}>
              {t("noExamsHint")}
            </p>
          </m.div>
        )}
      </div>
    </div>
  );
}
