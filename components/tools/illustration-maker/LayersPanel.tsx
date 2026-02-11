"use client";

import { useState, useRef } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  Search,
  GripVertical,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useIllustration } from "./IllustrationContext";
import type { FabricObject } from "fabric";

function getObjectLabel(obj: FabricObject, index: number): string {
  // Check for custom name first
  if ((obj as any).customName) return (obj as any).customName;

  const type = obj.type || "object";
  switch (type) {
    case "textbox":
    case "text":
    case "i-text": {
      const text = (obj as any).text as string;
      return text ? `Text: "${text.slice(0, 16)}${text.length > 16 ? "..." : ""}"` : `Text ${index + 1}`;
    }
    case "rect":
      return `Rectangle ${index + 1}`;
    case "circle":
      return `Circle ${index + 1}`;
    case "line":
      return `Line ${index + 1}`;
    case "triangle":
      return `Triangle ${index + 1}`;
    case "group":
      return `Group ${index + 1}`;
    case "image":
      return `Image ${index + 1}`;
    case "path":
      return `Path ${index + 1}`;
    default:
      return `${type} ${index + 1}`;
  }
}

function getObjectColor(obj: FabricObject): string {
  const fill = obj.fill;
  if (typeof fill === "string" && fill.startsWith("#")) return fill;
  if (typeof fill === "string" && fill.startsWith("rgb")) return fill;
  return "#6C5CE7";
}

export default function LayersPanel() {
  const t = useTranslations("tools.illustrationMaker.ui.layers");
  const {
    canvas,
    objects,
    selectedObjects,
    refreshObjects,
  } = useIllustration();

  const [expanded, setExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  if (!canvas) return null;

  // Show objects in reverse order (top layer first)
  const reversedObjects = [...objects].reverse();

  // Filter by search
  const filteredObjects = searchQuery
    ? reversedObjects.filter((obj, i) => {
        const idx = objects.length - 1 - i;
        const label = getObjectLabel(obj, idx, t);
        return label.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : reversedObjects;

  const handleSelectObject = (obj: FabricObject) => {
    canvas.setActiveObject(obj);
    canvas.renderAll();
  };

  const handleToggleVisibility = (obj: FabricObject) => {
    obj.set({ visible: !obj.visible });
    canvas.renderAll();
    refreshObjects();
  };

  const handleToggleLock = (obj: FabricObject) => {
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
    canvas.renderAll();
  };

  const handleDeleteObject = (obj: FabricObject) => {
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
    refreshObjects();
  };

  const handleDoubleClick = (obj: FabricObject, displayIndex: number) => {
    const idx = objects.indexOf(obj);
    setEditingIndex(displayIndex);
    setEditingName((obj as any).customName || getObjectLabel(obj, idx, t));
    setTimeout(() => editInputRef.current?.select(), 50);
  };

  const handleRenameSubmit = (obj: FabricObject) => {
    if (editingName.trim()) {
      (obj as any).customName = editingName.trim();
      refreshObjects();
    }
    setEditingIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) return;
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;

    // Convert display indices back to canvas indices
    const sourceObj = filteredObjects[dragIndex];
    const targetObj = filteredObjects[targetIndex];
    if (!sourceObj || !targetObj) return;

    const sourceCanvasIdx = objects.indexOf(sourceObj);
    const targetCanvasIdx = objects.indexOf(targetObj);

    // Move object in canvas
    canvas.moveObjectTo(sourceObj, targetCanvasIdx);
    canvas.renderAll();
    refreshObjects();
    setDragIndex(null);
  };

  const isSelected = (obj: FabricObject) =>
    selectedObjects.some((s) => s === obj);

  return (
    <div className="border-t-2 border-showcase-navy/5">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-pastel-lavender/30"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-ink-light" />
        ) : (
          <ChevronRight className="h-3 w-3 text-ink-light" />
        )}
        <Layers className="h-3.5 w-3.5 text-showcase-purple" />
        <span className="text-xs font-bold text-ink-muted">
          {t("count", { count: objects.length })}
        </span>
      </button>

      {expanded && (
        <>
          {/* Search */}
          {objects.length > 3 && (
            <div className="px-2 pb-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-light" />
                <input
                  type="text"
                  placeholder="Search layers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-showcase-navy/10 bg-pastel-cream/20 py-1 pl-7 pr-2 text-[10px] text-ink-dark placeholder:text-ink-light focus:border-showcase-purple/40 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto px-1 pb-2">
            {filteredObjects.length === 0 ? (
              <p className="px-3 py-3 text-center text-[10px] text-ink-light">
                {searchQuery ? "No matching layers" : "No objects on canvas"}
              </p>
            ) : (
              filteredObjects.map((obj, i) => {
                const idx = objects.indexOf(obj);
                const selected = isSelected(obj);
                const isLocked = obj.lockMovementX;
                const isVisible = obj.visible !== false;
                const isEditing = editingIndex === i;

                return (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={() => handleDrop(i)}
                    onClick={() => handleSelectObject(obj)}
                    onDoubleClick={() => handleDoubleClick(obj, i)}
                    className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs cursor-pointer transition-all ${
                      selected
                        ? "bg-showcase-purple/10 border border-showcase-purple/30"
                        : "border border-transparent hover:bg-pastel-lavender/30"
                    } ${dragIndex === i ? "opacity-50" : ""}`}
                  >
                    {/* Drag handle */}
                    <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-ink-light opacity-0 group-hover:opacity-50" />

                    {/* Color swatch */}
                    <div
                      className="h-3 w-3 shrink-0 rounded border border-showcase-navy/10"
                      style={{ backgroundColor: getObjectColor(obj) }}
                    />

                    {/* Label / Edit input */}
                    {isEditing ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRenameSubmit(obj)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(obj);
                          if (e.key === "Escape") setEditingIndex(null);
                        }}
                        className="flex-1 rounded border border-showcase-purple/30 bg-white px-1 py-0.5 text-[11px] text-ink-dark focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className={`flex-1 truncate text-[11px] ${
                          selected ? "font-bold text-showcase-purple" : "text-ink-muted"
                        } ${!isVisible ? "line-through opacity-50" : ""}`}
                      >
                        {getObjectLabel(obj, idx)}
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className={`flex items-center gap-0.5 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(obj);
                        }}
                        className="rounded p-0.5 text-ink-light hover:bg-pastel-cream hover:text-ink-dark"
                        title={isVisible ? t("hide") : t("show")}
                      >
                        {isVisible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLock(obj);
                        }}
                        className="rounded p-0.5 text-ink-light hover:bg-pastel-cream hover:text-ink-dark"
                        title={isLocked ? t("unlock") : t("lock")}
                      >
                        {isLocked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Unlock className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteObject(obj);
                        }}
                        className="rounded p-0.5 text-ink-light hover:bg-showcase-coral/10 hover:text-showcase-coral"
                        title={t("delete")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
