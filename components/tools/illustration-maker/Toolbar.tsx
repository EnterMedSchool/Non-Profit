"use client";

import { useState, useRef, useCallback } from "react";
import {
  MousePointer2,
  Type,
  Square,
  Circle as CircleIcon,
  Minus,
  ArrowRight,
  Pencil,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Magnet,
  Ruler,
  Download,
  Upload,
  Save,
  FileDown,
  Trash2,
  ChevronDown,
  Image,
  ImagePlus,
  Copy,
  Clipboard,
  Group,
  Ungroup,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Keyboard,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  FileImage,
  FileType2,
  ClipboardCopy,
  Spline,
  Tag,
  Hash,
  ScalingIcon,
  LayoutTemplate,
} from "lucide-react";
import { useIllustration, CANVAS_PRESETS, type ActiveTool } from "./IllustrationContext";
import dynamic from "next/dynamic";

const TemplatesPanel = dynamic(() => import("./TemplatesPanel"), { ssr: false });
const ExportDialog = dynamic(() => import("./ExportDialog"), { ssr: false });

const TOOL_ITEMS: { id: ActiveTool; icon: React.ComponentType<{ className?: string }>; label: string; separator?: boolean }[] = [
  { id: "select",    icon: MousePointer2, label: "Select (V)" },
  { id: "text",      icon: Type,          label: "Text (T)" },
  { id: "rect",      icon: Square,        label: "Rectangle (R)" },
  { id: "circle",    icon: CircleIcon,    label: "Circle (C)" },
  { id: "line",      icon: Minus,         label: "Line (L)" },
  { id: "arrow",     icon: ArrowRight,    label: "Arrow (A)" },
  { id: "freehand",  icon: Pencil,        label: "Freehand (F)" },
  { id: "connector", icon: Spline,        label: "Connector" },
  { id: "label",     icon: Tag,           label: "Label (K)" },
  { id: "marker",    icon: Hash,          label: "Marker (M)" },
];

