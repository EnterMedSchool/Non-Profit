"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { bracketMatching, indentOnInput, foldGutter, foldKeymap, StreamLanguage } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap, autocompletion, type CompletionContext, type Completion } from "@codemirror/autocomplete";
import { lintGutter } from "@codemirror/lint";
import { tags as t } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { useLaTeXEditor } from "./LaTeXEditorContext";

/* ── LaTeX StreamLanguage definition ─────────────────────── */

const latexLanguage = StreamLanguage.define({
  name: "latex",
  startState() {
    return {
      inMath: false,
      inDisplayMath: false,
      inEnvironment: false,
      inComment: false,
    };
  },
  token(stream, state) {
    // Comments
    if (stream.match("%")) {
      stream.skipToEnd();
      return "comment";
    }

    // Display math $$...$$
    if (stream.match("$$")) {
      state.inDisplayMath = !state.inDisplayMath;
      return "keyword";
    }

    // Display math \[...\]
    if (stream.match("\\[") || stream.match("\\]")) {
      state.inDisplayMath = !state.inDisplayMath;
      return "keyword";
    }

    // Inline math $...$
    if (stream.peek() === "$" && !state.inDisplayMath) {
      stream.next();
      state.inMath = !state.inMath;
      return "keyword";
    }

    // Inside math mode
    if (state.inMath || state.inDisplayMath) {
      if (stream.match(/^\\[a-zA-Z@]+/)) {
        return "function";
      }
      if (stream.match(/^[_^]/)) {
        return "operator";
      }
      if (stream.match(/^[{}[\]()]/)) {
        return "bracket";
      }
      if (stream.match(/^[0-9]+/)) {
        return "number";
      }
      stream.next();
      return "string";
    }

    // LaTeX commands: \commandname
    if (stream.match(/^\\[a-zA-Z@]+/)) {
      const matched = stream.current();
      // Document structure commands
      if (
        /^\\(documentclass|usepackage|begin|end|input|include|newcommand|renewcommand|def)$/.test(
          matched
        )
      ) {
        return "keyword";
      }
      // Section commands
      if (
        /^\\(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)$/.test(
          matched
        )
      ) {
        return "heading";
      }
      // Formatting
      if (
        /^\\(textbf|textit|texttt|emph|underline|textsc|textrm|textsf|textsl)$/.test(
          matched
        )
      ) {
        return "strong";
      }
      // References
      if (/^\\(label|ref|cite|bibliography|bibliographystyle|footnote|href|url)$/.test(matched)) {
        return "link";
      }
      // Environments
      if (/^\\(item|caption|title|author|date|maketitle|tableofcontents)$/.test(matched)) {
        return "meta";
      }
      return "function";
    }

    // Escaped characters: \%, \$, \\, etc.
    if (stream.match(/^\\[^a-zA-Z]/)) {
      return "escape";
    }

    // Braces
    if (stream.match(/^[{}]/)) {
      return "bracket";
    }

    // Square brackets (optional arguments)
    if (stream.match(/^[[\]]/)) {
      return "squareBracket";
    }

    // Ampersand (table separator)
    if (stream.match("&")) {
      return "operator";
    }

    // Tilde (non-breaking space)
    if (stream.match("~")) {
      return "atom";
    }

    // Numbers
    if (stream.match(/^[0-9]+(\.[0-9]+)?/)) {
      return "number";
    }

    // Everything else
    stream.next();
    return null;
  },
});

/* ── LaTeX-themed highlight styles ───────────────────────── */

const latexHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#7c3aed", fontWeight: "bold" },
  { tag: t.function(t.variableName), color: "#0891b2" },
  { tag: t.heading, color: "#c026d3", fontWeight: "bold" },
  { tag: t.strong, color: "#ea580c" },
  { tag: t.link, color: "#2563eb", textDecoration: "underline" },
  { tag: t.meta, color: "#059669" },
  { tag: t.comment, color: "#94a3b8", fontStyle: "italic" },
  { tag: t.string, color: "#d946ef" },
  { tag: t.bracket, color: "#f59e0b" },
  { tag: t.squareBracket, color: "#8b5cf6" },
  { tag: t.number, color: "#10b981" },
  { tag: t.operator, color: "#ef4444" },
  { tag: t.atom, color: "#6366f1" },
  { tag: t.escape, color: "#94a3b8" },
]);

const latexDarkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#c4b5fd", fontWeight: "bold" },
  { tag: t.function(t.variableName), color: "#67e8f9" },
  { tag: t.heading, color: "#f0abfc", fontWeight: "bold" },
  { tag: t.strong, color: "#fdba74" },
  { tag: t.link, color: "#93c5fd", textDecoration: "underline" },
  { tag: t.meta, color: "#6ee7b7" },
  { tag: t.comment, color: "#64748b", fontStyle: "italic" },
  { tag: t.string, color: "#f0abfc" },
  { tag: t.bracket, color: "#fcd34d" },
  { tag: t.squareBracket, color: "#a78bfa" },
  { tag: t.number, color: "#34d399" },
  { tag: t.operator, color: "#fca5a5" },
  { tag: t.atom, color: "#a5b4fc" },
  { tag: t.escape, color: "#64748b" },
]);

const darkEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "#1e1e2e",
    color: "#cdd6f4",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-gutters": {
    backgroundColor: "#181825",
    borderRight: "2px solid #313244",
    color: "#6c7086",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#313244",
    color: "#cdd6f4",
  },
  ".cm-activeLine": {
    backgroundColor: "#313244",
  },
  ".cm-selectionBackground": {
    backgroundColor: "#45475a !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "#585b70 !important",
  },
  ".cm-cursor": {
    borderLeftColor: "#c4b5fd",
    borderLeftWidth: "2px",
  },
  ".cm-matchingBracket": {
    backgroundColor: "#f9e2af40",
    outline: "1px solid #f9e2af",
  },
  ".cm-searchMatch": {
    backgroundColor: "#f9e2af40",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "#f9e2af60",
  },
  ".cm-foldGutter .cm-gutterElement": {
    cursor: "pointer",
  },
});

/* ── LaTeX autocomplete ──────────────────────────────────── */

