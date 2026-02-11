"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Map, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useIllustration } from "./IllustrationContext";

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 120;

export default function Minimap() {
  const t = useTranslations("tools.illustrationMaker.ui.minimap");
  const { canvas, canvasSize, zoom } = useIllustration();
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  const renderMinimap = useCallback(() => {
    if (!canvas || !miniCanvasRef.current || !visible) return;

    const ctx = miniCanvasRef.current.getContext("2d");
    if (!ctx) return;

    const scaleX = MINIMAP_WIDTH / canvasSize.width;
    const scaleY = MINIMAP_HEIGHT / canvasSize.height;
    const scale = Math.min(scaleX, scaleY);

    const drawWidth = canvasSize.width * scale;
    const drawHeight = canvasSize.height * scale;
    const offsetX = (MINIMAP_WIDTH - drawWidth) / 2;
    const offsetY = (MINIMAP_HEIGHT - drawHeight) / 2;

    // Clear
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Draw canvas background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight);

    // Draw objects as simple shapes
    const objects = canvas.getObjects();
    for (const obj of objects) {
      if (obj.visible === false) continue;
      const bound = obj.getBoundingRect();

      ctx.fillStyle = typeof obj.fill === "string" && obj.fill !== "transparent"
        ? obj.fill
        : "rgba(108, 92, 231, 0.3)";

      ctx.fillRect(
        offsetX + bound.left * scale,
        offsetY + bound.top * scale,
        bound.width * scale,
        bound.height * scale
      );
    }

    // Draw viewport rectangle
    const vpt = canvas.viewportTransform;
    if (vpt) {
      const viewLeft = -vpt[4] / zoom;
      const viewTop = -vpt[5] / zoom;
      const viewWidth = (canvas.width || 0) / zoom;
      const viewHeight = (canvas.height || 0) / zoom;

      ctx.strokeStyle = "#6C5CE7";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        offsetX + viewLeft * scale,
        offsetY + viewTop * scale,
        viewWidth * scale,
        viewHeight * scale
      );
    }

    // Draw border
    ctx.strokeStyle = "rgba(108, 92, 231, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);
  }, [canvas, canvasSize, zoom, visible]);

  // Render on canvas changes
  useEffect(() => {
    if (!canvas || !visible) return;

    const handler = () => requestAnimationFrame(renderMinimap);
    canvas.on("after:render", handler);
    handler();

    return () => {
      canvas.off("after:render", handler);
    };
  }, [canvas, visible, renderMinimap]);

  // Click to navigate
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvas) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = MINIMAP_WIDTH / canvasSize.width;
    const scaleY = MINIMAP_HEIGHT / canvasSize.height;
    const scale = Math.min(scaleX, scaleY);

    const drawWidth = canvasSize.width * scale;
    const drawHeight = canvasSize.height * scale;
    const offsetX = (MINIMAP_WIDTH - drawWidth) / 2;
    const offsetY = (MINIMAP_HEIGHT - drawHeight) / 2;

    const canvasX = (x - offsetX) / scale;
    const canvasY = (y - offsetY) / scale;

    // Center viewport on clicked point
    const vpt = canvas.viewportTransform!;
    vpt[4] = -(canvasX * zoom - (canvas.width || 0) / 2);
    vpt[5] = -(canvasY * zoom - (canvas.height || 0) / 2);
    canvas.setViewportTransform(vpt);
    canvas.renderAll();
  }, [canvas, canvasSize, zoom]);

  return (
    <>
      {/* Toggle button */}
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          className="absolute bottom-12 end-3 rounded-lg border-2 border-showcase-navy/10 bg-white/90 p-1.5 text-ink-muted backdrop-blur-sm transition-all hover:border-showcase-purple/30 hover:text-showcase-purple"
          title={t("showMinimap")}
        >
          <Map className="h-4 w-4" />
        </button>
      )}

      {/* Minimap panel */}
      {visible && (
        <div className="absolute bottom-12 end-3 rounded-xl border-2 border-showcase-navy/10 bg-white/95 shadow-chunky backdrop-blur-sm">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[10px] font-bold text-ink-light">{t("title")}</span>
            <button
              onClick={() => setVisible(false)}
              className="rounded p-0.5 text-ink-light hover:text-ink-dark"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <canvas
            ref={miniCanvasRef}
            width={MINIMAP_WIDTH}
            height={MINIMAP_HEIGHT}
            onClick={handleMinimapClick}
            className="cursor-crosshair rounded-b-lg"
          />
        </div>
      )}
    </>
  );
}