export default function Toolbar() {
  const {
    activeTool,
    setActiveTool,
    canUndo,
    canRedo,
    undo,
    redo,
    zoom,
    setZoom,
    canvas,
    showGrid,
    toggleGrid,
    showSnapping,
    toggleSnapping,
    showRulers,
    toggleRulers,
    alignObjects,
    distributeObjects,
    canvasSize,
    setCanvasSize,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteClipboard,
    groupSelected,
    ungroupSelected,
    lockSelected,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    selectedObjects,
    clearCanvas,
    saveToLocalStorage,
    exportProject,
    importProject,
    exportImage,
    exportSVG,
    exportPDF,
    copyImageToClipboard,
    addImageFromFile,
    addScaleBarToCanvas,
    backgroundColor,
    setBackgroundColor,
  } = useIllustration();

  const [showCanvasMenu, setShowCanvasMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const hasSelection = selectedObjects.length > 0;
  const isGroup = selectedObjects.length === 1 && selectedObjects[0]?.type === "group";
  const isMultiSelect = selectedObjects.length > 1 || (selectedObjects.length === 1 && selectedObjects[0]?.type === "activeSelection");
  const isLocked = selectedObjects.length > 0 && selectedObjects[0]?.lockMovementX;

  /* ── Handlers ───────────────────────────────────────────────── */

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importProject(reader.result as string);
    reader.readAsText(file);
    e.target.value = "";
  }, [importProject]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        addImageFromFile(file);
      }
    }
    e.target.value = "";
  }, [addImageFromFile]);

  const handleFitToScreen = useCallback(() => {
    if (!canvas) return;
    const container = canvas.wrapperEl?.parentElement;
    if (!container) return;
    const padding = 40;
    const availW = container.clientWidth - padding * 2;
    const availH = container.clientHeight - padding * 2;
    const scaleW = availW / canvasSize.width;
    const scaleH = availH / canvasSize.height;
    const scale = Math.min(scaleW, scaleH, 1);
    canvas.setZoom(scale);
    const vpt = canvas.viewportTransform!;
    vpt[4] = (container.clientWidth - canvasSize.width * scale) / 2;
    vpt[5] = (container.clientHeight - canvasSize.height * scale) / 2;
    canvas.setViewportTransform(vpt);
    canvas.renderAll();
    setZoom(scale);
  }, [canvas, canvasSize, setZoom]);

  /* ── Button component ───────────────────────────────────────── */

  const Btn = ({
    onClick,
    active,
    disabled,
    title,
    children,
    className = "",
  }: {
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex h-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all
        ${active
          ? "border-2 border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
          : "border-2 border-transparent text-ink-muted hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
        }
        ${disabled ? "cursor-not-allowed opacity-30" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="mx-1 h-6 w-px bg-showcase-navy/10" />;

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 border-b-3 border-showcase-navy/10 bg-white px-2 py-1.5">
        {/* ── Tools ──────────────────────────────────────────── */}
        {TOOL_ITEMS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Btn
              key={tool.id}
              active={activeTool === tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </Btn>
          );
        })}

        <Divider />

        {/* ── Selection actions ───────────────────────────────── */}
        <Btn onClick={copySelected} disabled={!hasSelection} title="Copy (Ctrl+C)">
          <Copy className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={pasteClipboard} title="Paste (Ctrl+V)">
          <Clipboard className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={duplicateSelected} disabled={!hasSelection} title="Duplicate (Ctrl+D)">
          <Image className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={deleteSelected} disabled={!hasSelection} title="Delete (Del)">
          <Trash2 className="h-3.5 w-3.5" />
        </Btn>

        <Divider />

        {/* ── Layer ordering ──────────────────────────────────── */}
        <Btn onClick={bringToFront} disabled={!hasSelection} title="Bring to Front">
          <ChevronsUp className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={bringForward} disabled={!hasSelection} title="Bring Forward">
          <ArrowUp className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={sendBackward} disabled={!hasSelection} title="Send Backward">
          <ArrowDown className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={sendToBack} disabled={!hasSelection} title="Send to Back">
          <ChevronsDown className="h-3.5 w-3.5" />
        </Btn>

        <Divider />

        {/* ── Group / Lock ────────────────────────────────────── */}
        <Btn onClick={groupSelected} disabled={!isMultiSelect} title="Group (Ctrl+G)">
          <Group className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={ungroupSelected} disabled={!isGroup} title="Ungroup (Ctrl+Shift+G)">
          <Ungroup className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={lockSelected} disabled={!hasSelection} title="Lock/Unlock">
          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </Btn>

        {/* ── Alignment (when multi-selected) ─────────────────── */}
        {isMultiSelect && (
          <>
            <Divider />
            <div className="relative">
              <Btn onClick={() => setShowAlignMenu(!showAlignMenu)} title="Align & Distribute">
                <AlignCenterVertical className="h-3.5 w-3.5 me-0.5" />
                <ChevronDown className="h-3 w-3" />
              </Btn>
              {showAlignMenu && (
                <div className="absolute top-full start-0 z-50 mt-1 w-48 rounded-xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky">
                  <p className="px-3 py-1 text-[10px] font-bold text-ink-light">Align</p>
                  <div className="flex gap-0.5 px-2 pb-1">
                    {([
                      { dir: "left" as const, icon: AlignStartVertical, label: "Align Left" },
                      { dir: "center" as const, icon: AlignCenterVertical, label: "Align Center" },
                      { dir: "right" as const, icon: AlignEndVertical, label: "Align Right" },
                      { dir: "top" as const, icon: AlignStartHorizontal, label: "Align Top" },
                      { dir: "middle" as const, icon: AlignCenterHorizontal, label: "Align Middle" },
                      { dir: "bottom" as const, icon: AlignEndHorizontal, label: "Align Bottom" },
                    ]).map(({ dir, icon: Icon, label }) => (
                      <button
                        key={dir}
                        onClick={() => { alignObjects(dir); setShowAlignMenu(false); }}
                        className="rounded-lg border-2 border-transparent p-1.5 text-ink-muted transition-colors hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
                        title={label}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                  <p className="px-3 py-1 text-[10px] font-bold text-ink-light">Distribute</p>
                  <div className="flex gap-0.5 px-2 pb-1">
                    <button
                      onClick={() => { distributeObjects("horizontal"); setShowAlignMenu(false); }}
                      className="rounded-lg border-2 border-transparent p-1.5 text-ink-muted transition-colors hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
                      title="Distribute Horizontally"
                    >
                      <AlignHorizontalSpaceAround className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { distributeObjects("vertical"); setShowAlignMenu(false); }}
                      className="rounded-lg border-2 border-transparent p-1.5 text-ink-muted transition-colors hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
                      title="Distribute Vertically"
                    >
                      <AlignVerticalSpaceAround className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Divider />

        {/* ── Undo / Redo ─────────────────────────────────────── */}
        <Btn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="h-4 w-4" />
        </Btn>

        <Divider />

        {/* ── Zoom ────────────────────────────────────────────── */}
        <Btn onClick={() => setZoom(zoom * 1.2)} title="Zoom In (+)">
          <ZoomIn className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => setZoom(zoom / 1.2)} title="Zoom Out (-)">
          <ZoomOut className="h-4 w-4" />
        </Btn>
        <Btn onClick={handleFitToScreen} title="Fit to Screen">
          <Maximize className="h-4 w-4" />
        </Btn>

        {/* ── Grid / Snap / Rulers ──────────────────────────────── */}
        <Btn onClick={toggleGrid} active={showGrid} title="Toggle Grid (G)">
          <Grid3X3 className="h-4 w-4" />
        </Btn>
        <Btn onClick={toggleSnapping} active={showSnapping} title="Toggle Snapping">
          <Magnet className="h-4 w-4" />
        </Btn>
        <Btn onClick={toggleRulers} active={showRulers} title="Toggle Rulers">
          <Ruler className="h-4 w-4" />
        </Btn>

        <Divider />

        {/* ── Upload image & Scale bar ─────────────────────── */}
        <Btn onClick={() => imageInputRef.current?.click()} title="Upload Image">
          <ImagePlus className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={addScaleBarToCanvas} title="Add Scale Bar">
          <ScalingIcon className="h-3.5 w-3.5" />
        </Btn>

        {/* ── Canvas size ─────────────────────────────────────── */}
        <div className="relative">
          <Btn onClick={() => setShowCanvasMenu(!showCanvasMenu)} title="Canvas Size">
            <span className="text-[10px]">
              {canvasSize.width}x{canvasSize.height}
            </span>
            <ChevronDown className="ms-0.5 h-3 w-3" />
          </Btn>
          {showCanvasMenu && (
            <div className="absolute top-full start-0 z-50 mt-1 w-56 rounded-xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky">
              {CANVAS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setCanvasSize({ width: preset.width, height: preset.height });
                    setShowCanvasMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors hover:bg-pastel-lavender/50 ${
                    canvasSize.width === preset.width && canvasSize.height === preset.height
                      ? "font-bold text-showcase-purple"
                      : "text-ink-muted"
                  }`}
                >
                  <span>{preset.label}</span>
                  <span className="text-[10px] text-ink-light">
                    {preset.width}x{preset.height}
                  </span>
                </button>
              ))}

              {/* Background color */}
              <div className="mt-2 border-t border-showcase-navy/5 pt-2">
                <div className="flex items-center gap-2 px-3 py-1">
                  <span className="text-[10px] font-bold text-ink-muted">Background</span>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-5 w-8 cursor-pointer rounded border border-showcase-navy/10"
                  />
                  <button
                    onClick={() => setBackgroundColor("#ffffff")}
                    className="text-[10px] text-showcase-purple hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* ── File operations ─────────────────────────────────── */}
        <div className="relative">
          <Btn onClick={() => setShowFileMenu(!showFileMenu)} title="File">
            <Save className="h-3.5 w-3.5 me-1" />
            <span className="text-[10px]">File</span>
            <ChevronDown className="ms-0.5 h-3 w-3" />
          </Btn>
          {showFileMenu && (
            <div className="absolute top-full right-0 z-50 mt-1 w-56 rounded-xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky">
              <button
                onClick={() => { setShowTemplates(true); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-showcase-purple font-bold transition-colors hover:bg-pastel-lavender/50"
              >
                <LayoutTemplate className="h-3.5 w-3.5" /> New from Template
              </button>
              <div className="my-1 border-t border-showcase-navy/5" />
              <button
                onClick={() => { saveToLocalStorage(); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <Save className="h-3.5 w-3.5" /> Save to Browser
              </button>
              <button
                onClick={() => { exportProject(); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <FileDown className="h-3.5 w-3.5" /> Download Project (.json)
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <Upload className="h-3.5 w-3.5" /> Open Project (.json)
              </button>
              <div className="my-1 border-t border-showcase-navy/5" />
              <button
                onClick={() => {
                  if (confirm("Clear the entire canvas? This cannot be undone.")) {
                    clearCanvas();
                  }
                  setShowFileMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-showcase-coral transition-colors hover:bg-showcase-coral/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Canvas
              </button>
            </div>
          )}
        </div>

        {/* ── Export ───────────────────────────────────────────── */}
        <Btn onClick={() => setShowExportDialog(true)} title="Export (Full Dialog)">
          <Download className="h-3.5 w-3.5 me-1" />
          <span className="text-[10px]">Export</span>
        </Btn>

        <div className="relative">
          <Btn onClick={() => setShowExportMenu(!showExportMenu)} title="Quick Export Options">
            <ChevronDown className="h-3 w-3" />
          </Btn>
          {showExportMenu && (
            <div className="absolute top-full right-0 z-50 mt-1 w-60 rounded-xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky max-h-96 overflow-y-auto">
              {/* PNG */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">PNG</p>
              {[1, 2, 3, 4].map((m) => (
                <button
                  key={`png-${m}`}
                  onClick={() => { exportImage("png", m, false); setShowExportMenu(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
                >
                  <span>PNG {m}x</span>
                  <span className="text-[10px] text-ink-light">
                    {canvasSize.width * m} x {canvasSize.height * m}
                  </span>
                </button>
              ))}
              <button
                onClick={() => { exportImage("png", 2, true); setShowExportMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-showcase-purple transition-colors hover:bg-pastel-lavender/50"
              >
                <FileImage className="h-3.5 w-3.5" /> PNG 2x (Transparent)
              </button>

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* JPEG */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">JPEG</p>
              {[1, 2].map((m) => (
                <button
                  key={`jpeg-${m}`}
                  onClick={() => { exportImage("jpeg", m, false); setShowExportMenu(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
                >
                  <span>JPEG {m}x</span>
                  <span className="text-[10px] text-ink-light">
                    {canvasSize.width * m} x {canvasSize.height * m}
                  </span>
                </button>
              ))}

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* SVG */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">Vector</p>
              <button
                onClick={() => { exportSVG(); setShowExportMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <FileType2 className="h-3.5 w-3.5" /> SVG (Scalable)
              </button>

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* PDF */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">PDF</p>
              {[150, 300, 600].map((dpi) => (
                <button
                  key={`pdf-${dpi}`}
                  onClick={() => { exportPDF(dpi); setShowExportMenu(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
                >
                  <span>PDF ({dpi} DPI)</span>
                  <span className="text-[10px] text-ink-light">
                    {dpi === 150 ? "Web" : dpi === 300 ? "Print" : "High-Res"}
                  </span>
                </button>
              ))}

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* Copy to clipboard */}
              <button
                onClick={() => { copyImageToClipboard(2); setShowExportMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-showcase-purple transition-colors hover:bg-pastel-lavender/50"
              >
                <ClipboardCopy className="h-3.5 w-3.5" /> Copy to Clipboard (2x)
              </button>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts */}
        <Btn onClick={() => setShowShortcuts(!showShortcuts)} title="Keyboard Shortcuts">
          <Keyboard className="h-3.5 w-3.5" />
        </Btn>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* ── Close menus on click outside ──────────────────────── */}
      {(showCanvasMenu || showExportMenu || showFileMenu || showAlignMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCanvasMenu(false);
            setShowExportMenu(false);
            setShowFileMenu(false);
            setShowAlignMenu(false);
          }}
        />
      )}

      {/* ── Templates modal ──────────────────────────────────── */}
      {showTemplates && (
        <TemplatesPanel onClose={() => setShowTemplates(false)} />
      )}

      {/* ── Export dialog ─────────────────────────────────────── */}
      {showExportDialog && (
        <ExportDialog onClose={() => setShowExportDialog(false)} />
      )}

      {/* ── Keyboard shortcuts modal ──────────────────────────── */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="w-full max-w-md rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink-dark">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="rounded-lg p-1 hover:bg-pastel-lavender">
                <span className="text-ink-muted">&times;</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              {[
                ["V", "Select tool"],
                ["T", "Text tool"],
                ["R", "Rectangle tool"],
                ["C", "Circle tool"],
                ["L", "Line tool"],
                ["A", "Arrow tool"],
                ["F", "Freehand tool"],
                ["K", "Label tool"],
                ["M", "Marker tool"],
                ["G", "Toggle grid"],
                ["Delete", "Delete selected"],
                ["Ctrl+Z", "Undo"],
                ["Ctrl+Shift+Z", "Redo"],
                ["Ctrl+C", "Copy"],
                ["Ctrl+V", "Paste / Paste image"],
                ["Ctrl+D", "Duplicate"],
                ["Ctrl+A", "Select all"],
                ["Ctrl+G", "Group"],
                ["Ctrl+Shift+G", "Ungroup"],
                ["Ctrl+S", "Save to browser"],
                ["Space + Drag", "Pan canvas"],
                ["Scroll", "Zoom in/out"],
                ["Escape", "Deselect / Cancel"],
                ["+", "Zoom in"],
                ["-", "Zoom out"],
                ["Right-click", "Context menu"],
              ].map(([key, action]) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <span className="text-ink-muted">{action}</span>
                  <kbd className="rounded border border-showcase-navy/10 bg-pastel-cream/50 px-1.5 py-0.5 text-[10px] font-bold text-ink-dark">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
