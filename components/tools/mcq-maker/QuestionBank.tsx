"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  ChevronDown,
  ArrowUpDown,
  Tag,
  HelpCircle,
  BarChart3,
  X,
} from "lucide-react";
import { useMCQ } from "./MCQContext";
import type { MCQQuestion } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────
import { OPTION_LETTERS } from "./constants";

type SortField = "date" | "category" | "difficulty" | "question";
type SortDir = "asc" | "desc";

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };
const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

// ── Component ────────────────────────────────────────────────────────
export default function QuestionBank() {
  const t = useTranslations("tools.mcqMaker.ui");
  const {
    questions,
    removeQuestion,
    removeQuestions,
    setEditingQuestion,
    setActivePanel,
    setSelectedQuestionId,
    selectedQuestionId,
    allCategories,
    allTags,
  } = useMCQ();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // ── Filtering & sorting ────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...questions];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.options.some((o) => o.text.toLowerCase().includes(q)) ||
          (item.explanation ?? "").toLowerCase().includes(q) ||
          (item.category ?? "").toLowerCase().includes(q),
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter) {
      result = result.filter((item) => item.difficulty === difficultyFilter);
    }

    // Tag filter
    if (tagFilter) {
      result = result.filter((item) => (item.tags ?? []).includes(tagFilter));
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = a.updatedAt - b.updatedAt;
          break;
        case "category":
          cmp = (a.category ?? "").localeCompare(b.category ?? "");
          break;
        case "difficulty":
          cmp =
            (DIFFICULTY_ORDER[a.difficulty ?? "medium"] ?? 1) -
            (DIFFICULTY_ORDER[b.difficulty ?? "medium"] ?? 1);
          break;
        case "question":
          cmp = a.question.localeCompare(b.question);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
    questions,
    searchQuery,
    categoryFilter,
    difficultyFilter,
    tagFilter,
    sortField,
    sortDir,
  ]);

  // ── Selection ──────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((q) => q.id)));
    }
  }, [filtered, selectedIds.size]);

  const deleteSelected = useCallback(() => {
    if (
      !window.confirm(
        `Delete ${selectedIds.size} selected question${selectedIds.size !== 1 ? "s" : ""}? This cannot be undone.`,
      )
    )
      return;
    removeQuestions(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds, removeQuestions]);

  // ── Edit ───────────────────────────────────────────────────────────
  const handleEdit = useCallback(
    (q: MCQQuestion) => {
      setEditingQuestion(q);
      setActivePanel("editor");
    },
    [setEditingQuestion, setActivePanel],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm(t("deleteConfirmSingle")))
        return;
      removeQuestion(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [removeQuestion],
  );

  // ── Sort toggle ────────────────────────────────────────────────────
  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField],
  );

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const easy = questions.filter((q) => q.difficulty === "easy").length;
    const medium = questions.filter((q) => q.difficulty === "medium").length;
    const hard = questions.filter((q) => q.difficulty === "hard").length;
    const unset = questions.length - easy - medium - hard;
    const categories = new Set(questions.map((q) => q.category).filter(Boolean))
      .size;
    return { easy, medium, hard, unset, categories, total: questions.length };
  }, [questions]);

  // ── Active filter count ────────────────────────────────────────────
  const activeFilterCount = [categoryFilter, difficultyFilter, tagFilter].filter(
    Boolean,
  ).length;

  const clearFilters = useCallback(() => {
    setCategoryFilter(null);
    setDifficultyFilter(null);
    setTagFilter(null);
    setSearchQuery("");
  }, []);

  // ── Empty state ────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-pastel-lavender mb-4">
          <HelpCircle className="h-10 w-10 text-showcase-purple/40 animate-float-gentle" />
        </div>
        <p className="font-display text-lg font-bold text-ink-dark">
          {t("noQuestionsYet")}
        </p>
        <p className="mt-1 text-sm text-ink-muted max-w-xs">
          {t("createOrImport")}
        </p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActivePanel("editor")}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-4 py-2 font-display text-sm font-bold text-white shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky transition-all"
          >
            {t("createQuestion")}
          </button>
          <button
            onClick={() => setActivePanel("import")}
            className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-teal px-4 py-2 font-display text-sm font-bold text-white shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky transition-all"
          >
            {t("importCsv")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Stats bar */}
      <div className="flex items-center gap-3 rounded-xl border-2 border-ink-light/15 bg-pastel-cream/30 px-3 py-2">
        <BarChart3 className="h-4 w-4 text-ink-muted shrink-0" />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span className="font-bold text-ink-dark">{t("questionsCountLabel", { count: stats.total })}</span>
          <span className="text-showcase-purple">{t("categoriesCount", { count: stats.categories })}</span>
          {stats.easy > 0 && <span className="text-green-600">{t("easyCount", { count: stats.easy })}</span>}
          {stats.medium > 0 && (
            <span className="text-yellow-600">{t("mediumCount", { count: stats.medium })}</span>
          )}
          {stats.hard > 0 && <span className="text-red-600">{t("hardCount", { count: stats.hard })}</span>}
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border-2 border-ink-light/30 bg-white pl-9 pr-3 py-2 text-sm text-ink-dark placeholder:text-ink-light/50 focus:border-showcase-purple focus:outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all ${
            showFilters || activeFilterCount > 0
              ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
              : "border-ink-light/30 bg-white text-ink-muted hover:border-showcase-purple/50"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          {t("filter")}
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-showcase-purple text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={() => toggleSort(sortField)}
          className="inline-flex items-center gap-1 rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-xs font-bold text-ink-muted hover:border-showcase-purple/50 transition-all"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-xl border-2 border-ink-light/15 bg-white p-3">
          {/* Category */}
          <div className="relative">
            <select
              value={categoryFilter ?? ""}
              onChange={(e) =>
                setCategoryFilter(e.target.value || null)
              }
              className="appearance-none rounded-lg border-2 border-ink-light/20 bg-white pl-3 pr-7 py-1.5 text-xs font-bold text-ink-dark focus:border-showcase-purple focus:outline-none"
            >
              <option value="">{t("allCategories")}</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light pointer-events-none" />
          </div>

          {/* Difficulty */}
          <div className="relative">
            <select
              value={difficultyFilter ?? ""}
              onChange={(e) =>
                setDifficultyFilter(e.target.value || null)
              }
              className="appearance-none rounded-lg border-2 border-ink-light/20 bg-white pl-3 pr-7 py-1.5 text-xs font-bold text-ink-dark focus:border-showcase-purple focus:outline-none"
            >
              <option value="">{t("allDifficulties")}</option>
              <option value="easy">{t("easy")}</option>
              <option value="medium">{t("medium")}</option>
              <option value="hard">{t("hard")}</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light pointer-events-none" />
          </div>

          {/* Tag */}
          {allTags.length > 0 && (
            <div className="relative">
              <select
                value={tagFilter ?? ""}
                onChange={(e) => setTagFilter(e.target.value || null)}
                className="appearance-none rounded-lg border-2 border-ink-light/20 bg-white pl-3 pr-7 py-1.5 text-xs font-bold text-ink-dark focus:border-showcase-purple focus:outline-none"
              >
                <option value="">{t("allTags")}</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light pointer-events-none" />
            </div>
          )}

          {/* Sort by */}
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="appearance-none rounded-lg border-2 border-ink-light/20 bg-white pl-3 pr-7 py-1.5 text-xs font-bold text-ink-dark focus:border-showcase-purple focus:outline-none"
            >
              <option value="date">{t("sortDate")}</option>
              <option value="question">{t("sortQuestion")}</option>
              <option value="category">{t("sortCategory")}</option>
              <option value="difficulty">{t("sortDifficulty")}</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light pointer-events-none" />
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:underline"
            >
              <X className="h-3 w-3" />
              {t("clear")}
            </button>
          )}
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/5 px-3 py-2">
          <span className="text-xs font-bold text-showcase-purple">
            {t("selectedCount", { count: selectedIds.size })}
          </span>
          <button
            onClick={deleteSelected}
            className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-200 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            {t("delete")}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs font-bold text-ink-muted hover:underline ml-auto"
          >
            {t("deselect")}
          </button>
        </div>
      )}

      {/* Question list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1">
        {/* Select all */}
        {filtered.length > 0 && (
          <button
            onClick={selectAll}
            className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold text-ink-muted hover:text-showcase-purple transition-colors"
          >
            {selectedIds.size === filtered.length ? (
              <CheckSquare className="h-3.5 w-3.5" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}
            {selectedIds.size === filtered.length
              ? t("deselectAll")
              : t("selectAll")}
          </button>
        )}

        {filtered.map((q, i) => {
          const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
          const correctIdx = q.options.findIndex(
            (o) => o.id === q.correctOptionId,
          );
          const isSelected = selectedIds.has(q.id);

          return (
            <div
              key={q.id}
              className={`group flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 transition-all cursor-pointer ${
                selectedQuestionId === q.id
                  ? "border-showcase-purple bg-showcase-purple/5"
                  : isSelected
                    ? "border-showcase-purple/30 bg-showcase-purple/5"
                    : "border-ink-light/20 bg-white hover:border-showcase-purple/30"
              }`}
              onClick={() => setSelectedQuestionId(q.id)}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(q.id);
                }}
                className="mt-0.5 shrink-0 text-ink-light hover:text-showcase-purple transition-colors"
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-showcase-purple" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink-dark truncate">
                  <span className="text-ink-muted mr-1.5">{i + 1}.</span>
                  {q.question || t("emptyQuestion")}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                  {correctOpt && (
                    <span className="text-showcase-teal font-bold">
                      {OPTION_LETTERS[correctIdx]}: {correctOpt.text}
                    </span>
                  )}
                  {q.difficulty && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${DIFFICULTY_STYLES[q.difficulty]}`}
                    >
                      {q.difficulty}
                    </span>
                  )}
                  {q.category && (
                    <span className="text-showcase-purple">{q.category}</span>
                  )}
                  {(q.tags ?? []).length > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <Tag className="h-2.5 w-2.5" />
                      {(q.tags ?? []).length}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions (visible on hover AND focus-within for keyboard users) */}
              <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(q);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:text-showcase-purple hover:bg-showcase-purple/10 transition-colors"
                  aria-label={t("editQuestionNum", { num: i + 1 })}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(q.id);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={t("deleteQuestionNum", { num: i + 1 })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && questions.length > 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <Search className="h-8 w-8 text-ink-light/40 mb-2" />
            <p className="text-sm font-bold text-ink-muted">
              {t("noMatching")}
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 text-xs font-bold text-showcase-purple hover:underline"
            >
              {t("clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
