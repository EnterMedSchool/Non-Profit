"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";

/* ── Types ──────────────────────────────────────────────────────── */

export type ActiveTool =
  | "select"
  | "text"
  | "rect"
  | "circle"
  | "line"
  | "arrow"
  | "freehand"
  | "connector"
  | "label"
  | "marker";

export type AlignDirection =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom";

export type DistributeAxis = "horizontal" | "vertical";

export interface SnapGuide {
  orientation: "horizontal" | "vertical";
  position: number; // canvas-space coordinate
}

export interface PageState {
  id: string;
  name: string;
  canvasJSON: string | null;
}

export interface CanvasPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: "slide-16-9",    label: "Slide (16:9)",          width: 1920, height: 1080 },
  { id: "slide-4-3",     label: "Slide (4:3)",           width: 1600, height: 1200 },
  { id: "square",        label: "Square",                width: 1200, height: 1200 },
  { id: "graphical-abs", label: "Graphical Abstract",    width: 1200, height: 600 },
  { id: "poster-a4",     label: "Poster (A4 Portrait)",  width: 2480, height: 3508 },
  { id: "poster-a3",     label: "Poster (A3 Landscape)", width: 4960, height: 3508 },
  { id: "custom",        label: "Custom",                width: 1200, height: 800 },
];

const STORAGE_KEY = "ems-illustration-maker";
const MAX_HISTORY = 50;

/* ── Context value ──────────────────────────────────────────────── */

interface IllustrationContextValue {
  /* Canvas */
  canvas: FabricCanvas | null;
  setCanvas: (c: FabricCanvas | null) => void;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
  zoom: number;
  setZoom: (z: number) => void;
  backgroundColor: string;
  setBackgroundColor: (c: string) => void;

  /* Tools */
  activeTool: ActiveTool;
  setActiveTool: (t: ActiveTool) => void;

  /* Selection */
  selectedObjects: FabricObject[];

  /* Grid */
  showGrid: boolean;
  toggleGrid: () => void;

  /* Snapping */
  showSnapping: boolean;
  toggleSnapping: () => void;
  snapGuides: SnapGuide[];
  setSnapGuides: (guides: SnapGuide[]) => void;

  /* Rulers */
  showRulers: boolean;
  toggleRulers: () => void;

  /* Alignment */
  alignObjects: (direction: AlignDirection) => void;
  distributeObjects: (axis: DistributeAxis) => void;

  /* History */
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  /* Object actions */
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  pasteClipboard: () => void;
  selectAll: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  lockSelected: () => void;

  /* Canvas actions */
  addImageToCanvas: (url: string, dropX?: number, dropY?: number) => Promise<void>;
  addTextToCanvas: () => void;
  addShapeToCanvas: (type: "rect" | "circle" | "line" | "arrow") => void;
  addLabelToCanvas: (x?: number, y?: number) => void;
  addMarkerToCanvas: (x?: number, y?: number) => void;
  addScaleBarToCanvas: () => void;
  clearCanvas: () => void;

  /* Persistence */
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportProject: () => void;
  importProject: (json: string) => void;

  /* Export */
  exportImage: (format: "png" | "jpeg", multiplier: number, transparent: boolean) => void;
  exportSVG: () => void;
  exportPDF: (dpi: number) => void;
  copyImageToClipboard: (multiplier: number) => Promise<void>;

  /* Image upload */
  addImageFromFile: (file: File) => Promise<void>;

  /* Layers */
  objects: FabricObject[];
  refreshObjects: () => void;

  /* Multi-page */
  pages: PageState[];
  activePageIndex: number;
  addPage: () => void;
  switchPage: (index: number) => void;
  deletePage: (index: number) => void;
  renamePage: (index: number, name: string) => void;
}

const IllustrationContext = createContext<IllustrationContextValue | null>(null);

export function useIllustration() {
  const ctx = useContext(IllustrationContext);
  if (!ctx) throw new Error("useIllustration must be used within IllustrationProvider");
  return ctx;
}

/* ── Provider ───────────────────────────────────────────────────── */

