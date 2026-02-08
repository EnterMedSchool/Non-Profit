"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  Sparkles,
  Tag,
  HelpCircle,
} from "lucide-react";
import { useMCQ } from "./MCQContext";
import type { MCQQuestion, MCQOption } from "./types";
import {
  OPTION_LETTERS,
  MAX_OPTIONS,
  MIN_OPTIONS,
  MAX_IMAGE_SIZE_BYTES,
  SAVE_FLASH_MS,
} from "./constants";

// ── Helpers ──────────────────────────────────────────────────────────
function createEmptyQuestion(): MCQQuestion {
  const optA = crypto.randomUUID();
  const optB = crypto.randomUUID();
  const optC = crypto.randomUUID();
  const optD = crypto.randomUUID();
  return {
    id: crypto.randomUUID(),
    question: "",
    options: [
      { id: optA, text: "", isCorrect: true },
      { id: optB, text: "", isCorrect: false },
      { id: optC, text: "", isCorrect: false },
      { id: optD, text: "", isCorrect: false },
    ],
    correctOptionId: optA,
    category: undefined,
    difficulty: undefined,
    explanation: "",
    points: 1,
    tags: [],
    source: "local",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "hard", label: "Hard", color: "bg-red-100 text-red-700 border-red-300" },
] as const;

