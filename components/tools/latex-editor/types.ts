/* ── LaTeX Editor Types ─────────────────────────────────────── */

export interface LaTeXDocument {
  id: string;
  name: string;
  content: string;
  isMain: boolean;
}

export interface CursorPosition {
  line: number;
  col: number;
}

export interface EditorSettings {
  fontSize: number;
  wordWrap: boolean;
  theme: "light" | "dark";
  showLineNumbers: boolean;
  autoPreview: boolean;
  splitRatio: number; // 0-100, percentage for editor width
}

export type SidePanel = "snippets" | "learning" | "files" | null;

export type TemplateCategory =
  | "getting-started"
  | "notes"
  | "essay"
  | "research"
  | "thesis"
  | "presentation"
  | "cv";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface LaTeXTemplate {
  id: string;
  language: string;
  title: string;
  description: string;
  category: TemplateCategory;
  difficulty: Difficulty;
  icon: string;
  tags: string[];
  files: {
    name: string;
    content: string;
    isMain: boolean;
  }[];
  previewDescription: string;
}

export interface LaTeXSnippet {
  id: string;
  language: string;
  title: string;
  category: string;
  icon: string;
  code: string;
  description: string;
  explanation: string;
  preview: string;
  difficulty: Difficulty;
  tags: string[];
  relatedSnippets: string[];
}

export interface CompileError {
  line: number;
  message: string;
  friendlyMessage: string;
  severity: "error" | "warning" | "info";
}

export const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  wordWrap: true,
  theme: "light",
  showLineNumbers: true,
  autoPreview: true,
  splitRatio: 50,
};

export const DEFAULT_DOCUMENT: LaTeXDocument = {
  id: "main",
  name: "main.tex",
  content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}

\\title{My First LaTeX Document}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Welcome to LaTeX! This is your first document. Try editing this text and watch the preview update in real-time.

\\section{What is LaTeX?}
LaTeX is a typesetting system used by scientists, researchers, and students around the world to create beautifully formatted documents. It is especially good at:

\\begin{itemize}
  \\item Formatting mathematical equations
  \\item Managing references and citations
  \\item Creating consistent, professional-looking documents
  \\item Handling large documents like theses
\\end{itemize}

\\section{Text Formatting}
You can make text \\textbf{bold}, \\textit{italic}, or \\underline{underlined}. You can also \\textbf{\\textit{combine them}}.

\\section{A Simple Equation}
Here is the famous Einstein equation:

$$E = mc^2$$

And here is an inline equation: $a^2 + b^2 = c^2$.

The Michaelis-Menten equation: $v = \\frac{V_{max} \\cdot [S]}{K_m + [S]}$

\\section{A Numbered List}
Steps to write a great thesis:

\\begin{enumerate}
  \\item Choose your topic and do a literature review
  \\item Define your research question
  \\item Design your methodology
  \\item Collect and analyze data
  \\item Write and revise your manuscript
\\end{enumerate}

\\section{Conclusion}
You are now ready to start writing in LaTeX! Try adding new sections, lists, and equations. Use the \\textbf{Snippets} panel on the left to drag and drop code blocks into your document.

\\end{document}
`,
  isMain: true,
};

export const STORAGE_KEY = "ems-latex-editor";
export const STORAGE_VERSION = 2; // Bump this when DEFAULT_DOCUMENT changes
export const TOUR_STORAGE_KEY = "ems-latex-tour-completed";
