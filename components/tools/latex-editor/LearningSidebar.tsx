"use client";

import { useState, useEffect, useCallback } from "react";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  BookOpen,
  HelpCircle,
  X,
  Sparkles,
  Play,
  CheckCircle2,
  Circle,
} from "lucide-react";

/* ── Lessons data ────────────────────────────────────────── */

interface CodeBlock {
  code: string;
  label?: string;
}

interface Lesson {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  content: string;
  codeBlocks: CodeBlock[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

const LESSONS: Lesson[] = [
  {
    id: "what-is-latex",
    title: "What is LaTeX?",
    icon: HelpCircle,
    content: `LaTeX (pronounced "LAH-tek" or "LAY-tek") is a document preparation system used by scientists, researchers, and students worldwide.

Unlike Microsoft Word, where you format text visually, in LaTeX you write commands that describe the structure of your document. LaTeX then formats it beautifully for you.

Why use LaTeX?
- Produces publication-quality documents
- Handles math equations perfectly
- Manages references automatically
- Creates consistent formatting throughout
- Used by most scientific journals
- Free and open source

Think of it like HTML for websites — you write the structure, and LaTeX handles the design.`,
    codeBlocks: [],
    quiz: {
      question: "What does LaTeX do?",
      options: [
        "It's a drawing tool",
        "It formats documents from commands you write",
        "It's a programming language for apps",
        "It edits photos",
      ],
      correctIndex: 1,
    },
  },
  {
    id: "document-structure",
    title: "Document Structure",
    icon: BookOpen,
    content: `Every LaTeX document has two parts:

1. THE PREAMBLE (before \\begin{document})
   This is where you set up your document.

2. THE BODY (between \\begin{document} and \\end{document})
   This is your actual content.`,
    codeBlocks: [
      {
        label: "Basic document skeleton",
        code: `\\documentclass{article}
\\usepackage{amsmath}
\\title{My Title}
\\author{My Name}
\\begin{document}
\\maketitle
Your content here...
\\end{document}`,
      },
    ],
    quiz: {
      question: "Where do you put \\usepackage commands?",
      options: [
        "Inside \\begin{document}...\\end{document}",
        "At the very end of the file",
        "In the preamble (before \\begin{document})",
        "It doesn't matter",
      ],
      correctIndex: 2,
    },
  },
  {
    id: "formatting-text",
    title: "Formatting Text",
    icon: BookOpen,
    content: `Basic text formatting in LaTeX:

BOLD: \\textbf{bold text}
ITALIC: \\textit{italic text}
UNDERLINE: \\underline{underlined text}

SPECIAL CHARACTERS:
Some characters have special meaning in LaTeX:
  % — comment (use \\% for literal)
  $ — math mode (use \\$ for literal)
  & — table column separator (use \\& for literal)
  _ — subscript in math (use \\_ for literal)`,
    codeBlocks: [
      {
        label: "Try formatting text",
        code: `\\textbf{This is bold text}
\\textit{This is italic text}
\\underline{This is underlined}
\\textbf{\\textit{Bold and italic}}`,
      },
    ],
    quiz: {
      question: "Which command makes text bold?",
      options: ["\\bold{text}", "\\textbf{text}", "\\b{text}", "**text**"],
      correctIndex: 1,
    },
  },
  {
    id: "math-basics",
    title: "Working with Math",
    icon: BookOpen,
    content: `LaTeX excels at typesetting mathematics!

INLINE MATH (within text):
  $E = mc^2$ → appears inline with text

DISPLAY MATH (centered, on its own line):
  Use $$ or \\begin{equation}

COMMON OPERATIONS:
  Superscript: $x^2$ or $x^{10}$
  Subscript: $x_1$ or $x_{max}$
  Fraction: $\\frac{a}{b}$
  Square root: $\\sqrt{x}$
  Greek letters: $\\alpha, \\beta, \\gamma$`,
    codeBlocks: [
      {
        label: "Math examples",
        code: `Here is inline math: $E = mc^2$

And a display equation:
$$
  v = \\frac{V_{max} \\cdot [S]}{K_m + [S]}
$$`,
      },
    ],
    quiz: {
      question: "How do you write a fraction in LaTeX math?",
      options: ["a/b", "\\frac{a}{b}", "\\fraction{a,b}", "{a}/{b}"],
      correctIndex: 1,
    },
  },
  {
    id: "lists-tables",
    title: "Lists and Tables",
    icon: BookOpen,
    content: `BULLET LISTS use \\begin{itemize}
NUMBERED LISTS use \\begin{enumerate}

TABLES use \\begin{tabular}{columns}
Column types: l (left), c (center), r (right)
& separates columns, \\\\ ends rows`,
    codeBlocks: [
      {
        label: "Bullet list",
        code: `\\begin{itemize}
  \\item First point
  \\item Second point
  \\item Third point
\\end{itemize}`,
      },
      {
        label: "Simple table",
        code: `\\begin{tabular}{|l|c|r|}
  \\hline
  Left & Center & Right \\\\
  \\hline
  Data & Data & Data \\\\
  \\hline
\\end{tabular}`,
      },
    ],
  },
  {
    id: "images-figures",
    title: "Images and Figures",
    icon: BookOpen,
    content: `To include images, add \\usepackage{graphicx} to your preamble.

Use \\begin{figure} for a numbered figure with a caption.

PLACEMENT OPTIONS [h]:
  h — here, t — top of page, b — bottom, p — own page

NOTE: Images won't display in our preview, but they work in Overleaf.`,
    codeBlocks: [
      {
        label: "Figure with caption",
        code: `\\begin{figure}[h]
  \\centering
  \\includegraphics[width=0.8\\textwidth]{filename}
  \\caption{Description of the image}
  \\label{fig:myfig}
\\end{figure}`,
      },
    ],
  },
  {
    id: "references-citations",
    title: "References & Citations",
    icon: BookOpen,
    content: `CROSS-REFERENCES:
  1. Label something: \\label{sec:intro}
  2. Reference it: See Section~\\ref{sec:intro}
  LaTeX fills in the number automatically!

FOOTNOTES:
  This is a fact\\footnote{Source: WHO, 2024.}`,
    codeBlocks: [
      {
        label: "Cross-referencing example",
        code: `\\section{Introduction}
\\label{sec:intro}
This is the introduction.

Later... See Section~\\ref{sec:intro} for details.

Here is a footnote\\footnote{This appears at the bottom.}.`,
      },
    ],
  },
  {
    id: "common-mistakes",
    title: "Common Mistakes & Fixes",
    icon: BookOpen,
    content: `MISTAKE 1: Missing closing brace
  Wrong: \\textbf{bold text
  Right: \\textbf{bold text}

MISTAKE 2: Special characters without backslash
  Wrong: 50% of patients
  Right: 50\\% of patients

MISTAKE 3: Math outside math mode
  Wrong: x = 5 (plain text)
  Right: $x = 5$ (math mode)

MISTAKE 4: Forgetting \\end{...}
  Every \\begin{environment} needs a matching \\end{environment}

WHEN THINGS GO WRONG:
  - Read the error message — line numbers help!
  - Check for unmatched braces: { }
  - Check for unmatched environments
  - Try removing the last thing you added`,
    codeBlocks: [],
  },
];

/* ── Tips data ───────────────────────────────────────────── */

const TIPS = [
  "Use \\section{} to organize your thesis chapters — LaTeX numbers them automatically!",
  "Greek letters in math mode: $\\alpha$ (α), $\\beta$ (β), $\\gamma$ (γ), $\\delta$ (δ)",
  "Format species names in italics: \\textit{Escherichia coli}",
  "Use the booktabs package for publication-quality tables (\\toprule, \\midrule, \\bottomrule)",
  "The ~ character creates a non-breaking space — great before \\ref{} and \\cite{}",
  "Use \\% to write a literal percent sign (% alone starts a comment!)",
  "Double-compile your document for table of contents and cross-references to work",
  "Use \\frac{}{} for fractions: $\\frac{1}{2}$ gives you a beautiful ½",
  "Add \\usepackage{hyperref} to make all references clickable in the PDF",
  "Use $\\pm$ for plus-minus: great for reporting $mean \\pm SD$",
  "The enumerate environment auto-numbers items — no need to type numbers yourself!",
  "Use -- for an en-dash (page ranges) and --- for an em-dash (parenthetical)",
];

const PROGRESS_KEY = "ems-latex-learning-progress";

/* ── Component ───────────────────────────────────────────── */

export default function LearningSidebar() {
  const { setActivePanel, insertAtCursor } = useLaTeXEditor();
  const [expandedLesson, setExpandedLesson] = useState<string | null>("what-is-latex");
  const [tipIndex, setTipIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});

  // Load progress on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.completed) setCompletedLessons(new Set(data.completed));
      }
    } catch {
      /* noop */
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((completed: Set<string>) => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ completed: Array.from(completed) }));
    } catch {
      /* noop */
    }
  }, []);

  const markComplete = (lessonId: string) => {
    const next = new Set(completedLessons);
    next.add(lessonId);
    setCompletedLessons(next);
    saveProgress(next);
  };

  const handleQuizAnswer = (lessonId: string, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [lessonId]: optionIndex }));
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (lesson?.quiz && optionIndex === lesson.quiz.correctIndex) {
      markComplete(lessonId);
    }
  };

  const nextTip = () => setTipIndex((i) => (i + 1) % TIPS.length);

  const progress = Math.round((completedLessons.size / LESSONS.length) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-ink-dark/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={15} className="text-showcase-purple" />
            <h3 className="text-sm font-bold text-ink-dark">Learn LaTeX</h3>
          </div>
          <button
            onClick={() => setActivePanel(null)}
            className="p-1 rounded-md text-ink-light hover:text-ink-muted hover:bg-pastel-cream transition-colors lg:hidden"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-[10px] text-ink-muted mt-1">
          Step-by-step lessons to master LaTeX for your academic writing.
        </p>
        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-ink-dark/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-showcase-purple rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-showcase-purple">{progress}%</span>
        </div>
      </div>

      {/* Tip of the moment */}
      <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <Lightbulb size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-amber-800 mb-1">Tip</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              {TIPS[tipIndex]}
            </p>
            <button
              onClick={nextTip}
              className="mt-1.5 text-[10px] font-semibold text-amber-600 hover:text-amber-800"
            >
              Next tip &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Lessons accordion */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-1">
        <h4 className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
          LaTeX Basics
        </h4>
        {LESSONS.map((lesson) => {
          const isExpanded = expandedLesson === lesson.id;
          const isComplete = completedLessons.has(lesson.id);
          const Icon = lesson.icon;
          return (
            <div
              key={lesson.id}
              className="border border-ink-dark/5 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedLesson(isExpanded ? null : lesson.id)
                }
                className={`flex items-center gap-2 w-full px-3 py-2.5 text-start transition-colors ${
                  isExpanded
                    ? "bg-showcase-purple/5"
                    : "hover:bg-pastel-cream/50"
                }`}
              >
                {/* Completion indicator */}
                {isComplete ? (
                  <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                ) : isExpanded ? (
                  <ChevronDown size={12} className="text-showcase-purple flex-shrink-0" />
                ) : (
                  <Circle size={12} className="text-ink-dark/20 flex-shrink-0" />
                )}
                <Icon size={13} className={isExpanded ? "text-showcase-purple" : "text-ink-muted"} />
                <span
                  className={`text-xs font-medium flex-1 ${
                    isExpanded ? "text-showcase-purple" : "text-ink-dark"
                  }`}
                >
                  {lesson.title}
                </span>
                {isComplete && (
                  <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    DONE
                  </span>
                )}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 bg-white space-y-3">
                  {/* Lesson text */}
                  <pre className="text-[11px] text-ink-muted leading-relaxed whitespace-pre-wrap font-sans">
                    {lesson.content}
                  </pre>

                  {/* Code blocks with "Try This" buttons */}
                  {lesson.codeBlocks.map((block, i) => (
                    <div key={i} className="rounded-lg border border-ink-dark/8 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-ink-dark/5">
                        <span className="text-[10px] font-semibold text-ink-muted">
                          {block.label || "Example"}
                        </span>
                        <button
                          onClick={() => insertAtCursor("\n" + block.code + "\n")}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-showcase-purple/10 text-showcase-purple text-[10px] font-bold hover:bg-showcase-purple/20 transition-colors"
                        >
                          <Play size={8} />
                          Try This
                        </button>
                      </div>
                      <pre className="px-3 py-2 text-[11px] font-mono leading-relaxed text-ink-dark overflow-x-auto bg-white">
                        {highlightLatexCode(block.code)}
                      </pre>
                    </div>
                  ))}

                  {/* Quiz */}
                  {lesson.quiz && (
                    <div className="rounded-lg border-2 border-showcase-purple/20 p-3 bg-showcase-purple/5">
                      <p className="text-[11px] font-bold text-ink-dark mb-2">
                        Quick quiz: {lesson.quiz.question}
                      </p>
                      <div className="space-y-1">
                        {lesson.quiz.options.map((option, oi) => {
                          const selected = quizAnswers[lesson.id] === oi;
                          const isCorrect = oi === lesson.quiz!.correctIndex;
                          const answered = quizAnswers[lesson.id] !== undefined;
                          return (
                            <button
                              key={oi}
                              onClick={() => handleQuizAnswer(lesson.id, oi)}
                              disabled={answered}
                              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[11px] text-start transition-colors ${
                                answered && selected && isCorrect
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : answered && selected && !isCorrect
                                  ? "bg-red-100 text-red-700 border border-red-300"
                                  : answered && isCorrect
                                  ? "bg-green-50 text-green-600 border border-green-200"
                                  : "bg-white border border-ink-dark/10 hover:border-showcase-purple/30 text-ink-muted"
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 text-[8px] font-bold">
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswers[lesson.id] !== undefined && (
                        <p className={`mt-2 text-[10px] font-semibold ${
                          quizAnswers[lesson.id] === lesson.quiz.correctIndex
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {quizAnswers[lesson.id] === lesson.quiz.correctIndex
                            ? "Correct! Well done."
                            : `Not quite. The answer is: ${lesson.quiz.options[lesson.quiz.correctIndex]}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mark as complete */}
                  {!isComplete && !lesson.quiz && (
                    <button
                      onClick={() => markComplete(lesson.id)}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-showcase-purple hover:underline"
                    >
                      <CheckCircle2 size={10} />
                      Mark as complete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-ink-dark/5 bg-pastel-cream/30">
        <div className="flex items-center gap-2 text-[10px] text-ink-muted">
          <Sparkles size={10} className="text-showcase-purple" />
          <span>Click "Try This" on code examples to insert them into your editor</span>
        </div>
      </div>
    </div>
  );
}

/* ── Simple syntax highlighter (returns JSX) ──────────────── */

function highlightLatexCode(code: string): React.ReactNode {
  // Split code into segments and apply colors
  const parts: React.ReactNode[] = [];
  const regex = /(\\[a-zA-Z@]+)|(%[^\n]*)|(\$[^$]+\$)|(\{)|(\})|([^\\%${}\n]+|\n)/g;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(code)) !== null) {
    const [full] = match;
    if (match[1]) {
      // LaTeX command
      parts.push(<span key={key++} style={{ color: "#7c3aed", fontWeight: 600 }}>{full}</span>);
    } else if (match[2]) {
      // Comment
      parts.push(<span key={key++} style={{ color: "#94a3b8", fontStyle: "italic" }}>{full}</span>);
    } else if (match[3]) {
      // Math
      parts.push(<span key={key++} style={{ color: "#d946ef" }}>{full}</span>);
    } else if (match[4] || match[5]) {
      // Braces
      parts.push(<span key={key++} style={{ color: "#f59e0b" }}>{full}</span>);
    } else {
      parts.push(<span key={key++}>{full}</span>);
    }
  }

  return <>{parts}</>;
}
