"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLaTeXEditor } from "./LaTeXEditorContext";
import RichTooltip from "./RichTooltip";
import {
  ArrowLeft,
  FileText,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Sigma,
  Table,
  Image,
  Quote,
  Link,
  BookOpen,
  Puzzle,
  GraduationCap,
  FolderOpen,
  Download,
  Search,
  Settings,
  Minus,
  Plus,
  Sun,
  Moon,
  WrapText,
  Hash,
  Eye,
  EyeOff,
  ChevronDown,
  Undo2,
  Redo2,
  Sparkles,
} from "lucide-react";

/* ── Formatting actions ──────────────────────────────────── */

interface FormatAction {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  labelKey: string;
  tooltipKey: string;
  snippet: string;
  wrapPrefix?: string;
  wrapSuffix?: string;
  fallbackBody?: string;
  cursorOffset?: number;
  richTooltip?: {
    titleKey: string;
    descKey: string;
    preview?: string;
    shortcut?: string;
    code?: string;
  };
}

const FORMAT_GROUPS: { labelKey: string; actions: FormatAction[] }[] = [
  {
    labelKey: "formatGroupText",
    actions: [
      {
        icon: Bold,
        labelKey: "formatBold",
        tooltipKey: "formatBoldTooltip",
        snippet: "\\textbf{text}",
        wrapPrefix: "\\textbf{",
        wrapSuffix: "}",
        fallbackBody: "text",
        richTooltip: { titleKey: "formatBoldRichTitle", descKey: "formatBoldRichDesc", preview: "<b>Bold text</b>", shortcut: "Ctrl+B", code: "\\textbf{your text}" },
      },
      {
        icon: Italic,
        labelKey: "formatItalic",
        tooltipKey: "formatItalicTooltip",
        snippet: "\\textit{text}",
        wrapPrefix: "\\textit{",
        wrapSuffix: "}",
        fallbackBody: "text",
        richTooltip: { titleKey: "formatItalicRichTitle", descKey: "formatItalicRichDesc", preview: "<i>Italic text</i>", shortcut: "Ctrl+I", code: "\\textit{your text}" },
      },
      {
        icon: Underline,
        labelKey: "formatUnderline",
        tooltipKey: "formatUnderlineTooltip",
        snippet: "\\underline{text}",
        wrapPrefix: "\\underline{",
        wrapSuffix: "}",
        fallbackBody: "text",
        richTooltip: { titleKey: "formatUnderlineRichTitle", descKey: "formatUnderlineRichDesc", preview: "<u>Underlined text</u>", shortcut: "Ctrl+U", code: "\\underline{your text}" },
      },
    ],
  },
  {
    labelKey: "formatGroupSections",
    actions: [
      {
        icon: Heading1,
        labelKey: "formatSection",
        tooltipKey: "formatSectionTooltip",
        snippet: "\\section{Section Title}\n",
        wrapPrefix: "\\section{",
        wrapSuffix: "}\n",
        fallbackBody: "Section Title",
        richTooltip: { titleKey: "formatSectionRichTitle", descKey: "formatSectionRichDesc", preview: "<b style='font-size:1.2em'>1 Introduction</b>", code: "\\section{Your Title}" },
      },
      { icon: Heading2, labelKey: "formatSubsection", tooltipKey: "formatSubsectionTooltip", snippet: "\\subsection{Subsection Title}\n", wrapPrefix: "\\subsection{", wrapSuffix: "}\n", fallbackBody: "Subsection Title" },
      { icon: Heading3, labelKey: "formatSubsubsection", tooltipKey: "formatSubsubsectionTooltip", snippet: "\\subsubsection{Title}\n", wrapPrefix: "\\subsubsection{", wrapSuffix: "}\n", fallbackBody: "Title" },
    ],
  },
  {
    labelKey: "formatGroupLists",
    actions: [
      { icon: List, labelKey: "formatBulletList", tooltipKey: "formatBulletListTooltip", snippet: "\\begin{itemize}\n  \\item First item\n  \\item Second item\n  \\item Third item\n\\end{itemize}\n" },
      { icon: ListOrdered, labelKey: "formatNumberedList", tooltipKey: "formatNumberedListTooltip", snippet: "\\begin{enumerate}\n  \\item First item\n  \\item Second item\n  \\item Third item\n\\end{enumerate}\n" },
    ],
  },
  {
    labelKey: "formatGroupMath",
    actions: [
      { icon: Sigma, labelKey: "formatInlineMath", tooltipKey: "formatInlineMathTooltip", snippet: "$x = $", wrapPrefix: "$", wrapSuffix: "$", fallbackBody: "x = " },
      { icon: () => <span className="text-[10px] font-bold leading-none">∫</span>, labelKey: "formatDisplayMath", tooltipKey: "formatDisplayMathTooltip", snippet: "\\begin{equation}\n  E = mc^2\n\\end{equation}\n" },
    ],
  },
  {
    labelKey: "formatGroupObjects",
    actions: [
      { icon: Table, labelKey: "formatTable", tooltipKey: "formatTableTooltip", snippet: "\\begin{table}[h]\n  \\centering\n  \\begin{tabular}{|l|c|r|}\n    \\hline\n    \\textbf{Header 1} & \\textbf{Header 2} & \\textbf{Header 3} \\\\\n    \\hline\n    Cell 1 & Cell 2 & Cell 3 \\\\\n    Cell 4 & Cell 5 & Cell 6 \\\\\n    \\hline\n  \\end{tabular}\n  \\caption{Table caption}\n  \\label{tab:mytable}\n\\end{table}\n" },
      { icon: Image, labelKey: "formatFigure", tooltipKey: "formatFigureTooltip", snippet: "\\begin{figure}[h]\n  \\centering\n  % \\includegraphics[width=0.8\\textwidth]{filename}\n  \\caption{Figure caption}\n  \\label{fig:myfigure}\n\\end{figure}\n" },
      { icon: Quote, labelKey: "formatQuote", tooltipKey: "formatQuoteTooltip", snippet: "\\begin{quote}\n  Your quoted text here.\n\\end{quote}\n", wrapPrefix: "\\begin{quote}\n  ", wrapSuffix: "\n\\end{quote}\n", fallbackBody: "Your quoted text here." },
      { icon: Link, labelKey: "formatHyperlink", tooltipKey: "formatHyperlinkTooltip", snippet: "\\href{https://example.com}{Link Text}", wrapPrefix: "\\href{https://example.com}{", wrapSuffix: "}", fallbackBody: "Link Text" },
    ],
  },
];