// ── Component ────────────────────────────────────────────────────────
export default function QuestionEditor() {
  const {
    editingQuestion,
    setEditingQuestion,
    addQuestion,
    updateQuestion,
    questions,
    allCategories,
    setActivePanel,
    setSelectedQuestionId,
    editorDraft,
    setEditorDraft,
  } = useMCQ();

  // Initialize with editing question, persisted draft, or empty
  const [draft, setDraft] = useState<MCQQuestion>(
    () => editingQuestion ?? editorDraft ?? createEmptyQuestion(),
  );
  const [showExplanation, setShowExplanation] = useState(
    !!editingQuestion?.explanation,
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState(draft.category ?? "");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Clean up flash timeout on unmount (Phase 1.12)
  useEffect(() => {
    return () => clearTimeout(flashTimeoutRef.current);
  }, []);

  // Persist draft to context so it survives tab switches (Phase 4.2)
  useEffect(() => {
    setEditorDraft(draft);
  }, [draft, setEditorDraft]);

  // Sync when editingQuestion changes externally
  useEffect(() => {
    if (editingQuestion) {
      setDraft(editingQuestion);
      setCategoryInput(editingQuestion.category ?? "");
      setShowExplanation(!!editingQuestion.explanation);
    } else if (!editorDraft) {
      // Reset to empty when editing is cleared and no draft
      setDraft(createEmptyQuestion());
      setCategoryInput("");
      setShowExplanation(false);
    }
  }, [editingQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts (Phase 4.3) ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept in textareas for Ctrl+S
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "s") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAndView();
        } else {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }); // Re-attach on every render to capture latest handleSave

  // ── Draft helpers ──────────────────────────────────────────────────
  const updateDraft = useCallback(
    (patch: Partial<MCQQuestion>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const updateOption = useCallback(
    (optId: string, text: string) => {
      setDraft((prev) => ({
        ...prev,
        options: prev.options.map((o) =>
          o.id === optId ? { ...o, text } : o,
        ),
      }));
    },
    [],
  );

  const setCorrectOption = useCallback(
    (optId: string) => {
      setDraft((prev) => ({
        ...prev,
        correctOptionId: optId,
        options: prev.options.map((o) => ({
          ...o,
          isCorrect: o.id === optId,
        })),
      }));
    },
    [],
  );

  const addOption = useCallback(() => {
    if (draft.options.length >= MAX_OPTIONS) return;
    const newOpt: MCQOption = {
      id: crypto.randomUUID(),
      text: "",
      isCorrect: false,
    };
    setDraft((prev) => ({
      ...prev,
      options: [...prev.options, newOpt],
    }));
  }, [draft.options.length]);

  const removeOption = useCallback(
    (optId: string) => {
      if (draft.options.length <= MIN_OPTIONS) return;
      setDraft((prev) => {
        const filtered = prev.options.filter((o) => o.id !== optId);
        // If we removed the correct option, make the first one correct
        const correctStillExists = filtered.some(
          (o) => o.id === prev.correctOptionId,
        );
        if (!correctStillExists) {
          filtered[0].isCorrect = true;
          return {
            ...prev,
            options: filtered,
            correctOptionId: filtered[0].id,
          };
        }
        return { ...prev, options: filtered };
      });
    },
    [draft.options.length],
  );

  // ── Tags ───────────────────────────────────────────────────────────
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || (draft.tags ?? []).includes(tag)) {
      setTagInput("");
      return;
    }
    setDraft((prev) => ({
      ...prev,
      tags: [...(prev.tags ?? []), tag],
    }));
    setTagInput("");
  }, [tagInput, draft.tags]);

  const removeTag = useCallback((tag: string) => {
    setDraft((prev) => ({
      ...prev,
      tags: (prev.tags ?? []).filter((t) => t !== tag),
    }));
  }, []);

  // ── Image (with size limit — Phase 3.3) ───────────────────────────
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageError(null);

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setImageError(
          `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is 2 MB.`,
        );
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        updateDraft({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [updateDraft],
  );

  // ── Save ───────────────────────────────────────────────────────────
  const isValid =
    draft.question.trim().length > 0 &&
    draft.options.filter((o) => o.text.trim().length > 0).length >= 2 &&
    draft.options.some((o) => o.id === draft.correctOptionId && o.text.trim().length > 0);

  const handleSave = useCallback(() => {
    if (!isValid) return;
    const now = Date.now();
    const q: MCQQuestion = {
      ...draft,
      category: categoryInput.trim() || undefined,
      updatedAt: now,
    };

    const exists = questions.some((existing) => existing.id === q.id);
    if (exists) {
      updateQuestion(q.id, q);
    } else {
      q.createdAt = now;
      addQuestion(q);
    }

    // Flash with proper cleanup (Phase 1.12)
    setSaveFlash(true);
    clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(
      () => setSaveFlash(false),
      SAVE_FLASH_MS,
    );

    // Start a new blank question
    const newQ = createEmptyQuestion();
    setDraft(newQ);
    setEditorDraft(newQ);
    setEditingQuestion(null);
    setCategoryInput("");
    setShowExplanation(false);
    setShowAdvanced(false);
    setTagInput("");
    questionInputRef.current?.focus();
  }, [
    isValid,
    draft,
    categoryInput,
    questions,
    updateQuestion,
    addQuestion,
    setEditingQuestion,
    setEditorDraft,
  ]);

  const handleSaveAndView = useCallback(() => {
    if (!isValid) return;
    handleSave();
    setActivePanel("bank");
  }, [isValid, handleSave, setActivePanel]);

  // Category suggestions
  const filteredCategories = allCategories.filter(
    (c) =>
      c.toLowerCase().includes(categoryInput.toLowerCase()) &&
      c !== categoryInput,
  );

  // ── Unique IDs for label association (Phase 5.4) ─────────────────
  const questionId = "mcq-question-input";
  const categoryId = "mcq-category-input";
  const difficultyId = "mcq-difficulty-group";
  const pointsId = "mcq-points-input";
  const tagsId = "mcq-tags-input";

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink-dark flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-showcase-purple" />
          {editingQuestion ? "Edit Question" : "New Question"}
        </h2>
        {questions.length > 0 && (
          <button
            onClick={() => setActivePanel("bank")}
            className="text-xs font-bold text-showcase-purple hover:underline"
          >
            View All ({questions.length})
          </button>
        )}
      </div>

      {/* Success flash */}
      {saveFlash && (
        <div
          className="flex items-center gap-2 rounded-xl border-2 border-green-300 bg-green-50 px-3 py-2 text-sm font-bold text-green-700 animate-pop-in"
          role="status"
        >
          <Check className="h-4 w-4" />
          Question saved!
        </div>
      )}

      {/* Image error */}
      {imageError && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {imageError}
          <button
            onClick={() => setImageError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Question text */}
      <div>
        <label
          htmlFor={questionId}
          className="block text-sm font-bold text-ink-dark mb-1.5"
        >
          Question <span className="text-red-400">*</span>
        </label>
        <textarea
          id={questionId}
          ref={questionInputRef}
          value={draft.question}
          onChange={(e) => updateDraft({ question: e.target.value })}
          placeholder="e.g. What is the powerhouse of the cell?"
          rows={3}
          aria-required="true"
          className="w-full rounded-xl border-2 border-ink-light/30 bg-white px-4 py-3 text-sm text-ink-dark placeholder:text-ink-light/50 focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10 transition-all resize-none"
        />
      </div>

      {/* Image upload */}
      {draft.imageUrl && (
        <div className="relative rounded-xl border-2 border-ink-light/20 overflow-hidden">
          <img
            src={draft.imageUrl}
            alt="Question illustration"
            className="w-full max-h-40 object-contain bg-pastel-cream/30"
          />
          <button
            onClick={() => updateDraft({ imageUrl: undefined })}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 border border-ink-light/30 text-ink-muted hover:text-red-500 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-showcase-purple transition-colors"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {draft.imageUrl ? "Change image" : "Add image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          aria-label="Upload question image"
        />
      </div>

      {/* Answer Options */}
      <div>
        <label className="block text-sm font-bold text-ink-dark mb-1.5" id="mcq-options-label">
          Answer Options <span className="text-red-400">*</span>
          <span className="ml-2 text-xs font-normal text-ink-muted">
            Select the correct answer
          </span>
        </label>
        <div className="flex flex-col gap-2" role="group" aria-labelledby="mcq-options-label">
          {draft.options.map((opt, idx) => (
            <div key={opt.id} className="flex items-center gap-2">
              {/* Correct answer radio */}
              <button
                onClick={() => setCorrectOption(opt.id)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 text-xs font-bold transition-all ${
                  opt.id === draft.correctOptionId
                    ? "border-showcase-teal bg-showcase-teal text-white shadow-chunky-sm scale-105"
                    : "border-ink-light/30 bg-white text-ink-muted hover:border-showcase-teal/50"
                }`}
                aria-label={`Mark option ${OPTION_LETTERS[idx]} as correct`}
                aria-pressed={opt.id === draft.correctOptionId}
              >
                {opt.id === draft.correctOptionId ? (
                  <Check className="h-4 w-4" />
                ) : (
                  OPTION_LETTERS[idx]
                )}
              </button>

              {/* Option text */}
              <input
                type="text"
                value={opt.text}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                placeholder={`Option ${OPTION_LETTERS[idx]}`}
                aria-label={`Option ${OPTION_LETTERS[idx]} text`}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    idx === draft.options.length - 1 &&
                    draft.options.length < MAX_OPTIONS
                  ) {
                    e.preventDefault();
                    addOption();
                  }
                }}
                className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm text-ink-dark placeholder:text-ink-light/40 focus:outline-none focus:ring-2 focus:ring-showcase-purple/10 transition-all ${
                  opt.id === draft.correctOptionId
                    ? "border-showcase-teal/40 bg-showcase-teal/5 focus:border-showcase-teal"
                    : "border-ink-light/30 bg-white focus:border-showcase-purple"
                }`}
              />

              {/* Remove button */}
              {draft.options.length > MIN_OPTIONS && (
                <button
                  onClick={() => removeOption(opt.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-light hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Remove option ${OPTION_LETTERS[idx]}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {draft.options.length < MAX_OPTIONS && (
          <button
            onClick={addOption}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-showcase-purple hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add option ({draft.options.length}/{MAX_OPTIONS})
          </button>
        )}
      </div>

      {/* Explanation (collapsible) */}
      <div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-dark hover:text-showcase-purple transition-colors"
          aria-expanded={showExplanation}
        >
          {showExplanation ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Explanation
          <span className="text-xs font-normal text-ink-muted">(optional)</span>
        </button>
        {showExplanation && (
          <textarea
            value={draft.explanation ?? ""}
            onChange={(e) => updateDraft({ explanation: e.target.value })}
            placeholder="Explain why this is the correct answer..."
            rows={3}
            aria-label="Explanation"
            className="mt-2 w-full rounded-xl border-2 border-ink-light/30 bg-white px-4 py-3 text-sm text-ink-dark placeholder:text-ink-light/50 focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10 transition-all resize-none"
          />
        )}
      </div>

      {/* Category & Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category */}
        <div className="relative">
          <label htmlFor={categoryId} className="block text-xs font-bold text-ink-dark mb-1">
            Category
          </label>
          <input
            id={categoryId}
            type="text"
            value={categoryInput}
            onChange={(e) => {
              setCategoryInput(e.target.value);
              setShowCategorySuggestions(true);
            }}
            onFocus={() => setShowCategorySuggestions(true)}
            onBlur={() =>
              setTimeout(() => setShowCategorySuggestions(false), 150)
            }
            placeholder="e.g. Cell Biology"
            role="combobox"
            aria-expanded={showCategorySuggestions && filteredCategories.length > 0}
            aria-autocomplete="list"
            aria-controls="mcq-category-listbox"
            className="w-full rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10 transition-all"
          />
          {showCategorySuggestions && filteredCategories.length > 0 && (
            <div
              id="mcq-category-listbox"
              role="listbox"
              className="absolute z-10 mt-1 w-full rounded-xl border-2 border-ink-light/20 bg-white shadow-lg overflow-hidden"
            >
              {filteredCategories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    setCategoryInput(cat);
                    setShowCategorySuggestions(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-ink-dark hover:bg-pastel-lavender/30 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label id={difficultyId} className="block text-xs font-bold text-ink-dark mb-1">
            Difficulty
          </label>
          <div className="flex gap-1.5" role="group" aria-labelledby={difficultyId}>
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() =>
                  updateDraft({
                    difficulty:
                      draft.difficulty === d.value ? undefined : d.value,
                  })
                }
                aria-pressed={draft.difficulty === d.value}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-all ${
                  draft.difficulty === d.value
                    ? `${d.color} border-current scale-105`
                    : "border-ink-light/20 bg-white text-ink-muted hover:bg-gray-50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced (Tags, Points) */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted hover:text-showcase-purple transition-colors"
        aria-expanded={showAdvanced}
      >
        {showAdvanced ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        Advanced
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-3 rounded-xl border-2 border-ink-light/15 bg-pastel-cream/20 p-3">
          {/* Points */}
          <div>
            <label htmlFor={pointsId} className="block text-xs font-bold text-ink-dark mb-1">
              Points
            </label>
            <input
              id={pointsId}
              type="number"
              min={0}
              step={0.5}
              value={draft.points ?? 1}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateDraft({ points: Number.isNaN(val) ? 1 : val });
              }}
              className="w-24 rounded-lg border-2 border-ink-light/30 bg-white px-3 py-1.5 text-sm text-ink-dark focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10 transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor={tagsId} className="block text-xs font-bold text-ink-dark mb-1">
              <Tag className="inline h-3 w-3 mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(draft.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg bg-showcase-purple/10 px-2 py-0.5 text-xs font-bold text-showcase-purple"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id={tagsId}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 rounded-lg border-2 border-ink-light/30 bg-white px-3 py-1.5 text-xs text-ink-dark focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10 transition-all"
              />
              <button
                onClick={addTag}
                className="rounded-lg border-2 border-ink-light/30 bg-white px-3 py-1.5 text-xs font-bold text-ink-muted hover:border-showcase-purple hover:text-showcase-purple transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 mt-auto">
        <button
          onClick={handleSave}
          disabled={!isValid}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-3 px-4 py-2.5 font-display font-bold transition-all ${
            isValid
              ? "border-showcase-navy bg-showcase-purple text-white shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-chunky-sm"
              : "border-ink-light/20 bg-gray-100 text-ink-light cursor-not-allowed"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {editingQuestion ? "Update & New" : "Save & New"}
        </button>
        <button
          onClick={handleSaveAndView}
          disabled={!isValid}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border-3 px-4 py-2.5 font-display font-bold transition-all ${
            isValid
              ? "border-showcase-navy bg-showcase-teal text-white shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-chunky-sm"
              : "border-ink-light/20 bg-gray-100 text-ink-light cursor-not-allowed"
          }`}
        >
          <Check className="h-4 w-4" />
          Save
        </button>
      </div>
    </div>
  );
}