const LATEX_COMMANDS: { label: string; type: string; detail: string; info: string; boost?: number }[] = [
  // Text formatting — highest boost for beginners
  { label: "\\textbf{}", type: "function", detail: "Bold text", info: "Makes text bold", boost: 99 },
  { label: "\\textit{}", type: "function", detail: "Italic text", info: "Makes text italic", boost: 98 },
  { label: "\\underline{}", type: "function", detail: "Underline text", info: "Underlines text", boost: 97 },
  { label: "\\emph{}", type: "function", detail: "Emphasize", info: "Emphasizes text (usually italic)", boost: 96 },
  { label: "\\texttt{}", type: "function", detail: "Typewriter", info: "Monospace/typewriter font", boost: 50 },
  { label: "\\textsc{}", type: "function", detail: "Small caps", info: "Small capital letters", boost: 40 },

  // Sections
  { label: "\\section{}", type: "keyword", detail: "Section heading", info: "Creates a numbered section", boost: 95 },
  { label: "\\subsection{}", type: "keyword", detail: "Subsection heading", info: "Creates a numbered subsection", boost: 94 },
  { label: "\\subsubsection{}", type: "keyword", detail: "Sub-subsection", info: "Creates a sub-subsection heading", boost: 93 },
  { label: "\\paragraph{}", type: "keyword", detail: "Paragraph heading", info: "Creates a named paragraph", boost: 40 },
  { label: "\\section*{}", type: "keyword", detail: "Unnumbered section", info: "Section without a number", boost: 70 },

  // Document structure
  { label: "\\documentclass{}", type: "keyword", detail: "Document type", info: "Sets the document type (article, report, book, beamer)", boost: 90 },
  { label: "\\usepackage{}", type: "keyword", detail: "Load package", info: "Loads an extra feature package", boost: 89 },
  { label: "\\begin{}", type: "keyword", detail: "Start environment", info: "Starts a LaTeX environment", boost: 88 },
  { label: "\\end{}", type: "keyword", detail: "End environment", info: "Ends a LaTeX environment", boost: 87 },
  { label: "\\title{}", type: "keyword", detail: "Document title", info: "Sets the document title", boost: 85 },
  { label: "\\author{}", type: "keyword", detail: "Author name", info: "Sets the document author", boost: 84 },
  { label: "\\date{}", type: "keyword", detail: "Document date", info: "Sets the document date", boost: 83 },
  { label: "\\maketitle", type: "keyword", detail: "Print title block", info: "Renders the title, author, and date", boost: 82 },

  // Math
  { label: "\\frac{}{}", type: "function", detail: "Fraction", info: "Creates a fraction: numerator / denominator", boost: 80 },
  { label: "\\sqrt{}", type: "function", detail: "Square root", info: "Square root of expression", boost: 79 },
  { label: "\\sum", type: "function", detail: "Summation", info: "Summation symbol (use ^{} and _{} for limits)", boost: 75 },
  { label: "\\int", type: "function", detail: "Integral", info: "Integral symbol", boost: 74 },
  { label: "\\lim", type: "function", detail: "Limit", info: "Limit expression", boost: 73 },
  { label: "\\infty", type: "function", detail: "Infinity", info: "The infinity symbol", boost: 72 },
  { label: "\\cdot", type: "function", detail: "Centered dot", info: "Multiplication dot", boost: 71 },
  { label: "\\times", type: "function", detail: "Times sign", info: "Multiplication cross", boost: 70 },
  { label: "\\pm", type: "function", detail: "Plus-minus", info: "The plus-minus symbol (great for mean ± SD)", boost: 69 },
  { label: "\\leq", type: "function", detail: "Less or equal", info: "Less than or equal to", boost: 60 },
  { label: "\\geq", type: "function", detail: "Greater or equal", info: "Greater than or equal to", boost: 59 },
  { label: "\\neq", type: "function", detail: "Not equal", info: "Not equal to", boost: 58 },
  { label: "\\approx", type: "function", detail: "Approximately", info: "Approximately equal to", boost: 57 },
  { label: "\\rightarrow", type: "function", detail: "Right arrow", info: "Right arrow", boost: 50 },
  { label: "\\leftarrow", type: "function", detail: "Left arrow", info: "Left arrow", boost: 49 },
  { label: "\\Rightarrow", type: "function", detail: "Double right arrow", info: "Implies arrow", boost: 48 },

  // Greek letters
  { label: "\\alpha", type: "variable", detail: "α", info: "Greek letter alpha", boost: 65 },
  { label: "\\beta", type: "variable", detail: "β", info: "Greek letter beta", boost: 64 },
  { label: "\\gamma", type: "variable", detail: "γ", info: "Greek letter gamma", boost: 63 },
  { label: "\\delta", type: "variable", detail: "δ", info: "Greek letter delta", boost: 62 },
  { label: "\\epsilon", type: "variable", detail: "ε", info: "Greek letter epsilon", boost: 61 },
  { label: "\\lambda", type: "variable", detail: "λ", info: "Greek letter lambda", boost: 56 },
  { label: "\\mu", type: "variable", detail: "μ", info: "Greek letter mu (micro)", boost: 55 },
  { label: "\\sigma", type: "variable", detail: "σ", info: "Greek letter sigma", boost: 54 },
  { label: "\\pi", type: "variable", detail: "π", info: "Greek letter pi", boost: 53 },
  { label: "\\theta", type: "variable", detail: "θ", info: "Greek letter theta", boost: 52 },
  { label: "\\omega", type: "variable", detail: "ω", info: "Greek letter omega", boost: 51 },
  { label: "\\phi", type: "variable", detail: "φ", info: "Greek letter phi", boost: 50 },
  { label: "\\chi", type: "variable", detail: "χ", info: "Greek letter chi", boost: 49 },
  { label: "\\Delta", type: "variable", detail: "Δ", info: "Capital delta", boost: 48 },
  { label: "\\Sigma", type: "variable", detail: "Σ", info: "Capital sigma", boost: 47 },

  // References
  { label: "\\label{}", type: "function", detail: "Add label", info: "Labels a section/figure/table for cross-referencing", boost: 60 },
  { label: "\\ref{}", type: "function", detail: "Reference", info: "References a labeled element by its number", boost: 59 },
  { label: "\\cite{}", type: "function", detail: "Citation", info: "Cites a bibliography entry", boost: 58 },
  { label: "\\footnote{}", type: "function", detail: "Footnote", info: "Adds a footnote at the bottom of the page", boost: 57 },
  { label: "\\href{}{}", type: "function", detail: "Hyperlink", info: "Creates a clickable link (needs hyperref)", boost: 56 },
  { label: "\\url{}", type: "function", detail: "URL", info: "Displays a URL in monospace (needs hyperref)", boost: 55 },

  // Items
  { label: "\\item", type: "keyword", detail: "List item", info: "Adds an item to a list (itemize/enumerate)", boost: 85 },
  { label: "\\caption{}", type: "keyword", detail: "Caption", info: "Adds a caption to a figure or table", boost: 70 },
  { label: "\\centering", type: "keyword", detail: "Center content", info: "Centers content within an environment", boost: 65 },
  { label: "\\includegraphics{}", type: "function", detail: "Include image", info: "Inserts an image (needs graphicx)", boost: 60 },
  { label: "\\newpage", type: "keyword", detail: "Page break", info: "Starts a new page", boost: 45 },
  { label: "\\tableofcontents", type: "keyword", detail: "Table of contents", info: "Generates a table of contents", boost: 55 },
  { label: "\\today", type: "keyword", detail: "Today's date", info: "Inserts today's date", boost: 50 },

  // Spacing
  { label: "\\\\", type: "keyword", detail: "Line break", info: "Forces a line break", boost: 80 },
  { label: "\\hspace{}", type: "function", detail: "Horizontal space", info: "Adds horizontal space", boost: 30 },
  { label: "\\vspace{}", type: "function", detail: "Vertical space", info: "Adds vertical space", boost: 30 },
  { label: "\\noindent", type: "keyword", detail: "No indent", info: "Prevents paragraph indentation", boost: 40 },
];