export function IllustrationProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<FabricCanvas | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [zoom, setZoomState] = useState(1);
  const [backgroundColor, setBgColor] = useState("#ffffff");
  const [selectedObjects, setSelectedObjects] = useState<FabricObject[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showSnapping, setShowSnapping] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [pages, setPages] = useState<PageState[]>([
    { id: "page-1", name: "Page 1", canvasJSON: null },
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // History stacks
  const historyStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isRestoring = useRef(false);

  // Clipboard
  const clipboard = useRef<FabricObject | null>(null);

  /* ── Set canvas ref ─────────────────────────────────────────── */

  const setCanvas = useCallback((c: FabricCanvas | null) => {
    canvasRef.current = c;
    setCanvasReady(!!c);
  }, []);

  const canvas = canvasRef.current;

  /* ── Refresh objects list ───────────────────────────────────── */

  const refreshObjects = useCallback(() => {
    if (!canvasRef.current) return;
    const objs = canvasRef.current.getObjects().slice();
    setObjects(objs);
  }, []);

  /* ── Selection tracking ─────────────────────────────────────── */

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onSelect = () => {
      const active = c.getActiveObjects();
      setSelectedObjects(active || []);
    };
    const onDeselect = () => setSelectedObjects([]);

    c.on("selection:created", onSelect);
    c.on("selection:updated", onSelect);
    c.on("selection:cleared", onDeselect);

    return () => {
      c.off("selection:created", onSelect);
      c.off("selection:updated", onSelect);
      c.off("selection:cleared", onDeselect);
    };
  }, [canvasReady]);

  /* ── Object change tracking ─────────────────────────────────── */

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onModified = () => {
      if (!isRestoring.current) {
        pushHistory();
      }
      refreshObjects();
    };

    c.on("object:added", onModified);
    c.on("object:removed", onModified);
    c.on("object:modified", onModified);

    return () => {
      c.off("object:added", onModified);
      c.off("object:removed", onModified);
      c.off("object:modified", onModified);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);

  /* ── History ────────────────────────────────────────────────── */

  const pushHistory = useCallback(() => {
    const c = canvasRef.current;
    if (!c || isRestoring.current) return;
    const json = JSON.stringify(c.toJSON());
    historyStack.current.push(json);
    if (historyStack.current.length > MAX_HISTORY) {
      historyStack.current.shift();
    }
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(async () => {
    const c = canvasRef.current;
    if (!c || historyStack.current.length === 0) return;

    isRestoring.current = true;

    // Save current state to redo
    const current = JSON.stringify(c.toJSON());
    redoStack.current.push(current);

    // Pop previous state
    const prev = historyStack.current.pop()!;
    await c.loadFromJSON(prev);
    c.renderAll();
    refreshObjects();

    setCanUndo(historyStack.current.length > 0);
    setCanRedo(true);

    isRestoring.current = false;
  }, [refreshObjects]);

  const redo = useCallback(async () => {
    const c = canvasRef.current;
    if (!c || redoStack.current.length === 0) return;

    isRestoring.current = true;

    // Save current state to undo
    const current = JSON.stringify(c.toJSON());
    historyStack.current.push(current);

    // Pop redo state
    const next = redoStack.current.pop()!;
    await c.loadFromJSON(next);
    c.renderAll();
    refreshObjects();

    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);

    isRestoring.current = false;
  }, [refreshObjects]);

  /* ── Zoom ───────────────────────────────────────────────────── */

  const setZoom = useCallback((z: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const clamped = Math.min(Math.max(z, 0.1), 5);
    c.setZoom(clamped);
    c.renderAll();
    setZoomState(clamped);
  }, []);

  /* ── Background color ──────────────────────────────────────── */

  const setBackgroundColor = useCallback((color: string) => {
    const c = canvasRef.current;
    if (!c) return;
    c.backgroundColor = color;
    c.renderAll();
    setBgColor(color);
  }, []);

  /* ── Toggle grid ────────────────────────────────────────────── */

  const toggleGrid = useCallback(() => {
    setShowGrid((v) => !v);
  }, []);

  /* ── Toggle snapping ───────────────────────────────────────── */

  const toggleSnapping = useCallback(() => {
    setShowSnapping((v) => !v);
  }, []);

  /* ── Toggle rulers ─────────────────────────────────────────── */

  const toggleRulers = useCallback(() => {
    setShowRulers((v) => !v);
  }, []);

  /* ── Align objects ─────────────────────────────────────────── */

  const alignObjects = useCallback((direction: AlignDirection) => {
    const c = canvasRef.current;
    if (!c) return;
    const activeObj = c.getActiveObject();
    if (!activeObj) return;

    let objs: FabricObject[];
    if (activeObj.type === "activeSelection") {
      objs = (activeObj as any).getObjects() as FabricObject[];
    } else {
      return; // Need multiple objects
    }

    if (objs.length < 2) return;

    // Calculate bounding boxes in canvas coords
    const bounds = objs.map((o) => {
      const bound = o.getBoundingRect();
      return { obj: o, ...bound };
    });

    switch (direction) {
      case "left": {
        const minLeft = Math.min(...bounds.map((b) => b.left));
        bounds.forEach((b) => {
          b.obj.set({ left: (b.obj.left || 0) + (minLeft - b.left) });
        });
        break;
      }
      case "center": {
        const minLeft = Math.min(...bounds.map((b) => b.left));
        const maxRight = Math.max(...bounds.map((b) => b.left + b.width));
        const centerX = (minLeft + maxRight) / 2;
        bounds.forEach((b) => {
          const objCenter = b.left + b.width / 2;
          b.obj.set({ left: (b.obj.left || 0) + (centerX - objCenter) });
        });
        break;
      }
      case "right": {
        const maxRight = Math.max(...bounds.map((b) => b.left + b.width));
        bounds.forEach((b) => {
          const objRight = b.left + b.width;
          b.obj.set({ left: (b.obj.left || 0) + (maxRight - objRight) });
        });
        break;
      }
      case "top": {
        const minTop = Math.min(...bounds.map((b) => b.top));
        bounds.forEach((b) => {
          b.obj.set({ top: (b.obj.top || 0) + (minTop - b.top) });
        });
        break;
      }
      case "middle": {
        const minTop = Math.min(...bounds.map((b) => b.top));
        const maxBottom = Math.max(...bounds.map((b) => b.top + b.height));
        const centerY = (minTop + maxBottom) / 2;
        bounds.forEach((b) => {
          const objCenter = b.top + b.height / 2;
          b.obj.set({ top: (b.obj.top || 0) + (centerY - objCenter) });
        });
        break;
      }
      case "bottom": {
        const maxBottom = Math.max(...bounds.map((b) => b.top + b.height));
        bounds.forEach((b) => {
          const objBottom = b.top + b.height;
          b.obj.set({ top: (b.obj.top || 0) + (maxBottom - objBottom) });
        });
        break;
      }
    }

    objs.forEach((o) => o.setCoords());
    c.renderAll();
    pushHistory();
    refreshObjects();
  }, [pushHistory, refreshObjects]);

  /* ── Distribute objects ─────────────────────────────────────── */

  const distributeObjects = useCallback((axis: DistributeAxis) => {
    const c = canvasRef.current;
    if (!c) return;
    const activeObj = c.getActiveObject();
    if (!activeObj) return;

    let objs: FabricObject[];
    if (activeObj.type === "activeSelection") {
      objs = (activeObj as any).getObjects() as FabricObject[];
    } else {
      return;
    }

    if (objs.length < 3) return;

    const bounds = objs.map((o) => {
      const bound = o.getBoundingRect();
      return { obj: o, ...bound };
    });

    if (axis === "horizontal") {
      bounds.sort((a, b) => a.left - b.left);
      const totalWidth = bounds.reduce((sum, b) => sum + b.width, 0);
      const minLeft = bounds[0].left;
      const maxRight = bounds[bounds.length - 1].left + bounds[bounds.length - 1].width;
      const totalSpace = maxRight - minLeft - totalWidth;
      const gap = totalSpace / (bounds.length - 1);

      let currentLeft = minLeft;
      bounds.forEach((b) => {
        b.obj.set({ left: (b.obj.left || 0) + (currentLeft - b.left) });
        currentLeft += b.width + gap;
      });
    } else {
      bounds.sort((a, b) => a.top - b.top);
      const totalHeight = bounds.reduce((sum, b) => sum + b.height, 0);
      const minTop = bounds[0].top;
      const maxBottom = bounds[bounds.length - 1].top + bounds[bounds.length - 1].height;
      const totalSpace = maxBottom - minTop - totalHeight;
      const gap = totalSpace / (bounds.length - 1);

      let currentTop = minTop;
      bounds.forEach((b) => {
        b.obj.set({ top: (b.obj.top || 0) + (currentTop - b.top) });
        currentTop += b.height + gap;
      });
    }

    objs.forEach((o) => o.setCoords());
    c.renderAll();
    pushHistory();
    refreshObjects();
  }, [pushHistory, refreshObjects]);

  /* ── Add image to canvas ────────────────────────────────────── */

  const addImageToCanvas = useCallback(async (url: string, dropX?: number, dropY?: number) => {
    const c = canvasRef.current;
    if (!c) {
      console.warn("[IllustrationMaker] Canvas not ready — cannot add image");
      return;
    }

    try {
      const { FabricImage } = await import("fabric");

      // Load image manually instead of FabricImage.fromURL to avoid
      // crossOrigin issues with same-origin SVGs and for better error control.
      const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });

      const fabricImg = new FabricImage(imgEl);

      if (!fabricImg.width || !fabricImg.height) {
        console.warn("[IllustrationMaker] Image has 0 dimensions:", url);
        return;
      }

      // Scale image to fit nicely (max 200px on largest side initially)
      const maxSize = 200;
      const scale = Math.min(maxSize / fabricImg.width, maxSize / fabricImg.height, 1);
      fabricImg.scale(scale);

      const scaledW = fabricImg.width * scale;
      const scaledH = fabricImg.height * scale;

      if (dropX !== undefined && dropY !== undefined) {
        // Place at drop position (already in canvas coordinates)
        fabricImg.set({
          left: dropX - scaledW / 2,
          top: dropY - scaledH / 2,
        });
      } else {
        // Place in center of visible area
        const vpt = c.viewportTransform!;
        const zoom = c.getZoom();
        const cx = (-vpt[4] + c.width! / 2) / zoom;
        const cy = (-vpt[5] + c.height! / 2) / zoom;
        fabricImg.set({
          left: cx - scaledW / 2,
          top: cy - scaledH / 2,
        });
      }

      c.add(fabricImg);
      c.setActiveObject(fabricImg);
      c.renderAll();
    } catch (err) {
      console.error("[IllustrationMaker] addImageToCanvas failed:", err);
    }
  }, []);

  /* ── Add text ───────────────────────────────────────────────── */

  const addTextToCanvas = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;

    const { Textbox } = await import("fabric");
    const vpt = c.viewportTransform!;
    const cx = (-vpt[4] + c.width! / 2) / c.getZoom();
    const cy = (-vpt[5] + c.height! / 2) / c.getZoom();

    const text = new Textbox("Type here", {
      left: cx - 80,
      top: cy - 15,
      width: 160,
      fontSize: 24,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fill: "#1a1a2e",
      editable: true,
    });

    c.add(text);
    c.setActiveObject(text);
    c.renderAll();
  }, []);

  /* ── Add shape ──────────────────────────────────────────────── */

  const addShapeToCanvas = useCallback(async (type: "rect" | "circle" | "line" | "arrow") => {
    const c = canvasRef.current;
    if (!c) return;

    const fabric = await import("fabric");
    const vpt = c.viewportTransform!;
    const cx = (-vpt[4] + c.width! / 2) / c.getZoom();
    const cy = (-vpt[5] + c.height! / 2) / c.getZoom();

    let obj: FabricObject;

    switch (type) {
      case "rect":
        obj = new fabric.Rect({
          left: cx - 60,
          top: cy - 40,
          width: 120,
          height: 80,
          fill: "rgba(108, 92, 231, 0.2)",
          stroke: "#6C5CE7",
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        });
        break;
      case "circle":
        obj = new fabric.Circle({
          left: cx - 40,
          top: cy - 40,
          radius: 40,
          fill: "rgba(0, 217, 192, 0.2)",
          stroke: "#00D9C0",
          strokeWidth: 2,
        });
        break;
      case "line":
        obj = new fabric.Line([cx - 60, cy, cx + 60, cy], {
          stroke: "#1a1a2e",
          strokeWidth: 3,
          strokeLineCap: "round",
        });
        break;
      case "arrow": {
        // Create arrow as a group: line + triangle
        const line = new fabric.Line([0, 25, 100, 25], {
          stroke: "#1a1a2e",
          strokeWidth: 3,
          strokeLineCap: "round",
        });
        const head = new fabric.Triangle({
          left: 90,
          top: 10,
          width: 16,
          height: 20,
          fill: "#1a1a2e",
          angle: 90,
        });
        obj = new fabric.Group([line, head], {
          left: cx - 50,
          top: cy - 12,
        });
        break;
      }
      default:
        return;
    }

    c.add(obj);
    c.setActiveObject(obj);
    c.renderAll();
  }, []);

  /* ── Add label with leader line ──────────────────────────────── */

  const addLabelToCanvas = useCallback(async (x?: number, y?: number) => {
    const c = canvasRef.current;
    if (!c) return;

    const fabric = await import("fabric");
    const vpt = c.viewportTransform!;
    const zoomLevel = c.getZoom();
    const cx = x ?? (-vpt[4] + c.width! / 2) / zoomLevel;
    const cy = y ?? (-vpt[5] + c.height! / 2) / zoomLevel;

    // Leader line
    const line = new fabric.Line([cx, cy, cx + 80, cy - 50], {
      stroke: "#636e72",
      strokeWidth: 1.5,
      strokeLineCap: "round",
    });

    // Small dot at anchor
    const dot = new fabric.Circle({
      left: cx - 3,
      top: cy - 3,
      radius: 3,
      fill: "#636e72",
      stroke: "",
      strokeWidth: 0,
    });

    // Text label
    const text = new fabric.Textbox("Label", {
      left: cx + 82,
      top: cy - 65,
      width: 80,
      fontSize: 14,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fill: "#1a1a2e",
      editable: true,
    });

    const group = new fabric.Group([line, dot, text], {
      left: cx - 5,
      top: cy - 65,
    });

    (group as any).customName = "Label";
    c.add(group);
    c.setActiveObject(group);
    c.renderAll();
  }, []);

  /* ── Add numbered marker ───────────────────────────────────── */

  const markerCountRef = useRef(0);

  const addMarkerToCanvas = useCallback(async (x?: number, y?: number) => {
    const c = canvasRef.current;
    if (!c) return;

    const fabric = await import("fabric");
    const vpt = c.viewportTransform!;
    const zoomLevel = c.getZoom();
    const cx = x ?? (-vpt[4] + c.width! / 2) / zoomLevel;
    const cy = y ?? (-vpt[5] + c.height! / 2) / zoomLevel;

    markerCountRef.current += 1;
    const num = markerCountRef.current;

    const circle = new fabric.Circle({
      radius: 14,
      fill: "#6C5CE7",
      stroke: "#ffffff",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
    });

    const text = new fabric.Text(String(num), {
      fontSize: 14,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fill: "#ffffff",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
    });

    const group = new fabric.Group([circle, text], {
      left: cx - 14,
      top: cy - 14,
    });

    (group as any).customName = `Marker ${num}`;
    c.add(group);
    c.setActiveObject(group);
    c.renderAll();
  }, []);

  /* ── Add scale bar ─────────────────────────────────────────── */

  const addScaleBarToCanvas = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;

    const fabric = await import("fabric");
    const vpt = c.viewportTransform!;
    const zoomLevel = c.getZoom();
    const cx = (-vpt[4] + c.width! / 2) / zoomLevel;
    const cy = (-vpt[5] + c.height! * 0.85) / zoomLevel;

    const barWidth = 100;
    const barHeight = 4;
    const capHeight = 12;

    // Main bar
    const bar = new fabric.Rect({
      left: 0,
      top: capHeight / 2 - barHeight / 2,
      width: barWidth,
      height: barHeight,
      fill: "#1a1a2e",
    });

    // Left cap
    const leftCap = new fabric.Line([0, 0, 0, capHeight], {
      stroke: "#1a1a2e",
      strokeWidth: 2,
    });

    // Right cap
    const rightCap = new fabric.Line([barWidth, 0, barWidth, capHeight], {
      stroke: "#1a1a2e",
      strokeWidth: 2,
    });

    // Label
    const label = new fabric.Text("100 \u00B5m", {
      left: barWidth / 2,
      top: capHeight + 4,
      fontSize: 12,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fill: "#1a1a2e",
      originX: "center",
      textAlign: "center",
    });

    const group = new fabric.Group([bar, leftCap, rightCap, label], {
      left: cx - barWidth / 2,
      top: cy,
    });

    (group as any).customName = "Scale Bar";
    c.add(group);
    c.setActiveObject(group);
    c.renderAll();
  }, []);

  /* ── Delete selected ────────────────────────────────────────── */

  const deleteSelected = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObjects();
    if (!active || active.length === 0) return;

    active.forEach((obj) => c.remove(obj));
    c.discardActiveObject();
    c.renderAll();
    refreshObjects();
  }, [refreshObjects]);

  /* ── Duplicate ──────────────────────────────────────────────── */

  const duplicateSelected = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active) return;

    const cloned = await active.clone();
    cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
    c.add(cloned);
    c.setActiveObject(cloned);
    c.renderAll();
  }, []);

  /* ── Copy / Paste ───────────────────────────────────────────── */

  const copySelected = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active) return;
    clipboard.current = await active.clone();
  }, []);

  const pasteClipboard = useCallback(async () => {
    const c = canvasRef.current;
    if (!c || !clipboard.current) return;
    const cloned = await clipboard.current.clone();
    cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
    c.add(cloned);
    c.setActiveObject(cloned);
    c.renderAll();
    // Update clipboard position for cascading pastes
    clipboard.current = await cloned.clone();
  }, []);

  /* ── Select all ─────────────────────────────────────────────── */

  const selectAll = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const { ActiveSelection } = await import("fabric");
    c.discardActiveObject();
    const objs = c.getObjects();
    if (objs.length === 0) return;
    const sel = new ActiveSelection(objs, { canvas: c });
    c.setActiveObject(sel);
    c.renderAll();
  }, []);

  /* ── Layering ───────────────────────────────────────────────── */

  const bringForward = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active) return;
    c.bringObjectForward(active);
    c.renderAll();
    refreshObjects();
  }, [refreshObjects]);

  const sendBackward = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active) return;
    c.sendObjectBackwards(active);
    c.renderAll();
    refreshObjects();
  }, [refreshObjects]);

  const bringToFront = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active) return;
    c.bringObjectToFront(active);
    c.renderAll();
    refreshObjects();
  }, [refreshObjects]);

  const sendToBack = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active) return;
    c.sendObjectToBack(active);
    c.renderAll();
    refreshObjects();
  }, [refreshObjects]);

  /* ── Group / Ungroup ────────────────────────────────────────── */

  const groupSelected = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active || active.type !== "activeSelection") return;

    const { Group: FabricGroup } = await import("fabric");
    const objs = (active as any).getObjects() as FabricObject[];
    c.discardActiveObject();
    objs.forEach((o) => c.remove(o));
    const group = new FabricGroup(objs);
    c.add(group);
    c.setActiveObject(group);
    c.renderAll();
    refreshObjects();
  }, [refreshObjects]);

  const ungroupSelected = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active || active.type !== "group") return;

    const { ActiveSelection } = await import("fabric");
    const items = (active as any).getObjects() as FabricObject[];
    (active as any).destroy?.();
    c.remove(active);

    items.forEach((item: FabricObject) => {
      c.add(item);
    });

    const sel = new ActiveSelection(items, { canvas: c });
    c.setActiveObject(sel);
    c.renderAll();
    refreshObjects();
  }, [refreshObjects]);

  /* ── Lock ───────────────────────────────────────────────────── */

  const lockSelected = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObjects();
    if (!active) return;
    active.forEach((obj) => {
      const isLocked = obj.lockMovementX;
      obj.set({
        lockMovementX: !isLocked,
        lockMovementY: !isLocked,
        lockRotation: !isLocked,
        lockScalingX: !isLocked,
        lockScalingY: !isLocked,
        hasControls: isLocked,
        selectable: true,
      });
    });
    c.renderAll();
  }, []);

  /* ── Clear canvas ───────────────────────────────────────────── */

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.clear();
    c.backgroundColor = backgroundColor;
    c.renderAll();
    refreshObjects();
    pushHistory();
  }, [backgroundColor, refreshObjects, pushHistory]);

  /* ── Persistence: localStorage ──────────────────────────────── */

  const saveToLocalStorage = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const data = {
      canvas: c.toJSON(),
      canvasSize,
      backgroundColor,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or unavailable
    }
  }, [canvasSize, backgroundColor]);

  const loadFromLocalStorage = useCallback((): boolean => {
    const c = canvasRef.current;
    if (!c) return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.canvasSize) setCanvasSize(data.canvasSize);
      if (data.backgroundColor) {
        setBgColor(data.backgroundColor);
        c.backgroundColor = data.backgroundColor;
      }
      isRestoring.current = true;
      c.loadFromJSON(data.canvas).then(() => {
        c.renderAll();
        refreshObjects();
        isRestoring.current = false;
      });
      return true;
    } catch {
      return false;
    }
  }, [refreshObjects]);

  /* ── Auto-save debounced ────────────────────────────────────── */

  useEffect(() => {
    if (!canvasReady) return;
    const timer = setInterval(() => {
      saveToLocalStorage();
    }, 10_000); // Auto-save every 10 seconds
    return () => clearInterval(timer);
  }, [canvasReady, saveToLocalStorage]);

  /* ── Export / Import project JSON ───────────────────────────── */

  const exportProject = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const data = {
      version: 1,
      app: "entermedschool-illustration-maker",
      canvas: c.toJSON(),
      canvasSize,
      backgroundColor,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `illustration-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [canvasSize, backgroundColor]);

  const importProject = useCallback(async (json: string) => {
    const c = canvasRef.current;
    if (!c) return;
    try {
      const data = JSON.parse(json);
      if (data.canvasSize) setCanvasSize(data.canvasSize);
      if (data.backgroundColor) {
        setBgColor(data.backgroundColor);
        c.backgroundColor = data.backgroundColor;
      }
      isRestoring.current = true;
      await c.loadFromJSON(data.canvas);
      c.renderAll();
      refreshObjects();
      isRestoring.current = false;
      pushHistory();
    } catch (e) {
      console.error("Failed to import project:", e);
    }
  }, [refreshObjects, pushHistory]);

  /* ── Export image ───────────────────────────────────────────── */

  const exportImage = useCallback((format: "png" | "jpeg", multiplier: number, transparent: boolean) => {
    const c = canvasRef.current;
    if (!c) return;

    // Temporarily set background if transparent
    const origBg = c.backgroundColor;
    if (transparent && format === "png") {
      c.backgroundColor = undefined as any;
      c.renderAll();
    }

    const dataURL = c.toDataURL({
      format,
      multiplier,
      quality: format === "jpeg" ? 0.92 : undefined,
    });

    // Restore background
    if (transparent && format === "png") {
      c.backgroundColor = origBg;
      c.renderAll();
    }

    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `illustration.${format}`;
    a.click();
  }, []);

  /* ── Export SVG ────────────────────────────────────────────── */

  const exportSVG = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const svg = c.toSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "illustration.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /* ── Export PDF ────────────────────────────────────────────── */

  const exportPDF = useCallback(async (dpi: number) => {
    const c = canvasRef.current;
    if (!c) return;

    const { jsPDF } = await import("jspdf");
    const multiplier = dpi / 72; // 72 is base DPI
    const dataURL = c.toDataURL({
      format: "png",
      multiplier,
      quality: 1,
    });

    const widthInches = canvasSize.width / 72;
    const heightInches = canvasSize.height / 72;
    const orientation = widthInches > heightInches ? "landscape" : "portrait";

    const pdf = new jsPDF({
      orientation,
      unit: "in",
      format: [widthInches, heightInches],
    });

    pdf.addImage(dataURL, "PNG", 0, 0, widthInches, heightInches);
    pdf.save("illustration.pdf");
  }, [canvasSize]);

  /* ── Copy to clipboard ──────────────────────────────────────── */

  const copyImageToClipboard = useCallback(async (multiplier: number) => {
    const c = canvasRef.current;
    if (!c) return;

    const dataURL = c.toDataURL({ format: "png", multiplier });
    const res = await fetch(dataURL);
    const blob = await res.blob();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch {
      // Clipboard API not available
    }
  }, []);

  /* ── Add image from file ────────────────────────────────────── */

  const addImageFromFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    await addImageToCanvas(url);
    // Don't revoke immediately — Fabric needs the URL for rendering
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [addImageToCanvas]);

  /* ── Multi-page management ──────────────────────────────────── */

  const addPage = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;

    // Save current page state
    setPages((prev) => {
      const updated = [...prev];
      updated[activePageIndex] = {
        ...updated[activePageIndex],
        canvasJSON: JSON.stringify(c.toJSON()),
      };
      const newPage: PageState = {
        id: `page-${Date.now()}`,
        name: `Page ${prev.length + 1}`,
        canvasJSON: null,
      };
      return [...updated, newPage];
    });

    // Clear canvas for new page
    isRestoring.current = true;
    c.clear();
    c.backgroundColor = backgroundColor;
    c.renderAll();
    refreshObjects();
    isRestoring.current = false;

    setActivePageIndex((prev) => pages.length);
  }, [activePageIndex, backgroundColor, refreshObjects, pages.length]);

  const switchPage = useCallback(async (index: number) => {
    const c = canvasRef.current;
    if (!c || index === activePageIndex) return;

    // Save current page
    setPages((prev) => {
      const updated = [...prev];
      updated[activePageIndex] = {
        ...updated[activePageIndex],
        canvasJSON: JSON.stringify(c.toJSON()),
      };
      return updated;
    });

    // Load target page
    isRestoring.current = true;
    const targetPage = pages[index];
    if (targetPage?.canvasJSON) {
      await c.loadFromJSON(targetPage.canvasJSON);
    } else {
      c.clear();
      c.backgroundColor = backgroundColor;
    }
    c.renderAll();
    refreshObjects();
    isRestoring.current = false;

    setActivePageIndex(index);
  }, [activePageIndex, pages, backgroundColor, refreshObjects]);

  const deletePage = useCallback(async (index: number) => {
    if (pages.length <= 1) return; // Keep at least one page

    const c = canvasRef.current;
    if (!c) return;

    setPages((prev) => prev.filter((_, i) => i !== index));

    // If we're deleting the active page, switch to another
    if (index === activePageIndex) {
      const newIndex = Math.max(0, index - 1);
      const targetPage = pages[newIndex === index ? (index + 1) : newIndex];
      isRestoring.current = true;
      if (targetPage?.canvasJSON) {
        await c.loadFromJSON(targetPage.canvasJSON);
      } else {
        c.clear();
        c.backgroundColor = backgroundColor;
      }
      c.renderAll();
      refreshObjects();
      isRestoring.current = false;
      setActivePageIndex(Math.min(newIndex, pages.length - 2));
    } else if (index < activePageIndex) {
      setActivePageIndex((prev) => prev - 1);
    }
  }, [pages, activePageIndex, backgroundColor, refreshObjects]);

  const renamePage = useCallback((index: number, name: string) => {
    setPages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  }, []);

  /* ── Context value ──────────────────────────────────────────── */

  const value: IllustrationContextValue = {
    canvas,
    setCanvas,
    canvasSize,
    setCanvasSize,
    zoom,
    setZoom,
    backgroundColor,
    setBackgroundColor,
    activeTool,
    setActiveTool,
    selectedObjects,
    showGrid,
    toggleGrid,
    showSnapping,
    toggleSnapping,
    snapGuides,
    setSnapGuides,
    showRulers,
    toggleRulers,
    alignObjects,
    distributeObjects,
    canUndo,
    canRedo,
    undo,
    redo,
    pushHistory,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteClipboard,
    selectAll,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
    lockSelected,
    addImageToCanvas,
    addTextToCanvas,
    addShapeToCanvas,
    addLabelToCanvas,
    addMarkerToCanvas,
    addScaleBarToCanvas,
    clearCanvas,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportProject,
    importProject,
    exportImage,
    exportSVG,
    exportPDF,
    copyImageToClipboard,
    addImageFromFile,
    objects,
    refreshObjects,
    pages,
    activePageIndex,
    addPage,
    switchPage,
    deletePage,
    renamePage,
  };

  return (
    <IllustrationContext.Provider value={value}>
      {children}
    </IllustrationContext.Provider>
  );
}
