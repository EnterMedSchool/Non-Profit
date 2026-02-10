"use client";

import { Download, Code, Eye } from "lucide-react";
import type { Resource } from "@/data/resources";
import StickerBadge from "@/components/shared/StickerBadge";

export default function ResourceCard({ resource }: { resource: Resource }) {
  const categoryIcons: Record<string, string> = {
    questions: "HelpCircle",
    videos: "Video",
    pdfs: "FileText",
    visuals: "Image",
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border-3 border-showcase-navy bg-white p-5 shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-light">
          {resource.category}
        </span>
        <StickerBadge color={resource.badgeColor} size="sm">
          {resource.badge}
        </StickerBadge>
      </div>

      <h3 className="font-display text-base font-bold text-ink-dark">
        {resource.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
        {resource.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {resource.downloadUrl && (
          <a href={resource.downloadUrl} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-teal bg-showcase-teal/10 px-3 py-1.5 text-xs font-bold text-showcase-teal transition-colors hover:bg-showcase-teal hover:text-white">
            <Download className="h-3.5 w-3.5" /> Download
          </a>
        )}
        {resource.sourceUrl && (
          <a href={resource.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-purple bg-showcase-purple/10 px-3 py-1.5 text-xs font-bold text-showcase-purple transition-colors hover:bg-showcase-purple hover:text-white">
            <Code className="h-3.5 w-3.5" /> Source
          </a>
        )}
        {resource.previewUrl && (
          <a href={resource.previewUrl} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-showcase-navy/20 px-3 py-1.5 text-xs font-bold text-ink-muted transition-colors hover:border-showcase-navy hover:text-ink-dark">
            <Eye className="h-3.5 w-3.5" /> Preview
          </a>
        )}
      </div>
    </div>
  );
}