/* ── Toolbar component ───────────────────────────────────── */

export default function ToolbarBar() {
  const t = useTranslations("tools.latexEditor.ui");
  const {
    documentTitle,
    setDocumentTitle,
    activePanel,
    setActivePanel,
    setIsTemplateBrowserOpen,
    setIsExportPanelOpen,
    setIsCommandPaletteOpen,
    insertAtCursor,
    wrapSelection,
    undoEditor,
    redoEditor,
    settings,
    updateSettings,
    setIsTableBuilderOpen,
    setIsEquationBuilderOpen,
    setIsKeyboardShortcutsOpen,
  } = useLaTeXEditor();

  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSettings]);

  const togglePanel = (panel: "snippets" | "learning" | "files") => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="flex flex-col border-b-2 border-ink-dark/10 bg-white">
      {/* Top row: logo, title, panel toggles, settings */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Left: back + title */}
        <a
          href="/"
          className="p-1.5 rounded-lg hover:bg-pastel-cream transition-colors text-ink-muted flex-shrink-0"
          title={t("backToHome")}
        >
          <ArrowLeft size={18} />
        </a>
        <div className="flex items-center gap-2 ms-1 min-w-0">
          <FileText size={18} className="text-showcase-purple flex-shrink-0" />
          <input
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-showcase-purple/30 rounded px-1 py-0.5 min-w-0 w-48"
            title={t("documentTitle")}
          />
        </div>

        <div className="flex-1" />

        {/* Panel toggles */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Puzzle}
            label={t("snippets")}
            active={activePanel === "snippets"}
            onClick={() => togglePanel("snippets")}
            dataTour="btn-snippets"
          />
          <ToolbarButton
            icon={GraduationCap}
            label="Learn"
            active={activePanel === "learning"}
            onClick={() => togglePanel("learning")}
            dataTour="btn-learn"
          />
          <ToolbarButton
            icon={FolderOpen}
            label={t("files")}
            active={activePanel === "files"}
            onClick={() => togglePanel("files")}
          />
          <div className="w-px h-5 bg-ink-dark/10 mx-1" />
          <ToolbarButton
            icon={BookOpen}
            label="Templates"
            onClick={() => setIsTemplateBrowserOpen(true)}
            dataTour="btn-templates"
          />
          <ToolbarButton
            icon={Download}
            label={t("export")}
            onClick={() => setIsExportPanelOpen(true)}
            dataTour="btn-export"
          />
        </div>

        <div className="w-px h-5 bg-ink-dark/10 mx-1 hidden sm:block" />

        {/* Command palette + settings */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Search}
            label="Ctrl+K"
            onClick={() => setIsCommandPaletteOpen(true)}
          />
          <div className="relative" ref={settingsRef}>
            <ToolbarButton
              icon={Settings}
              label=""
              onClick={() => setShowSettings(!showSettings)}
            />
            {showSettings && (
              <SettingsDropdown
                settings={settings}
                updateSettings={updateSettings}
                onOpenShortcuts={() => {
                  setShowSettings(false);
                  setIsKeyboardShortcutsOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: undo/redo + formatting buttons */}
      <div data-tour="format-toolbar" className="flex items-center gap-0.5 px-3 py-1 border-t border-ink-dark/5 overflow-x-auto scrollbar-none toolbar-scroll-container">
        {/* Undo / Redo */}
        <button
          onClick={undoEditor}
          title="Undo (Ctrl+Z)"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-ink-muted hover:bg-pastel-cream hover:text-ink-dark transition-colors flex-shrink-0"
        >
          <Undo2 size={14} />
          <span className="text-[11px] font-medium hidden xl:inline">Undo</span>
        </button>
        <button
          onClick={redoEditor}
          title="Redo (Ctrl+Y)"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-ink-muted hover:bg-pastel-cream hover:text-ink-dark transition-colors flex-shrink-0"
        >
          <Redo2 size={14} />
          <span className="text-[11px] font-medium hidden xl:inline">{t("redo")}</span>
        </button>
        <div className="w-px h-5 bg-ink-dark/8 mx-1 flex-shrink-0" />

        {FORMAT_GROUPS.map((group, gi) => (
          <div key={group.labelKey} className="flex items-center gap-0.5">
            {gi > 0 && (
              <div className="w-px h-5 bg-ink-dark/8 mx-1 flex-shrink-0" />
            )}
            {group.actions.map((action) => {
              const label = t(action.labelKey);
              const btn = (
                <button
                  key={action.labelKey}
                  data-tour={action.labelKey === "formatBold" ? "btn-bold" : undefined}
                  onClick={() => {
                    if (action.labelKey === "formatTable") {
                      setIsTableBuilderOpen(true);
                    } else if (action.labelKey === "formatDisplayMath") {
                      setIsEquationBuilderOpen(true);
                    } else if (action.wrapPrefix && action.wrapSuffix) {
                      wrapSelection(action.wrapPrefix, action.wrapSuffix, action.fallbackBody);
                    } else {
                      insertAtCursor(action.snippet);
                    }
                  }}
                  title={action.richTooltip ? undefined : t(action.tooltipKey)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-ink-muted hover:bg-pastel-cream hover:text-ink-dark transition-colors flex-shrink-0"
                >
                  <action.icon size={14} />
                  <span className="text-[11px] font-medium hidden xl:inline">
                    {label}
                  </span>
                </button>
              );

              return action.richTooltip ? (
                <RichTooltip
                  key={action.labelKey}
                  content={{
                    title: t(action.richTooltip.titleKey),
                    description: t(action.richTooltip.descKey),
                    preview: action.richTooltip.preview,
                    shortcut: action.richTooltip.shortcut,
                    code: action.richTooltip.code,
                  }}
                >
                  {btn}
                </RichTooltip>
              ) : (
                btn
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
  dataTour,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  dataTour?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      data-tour={dataTour}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
        active
          ? "bg-showcase-purple/10 text-showcase-purple"
          : "text-ink-muted hover:bg-pastel-cream hover:text-ink-dark"
      }`}
    >
      <Icon size={15} />
      {label && <span className="hidden lg:inline">{label}</span>}
    </button>
  );
}

function SettingsDropdown({
  settings,
  updateSettings,
  onOpenShortcuts,
}: {
  settings: import("./types").EditorSettings;
  updateSettings: (patch: Partial<import("./types").EditorSettings>) => void;
  onOpenShortcuts: () => void;
}) {
  const t = useTranslations("tools.latexEditor.ui");
  const restartTour = () => {
    try {
      localStorage.removeItem("ems-latex-tour-completed");
      window.location.reload();
    } catch {
      /* noop */
    }
  };

  return (
    <div className="absolute end-0 top-full mt-1 w-64 bg-white rounded-xl border-2 border-ink-dark/10 shadow-xl p-3 z-50">
      <h4 className="text-xs font-bold text-ink-dark mb-3 uppercase tracking-wider">
        Editor Settings
      </h4>

      {/* Font size */}
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-ink-muted">Font Size</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              updateSettings({ fontSize: Math.max(10, settings.fontSize - 1) })
            }
            className="p-1 rounded hover:bg-pastel-cream text-ink-muted"
          >
            <Minus size={12} />
          </button>
          <span className="text-xs font-mono w-6 text-center">
            {settings.fontSize}
          </span>
          <button
            onClick={() =>
              updateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })
            }
            className="p-1 rounded hover:bg-pastel-cream text-ink-muted"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Word wrap */}
      <SettingsToggle
        label={t("wordWrap")}
        icon={WrapText}
        value={settings.wordWrap}
        onChange={(v) => updateSettings({ wordWrap: v })}
      />

      {/* Line numbers */}
      <SettingsToggle
        label={t("lineNumbers")}
        icon={Hash}
        value={settings.showLineNumbers}
        onChange={(v) => updateSettings({ showLineNumbers: v })}
      />

      {/* Auto preview */}
      <SettingsToggle
        label={t("autoPreview")}
        icon={settings.autoPreview ? Eye : EyeOff}
        value={settings.autoPreview}
        onChange={(v) => updateSettings({ autoPreview: v })}
      />

      {/* Dark mode */}
      <SettingsToggle
        label="Dark Mode"
        icon={settings.theme === "dark" ? Moon : Sun}
        value={settings.theme === "dark"}
        onChange={(v) => updateSettings({ theme: v ? "dark" : "light" })}
      />

      {/* Divider */}
      <div className="border-t border-ink-dark/10 my-2" />

      {/* Keyboard shortcuts */}
      <button
        onClick={onOpenShortcuts}
        className="flex items-center gap-2 w-full py-2 text-xs text-ink-muted hover:text-showcase-purple transition-colors"
      >
        <span className="text-[11px]">⌨</span>
        <span>Keyboard Shortcuts</span>
      </button>

      {/* Restart tour */}
      <button
        onClick={restartTour}
        className="flex items-center gap-2 w-full py-2 text-xs text-ink-muted hover:text-showcase-purple transition-colors"
      >
        <Sparkles size={13} />
        <span>Restart Guided Tour</span>
      </button>
    </div>
  );
}

function SettingsToggle({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-2 text-xs text-ink-muted hover:text-ink-dark transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon size={13} />
        <span>{label}</span>
      </div>
      <div
        className={`w-8 h-4.5 rounded-full transition-colors relative ${
          value ? "bg-showcase-purple" : "bg-ink-dark/20"
        }`}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
