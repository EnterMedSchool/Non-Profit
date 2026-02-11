"use client";

import type { LaTeXTemplate, Difficulty } from "./types";
import {
  Sparkles, NotebookPen, Calculator, BookCheck, PenTool, FlaskConical,
  Stethoscope, Microscope, Library, GraduationCap, Presentation, User, FileText,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sparkles, NotebookPen, Calculator, BookCheck, PenTool, FlaskConical,
  Stethoscope, Microscope, Library, GraduationCap, Presentation, User, FileText,
};

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; label: string }> = {
  beginner: { bg: "bg-green-100", text: "text-green-700", label: "Beginner" },
  intermediate: { bg: "bg-amber-100", text: "text-amber-700", label: "Intermediate" },
  advanced: { bg: "bg-red-100", text: "text-red-700", label: "Advanced" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "getting-started": "border-s-green-400",
  notes: "border-s-blue-400",
  essay: "border-s-purple-400",
  research: "border-s-teal-400",
  thesis: "border-s-amber-400",
  presentation: "border-s-pink-400",
  cv: "border-s-indigo-400",
};

interface TemplateCardProps {
  template: LaTeXTemplate;
  onUse: (template: LaTeXTemplate) => void;
  onPreview: (template: LaTeXTemplate) => void;
}

export default function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const IconComponent = ICON_MAP[template.icon] ?? FileText;
  const diff = DIFFICULTY_COLORS[template.difficulty];
  const borderColor = CATEGORY_COLORS[template.category] ?? "border-s-gray-400";

  return (
    <div
      className={`group bg-white rounded-xl border-2 border-ink-dark/8 border-s-4 ${borderColor} hover:border-ink-dark/15 hover:shadow-lg transition-all duration-200 overflow-hidden`}
    >
      {/* Card header */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-pastel-lavender/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <IconComponent size={20} className="text-showcase-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-ink-dark truncate">
              {template.title}
            </h3>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${diff.bg} ${diff.text}`}
            >
              {diff.label}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 bg-pastel-cream rounded text-[10px] text-ink-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex border-t border-ink-dark/5">
        <button
          onClick={() => onPreview(template)}
          className="flex-1 py-2.5 text-xs font-medium text-ink-muted hover:text-ink-dark hover:bg-pastel-cream/50 transition-colors border-e border-ink-dark/5"
        >
          Preview
        </button>
        <button
          onClick={() => onUse(template)}
          className="flex-1 py-2.5 text-xs font-bold text-showcase-purple hover:bg-showcase-purple/5 transition-colors"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}
