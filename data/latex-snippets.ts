import type { LaTeXSnippet } from "@/components/tools/latex-editor/types";

export const latexSnippets: LaTeXSnippet[] = [
  /* ──────────────────────────────────────────────────────────
     Document Structure
     ────────────────────────────────────────────────────────── */
  {
    id: "documentclass",
    language: "en",
    title: "Document Class",
    category: "Document Structure",
    icon: "FileText",
    code: `\\documentclass[12pt]{article}`,
    description: "Sets the type of document (article, report, book, etc.).",
    explanation:
      "Every LaTeX document starts with \\documentclass. The [12pt] sets the base font size. Common classes: 'article' for short papers, 'report' for longer documents with chapters, 'book' for books, 'beamer' for presentations.",
    preview: "Defines the document type — no visible output",
    difficulty: "beginner",
    tags: ["structure", "document", "setup"],
    relatedSnippets: ["usepackage", "begin-document"],
  },
  {
    id: "usepackage",
    language: "en",
    title: "Use Package",
    category: "Document Structure",
    icon: "Package",
    code: `\\usepackage{amsmath}`,
    description: "Loads an extra package that adds features.",
    explanation:
      "Packages extend LaTeX's capabilities. 'amsmath' adds better math. 'graphicx' lets you include images. 'hyperref' makes clickable links. Put \\usepackage commands in the preamble (before \\begin{document}).",
    preview: "Loads extra features — no visible output",
    difficulty: "beginner",
    tags: ["structure", "packages", "setup"],
    relatedSnippets: ["documentclass", "common-packages"],
  },
  {
    id: "common-packages",
    language: "en",
    title: "Common Packages Bundle",
    category: "Document Structure",
    icon: "Layers",
    code: `\\usepackage[utf8]{inputenc}   % Special characters support
\\usepackage[T1]{fontenc}      % Better font encoding
\\usepackage{amsmath}          % Better math
\\usepackage{graphicx}         % Include images
\\usepackage{hyperref}         % Clickable links
\\usepackage{geometry}         % Page margins
\\usepackage{booktabs}         % Better tables`,
    description: "A bundle of the most commonly needed packages.",
    explanation:
      "These are the packages you'll use in almost every document. inputenc and fontenc handle text encoding, amsmath is for equations, graphicx for images, hyperref for links, geometry for margins, and booktabs for professional tables.",
    preview: "Loads essential features — no visible output",
    difficulty: "beginner",
    tags: ["structure", "packages", "setup", "essential"],
    relatedSnippets: ["documentclass", "usepackage"],
  },
  {
    id: "begin-document",
    language: "en",
    title: "Document Body",
    category: "Document Structure",
    icon: "FileText",
    code: `\\begin{document}

% Your content goes here

\\end{document}`,
    description: "Wraps the visible content of your document.",
    explanation:
      "Everything between \\begin{document} and \\end{document} is what appears in your final document. Anything before \\begin{document} (called the 'preamble') is for settings and package loading.",
    preview: "The area where all your content lives",
    difficulty: "beginner",
    tags: ["structure", "document"],
    relatedSnippets: ["documentclass", "title-page"],
  },
  {
    id: "title-page",
    language: "en",
    title: "Title & Author",
    category: "Document Structure",
    icon: "User",
    code: `\\title{Your Document Title}
\\author{Your Name}
\\date{\\today}

% Place this inside \\begin{document}:
\\maketitle`,
    description: "Creates a formatted title block with title, author, and date.",
    explanation:
      "\\title, \\author, and \\date define your document info. \\today auto-inserts today's date. \\maketitle creates the formatted title block — it must go inside \\begin{document}.",
    preview: "A centered title, author name, and date at the top",
    difficulty: "beginner",
    tags: ["structure", "title", "author"],
    relatedSnippets: ["begin-document"],
  },
  {
    id: "section",
    language: "en",
    title: "Section",
    category: "Document Structure",
    icon: "Heading1",
    code: `\\section{Section Title}`,
    description: "Creates a numbered section heading.",
    explanation:
      "\\section creates a numbered heading (1, 2, 3...). Use \\section*{Title} (with asterisk) for unnumbered sections. Sections are automatically added to the table of contents.",
    preview: "1 Section Title",
    difficulty: "beginner",
    tags: ["structure", "heading", "section"],
    relatedSnippets: ["subsection", "toc"],
  },
  {
    id: "subsection",
    language: "en",
    title: "Subsection",
    category: "Document Structure",
    icon: "Heading2",
    code: `\\subsection{Subsection Title}`,
    description: "Creates a numbered subsection heading.",
    explanation:
      "Subsections are numbered within sections (e.g., 1.1, 1.2). Use \\subsubsection for even deeper nesting. These create a hierarchical structure in your document.",
    preview: "1.1 Subsection Title",
    difficulty: "beginner",
    tags: ["structure", "heading", "subsection"],
    relatedSnippets: ["section"],
  },
  {
    id: "toc",
    language: "en",
    title: "Table of Contents",
    category: "Document Structure",
    icon: "List",
    code: `\\tableofcontents
\\newpage`,
    description: "Generates an automatic table of contents.",
    explanation:
      "LaTeX automatically creates a table of contents from your \\section, \\subsection, etc. commands. You may need to compile twice for it to appear correctly. \\newpage starts a new page after it.",
    preview: "An automatic table of contents with page numbers",
    difficulty: "beginner",
    tags: ["structure", "navigation"],
    relatedSnippets: ["section", "subsection"],
  },

  /* ──────────────────────────────────────────────────────────
     Text Formatting
     ────────────────────────────────────────────────────────── */
  {
    id: "bold",
    language: "en",
    title: "Bold Text",
    category: "Text Formatting",
    icon: "Bold",
    code: `\\textbf{bold text}`,
    description: "Makes text bold.",
    explanation:
      "\\textbf{} wraps text in bold. You can nest formatting: \\textbf{\\textit{bold and italic}}.",
    preview: "bold text",
    difficulty: "beginner",
    tags: ["formatting", "bold", "text"],
    relatedSnippets: ["italic", "underline"],
  },
  {
    id: "italic",
    language: "en",
    title: "Italic Text",
    category: "Text Formatting",
    icon: "Italic",
    code: `\\textit{italic text}`,
    description: "Makes text italic. Use for emphasis or species names.",
    explanation:
      "\\textit{} makes text italic. In medical/scientific writing, italics are used for: species names (\\textit{E. coli}), gene names, emphasis, and book titles.",
    preview: "italic text",
    difficulty: "beginner",
    tags: ["formatting", "italic", "text"],
    relatedSnippets: ["bold", "emph"],
  },
  {
    id: "underline",
    language: "en",
    title: "Underlined Text",
    category: "Text Formatting",
    icon: "Underline",
    code: `\\underline{underlined text}`,
    description: "Underlines text.",
    explanation:
      "\\underline{} adds an underline. Note: in academic writing, italics or bold are usually preferred over underlines for emphasis.",
    preview: "underlined text",
    difficulty: "beginner",
    tags: ["formatting", "underline", "text"],
    relatedSnippets: ["bold", "italic"],
  },
  {
    id: "emph",
    language: "en",
    title: "Emphasis",
    category: "Text Formatting",
    icon: "Type",
    code: `\\emph{emphasized text}`,
    description: "Emphasizes text — italic in normal text, upright in italic context.",
    explanation:
      "\\emph{} is context-aware: it makes text italic normally, but if you're already in italic text, it switches to upright. It's the 'smart' way to add emphasis.",
    preview: "emphasized text (italic)",
    difficulty: "beginner",
    tags: ["formatting", "emphasis"],
    relatedSnippets: ["italic", "bold"],
  },

  /* ──────────────────────────────────────────────────────────
     Lists
     ────────────────────────────────────────────────────────── */
  {
    id: "itemize",
    language: "en",
    title: "Bullet List",
    category: "Lists",
    icon: "List",
    code: `\\begin{itemize}
  \\item First item
  \\item Second item
  \\item Third item
\\end{itemize}`,
    description: "Creates a bullet-point list.",
    explanation:
      "The 'itemize' environment creates bullet points. Each \\item starts a new bullet. You can nest lists by putting another itemize inside an item.",
    preview: "• First item\n• Second item\n• Third item",
    difficulty: "beginner",
    tags: ["list", "bullets", "itemize"],
    relatedSnippets: ["enumerate", "description-list"],
  },
  {
    id: "enumerate",
    language: "en",
    title: "Numbered List",
    category: "Lists",
    icon: "ListOrdered",
    code: `\\begin{enumerate}
  \\item First item
  \\item Second item
  \\item Third item
\\end{enumerate}`,
    description: "Creates a numbered list.",
    explanation:
      "The 'enumerate' environment creates a numbered list (1, 2, 3...). Numbering is automatic — you don't need to type the numbers yourself. Nesting creates sub-numbering (a, b, c).",
    preview: "1. First item\n2. Second item\n3. Third item",
    difficulty: "beginner",
    tags: ["list", "numbered", "enumerate"],
    relatedSnippets: ["itemize", "description-list"],
  },
  {
    id: "description-list",
    language: "en",
    title: "Description List",
    category: "Lists",
    icon: "AlignLeft",
    code: `\\begin{description}
  \\item[Term 1] Definition of the first term.
  \\item[Term 2] Definition of the second term.
  \\item[Term 3] Definition of the third term.
\\end{description}`,
    description: "A list of terms with their definitions.",
    explanation:
      "The 'description' environment creates a glossary-style list where each item has a bold label followed by its description. Great for defining medical terms or listing symptoms.",
    preview: "Term 1  Definition of the first term.\nTerm 2  Definition of the second term.",
    difficulty: "beginner",
    tags: ["list", "definition", "glossary"],
    relatedSnippets: ["itemize", "enumerate"],
  },

  /* ──────────────────────────────────────────────────────────
     Math
     ────────────────────────────────────────────────────────── */
  {
    id: "inline-math",
    language: "en",
    title: "Inline Math",
    category: "Math",
    icon: "Sigma",
    code: `$E = mc^2$`,
    description: "Math that flows with your text.",
    explanation:
      "Dollar signs $...$ wrap inline math. The equation appears within the line of text. Use ^ for superscripts and _ for subscripts. Example: $x^2$ gives x² and $H_2O$ gives H₂O.",
    preview: "E = mc²",
    difficulty: "beginner",
    tags: ["math", "inline", "equation"],
    relatedSnippets: ["display-math", "equation"],
  },
  {
    id: "display-math",
    language: "en",
    title: "Display Equation",
    category: "Math",
    icon: "Sigma",
    code: `$$E = mc^2$$`,
    description: "A centered equation on its own line.",
    explanation:
      "Double dollar signs $$...$$ create a centered, display-mode equation. For numbered equations (useful for cross-referencing), use \\begin{equation}...\\end{equation} — this requires the amsmath package. Both work in Overleaf; the live preview uses $$ for best compatibility.",
    preview: "E = mc² (centered)",
    difficulty: "beginner",
    tags: ["math", "display", "equation"],
    relatedSnippets: ["inline-math", "align"],
  },
  {
    id: "fraction",
    language: "en",
    title: "Fraction",
    category: "Math",
    icon: "Divide",
    code: `$\\frac{numerator}{denominator}$`,
    description: "Creates a fraction with a numerator over a denominator.",
    explanation:
      "\\frac{top}{bottom} creates a fraction. In inline mode it's compact; in display mode it's full-size. Example: $\\frac{1}{2}$ for one-half.",
    preview: "numerator / denominator",
    difficulty: "beginner",
    tags: ["math", "fraction"],
    relatedSnippets: ["inline-math", "display-math"],
  },
  {
    id: "greek-letters",
    language: "en",
    title: "Greek Letters",
    category: "Math",
    icon: "Languages",
    code: `% Common Greek letters in math mode:
$\\alpha$ $\\beta$ $\\gamma$ $\\delta$ $\\epsilon$
$\\theta$ $\\lambda$ $\\mu$ $\\sigma$ $\\omega$
% Capital: $\\Gamma$ $\\Delta$ $\\Sigma$ $\\Omega$`,
    description: "Greek letters commonly used in medical and scientific writing.",
    explanation:
      "Greek letters must be inside math mode ($...$). Lowercase: \\alpha, \\beta, etc. Uppercase: \\Gamma, \\Delta, etc. Medical uses: \\alpha (alpha receptors), \\beta (beta-blockers), \\mu (micro in dosing).",
    preview: "α β γ δ ε θ λ μ σ ω Γ Δ Σ Ω",
    difficulty: "beginner",
    tags: ["math", "greek", "symbols", "medical"],
    relatedSnippets: ["inline-math", "medical-symbols"],
  },
  {
    id: "align",
    language: "en",
    title: "Aligned Equations",
    category: "Math",
    icon: "AlignCenter",
    code: `% Requires \\usepackage{amsmath} in preamble
\\begin{align}
  a &= b + c \\\\
  d &= e + f
\\end{align}`,
    description: "Multiple equations aligned at the = sign (requires amsmath).",
    explanation:
      "The 'align' environment lines up multiple equations at the & symbol (usually placed before =). \\\\\\\\ creates a new line. Each equation is automatically numbered. Use align* for unnumbered. Requires \\usepackage{amsmath}. Note: the live preview will simplify this, but it compiles perfectly in Overleaf.",
    preview: "a = b + c\nd = e + f (aligned at =)",
    difficulty: "intermediate",
    tags: ["math", "align", "multiple equations"],
    relatedSnippets: ["display-math"],
  },
  {
    id: "matrix",
    language: "en",
    title: "Matrix",
    category: "Math",
    icon: "Grid3x3",
    code: `$\\begin{pmatrix}
  a & b \\\\
  c & d
\\end{pmatrix}$`,
    description: "Creates a matrix with parentheses.",
    explanation:
      "pmatrix = parentheses (), bmatrix = brackets [], vmatrix = vertical bars ||. Columns are separated by & and rows by \\\\. Useful for representing data tables in equations.",
    preview: "( a b )\n( c d )",
    difficulty: "intermediate",
    tags: ["math", "matrix", "linear algebra"],
    relatedSnippets: ["align"],
  },
  {
    id: "sum-integral",
    language: "en",
    title: "Sums & Integrals",
    category: "Math",
    icon: "Sigma",
    code: `% Summation:
$\\sum_{i=1}^{n} x_i$

% Integral:
$\\int_{0}^{\\infty} f(x) \\, dx$

% Product:
$\\prod_{i=1}^{n} x_i$`,
    description: "Summation, integral, and product notation.",
    explanation:
      "\\sum creates Σ, \\int creates ∫, \\prod creates Π. Use _{lower}^{upper} for bounds. These are essential for statistics, pharmacokinetics, and physiological calculations.",
    preview: "Σ from i=1 to n of x_i, ∫ from 0 to ∞ of f(x) dx",
    difficulty: "intermediate",
    tags: ["math", "calculus", "statistics"],
    relatedSnippets: ["fraction", "display-math"],
  },

  /* ──────────────────────────────────────────────────────────
     Tables
     ────────────────────────────────────────────────────────── */
  {
    id: "basic-table",
    language: "en",
    title: "Basic Table",
    category: "Tables",
    icon: "Table",
    code: `\\begin{table}[h]
  \\centering
  \\caption{Table caption here}
  \\label{tab:mytable}
  \\begin{tabular}{|l|c|r|}
    \\hline
    \\textbf{Left} & \\textbf{Center} & \\textbf{Right} \\\\
    \\hline
    Row 1 & Data & Data \\\\
    Row 2 & Data & Data \\\\
    Row 3 & Data & Data \\\\
    \\hline
  \\end{tabular}
\\end{table}`,
    description: "A basic table with headers and borders.",
    explanation:
      "{|l|c|r|} defines columns: l=left, c=center, r=right aligned. | adds vertical lines. \\hline adds horizontal lines. & separates columns, \\\\\\\\ ends rows. \\caption adds a title, \\label lets you reference it.",
    preview: "A bordered table with header row and aligned data",
    difficulty: "intermediate",
    tags: ["table", "data", "tabular"],
    relatedSnippets: ["professional-table", "patient-table"],
  },
  {
    id: "professional-table",
    language: "en",
    title: "Professional Table",
    category: "Tables",
    icon: "Table",
    code: `\\begin{table}[h]
  \\centering
  \\caption{Comparison of Treatment Groups}
  \\label{tab:comparison}
  \\begin{tabular}{@{}lccc@{}}
    \\toprule
    \\textbf{Parameter} & \\textbf{Group A} & \\textbf{Group B} & \\textbf{p-value} \\\\
    \\midrule
    Age (years)    & $54.2 \\pm 12.1$ & $55.8 \\pm 11.4$ & 0.38 \\\\
    BMI (kg/m$^2$) & $27.3 \\pm 4.2$  & $26.9 \\pm 4.5$  & 0.55 \\\\
    Female (\\%)    & 48.2            & 51.1            & 0.71 \\\\
    \\bottomrule
  \\end{tabular}
\\end{table}`,
    description: "A publication-quality table using booktabs (requires \\usepackage{booktabs}).",
    explanation:
      "booktabs provides \\toprule, \\midrule, \\bottomrule for professional horizontal rules. No vertical lines! This is the standard for scientific publications. @{} removes extra column padding.",
    preview: "A clean, professional table with horizontal rules only",
    difficulty: "intermediate",
    tags: ["table", "professional", "publication", "booktabs"],
    relatedSnippets: ["basic-table"],
  },

  /* ──────────────────────────────────────────────────────────
     Figures
     ────────────────────────────────────────────────────────── */
  {
    id: "figure",
    language: "en",
    title: "Figure",
    category: "Figures",
    icon: "Image",
    code: `\\begin{figure}[h]
  \\centering
  % \\includegraphics[width=0.8\\textwidth]{your-image-filename}
  \\caption{Description of the figure.}
  \\label{fig:myfig}
\\end{figure}`,
    description: "Inserts an image with a caption (requires \\usepackage{graphicx}).",
    explanation:
      "[h] suggests 'here' for placement (also try [t] for top, [b] for bottom). \\centering centers the image. width=0.8\\textwidth makes it 80% of the text width. \\label lets you reference it with \\ref{fig:myfig}.",
    preview: "A centered image with a numbered caption below",
    difficulty: "intermediate",
    tags: ["figure", "image", "graphics"],
    relatedSnippets: ["basic-table"],
  },

  /* ──────────────────────────────────────────────────────────
     References
     ────────────────────────────────────────────────────────── */
  {
    id: "citation",
    language: "en",
    title: "Citation & Footnote",
    category: "References",
    icon: "Quote",
    code: `% Footnote (appears at bottom of page):
This is a fact\\footnote{Source: Journal of Medicine, 2025.}.

% Cross-reference (to a labeled figure/table/equation):
As shown in Figure~\\ref{fig:myfig} and Table~\\ref{tab:mytable}.

% Label (place inside a figure, table, or section):
\\label{fig:myfig}`,
    description: "Add footnotes and cross-references to your document.",
    explanation:
      "\\footnote{} creates numbered footnotes at the page bottom. \\label{} marks a location, and \\ref{} references it — LaTeX auto-fills the number. The ~ prevents line breaks before the reference number.",
    preview: "This is a fact¹. See Figure 1 and Table 2.",
    difficulty: "intermediate",
    tags: ["reference", "footnote", "cross-reference", "citation"],
    relatedSnippets: ["bibliography"],
  },
  {
    id: "bibliography",
    language: "en",
    title: "Bibliography",
    category: "References",
    icon: "BookOpen",
    code: `\\section*{References}
\\begin{enumerate}
  \\item Author, A.B., Author, C.D. (2025). Title of the article. \\textit{Journal Name}, 12(3), 45--52.
  \\item Author, E.F. (2024). Title of another article. \\textit{Another Journal}, 8(1), 112--118.
\\end{enumerate}`,
    description: "A simple numbered bibliography section.",
    explanation:
      "This is the simplest way to add references — a manually numbered list. For larger documents, consider using BibTeX or biblatex for automatic bibliography management. Note: use -- for en-dashes in page ranges.",
    preview: "[1] Author... Journal Name, 12(3), 45-52.\n[2] Author... Another Journal, 8(1), 112-118.",
    difficulty: "intermediate",
    tags: ["bibliography", "references", "citation"],
    relatedSnippets: ["citation"],
  },

  /* ──────────────────────────────────────────────────────────
     Medical-Specific
     ────────────────────────────────────────────────────────── */
  {
    id: "soap-note",
    language: "en",
    title: "SOAP Note",
    category: "Medical",
    icon: "Stethoscope",
    code: `\\subsection*{SOAP Note}

\\textbf{S (Subjective):}\\\\
Patient reports [chief complaint], duration [X days/weeks], associated with [symptoms]. Denies [pertinent negatives].

\\textbf{O (Objective):}\\\\
\\begin{description}
  \\item[Vitals] BP [X/Y], HR [X], RR [X], Temp [X]°C, SpO2 [X]\\%
  \\item[Physical Exam] [Findings organized by system]
  \\item[Labs] [Relevant lab values]
\\end{description}

\\textbf{A (Assessment):}\\\\
[Diagnosis or differential diagnosis]

\\textbf{P (Plan):}\\\\
\\begin{enumerate}
  \\item [Medications/treatments]
  \\item [Further workup]
  \\item [Follow-up plan]
\\end{enumerate}`,
    description: "Structured SOAP note format for clinical documentation.",
    explanation:
      "SOAP stands for Subjective, Objective, Assessment, Plan. This is the standard format for clinical notes. Fill in the bracketed areas with patient-specific information.",
    preview: "S: Patient reports...\nO: Vitals...\nA: Diagnosis...\nP: Plan...",
    difficulty: "intermediate",
    tags: ["medical", "clinical", "SOAP", "patient"],
    relatedSnippets: ["patient-table", "differential-dx"],
  },
  {
    id: "differential-dx",
    language: "en",
    title: "Differential Diagnosis List",
    category: "Medical",
    icon: "ListChecks",
    code: `\\subsection*{Differential Diagnosis}
\\begin{enumerate}
  \\item \\textbf{Most likely:} [Primary diagnosis] — [supporting evidence]
  \\item \\textbf{Likely:} [Second diagnosis] — [supporting evidence]
  \\item \\textbf{Possible:} [Third diagnosis] — [supporting evidence]
  \\item \\textbf{Must rule out:} [Dangerous diagnosis] — [why it must be excluded]
\\end{enumerate}`,
    description: "A structured differential diagnosis list ranked by likelihood.",
    explanation:
      "Organizing differentials by likelihood helps structure clinical reasoning. The 'must rule out' category is for dangerous conditions that need to be excluded even if unlikely (e.g., PE in chest pain).",
    preview: "1. Most likely: ...\n2. Likely: ...\n3. Possible: ...\n4. Must rule out: ...",
    difficulty: "intermediate",
    tags: ["medical", "diagnosis", "clinical"],
    relatedSnippets: ["soap-note", "patient-table"],
  },
  {
    id: "patient-table",
    language: "en",
    title: "Patient Data Table",
    category: "Medical",
    icon: "Table",
    code: `\\begin{table}[h]
  \\centering
  \\caption{Patient Demographics and Baseline Characteristics}
  \\label{tab:demographics}
  \\begin{tabular}{@{}lcc@{}}
    \\toprule
    \\textbf{Characteristic} & \\textbf{Study Group ($n$=50)} & \\textbf{Control ($n$=50)} \\\\
    \\midrule
    Age, mean $\\pm$ SD        & $45.2 \\pm 12.3$ & $44.8 \\pm 11.9$ \\\\
    Female, $n$ (\\%)          & 28 (56\\%)       & 26 (52\\%)       \\\\
    BMI, mean $\\pm$ SD        & $26.1 \\pm 4.2$  & $25.8 \\pm 3.9$  \\\\
    Hypertension, $n$ (\\%)   & 15 (30\\%)       & 14 (28\\%)       \\\\
    Diabetes, $n$ (\\%)       & 8 (16\\%)        & 7 (14\\%)        \\\\
    Smoking, $n$ (\\%)        & 12 (24\\%)       & 11 (22\\%)       \\\\
    \\bottomrule
  \\end{tabular}
\\end{table}`,
    description: "A publication-ready patient demographics table.",
    explanation:
      "This is the standard Table 1 in clinical research papers. It compares baseline characteristics between groups. Use booktabs for professional rules. Report continuous data as mean ± SD and categorical data as n (%).",
    preview: "A professional patient demographics comparison table",
    difficulty: "advanced",
    tags: ["medical", "table", "demographics", "research"],
    relatedSnippets: ["professional-table", "lab-results"],
  },
  {
    id: "lab-results",
    language: "en",
    title: "Lab Results Table",
    category: "Medical",
    icon: "FlaskConical",
    code: `\\begin{table}[h]
  \\centering
  \\caption{Laboratory Results}
  \\label{tab:labs}
  \\begin{tabular}{@{}lccc@{}}
    \\toprule
    \\textbf{Test} & \\textbf{Result} & \\textbf{Reference} & \\textbf{Units} \\\\
    \\midrule
    WBC       & 7.2   & 4.5--11.0 & $\\times 10^3/\\mu$L \\\\
    Hemoglobin & 13.5 & 12.0--16.0 & g/dL \\\\
    Platelets  & 245  & 150--400   & $\\times 10^3/\\mu$L \\\\
    Glucose    & 95   & 70--100    & mg/dL \\\\
    Creatinine & 0.9  & 0.6--1.2   & mg/dL \\\\
    Na$^+$     & 140  & 136--145   & mEq/L \\\\
    K$^+$      & 4.2  & 3.5--5.0   & mEq/L \\\\
    \\bottomrule
  \\end{tabular}
\\end{table}`,
    description: "A formatted laboratory results table with reference ranges.",
    explanation:
      "A common table format in case reports and clinical studies. Notice the math mode for superscripts (Na$^+$) and scientific notation ($\\times 10^3$). The µ symbol uses \\mu in math mode.",
    preview: "A lab results table with test names, values, and reference ranges",
    difficulty: "intermediate",
    tags: ["medical", "laboratory", "results", "table"],
    relatedSnippets: ["patient-table", "soap-note"],
  },
  {
    id: "drug-table",
    language: "en",
    title: "Drug Dosage Table",
    category: "Medical",
    icon: "Pill",
    code: `\\begin{table}[h]
  \\centering
  \\caption{Medication Summary}
  \\label{tab:medications}
  \\begin{tabular}{@{}llcl@{}}
    \\toprule
    \\textbf{Drug} & \\textbf{Dose} & \\textbf{Route} & \\textbf{Frequency} \\\\
    \\midrule
    Metformin     & 500 mg  & PO  & BID \\\\
    Lisinopril    & 10 mg   & PO  & QD \\\\
    Atorvastatin  & 40 mg   & PO  & QHS \\\\
    Aspirin       & 81 mg   & PO  & QD \\\\
    \\bottomrule
  \\end{tabular}
\\end{table}`,
    description: "A medication/drug dosage table format.",
    explanation:
      "Standard format for listing patient medications. PO = by mouth, IV = intravenous. QD = once daily, BID = twice daily, TID = three times daily, QHS = at bedtime.",
    preview: "A medication list with drug, dose, route, and frequency columns",
    difficulty: "intermediate",
    tags: ["medical", "pharmacology", "dosage", "table"],
    relatedSnippets: ["patient-table", "lab-results"],
  },
  {
    id: "medical-symbols",
    language: "en",
    title: "Medical Symbols",
    category: "Medical",
    icon: "Heart",
    code: `% Arrows (useful for indicating changes):
$\\uparrow$ increase, $\\downarrow$ decrease
$\\rightarrow$ leads to, $\\leftrightarrow$ bidirectional

% Comparison:
$\\geq$ greater or equal, $\\leq$ less or equal
$\\approx$ approximately, $\\pm$ plus or minus

% Subscripts/Superscripts:
$O_2$, $CO_2$, $H_2O$, $Ca^{2+}$, $Na^+$, $K^+$

% Common medical math:
$\\mu$g (microgram), $10^3$ (thousand)
$\\%$ (percent), $\\degree$C (degrees)`,
    description: "Common symbols used in medical documentation.",
    explanation:
      "These symbols must be inside math mode ($...$). Arrows are great for clinical notes (↑BP, ↓HR). Chemical formulas use subscripts (H₂O) and superscripts (Ca²⁺). \\pm is used for mean ± SD.",
    preview: "↑ ↓ → ≥ ≤ ≈ ± O₂ CO₂ H₂O Ca²⁺",
    difficulty: "beginner",
    tags: ["medical", "symbols", "chemistry", "math"],
    relatedSnippets: ["greek-letters", "inline-math"],
  },

  /* ──────────────────────────────────────────────────────────
     Layout
     ────────────────────────────────────────────────────────── */
  {
    id: "page-setup",
    language: "en",
    title: "Page Setup",
    category: "Layout",
    icon: "Layout",
    code: `% Set page margins (requires geometry package):
\\usepackage{geometry}
\\geometry{a4paper, margin=2.5cm}

% Or specify each margin individually:
% \\geometry{left=3cm, right=2cm, top=2.5cm, bottom=2.5cm}`,
    description: "Set page size and margins.",
    explanation:
      "The geometry package gives you full control over page layout. a4paper sets A4 size. margin=2.5cm sets all margins equally. For thesis requirements, you often need a larger left margin for binding.",
    preview: "Sets page dimensions — no visible content change",
    difficulty: "beginner",
    tags: ["layout", "margins", "page"],
    relatedSnippets: ["two-columns"],
  },
  {
    id: "two-columns",
    language: "en",
    title: "Two Columns",
    category: "Layout",
    icon: "Columns",
    code: `\\usepackage{multicol}

% In your document:
\\begin{multicols}{2}
  Left column content goes here...

  Right column content goes here...
\\end{multicols}`,
    description: "Creates a two-column layout section.",
    explanation:
      "multicol allows you to create multi-column layouts within your document. Content flows naturally from the left column to the right. Great for formula sheets, comparison lists, or fitting more content on a page.",
    preview: "Two side-by-side columns of text",
    difficulty: "intermediate",
    tags: ["layout", "columns", "multicol"],
    relatedSnippets: ["page-setup"],
  },
  {
    id: "line-spacing",
    language: "en",
    title: "Line Spacing",
    category: "Layout",
    icon: "AlignJustify",
    code: `\\usepackage{setspace}

% Choose one:
\\singlespacing
% \\onehalfspacing
% \\doublespacing`,
    description: "Controls the spacing between lines (single, 1.5, or double).",
    explanation:
      "Many universities require double-spacing for theses. \\onehalfspacing is a good balance between readability and space efficiency. You can also change spacing for specific sections.",
    preview: "Changes the vertical space between lines of text",
    difficulty: "beginner",
    tags: ["layout", "spacing"],
    relatedSnippets: ["page-setup"],
  },
  {
    id: "abstract-env",
    language: "en",
    title: "Abstract",
    category: "Layout",
    icon: "FileText",
    code: `\\begin{abstract}
Your abstract text goes here. Summarize your work in 150--250 words, covering the background, methods, results, and conclusion.
\\end{abstract}`,
    description: "Creates a formatted abstract section.",
    explanation:
      "The abstract environment creates an indented, titled abstract section. Place it right after \\maketitle. Most journals and thesis guidelines require a structured abstract with specific subsections.",
    preview: "Abstract\nYour abstract text here...",
    difficulty: "beginner",
    tags: ["layout", "abstract", "paper"],
    relatedSnippets: ["title-page"],
  },
  {
    id: "blockquote",
    language: "en",
    title: "Block Quote",
    category: "Layout",
    icon: "Quote",
    code: `\\begin{quote}
  "The art of medicine consists of amusing the patient while nature cures the disease." — Voltaire
\\end{quote}`,
    description: "A formatted block quote, indented on both sides.",
    explanation:
      "The quote environment creates an indented block of text, typically used for quotations. For longer quotes, use 'quotation' instead, which also indents the first line of each paragraph.",
    preview: "An indented quote block with text",
    difficulty: "beginner",
    tags: ["layout", "quote", "text"],
    relatedSnippets: ["emph"],
  },
];

/** Get all snippets */
export function getAllSnippets(): LaTeXSnippet[] {
  return latexSnippets;
}

/** Get snippets by category */
export function getSnippetsByCategory(category: string): LaTeXSnippet[] {
  return latexSnippets.filter((s) => s.category === category);
}

/** Get all unique snippet categories */
export function getSnippetCategories(): string[] {
  return [...new Set(latexSnippets.map((s) => s.category))];
}

/** Get a snippet by ID */
export function getSnippetById(id: string): LaTeXSnippet | undefined {
  return latexSnippets.find((s) => s.id === id);
}
