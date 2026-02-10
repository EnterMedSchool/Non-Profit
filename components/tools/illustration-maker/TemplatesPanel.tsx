"use client";

import { useState, useCallback, useEffect } from "react";
import { X, LayoutTemplate, ChevronRight } from "lucide-react";
import type {
  IllustrationTemplate,
  TemplateCategory,
} from "@/data/illustration-templates";
import { useIllustration } from "./IllustrationContext";

export default function TemplatesPanel({ onClose }: { onClose: () => void }) {
  const {
    canvas,
    setCanvasSize,
    setBackgroundColor,
    clearCanvas,
    pushHistory,
    refreshObjects,
  } = useIllustration();

  const [allCategories, setAllCategories] = useState<TemplateCategory[]>([]);
  const [allTemplates, setAllTemplates] = useState<IllustrationTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [confirmTemplate, setConfirmTemplate] = useState<IllustrationTemplate | null>(null);

  useEffect(() => {
    import("@/data/illustration-templates").then((mod) => {
      setAllCategories(mod.templateCategories);
      setAllTemplates(mod.illustrationTemplates);
      setActiveCategory(mod.templateCategories[0]?.id ?? "");
    });
  }, []);

  const templates = allTemplates.filter((t) => t.category === activeCategory);

  const applyTemplate = useCallback(async (template: IllustrationTemplate) => {
    if (!canvas) return;

    // Set canvas size
    setCanvasSize({ width: template.canvasWidth, height: template.canvasHeight });
    setBackgroundColor(template.backgroundColor);

    // Clear existing objects
    canvas.clear();
    canvas.backgroundColor = template.backgroundColor;

    // Dynamically import fabric and create objects
    const fabric = await import("fabric");

    for (const objDef of template.objects) {
      let obj: any;

      switch (objDef.type) {
        case "textbox":
          obj = new fabric.Textbox(objDef.text || "Text", {
            left: objDef.left,
            top: objDef.top,
            width: objDef.width || 200,
            fontSize: objDef.fontSize || 16,
            fontFamily: objDef.fontFamily || "system-ui",
            fontWeight: objDef.fontWeight || "normal",
            fontStyle: objDef.fontStyle || "normal",
            fill: objDef.fill || "#1a1a2e",
            textAlign: objDef.textAlign || "left",
            editable: true,
          });
          break;
        case "rect":
          obj = new fabric.Rect({
            left: objDef.left,
            top: objDef.top,
            width: objDef.width,
            height: objDef.height,
            fill: objDef.fill || "transparent",
            stroke: objDef.stroke || "",
            strokeWidth: objDef.strokeWidth || 0,
            rx: objDef.rx || 0,
            ry: objDef.ry || 0,
            strokeDashArray: objDef.strokeDashArray,
          });
          break;
        case "circle":
          obj = new fabric.Circle({
            left: objDef.left,
            top: objDef.top,
            radius: objDef.radius || 50,
            fill: objDef.fill || "transparent",
            stroke: objDef.stroke || "",
            strokeWidth: objDef.strokeWidth || 0,
            strokeDashArray: objDef.strokeDashArray,
          });
          break;
        case "line":
          obj = new fabric.Line(
            [objDef.x1 || 0, objDef.y1 || 0, objDef.x2 || 100, objDef.y2 || 0],
            {
              left: objDef.left,
              top: objDef.top,
              stroke: objDef.stroke || "#1a1a2e",
              strokeWidth: objDef.strokeWidth || 2,
            }
          );
          break;
        default:
          continue;
      }

      if (obj) {
        canvas.add(obj);
      }
    }

    canvas.renderAll();
    refreshObjects();
    pushHistory();
    setConfirmTemplate(null);
    onClose();
  }, [canvas, setCanvasSize, setBackgroundColor, pushHistory, refreshObjects, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-showcase-navy/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-showcase-purple" />
            <h2 className="font-display text-lg font-bold text-ink-dark">Templates</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-pastel-lavender">
            <X className="h-5 w-5 text-ink-muted" />
          </button>
        </div>

        <div className="flex" style={{ minHeight: 400 }}>
          {/* Category sidebar */}
          <div className="w-48 border-r border-showcase-navy/5 p-3">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                  activeCategory === cat.id
                    ? "bg-showcase-purple/10 font-bold text-showcase-purple"
                    : "text-ink-muted hover:bg-pastel-lavender/50"
                }`}
              >
                <span>{cat.name}</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-4">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setConfirmTemplate(tmpl)}
                  className="group rounded-xl border-2 border-showcase-navy/8 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-md"
                >
                  {/* Preview area */}
                  <div className="aspect-video rounded-lg bg-pastel-cream/30 flex items-center justify-center mb-2 overflow-hidden">
                    <div className="text-center p-4">
                      <LayoutTemplate className="mx-auto h-8 w-8 text-showcase-purple/30 mb-1" />
                      <span className="text-[10px] text-ink-light">{tmpl.canvasWidth}x{tmpl.canvasHeight}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-ink-dark group-hover:text-showcase-purple">
                    {tmpl.name}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-ink-light line-clamp-2">
                    {tmpl.description}
                  </p>
                </button>
              ))}
              {templates.length === 0 && (
                <p className="col-span-2 py-8 text-center text-sm text-ink-light">
                  No templates in this category yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation dialog */}
        {confirmTemplate && (
          <div className="border-t-2 border-showcase-navy/10 px-6 py-4 flex items-center justify-between bg-pastel-cream/30">
            <p className="text-sm text-ink-muted">
              Apply <span className="font-bold text-ink-dark">{confirmTemplate.name}</span>? This will replace the current canvas.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTemplate(null)}
                className="rounded-lg border-2 border-showcase-navy/10 px-4 py-1.5 text-xs font-bold text-ink-muted hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => applyTemplate(confirmTemplate)}
                className="rounded-lg border-2 border-showcase-purple bg-showcase-purple px-4 py-1.5 text-xs font-bold text-white hover:bg-showcase-purple/90"
              >
                Apply Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
