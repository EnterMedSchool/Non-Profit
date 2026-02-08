"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  ClipboardList,
  Settings,
  ChevronDown,
  ChevronUp,
  Clock,
  Shuffle,
  Target,
  GripVertical,
  BookOpen,
  Check,
  Edit3,
  HelpCircle,
} from "lucide-react";
import { useMCQ } from "./MCQContext";
import type { MCQExam, MCQExamSection, MCQExamSettings } from "./types";
import { DEFAULT_EXAM_SETTINGS } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────
function makeId() {
  return crypto.randomUUID();
}

// ── Component ────────────────────────────────────────────────────────
export default function ExamBuilder() {
  const {
    questions,
    exams,
    addExam,
    updateExam,
    removeExam,
    selectedExamId,
    setSelectedExamId,
    allCategories,
    setActivePanel,
  } = useMCQ();

  const [showSettings, setShowSettings] = useState(false);
  const [showNewExam, setShowNewExam] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addQuestionsCategory, setAddQuestionsCategory] = useState<Record<string, string>>({});

  const selectedExam = useMemo(
    () => exams.find((e) => e.id === selectedExamId) ?? null,
    [exams, selectedExamId],
  );

  // ── Create exam ────────────────────────────────────────────────────
  const handleCreateExam = useCallback(() => {
    if (!newTitle.trim()) return;
    const exam: MCQExam = {
      id: makeId(),
      title: newTitle.trim(),
      sections: [
        {
          id: makeId(),
          title: "Section 1",
          questionIds: [],
        },
      ],
      settings: { ...DEFAULT_EXAM_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addExam(exam);
    setSelectedExamId(exam.id);
    setNewTitle("");
    setShowNewExam(false);
  }, [newTitle, addExam, setSelectedExamId]);

  // ── Section management ─────────────────────────────────────────────
  const addSection = useCallback(() => {
    if (!selectedExam || !newSectionTitle.trim()) return;
    const section: MCQExamSection = {
      id: makeId(),
      title: newSectionTitle.trim(),
      questionIds: [],
    };
    updateExam(selectedExam.id, {
      sections: [...selectedExam.sections, section],
    });
    setNewSectionTitle("");
    setAddingSection(false);
  }, [selectedExam, newSectionTitle, updateExam]);

  const removeSection = useCallback(
    (secId: string) => {
      if (!selectedExam) return;
      updateExam(selectedExam.id, {
        sections: selectedExam.sections.filter((s) => s.id !== secId),
      });
    },
    [selectedExam, updateExam],
  );

  // ── Add questions to section ───────────────────────────────────────
  const addQuestionToSection = useCallback(
    (secId: string, qId: string) => {
      if (!selectedExam) return;
      updateExam(selectedExam.id, {
        sections: selectedExam.sections.map((s) =>
          s.id === secId && !s.questionIds.includes(qId)
            ? { ...s, questionIds: [...s.questionIds, qId] }
            : s,
        ),
      });
    },
    [selectedExam, updateExam],
  );

  const removeQuestionFromSection = useCallback(
    (secId: string, qId: string) => {
      if (!selectedExam) return;
      updateExam(selectedExam.id, {
        sections: selectedExam.sections.map((s) =>
          s.id === secId
            ? { ...s, questionIds: s.questionIds.filter((id) => id !== qId) }
            : s,
        ),
      });
    },
    [selectedExam, updateExam],
  );

  const addBulkToSection = useCallback(
    (secId: string) => {
      if (!selectedExam) return;
      const catFilter = addQuestionsCategory[secId] ?? "";
      const filtered = catFilter
        ? questions.filter((q) => q.category === catFilter)
        : questions;
      const section = selectedExam.sections.find((s) => s.id === secId);
      if (!section) return;
      const existing = new Set(section.questionIds);
      const newIds = filtered
        .filter((q) => !existing.has(q.id))
        .map((q) => q.id);
      updateExam(selectedExam.id, {
        sections: selectedExam.sections.map((s) =>
          s.id === secId
            ? { ...s, questionIds: [...s.questionIds, ...newIds] }
            : s,
        ),
      });
    },
    [selectedExam, questions, addQuestionsCategory, updateExam], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Settings update ────────────────────────────────────────────────
  const updateSettings = useCallback(
    (patch: Partial<MCQExamSettings>) => {
      if (!selectedExam) return;
      updateExam(selectedExam.id, {
        settings: { ...selectedExam.settings, ...patch },
      });
    },
    [selectedExam, updateExam],
  );

  // ── Computed stats ─────────────────────────────────────────────────
  const examStats = useMemo(() => {
    if (!selectedExam) return null;
    const allQIds = selectedExam.sections.flatMap((s) => s.questionIds);
    const examQuestions = allQIds
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean);
    const totalPoints = examQuestions.reduce(
      (sum, q) => sum + (q?.points ?? 1),
      0,
    );
    return {
      totalQuestions: allQIds.length,
      totalPoints,
      sections: selectedExam.sections.length,
    };
  }, [selectedExam, questions]);

  // ── Empty / no exam state ──────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-lavender/60 mb-3">
          <ClipboardList className="h-8 w-8 text-showcase-purple/30" />
        </div>
        <p className="font-display text-lg font-bold text-ink-dark">
          Exam Builder
        </p>
        <p className="mt-1 text-sm text-ink-muted max-w-xs">
          Add questions first, then build exams from your question bank.
        </p>
        <button
          onClick={() => setActivePanel("editor")}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-4 py-2 font-display text-sm font-bold text-white shadow-chunky-sm hover:-translate-y-0.5 hover:shadow-chunky transition-all"
        >
          Create Questions
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      <h2 className="font-display text-lg font-bold text-ink-dark flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-showcase-purple" />
        Exam Builder
      </h2>

      {/* Exam list / selector */}
      {exams.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedExamId(exam.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedExamId(exam.id);
                }
              }}
              className={`flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left transition-all cursor-pointer ${
                selectedExamId === exam.id
                  ? "border-showcase-purple bg-showcase-purple/5"
                  : "border-ink-light/20 bg-white hover:border-showcase-purple/30"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-ink-dark">{exam.title}</p>
                <p className="text-[10px] text-ink-muted">
                  {exam.sections.reduce(
                    (sum, s) => sum + s.questionIds.length,
                    0,
                  )}{" "}
                  questions
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeExam(exam.id);
                }}
                className="text-ink-light hover:text-red-500 transition-colors"
                aria-label={`Delete exam ${exam.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New exam */}
      {showNewExam ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Exam title..."
            onKeyDown={(e) => e.key === "Enter" && handleCreateExam()}
            className="flex-1 rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10"
            autoFocus
          />
          <button
            onClick={handleCreateExam}
            disabled={!newTitle.trim()}
            className="rounded-xl border-2 border-showcase-teal bg-showcase-teal px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewExam(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-showcase-purple/30 bg-showcase-purple/5 px-3 py-2.5 text-xs font-bold text-showcase-purple hover:bg-showcase-purple/10 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Create New Exam
        </button>
      )}

      {/* Selected exam editor */}
      {selectedExam && (
        <>
          {/* Stats */}
          {examStats && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-ink-light/15 bg-pastel-cream/30 px-3 py-2 text-xs text-ink-muted">
              <span className="font-bold text-ink-dark">
                {examStats.totalQuestions} questions
              </span>
              <span>{examStats.totalPoints} points</span>
              <span>{examStats.sections} sections</span>
            </div>
          )}

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-dark hover:text-showcase-purple transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Exam Settings
            {showSettings ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {showSettings && (
            <div className="flex flex-col gap-3 rounded-xl border-2 border-ink-light/15 bg-white p-3">
              {/* Time limit */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-ink-dark">
                  <Clock className="h-3.5 w-3.5" />
                  Time Limit (min)
                </label>
                <input
                  type="number"
                  min={0}
                  value={selectedExam.settings.timeLimit ?? ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    updateSettings({
                      timeLimit: isNaN(val) || val <= 0 ? undefined : val,
                    });
                  }}
                  placeholder="None"
                  className="w-20 rounded-lg border-2 border-ink-light/20 bg-white px-2 py-1 text-xs text-center focus:border-showcase-purple focus:outline-none"
                />
              </div>

              {/* Toggles */}
              {[
                {
                  key: "randomizeQuestions" as const,
                  label: "Randomize questions",
                  icon: Shuffle,
                },
                {
                  key: "randomizeOptions" as const,
                  label: "Randomize options",
                  icon: Shuffle,
                },
                {
                  key: "showFeedback" as const,
                  label: "Show feedback",
                  icon: Check,
                },
                {
                  key: "showExplanations" as const,
                  label: "Show explanations",
                  icon: BookOpen,
                },
                {
                  key: "allowReview" as const,
                  label: "Allow review",
                  icon: Edit3,
                },
                {
                  key: "showScore" as const,
                  label: "Show score",
                  icon: Target,
                },
              ].map((toggle) => {
                const Icon = toggle.icon;
                return (
                  <label
                    key={toggle.key}
                    className="flex items-center gap-2 text-xs text-ink-dark"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExam.settings[toggle.key] as boolean}
                      onChange={(e) =>
                        updateSettings({ [toggle.key]: e.target.checked })
                      }
                      className="accent-showcase-purple"
                    />
                    <Icon className="h-3 w-3 text-ink-muted" />
                    {toggle.label}
                  </label>
                );
              })}

              {/* Passing score */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-ink-dark">
                  <Target className="h-3.5 w-3.5" />
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={selectedExam.settings.passingScore ?? ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    updateSettings({
                      passingScore: isNaN(val) ? undefined : val,
                    });
                  }}
                  placeholder="None"
                  className="w-20 rounded-lg border-2 border-ink-light/20 bg-white px-2 py-1 text-xs text-center focus:border-showcase-purple focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="flex flex-col gap-3">
            {selectedExam.sections.map((section) => {
              const sectionQuestions = section.questionIds
                .map((id) => questions.find((q) => q.id === id))
                .filter(Boolean);

              return (
                <div
                  key={section.id}
                  className="rounded-xl border-2 border-ink-light/20 bg-white overflow-hidden"
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between bg-pastel-cream/40 px-3 py-2 border-b border-ink-light/10">
                    <span className="text-xs font-bold text-ink-dark">
                      {section.title}
                      <span className="ml-1 text-ink-muted font-normal">
                        ({section.questionIds.length})
                      </span>
                    </span>
                    {selectedExam.sections.length > 1 && (
                      <button
                        onClick={() => removeSection(section.id)}
                        className="text-ink-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Questions in section */}
                  <div className="p-2">
                    {sectionQuestions.length === 0 ? (
                      <p className="text-[10px] text-ink-muted text-center py-2">
                        No questions added yet
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {sectionQuestions.map((q, idx) =>
                          q ? (
                            <div
                              key={q.id}
                              className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs group hover:bg-gray-50"
                            >
                              <GripVertical className="h-3 w-3 text-ink-light shrink-0" />
                              <span className="text-ink-muted w-5 shrink-0">
                                {idx + 1}.
                              </span>
                              <span className="flex-1 truncate text-ink-dark">
                                {q.question}
                              </span>
                              <button
                                onClick={() =>
                                  removeQuestionFromSection(
                                    section.id,
                                    q.id,
                                  )
                                }
                                className="opacity-0 group-hover:opacity-100 text-ink-light hover:text-red-500 transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : null,
                        )}
                      </div>
                    )}

                    {/* Add questions */}
                    <div className="mt-2 flex gap-1.5">
                      <div className="relative flex-1">
                        <select
                          value={addQuestionsCategory[section.id] ?? ""}
                          onChange={(e) =>
                            setAddQuestionsCategory((prev) => ({
                              ...prev,
                              [section.id]: e.target.value,
                            }))
                          }
                          className="w-full appearance-none rounded-lg border border-ink-light/20 bg-white px-2 py-1 pr-6 text-[10px] text-ink-dark focus:outline-none"
                          aria-label={`Filter category for ${section.title}`}
                        >
                          <option value="">All categories</option>
                          {allCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-ink-light pointer-events-none" />
                      </div>
                      <button
                        onClick={() => addBulkToSection(section.id)}
                        className="rounded-lg bg-showcase-purple/10 px-2 py-1 text-[10px] font-bold text-showcase-purple hover:bg-showcase-purple/20 transition-colors"
                      >
                        Add All
                      </button>
                    </div>

                    {/* Individual question picker */}
                    <div className="mt-1.5 max-h-40 overflow-y-auto">
                      {questions
                        .filter(
                          (q) => !section.questionIds.includes(q.id),
                        )
                        .map((q) => (
                          <button
                            key={q.id}
                            onClick={() =>
                              addQuestionToSection(section.id, q.id)
                            }
                            className="flex w-full items-center gap-2 rounded px-2 py-0.5 text-[10px] text-ink-muted hover:bg-showcase-teal/10 hover:text-ink-dark transition-colors text-left"
                          >
                            <Plus className="h-2.5 w-2.5 shrink-0 text-showcase-teal" />
                            <span className="truncate">{q.question}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add section */}
            {addingSection ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Section title..."
                  onKeyDown={(e) => e.key === "Enter" && addSection()}
                  className="flex-1 rounded-lg border-2 border-ink-light/30 bg-white px-3 py-1.5 text-xs text-ink-dark focus:border-showcase-purple focus:outline-none focus:ring-2 focus:ring-showcase-purple/10"
                  autoFocus
                />
                <button
                  onClick={addSection}
                  disabled={!newSectionTitle.trim()}
                  className="rounded-lg bg-showcase-teal px-2 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                className="text-xs font-bold text-showcase-purple hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Section
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
