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
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const TemplatesPanel = dynamic(() => import("./TemplatesPanel"), { ssr: false });
const ExportDialog = dynamic(() => import("./ExportDialog"), { ssr: false });

const TOOL_ITEMS: { id: ActiveTool; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { id: "select",    icon: MousePointer2, labelKey: "selectTool" },
  { id: "text",      icon: Type,          labelKey: "textTool" },
  { id: "rect",      icon: Square,        labelKey: "rectangleTool" },
  { id: "circle",    icon: CircleIcon,    labelKey: "circleTool" },
  { id: "line",      icon: Minus,         labelKey: "lineTool" },
  { id: "arrow",     icon: ArrowRight,    labelKey: "arrowTool" },
  { id: "freehand",  icon: Pencil,        labelKey: "freehandTool" },
  { id: "connector", icon: Spline,        labelKey: "connectorTool" },
  { id: "label",     icon: Tag,           labelKey: "labelTool" },
  { id: "marker",    icon: Hash,          labelKey: "markerTool" },
];

export default function Toolbar() {
  const t = useTranslations("tools.illustrationMaker.ui.toolbar");
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
              title={t(tool.labelKey)}
            >
              <Icon className="h-4 w-4" />
            </Btn>
          );
        })}

        <Divider />

        {/* ── Selection actions ───────────────────────────────── */}
        <Btn onClick={copySelected} disabled={!hasSelection} title={t("copy")}>
          <Copy className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={pasteClipboard} title={t("paste")}>
          <Clipboard className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={duplicateSelected} disabled={!hasSelection} title={t("duplicate")}>
          <Image className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={deleteSelected} disabled={!hasSelection} title={t("delete")}>
          <Trash2 className="h-3.5 w-3.5" />
        </Btn>

        <Divider />

        {/* ── Layer ordering ──────────────────────────────────── */}
        <Btn onClick={bringToFront} disabled={!hasSelection} title={t("bringToFront")}>
          <ChevronsUp className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={bringForward} disabled={!hasSelection} title={t("bringForward")}>
          <ArrowUp className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={sendBackward} disabled={!hasSelection} title={t("sendBackward")}>
          <ArrowDown className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={sendToBack} disabled={!hasSelection} title={t("sendToBack")}>
          <ChevronsDown className="h-3.5 w-3.5" />
        </Btn>

        <Divider />

        {/* ── Group / Lock ────────────────────────────────────── */}
        <Btn onClick={groupSelected} disabled={!isMultiSelect} title={t("group")}>
          <Group className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={ungroupSelected} disabled={!isGroup} title={t("ungroup")}>
          <Ungroup className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={lockSelected} disabled={!hasSelection} title={t("lockUnlock")}>
          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </Btn>

        {/* ── Alignment (when multi-selected) ─────────────────── */}
        {isMultiSelect && (
          <>
            <Divider />
            <div className="relative">
              <Btn onClick={() => setShowAlignMenu(!showAlignMenu)} title={t("alignDistribute")}>
                <AlignCenterVertical className="h-3.5 w-3.5 me-0.5" />
                <ChevronDown className="h-3 w-3" />
              </Btn>
              {showAlignMenu && (
                <div className="absolute top-full start-0 z-50 mt-1 w-48 rounded-xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky">
                  <p className="px-3 py-1 text-[10px] font-bold text-ink-light">{t("alignSection")}</p>
                  <div className="flex gap-0.5 px-2 pb-1">
                    {([
                      { dir: "left" as const, icon: AlignStartVertical, labelKey: "alignLeft" as const },
                      { dir: "center" as const, icon: AlignCenterVertical, labelKey: "alignCenter" as const },
                      { dir: "right" as const, icon: AlignEndVertical, labelKey: "alignRight" as const },
                      { dir: "top" as const, icon: AlignStartHorizontal, labelKey: "alignTop" as const },
                      { dir: "middle" as const, icon: AlignCenterHorizontal, labelKey: "alignMiddle" as const },
                      { dir: "bottom" as const, icon: AlignEndHorizontal, labelKey: "alignBottom" as const },
                    ]).map(({ dir, icon: Icon, labelKey }) => (
                      <button
                        key={dir}
                        onClick={() => { alignObjects(dir); setShowAlignMenu(false); }}
                        className="rounded-lg border-2 border-transparent p-1.5 text-ink-muted transition-colors hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
                        title={t(labelKey)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                  <p className="px-3 py-1 text-[10px] font-bold text-ink-light">{t("distributeSection")}</p>
                  <div className="flex gap-0.5 px-2 pb-1">
                    <button
                      onClick={() => { distributeObjects("horizontal"); setShowAlignMenu(false); }}
                      className="rounded-lg border-2 border-transparent p-1.5 text-ink-muted transition-colors hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
                      title={t("distributeHorizontally")}
                    >
                      <AlignHorizontalSpaceAround className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { distributeObjects("vertical"); setShowAlignMenu(false); }}
                      className="rounded-lg border-2 border-transparent p-1.5 text-ink-muted transition-colors hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
                      title={t("distributeVertically")}
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
        <Btn onClick={undo} disabled={!canUndo} title={t("undo")}>
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={redo} disabled={!canRedo} title={t("redo")}>
          <Redo2 className="h-4 w-4" />
        </Btn>

        <Divider />

        {/* ── Zoom ────────────────────────────────────────────── */}
        <Btn onClick={() => setZoom(zoom * 1.2)} title={t("zoomIn")}>
          <ZoomIn className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => setZoom(zoom / 1.2)} title={t("zoomOut")}>
          <ZoomOut className="h-4 w-4" />
        </Btn>
        <Btn onClick={handleFitToScreen} title={t("fitToScreen")}>
          <Maximize className="h-4 w-4" />
        </Btn>

        {/* ── Grid / Snap / Rulers ──────────────────────────────── */}
        <Btn onClick={toggleGrid} active={showGrid} title={t("toggleGrid")}>
          <Grid3X3 className="h-4 w-4" />
        </Btn>
        <Btn onClick={toggleSnapping} active={showSnapping} title={t("toggleSnapping")}>
          <Magnet className="h-4 w-4" />
        </Btn>
        <Btn onClick={toggleRulers} active={showRulers} title={t("toggleRulers")}>
          <Ruler className="h-4 w-4" />
        </Btn>

        <Divider />

        {/* ── Upload image & Scale bar ─────────────────────── */}
        <Btn onClick={() => imageInputRef.current?.click()} title={t("uploadImage")}>
          <ImagePlus className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={addScaleBarToCanvas} title={t("addScaleBar")}>
          <ScalingIcon className="h-3.5 w-3.5" />
        </Btn>

        {/* ── Canvas size ─────────────────────────────────────── */}
        <div className="relative">
          <Btn onClick={() => setShowCanvasMenu(!showCanvasMenu)} title={t("canvasSize")}>
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
                    {t("reset")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* ── File operations ─────────────────────────────────── */}
        <div className="relative">
          <Btn onClick={() => setShowFileMenu(!showFileMenu)} title={t("file")}>
            <Save className="h-3.5 w-3.5 me-1" />
            <span className="text-[10px]">{t("file")}</span>
            <ChevronDown className="ms-0.5 h-3 w-3" />
          </Btn>
          {showFileMenu && (
            <div className="absolute top-full end-0 z-50 mt-1 w-56 rounded-xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky">
              <button
                onClick={() => { setShowTemplates(true); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-showcase-purple font-bold transition-colors hover:bg-pastel-lavender/50"
              >
                <LayoutTemplate className="h-3.5 w-3.5" /> {t("newFromTemplate")}
              </button>
              <div className="my-1 border-t border-showcase-navy/5" />
              <button
                onClick={() => { saveToLocalStorage(); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <Save className="h-3.5 w-3.5" /> {t("saveToBrowser")}
              </button>
              <button
                onClick={() => { exportProject(); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <FileDown className="h-3.5 w-3.5" /> {t("downloadProject")}
              </button>
              <button
                onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <Upload className="h-3.5 w-3.5" /> {t("openProject")}
              </button>
              <div className="my-1 border-t border-showcase-navy/5" />
              <button
                onClick={() => {
                  if (confirm(t("clearCanvasConfirm"))) {
                    clearCanvas();
                  }
                  setShowFileMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-showcase-coral transition-colors hover:bg-showcase-coral/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> {t("clearCanvas")}
              </button>
            </div>
          )}
        </div>

        {/* ── Export ───────────────────────────────────────────── */}
        <Btn onClick={() => setShowExportDialog(true)} title={t("exportFullDialog")}>
          <Download className="h-3.5 w-3.5 me-1" />
          <span className="text-[10px]">{t("export")}</span>
        </Btn>

        <div className="relative">
          <Btn onClick={() => setShowExportMenu(!showExportMenu)} title={t("quickExportOptions")}>
            <ChevronDown className="h-3 w-3" />
          </Btn>
          {showExportMenu && (
            <div className="absolute top-full end-0 z-50 mt-1 w-60 rounded-xl border-3 border-showcase-navy/10 bg-white p-2 shadow-chunky max-h-96 overflow-y-auto">
              {/* PNG */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">{t("pngLabel")}</p>
              {[1, 2, 3, 4].map((m) => (
                <button
                  key={`png-${m}`}
                  onClick={() => { exportImage("png", m, false); setShowExportMenu(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
                >
                  <span>{t("pngMultiplier", { m })}</span>
                  <span className="text-[10px] text-ink-light">
                    {canvasSize.width * m} x {canvasSize.height * m}
                  </span>
                </button>
              ))}
              <button
                onClick={() => { exportImage("png", 2, true); setShowExportMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-showcase-purple transition-colors hover:bg-pastel-lavender/50"
              >
                <FileImage className="h-3.5 w-3.5" /> {t("pngTransparent")}
              </button>

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* JPEG */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">{t("jpegLabel")}</p>
              {[1, 2].map((m) => (
                <button
                  key={`jpeg-${m}`}
                  onClick={() => { exportImage("jpeg", m, false); setShowExportMenu(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
                >
                  <span>{t("jpegMultiplier", { m })}</span>
                  <span className="text-[10px] text-ink-light">
                    {canvasSize.width * m} x {canvasSize.height * m}
                  </span>
                </button>
              ))}

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* SVG */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">{t("vectorLabel")}</p>
              <button
                onClick={() => { exportSVG(); setShowExportMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
              >
                <FileType2 className="h-3.5 w-3.5" /> {t("svgScalable")}
              </button>

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* PDF */}
              <p className="px-3 py-1 text-[10px] font-bold text-ink-light">{t("pdfLabel")}</p>
              {[150, 300, 600].map((dpi) => (
                <button
                  key={`pdf-${dpi}`}
                  onClick={() => { exportPDF(dpi); setShowExportMenu(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-pastel-lavender/50"
                >
                  <span>{t("pdfDpi", { dpi })}</span>
                  <span className="text-[10px] text-ink-light">
                    {dpi === 150 ? t("dpiWeb") : dpi === 300 ? t("dpiPrint") : t("dpiHighRes")}
                  </span>
                </button>
              ))}

              <div className="my-1 border-t border-showcase-navy/5" />

              {/* Copy to clipboard */}
              <button
                onClick={() => { copyImageToClipboard(2); setShowExportMenu(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-showcase-purple transition-colors hover:bg-pastel-lavender/50"
              >
                <ClipboardCopy className="h-3.5 w-3.5" /> {t("copyToClipboard")}
              </button>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts */}
        <Btn onClick={() => setShowShortcuts(!showShortcuts)} title={t("keyboardShortcuts")}>
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
              <h3 className="font-display text-lg font-bold text-ink-dark">{t("keyboardShortcuts")}</h3>
              <button onClick={() => setShowShortcuts(false)} className="rounded-lg p-1 hover:bg-pastel-lavender">
                <span className="text-ink-muted">&times;</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              {([
                ["V", t("shortcutSelect")],
                ["T", t("shortcutText")],
                ["R", t("shortcutRectangle")],
                ["C", t("shortcutCircle")],
                ["L", t("shortcutLine")],
                ["A", t("shortcutArrow")],
                ["F", t("shortcutFreehand")],
                ["K", t("shortcutLabel")],
                ["M", t("shortcutMarker")],
                ["G", t("shortcutGrid")],
                ["Delete", t("shortcutDelete")],
                ["Ctrl+Z", t("shortcutUndo")],
                ["Ctrl+Shift+Z", t("shortcutRedo")],
                ["Ctrl+C", t("shortcutCopy")],
                ["Ctrl+V", t("shortcutPaste")],
                ["Ctrl+D", t("shortcutDuplicate")],
                ["Ctrl+A", t("shortcutSelectAll")],
                ["Ctrl+G", t("shortcutGroup")],
                ["Ctrl+Shift+G", t("shortcutUngroup")],
                ["Ctrl+S", t("shortcutSave")],
                ["Space + Drag", t("shortcutPan")],
                ["Scroll", t("shortcutZoom")],
                ["Escape", t("shortcutDeselect")],
                ["+", t("shortcutZoomIn")],
                ["-", t("shortcutZoomOut")],
                ["Right-click", t("shortcutContextMenu")],
              ] as const).map(([key, action]) => (
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