const LATEX_ENVIRONMENTS = [
  { label: "document", detail: "Document body" },
  { label: "itemize", detail: "Bullet list" },
  { label: "enumerate", detail: "Numbered list" },
  { label: "description", detail: "Description list" },
  { label: "figure", detail: "Figure float" },
  { label: "table", detail: "Table float" },
  { label: "tabular", detail: "Table content" },
  { label: "equation", detail: "Numbered equation" },
  { label: "equation*", detail: "Unnumbered equation" },
  { label: "align", detail: "Aligned equations" },
  { label: "align*", detail: "Aligned (no numbers)" },
  { label: "abstract", detail: "Paper abstract" },
  { label: "quote", detail: "Block quote" },
  { label: "verbatim", detail: "Monospace text" },
  { label: "center", detail: "Centered content" },
  { label: "flushleft", detail: "Left-aligned" },
  { label: "flushright", detail: "Right-aligned" },
  { label: "minipage", detail: "Mini page box" },
  { label: "thebibliography", detail: "Bibliography" },
];

function latexCompletions(context: CompletionContext) {
  // Check if we're typing after a backslash
  const word = context.matchBefore(/\\[a-zA-Z]*/);
  if (word) {
    // Check if this is inside \begin{ or \end{
    const beforeBegin = context.matchBefore(/\\begin\{[a-zA-Z]*/);
    const beforeEnd = context.matchBefore(/\\end\{[a-zA-Z]*/);

    if (beforeBegin || beforeEnd) {
      const envWord = context.matchBefore(/\{[a-zA-Z]*/);
      if (envWord) {
        return {
          from: envWord.from + 1,
          options: LATEX_ENVIRONMENTS.map((env) => ({
            label: env.label,
            type: "type" as const,
            detail: env.detail,
            boost: 99,
          })),
        };
      }
    }

    if (word.from === word.to && !context.explicit) return null;

    return {
      from: word.from,
      options: LATEX_COMMANDS.map((cmd) => ({
        label: cmd.label,
        type: cmd.type as Completion["type"],
        detail: cmd.detail,
        info: cmd.info,
        boost: cmd.boost,
        apply: cmd.label,
      })),
    };
  }

  // Check for environment name completion inside \begin{} or \end{}
  const envWord = context.matchBefore(/\\(?:begin|end)\{[a-zA-Z]*/);
  if (envWord) {
    const bracePos = envWord.text.indexOf("{");
    if (bracePos >= 0) {
      return {
        from: envWord.from + bracePos + 1,
        options: LATEX_ENVIRONMENTS.map((env) => ({
          label: env.label,
          type: "type" as const,
          detail: env.detail,
          boost: 99,
        })),
      };
    }
  }

  return null;
}

/* ── Editor component ────────────────────────────────────── */

export default function EditorPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const {
    activeDocument,
    updateDocumentContent,
    setCursorPosition,
    settings,
    editorViewRef,
    wrapSelection,
  } = useLaTeXEditor();

  // Compartments for dynamic reconfiguration
  const fontSizeComp = useRef(new Compartment());
  const lineNumbersComp = useRef(new Compartment());
  const wrapComp = useRef(new Compartment());
  const themeComp = useRef(new Compartment());

  // Content update listener (stable callback)
  const onUpdate = useCallback(
    (docId: string) => {
      return EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          updateDocumentContent(docId, update.state.doc.toString());
        }
        if (update.selectionSet || update.docChanged) {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          setCursorPosition({
            line: line.number,
            col: pos - line.from + 1,
          });
        }
      });
    },
    [updateDocumentContent, setCursorPosition]
  );

  // Create/recreate editor when active document changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy previous view
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const state = EditorState.create({
      doc: activeDocument.content,
      extensions: [
        // Core
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        highlightSelectionMatches(),
        autocompletion({
          override: [latexCompletions],
          activateOnTyping: true,
          maxRenderedOptions: 30,
        }),

        // LaTeX language + highlighting
        latexLanguage,
        themeComp.current.of(
          settings.theme === "dark"
            ? [syntaxHighlighting(latexDarkHighlightStyle), darkEditorTheme]
            : [syntaxHighlighting(latexHighlightStyle)]
        ),

        // Dynamic compartments
        fontSizeComp.current.of(
          EditorView.theme({
            "&": { fontSize: `${settings.fontSize}px` },
            ".cm-content": { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace" },
            ".cm-gutters": { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: `${settings.fontSize - 2}px` },
          })
        ),
        lineNumbersComp.current.of(
          settings.showLineNumbers ? [lineNumbers(), foldGutter(), lintGutter()] : []
        ),
        wrapComp.current.of(
          settings.wordWrap ? EditorView.lineWrapping : []
        ),

        // Keymaps
        keymap.of([
          // LaTeX formatting shortcuts
          {
            key: "Mod-b",
            run: () => { wrapSelection("\\textbf{", "}", "text"); return true; },
          },
          {
            key: "Mod-i",
            run: () => { wrapSelection("\\textit{", "}", "text"); return true; },
          },
          {
            key: "Mod-u",
            run: () => { wrapSelection("\\underline{", "}", "text"); return true; },
          },
          {
            key: "Mod-m",
            run: () => { wrapSelection("$", "$", "x"); return true; },
          },
          {
            key: "Mod-Shift-m",
            run: () => { wrapSelection("$$\n  ", "\n$$\n", "E = mc^2"); return true; },
          },
          {
            key: "Mod-s",
            run: () => {
              // Prevent browser save dialog — document is auto-saved
              return true;
            },
          },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
        ]),

        // Update listener
        onUpdate(activeDocument.id),

        // Styling
        EditorView.theme({
          "&": {
            height: "100%",
            backgroundColor: "#ffffff",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-scroller": {
            overflow: "auto",
          },
          ".cm-gutters": {
            backgroundColor: "#f8fafc",
            borderRight: "2px solid #e2e8f0",
            color: "#94a3b8",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "#f1f5f9",
            color: "#475569",
          },
          ".cm-activeLine": {
            backgroundColor: "#f8fafc",
          },
          ".cm-selectionBackground": {
            backgroundColor: "#c4b5fd40 !important",
          },
          "&.cm-focused .cm-selectionBackground": {
            backgroundColor: "#c4b5fd60 !important",
          },
          ".cm-cursor": {
            borderLeftColor: "#7c3aed",
            borderLeftWidth: "2px",
          },
          ".cm-matchingBracket": {
            backgroundColor: "#fbbf2440",
            outline: "1px solid #fbbf24",
          },
          ".cm-searchMatch": {
            backgroundColor: "#fef08a80",
          },
          ".cm-searchMatch.cm-searchMatch-selected": {
            backgroundColor: "#fde04780",
          },
          ".cm-foldGutter .cm-gutterElement": {
            cursor: "pointer",
          },
        }),

        // Placeholder
        cmPlaceholder("Start typing LaTeX here..."),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;
    editorViewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only re-create when the document id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocument.id]);

  // Update settings dynamically without recreating the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: [
        fontSizeComp.current.reconfigure(
          EditorView.theme({
            "&": { fontSize: `${settings.fontSize}px` },
            ".cm-content": { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace" },
            ".cm-gutters": { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: `${settings.fontSize - 2}px` },
          })
        ),
        lineNumbersComp.current.reconfigure(
          settings.showLineNumbers ? [lineNumbers(), foldGutter(), lintGutter()] : []
        ),
        wrapComp.current.reconfigure(
          settings.wordWrap ? EditorView.lineWrapping : []
        ),
        themeComp.current.reconfigure(
          settings.theme === "dark"
            ? [syntaxHighlighting(latexDarkHighlightStyle), darkEditorTheme]
            : [syntaxHighlighting(latexHighlightStyle)]
        ),
      ],
    });
  }, [settings.fontSize, settings.showLineNumbers, settings.wordWrap, settings.theme]);

  // Sync external content changes (e.g. template load) into the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== activeDocument.content) {
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: activeDocument.content,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocument.content]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
