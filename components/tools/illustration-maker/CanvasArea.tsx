"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useIllustration } from "./IllustrationContext";
import Minimap from "./Minimap";

/**
 * Fabric.js canvas wrapper.
 *
 * Handles:
 * - Canvas initialization and cleanup
 * - Zoom via scroll wheel (Ctrl + scroll)
 * - Pan via middle mouse or Space + drag
 * - Grid overlay rendering
 * - Drop zone for assets from the AssetPanel (via Fabric.js events)
 */
export default function CanvasArea() {
  const {
    setCanvas,
    canvas,
    canvasSize,
    zoom,
    setZoom,
    backgroundColor,
    showGrid,
    showSnapping,
    snapGuides,
    setSnapGuides,
    showRulers,
    activeTool,
    setActiveTool,
    addTextToCanvas,
    addShapeToCanvas,
    addImageToCanvas,
    addImageFromFile,
    addLabelToCanvas,
    addMarkerToCanvas,
    loadFromLocalStorage,
  } = useIllustration();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const spacePressed = useRef(false);
  const initialized = useRef(false);

  const [canvasLoading, setCanvasLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  /* ── Initialize Fabric canvas ───────────────────────────────── */

  useEffect(() => {
    if (initialized.current || !canvasElRef.current) return;
    initialized.current = true;

    // NOTE: We intentionally do NOT use a `mounted` flag with cleanup here.
    // React 18/19 Strict Mode double-fires effects: the cleanup from the
    // first run sets `mounted = false` before the async import resolves,
    // but `initialized.current` (a ref) prevents the second run from
    // starting a new import. The result is the import resolves with
    // `mounted = false` and the canvas never initializes.
    // React 18/19 safely ignores state updates on unmounted components,
    // so removing the `mounted` guard is safe.

    import("fabric")
      .then(({ Canvas }) => {
        if (!canvasElRef.current) return;

        const c = new Canvas(canvasElRef.current, {
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundColor,
          preserveObjectStacking: true,
          selection: true,
          stopContextMenu: true,
          fireRightClick: true,
        });

        // Fit canvas in container
        fitCanvasInContainer(c);

        setCanvas(c);
        setCanvasLoading(false);

        // Try to load saved project
        setTimeout(() => {
          loadFromLocalStorage();
        }, 100);
      })
      .catch((err) => {
        console.error("[IllustrationMaker] Canvas init failed:", err);
        setInitError("Failed to initialize canvas. Please reload the page.");
        setCanvasLoading(false);
      });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Resize canvas when canvasSize changes ──────────────────── */

  useEffect(() => {
    if (!canvas) return;
    canvas.setDimensions({ width: canvasSize.width, height: canvasSize.height });
    fitCanvasInContainer(canvas);
  }, [canvas, canvasSize]);

  /* ── Fit canvas in container ────────────────────────────────── */

  const fitCanvasInContainer = useCallback((c: any) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const padding = 40;
    const availW = container.clientWidth - padding * 2;
    const availH = container.clientHeight - padding * 2;
    const scaleW = availW / c.width!;
    const scaleH = availH / c.height!;
    const scale = Math.min(scaleW, scaleH, 1);
    c.setZoom(scale);

    // Center the canvas
    const vpt = c.viewportTransform!;
    vpt[4] = (container.clientWidth - c.width! * scale) / 2;
    vpt[5] = (container.clientHeight - c.height! * scale) / 2;
    c.setViewportTransform(vpt);
    c.renderAll();

    // Keep React zoom state in sync
    setZoom(scale);
  }, [setZoom]);

  /* ── Zoom with scroll wheel ─────────────────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const handleWheel = (opt: any) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      let newZoom = canvas.getZoom() * (1 - delta / 500);
      newZoom = Math.min(Math.max(newZoom, 0.05), 5);

      const point = canvas.getScenePoint(e);
      canvas.zoomToPoint(point, newZoom);
      setZoom(newZoom);
    };

    canvas.on("mouse:wheel", handleWheel);
    return () => {
      canvas.off("mouse:wheel", handleWheel);
    };
  }, [canvas, setZoom]);

  /* ── Pan: Space + drag or middle mouse ──────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (opt: any) => {
      const e = opt.e as MouseEvent;
      // Middle mouse button or Space key held
      if (e.button === 1 || spacePressed.current) {
        isPanning.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        canvas.selection = false;
        canvas.setCursor("grabbing");
        e.preventDefault();
      }
    };

    const handleMouseMove = (opt: any) => {
      if (!isPanning.current) return;
      const e = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform!;
      vpt[4] += e.clientX - lastPointer.current.x;
      vpt[5] += e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      canvas.setViewportTransform(vpt);
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      isPanning.current = false;
      canvas.selection = true;
      canvas.setCursor("default");
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas]);

  /* ── Space key for pan mode ─────────────────────────────────── */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        spacePressed.current = true;
        if (canvas) canvas.setCursor("grab");
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spacePressed.current = false;
        if (canvas) canvas.setCursor("default");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [canvas]);

  /* ── Smart guides & snapping ────────────────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const SNAP_THRESHOLD = 5;

    const handleMoving = (opt: any) => {
      if (!showSnapping) {
        setSnapGuides([]);
        return;
      }

      const target = opt.target;
      if (!target) return;

      const targetBound = target.getBoundingRect();
      const targetLeft = targetBound.left;
      const targetTop = targetBound.top;
      const targetRight = targetBound.left + targetBound.width;
      const targetBottom = targetBound.top + targetBound.height;
      const targetCenterX = targetLeft + targetBound.width / 2;
      const targetCenterY = targetTop + targetBound.height / 2;

      const allObjects = canvas.getObjects().filter((o: any) => o !== target && !target.contains?.(o));
      const guides: { orientation: "horizontal" | "vertical"; position: number }[] = [];

      let snappedX = false;
      let snappedY = false;

      for (const other of allObjects) {
        const otherBound = other.getBoundingRect();
        const oLeft = otherBound.left;
        const oTop = otherBound.top;
        const oRight = otherBound.left + otherBound.width;
        const oBottom = otherBound.top + otherBound.height;
        const oCenterX = oLeft + otherBound.width / 2;
        const oCenterY = oTop + otherBound.height / 2;

        // Vertical guides (X alignment)
        if (!snappedX) {
          const xChecks = [
            { src: targetLeft, dst: oLeft },
            { src: targetLeft, dst: oCenterX },
            { src: targetLeft, dst: oRight },
            { src: targetCenterX, dst: oLeft },
            { src: targetCenterX, dst: oCenterX },
            { src: targetCenterX, dst: oRight },
            { src: targetRight, dst: oLeft },
            { src: targetRight, dst: oCenterX },
            { src: targetRight, dst: oRight },
          ];
          for (const check of xChecks) {
            if (Math.abs(check.src - check.dst) < SNAP_THRESHOLD) {
              const delta = check.dst - check.src;
              target.set({ left: (target.left || 0) + delta });
              guides.push({ orientation: "vertical", position: check.dst });
              snappedX = true;
              break;
            }
          }
        }

        // Horizontal guides (Y alignment)
        if (!snappedY) {
          const yChecks = [
            { src: targetTop, dst: oTop },
            { src: targetTop, dst: oCenterY },
            { src: targetTop, dst: oBottom },
            { src: targetCenterY, dst: oTop },
            { src: targetCenterY, dst: oCenterY },
            { src: targetCenterY, dst: oBottom },
            { src: targetBottom, dst: oTop },
            { src: targetBottom, dst: oCenterY },
            { src: targetBottom, dst: oBottom },
          ];
          for (const check of yChecks) {
            if (Math.abs(check.src - check.dst) < SNAP_THRESHOLD) {
              const delta = check.dst - check.src;
              target.set({ top: (target.top || 0) + delta });
              guides.push({ orientation: "horizontal", position: check.dst });
              snappedY = true;
              break;
            }
          }
        }

        if (snappedX && snappedY) break;
      }

      // Also snap to grid if grid is visible
      if (showGrid) {
        const gridSize = 50;
        if (!snappedX) {
          const nearestGridX = Math.round(targetLeft / gridSize) * gridSize;
          if (Math.abs(targetLeft - nearestGridX) < SNAP_THRESHOLD) {
            target.set({ left: (target.left || 0) + (nearestGridX - targetLeft) });
            snappedX = true;
          }
        }
        if (!snappedY) {
          const nearestGridY = Math.round(targetTop / gridSize) * gridSize;
          if (Math.abs(targetTop - nearestGridY) < SNAP_THRESHOLD) {
            target.set({ top: (target.top || 0) + (nearestGridY - targetTop) });
            snappedY = true;
          }
        }
      }

      target.setCoords();
      setSnapGuides(guides);
    };

    const handleModified = () => {
      setSnapGuides([]);
    };

    canvas.on("object:moving", handleMoving);
    canvas.on("object:modified", handleModified);

    return () => {
      canvas.off("object:moving", handleMoving);
      canvas.off("object:modified", handleModified);
    };
  }, [canvas, showSnapping, showGrid, setSnapGuides]);

  /* ── Render snap guides overlay ────────────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const renderGuides = () => {
      if (snapGuides.length === 0) return;
      const ctx = canvas.getContext() as unknown as CanvasRenderingContext2D;

      ctx.save();
      ctx.strokeStyle = "#FF6B6B";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      for (const guide of snapGuides) {
        ctx.beginPath();
        if (guide.orientation === "vertical") {
          ctx.moveTo(guide.position, 0);
          ctx.lineTo(guide.position, canvas.height! * 2);
        } else {
          ctx.moveTo(0, guide.position);
          ctx.lineTo(canvas.width! * 2, guide.position);
        }
        ctx.stroke();
      }

      ctx.restore();
    };

    canvas.on("after:render", renderGuides);
    canvas.renderAll();

    return () => {
      canvas.off("after:render", renderGuides);
      canvas.renderAll();
    };
  }, [canvas, snapGuides]);

  /* ── Ruler overlay ─────────────────────────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const renderRulers = () => {
      if (!showRulers) return;
      const ctx = canvas.getContext() as unknown as CanvasRenderingContext2D;
      const zoomLevel = canvas.getZoom();
      const vpt = canvas.viewportTransform!;
      const rulerSize = 20;

      ctx.save();

      // Top ruler background
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillRect(0, 0, canvas.width! * 2, rulerSize);

      // Left ruler background
      ctx.fillRect(0, 0, rulerSize, canvas.height! * 2);

      // Corner
      ctx.fillStyle = "rgba(108, 92, 231, 0.1)";
      ctx.fillRect(0, 0, rulerSize, rulerSize);

      // Tick marks and labels
      ctx.fillStyle = "#636e72";
      ctx.strokeStyle = "#b2bec3";
      ctx.lineWidth = 0.5;
      ctx.font = "9px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const step = zoomLevel > 0.5 ? 50 : zoomLevel > 0.2 ? 100 : 200;
      const startX = Math.floor(-vpt[4] / zoomLevel / step) * step;
      const startY = Math.floor(-vpt[5] / zoomLevel / step) * step;

      // Top ruler ticks
      for (let x = startX; x < startX + canvas.width! / zoomLevel + step * 2; x += step) {
        const screenX = x * zoomLevel + vpt[4];
        if (screenX < rulerSize) continue;

        ctx.beginPath();
        ctx.moveTo(screenX, rulerSize - 8);
        ctx.lineTo(screenX, rulerSize);
        ctx.stroke();

        ctx.fillText(String(Math.round(x)), screenX, 3);

        // Minor ticks
        for (let i = 1; i < 5; i++) {
          const minorX = screenX + (i * step * zoomLevel) / 5;
          ctx.beginPath();
          ctx.moveTo(minorX, rulerSize - 4);
          ctx.lineTo(minorX, rulerSize);
          ctx.stroke();
        }
      }

      // Left ruler ticks
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      for (let y = startY; y < startY + canvas.height! / zoomLevel + step * 2; y += step) {
        const screenY = y * zoomLevel + vpt[5];
        if (screenY < rulerSize) continue;

        ctx.beginPath();
        ctx.moveTo(rulerSize - 8, screenY);
        ctx.lineTo(rulerSize, screenY);
        ctx.stroke();

        ctx.save();
        ctx.translate(9, screenY);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillText(String(Math.round(y)), 0, 0);
        ctx.restore();

        for (let i = 1; i < 5; i++) {
          const minorY = screenY + (i * step * zoomLevel) / 5;
          ctx.beginPath();
          ctx.moveTo(rulerSize - 4, minorY);
          ctx.lineTo(rulerSize, minorY);
          ctx.stroke();
        }
      }

      // Ruler border lines
      ctx.strokeStyle = "rgba(108, 92, 231, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(rulerSize, 0);
      ctx.lineTo(rulerSize, canvas.height! * 2);
      ctx.moveTo(0, rulerSize);
      ctx.lineTo(canvas.width! * 2, rulerSize);
      ctx.stroke();

      ctx.restore();
    };

    canvas.on("after:render", renderRulers);
    canvas.renderAll();

    return () => {
      canvas.off("after:render", renderRulers);
      canvas.renderAll();
    };
  }, [canvas, showRulers]);

  /* ── Image file drop & paste support ───────────────────────── */

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!canvas) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await addImageFromFile(file);
          return;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [canvas, addImageFromFile]);

  /* ── Freehand drawing mode ──────────────────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    if (activeTool === "freehand") {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = "#1a1a2e";
        canvas.freeDrawingBrush.width = 3;
      }
    } else {
      canvas.isDrawingMode = false;
    }
  }, [canvas, activeTool]);

  /* ── Click-to-add for text and shapes ───────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const handleClick = (opt: any) => {
      // Only act when there's no existing object clicked
      if (opt.target) return;
      // Don't trigger when in freehand mode
      if (activeTool === "freehand") return;

      if (activeTool === "text") {
        addTextToCanvas();
        setActiveTool("select");
      } else if (activeTool === "rect" || activeTool === "circle" || activeTool === "line" || activeTool === "arrow") {
        addShapeToCanvas(activeTool);
        setActiveTool("select");
      } else if (activeTool === "label") {
        const point = canvas.getScenePoint(opt.e);
        addLabelToCanvas(point.x, point.y);
        setActiveTool("select");
      } else if (activeTool === "marker") {
        const point = canvas.getScenePoint(opt.e);
        addMarkerToCanvas(point.x, point.y);
      }
    };

    canvas.on("mouse:down", handleClick);
    return () => {
      canvas.off("mouse:down", handleClick);
    };
  }, [canvas, activeTool, addTextToCanvas, addShapeToCanvas, addLabelToCanvas, addMarkerToCanvas, setActiveTool]);

  /* ── Drop zone for assets (using Fabric.js event system) ───── */
  // Fabric.js v7 registers its own native drag listeners on the upper
  // canvas (dragover, drop, etc.) and sets draggable="true" on it.
  // Instead of fighting the DOM, we hook into Fabric's own event system
  // which gives us scenePoint coordinates for free.

  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!canvas) return;

    const handleDragOver = (opt: any) => {
      const e = opt.e as DragEvent;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    };

    const handleDragLeave = () => {
      setIsDragOver(false);
    };

    const handleDrop = (opt: any) => {
      const e = opt.e as DragEvent;
      e.preventDefault();
      setIsDragOver(false);

      // Check for illustration asset drag
      const assetPath = e.dataTransfer?.getData("application/illustration-asset");
      if (assetPath) {
        const point = opt.scenePoint;
        if (point) {
          addImageToCanvas(assetPath, point.x, point.y);
        } else {
          addImageToCanvas(assetPath);
        }
        return;
      }

      // Check for dropped image files
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            addImageFromFile(file);
          }
        }
      }
    };

    canvas.on("dragover", handleDragOver);
    canvas.on("dragleave", handleDragLeave);
    canvas.on("drop", handleDrop);

    return () => {
      canvas.off("dragover", handleDragOver);
      canvas.off("dragleave", handleDragLeave);
      canvas.off("drop", handleDrop);
    };
  }, [canvas, addImageToCanvas]);

  /* ── Grid overlay ───────────────────────────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const renderGrid = () => {
      if (!showGrid) return;
      const ctx = canvas.getContext() as unknown as CanvasRenderingContext2D;
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform!;
      const gridSize = 50;

      ctx.save();
      ctx.strokeStyle = "rgba(108, 92, 231, 0.12)";
      ctx.lineWidth = 1;

      const startX = Math.floor(-vpt[4] / zoom / gridSize) * gridSize;
      const startY = Math.floor(-vpt[5] / zoom / gridSize) * gridSize;
      const endX = startX + canvas.width! / zoom + gridSize * 2;
      const endY = startY + canvas.height! / zoom + gridSize * 2;

      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        const screenX = x * zoom + vpt[4];
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, canvas.height! * 2);
        ctx.stroke();
      }
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        const screenY = y * zoom + vpt[5];
        ctx.moveTo(0, screenY);
        ctx.lineTo(canvas.width! * 2, screenY);
        ctx.stroke();
      }

      ctx.restore();
    };

    canvas.on("after:render", renderGrid);
    canvas.renderAll();

    return () => {
      canvas.off("after:render", renderGrid);
      canvas.renderAll();
    };
  }, [canvas, showGrid]);

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden transition-colors duration-150 ${
        isDragOver
          ? "bg-showcase-purple/5 ring-2 ring-inset ring-showcase-purple/30"
          : "bg-[#f0f2f8]"
      }`}
      style={{
        backgroundImage: isDragOver
          ? "none"
          : "radial-gradient(circle, rgba(108,92,231,0.06) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Loading state */}
      {canvasLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-showcase-purple" />
          <p className="text-sm font-bold text-ink-muted">Loading canvas...</p>
        </div>
      )}

      {/* Error state */}
      {initError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/90">
          <div className="rounded-xl border-2 border-red-200 bg-red-50 px-6 py-4 text-center">
            <p className="text-sm font-bold text-red-600">{initError}</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas ref={canvasElRef} />

      {/* Drop indicator overlay */}
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-2xl border-3 border-dashed border-showcase-purple/40 bg-showcase-purple/5 px-8 py-4">
            <p className="text-sm font-bold text-showcase-purple">Drop to add asset</p>
          </div>
        </div>
      )}

      {/* Minimap */}
      <Minimap />

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 rounded-lg border-2 border-showcase-navy/10 bg-white/90 px-3 py-1 text-xs font-bold text-ink-muted backdrop-blur-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* Active tool indicator */}
      {activeTool !== "select" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-showcase-purple/30 bg-showcase-purple/10 px-4 py-1.5 text-xs font-bold text-showcase-purple backdrop-blur-sm">
          Click on canvas to add {activeTool} — Press Escape to cancel
        </div>
      )}
    </div>
  );
}
