"use client";

import { useState, useMemo } from "react";
import {
  Flag,
  ChevronDown,
  RotateCcw,
  Download,
  CheckCircle2,
} from "lucide-react";
import type { AlgorithmDefinition, PathEntry } from "@/lib/algorithmTypes";

interface AlgorithmSummaryProps {
  definition: AlgorithmDefinition;
  path: PathEntry[];
  currentNodeId: string;
  onReset: () => void;
  onDownloadPDF: () => void;
  compact?: boolean;
}

export default function AlgorithmSummary({
  definition,
  path,
  currentNodeId,
  onReset,
  onDownloadPDF,
  compact,
}: AlgorithmSummaryProps) {
  const [pathOpen, setPathOpen] = useState(false);

  const outcomeNode = useMemo(
    () => definition.nodes.find((n) => n.id === currentNodeId),
    [definition, currentNodeId],
  );

  const pathDetails = useMemo(() => {
    return path.map((entry) => {
      const node = definition.nodes.find((n) => n.id === entry.nodeId);
      const edge = entry.edgeId
        ? definition.edges.find((e) => e.id === entry.edgeId)
        : null;
      return { node, edge, entry };
    });
  }, [definition, path]);

  if (!outcomeNode) return null;

  const edu = outcomeNode.educationalContent ?? { why: "", detail: "" };

  return (
    <div className="space-y-4">
      {/* Outcome card */}
      <div className="rounded-2xl border-3 border-green-300 bg-green-50 p-5 sm:p-6 shadow-chunky-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 border-2 border-green-200">
            <Flag className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wide">
              Recommendation
            </p>
            <h3 className="mt-1 font-display text-lg sm:text-xl font-extrabold text-green-900 leading-snug">
              {outcomeNode.label}
            </h3>
          </div>
        </div>

        {edu.detail && (
          <p className="mt-4 text-sm text-green-800 leading-relaxed">
            {edu.detail}
          </p>
        )}

        {edu.keyPoints && edu.keyPoints.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
              Key Takeaways
            </p>
            <ul className="space-y-1.5">
              {edu.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-green-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {edu.references && edu.references.length > 0 && (
          <div className="mt-4 pt-3 border-t border-green-200">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1">
              References
            </p>
            {edu.references.map((ref, i) => (
              <p key={i} className="text-[11px] text-green-700 leading-snug">
                {ref}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Decision path */}
      {!compact && (
        <div className="rounded-xl border-2 border-showcase-navy/10 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setPathOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-bold text-ink-dark">
              Your Decision Path ({path.length} steps)
            </span>
            <ChevronDown
              className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${
                pathOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {pathOpen && (
            <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {pathDetails.map(({ node, edge }, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-showcase-purple/10 border-2 border-showcase-purple/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-showcase-purple">
                        {i + 1}
                      </span>
                    </div>
                    {i < pathDetails.length - 1 && (
                      <div className="w-0.5 flex-1 bg-showcase-purple/15 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="text-sm font-semibold text-ink-dark leading-snug">
                      {node?.label}
                    </p>
                    {edge && (
                      <p className="mt-0.5 text-xs text-showcase-purple font-semibold">
                        → {edge.label}
                      </p>
                    )}
                    {edge?.educationalNote && (
                      <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                        {edge.educationalNote}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {/* Final outcome in the path */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
                    <Flag className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-green-700 leading-snug">
                    {outcomeNode.label}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onDownloadPDF}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-5 py-3 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none min-h-[48px]"
        >
          <Download className="w-4 h-4" />
          Download PDF Summary
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-showcase-navy/15 bg-white px-5 py-3 font-display text-sm font-bold text-ink-dark transition-all hover:bg-gray-50 active:scale-[0.98] min-h-[48px]"
        >
          <RotateCcw className="w-4 h-4" />
          Try Another Path
        </button>
      </div>
    </div>
  );
}
