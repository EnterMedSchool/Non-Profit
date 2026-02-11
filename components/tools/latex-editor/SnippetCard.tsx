"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LaTeXSnippet, Difficulty } from "./types";
import { GripVertical, ChevronDown, ChevronUp, BookOpen, Star } from "lucide-react";

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  beginner: "bg-green-400",
  intermediate: "bg-amber-400",
  advanced: "bg-red-400",
};

interface SnippetCardProps {
  snippet: LaTeXSnippet;
  onInsert: (code: string) => void;
  onLearnMore: (snippet: LaTeXSnippet) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function SnippetCard({
  snippet,
  onInsert,
  onLearnMore,
  isFavorite = false,
  onToggleFavorite,
}: SnippetCardProps) {
  const t = useTranslations("tools.latexEditor.ui");
  const [expanded, setExpanded] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", snippet.code);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      className="group bg-white rounded-xl border-2 border-ink-dark/8 hover:border-showcase-purple/30 hover:shadow-md transition-all duration-200 overflow-hidden"
      draggable
      onDragStart={handleDragStart}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <div className="cursor-grab active:cursor-grabbing text-ink-light group-hover:text-ink-muted transition-colors hidden sm:block">
          <GripVertical size={14} />
        </div>

        {/* Favorite star */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`flex-shrink-0 transition-colors ${
              isFavorite
                ? "text-amber-400 hover:text-amber-500"
                : "text-ink-dark/10 hover:text-amber-300"
            }`}
            title={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
          >
            <Star size={12} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}

        {/* Title + difficulty */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[snippet.difficulty]}`} />
            <span className="text-xs font-semibold text-ink-dark truncate">
              {snippet.title}
            </span>
          </div>
          <p className="text-[10px] text-ink-muted truncate mt-0.5">
            {snippet.description}
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={() => onInsert(snippet.code)}
          className="px-2 py-1 rounded-md bg-showcase-purple/10 text-showcase-purple text-[10px] font-bold hover:bg-showcase-purple/20 transition-colors flex-shrink-0"
          title={t("clickToInsert")}
        >
          {t("insert")}
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-md text-ink-light hover:text-ink-muted hover:bg-pastel-cream transition-colors flex-shrink-0"
          title={expanded ? t("collapse") : t("showCode")}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Expanded code preview */}
      {expanded && (
        <div className="border-t border-ink-dark/5">
          {/* Code preview */}
          <pre className="px-3 py-2 text-[11px] font-mono text-ink-dark bg-gray-50 overflow-x-auto whitespace-pre leading-relaxed max-h-32">
            {snippet.code}
          </pre>

          {/* Explanation */}
          <div className="px-3 py-2 bg-pastel-lavender/20 border-t border-ink-dark/5">
            <p className="text-[11px] text-ink-muted leading-relaxed">
              {snippet.explanation}
            </p>
            <button
              onClick={() => onLearnMore(snippet)}
              className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-showcase-purple hover:underline"
            >
              <BookOpen size={10} />
              {t("learnMore")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
