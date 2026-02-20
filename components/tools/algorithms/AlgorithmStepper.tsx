"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ChevronDown,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import type {
  AlgorithmDefinition,
  AlgorithmNode,
  AlgorithmEdge,
  PathEntry,
} from "@/lib/algorithmTypes";

interface AlgorithmStepperProps {
  definition: AlgorithmDefinition;
  currentNodeId: string;
  path: PathEntry[];
  onAdvance: (edgeId: string) => void;
  onBack: () => void;
  onReset: () => void;
  onNodeSelect: (nodeId: string) => void;
  compact?: boolean;
}

export default function AlgorithmStepper({
  definition,
  currentNodeId,
  path,
  onAdvance,
  onBack,
  onReset,
  onNodeSelect,
  compact,
}: AlgorithmStepperProps) {
  const [eduOpen, setEduOpen] = useState(false);

  const currentNode: AlgorithmNode | undefined = useMemo(
    () => definition.nodes.find((n) => n.id === currentNodeId),
    [definition, currentNodeId],
  );

  const outEdges: AlgorithmEdge[] = useMemo(
    () => definition.edges.filter((e) => e.source === currentNodeId),
    [definition, currentNodeId],
  );

  const isOutcome = currentNode?.type === "outcome";
  const stepNumber = path.length;
  const totalNodes = definition.nodes.length;

  const handleAdvance = useCallback(
    (edgeId: string) => {
      setEduOpen(false);
      onAdvance(edgeId);
    },
    [onAdvance],
  );

  const handleBack = useCallback(() => {
    setEduOpen(false);
    onBack();
  }, [onBack]);

  if (!currentNode) return null;

  const edu = currentNode.educationalContent;

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="flex-shrink-0 px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-ink-muted uppercase tracking-wide">
            Step {stepNumber + 1}
          </span>
          {path.length > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-showcase-purple transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Restart
            </button>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-showcase-purple to-showcase-blue transition-all duration-500"
            style={{
              width: `${Math.min(100, ((stepNumber + 1) / totalNodes) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Breadcrumb trail */}
      {path.length > 0 && !compact && (
        <div className="flex-shrink-0 px-4 pt-3 sm:px-5">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {path.map((entry, i) => {
              const node = definition.nodes.find(
                (n) => n.id === entry.nodeId,
              );
              if (!node) return null;
              return (
                <div key={entry.nodeId} className="flex items-center gap-1 flex-shrink-0">
                  {i > 0 && (
                    <ChevronRight className="w-3 h-3 text-ink-light flex-shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => onNodeSelect(entry.nodeId)}
                    className="text-[10px] font-semibold text-showcase-purple hover:underline truncate max-w-[100px]"
                    title={node.label}
                  >
                    {node.label}
                  </button>
                </div>
              );
            })}
            <ChevronRight className="w-3 h-3 text-ink-light flex-shrink-0" />
            <span className="text-[10px] font-bold text-ink-dark truncate max-w-[120px]">
              {currentNode.label}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 space-y-4">
        {/* Current node card */}
        <div className="rounded-xl border-2 border-showcase-navy/10 bg-white p-4 sm:p-5 shadow-sm">
          <h3 className="font-display text-base sm:text-lg font-bold text-ink-dark leading-snug">
            {currentNode.label}
          </h3>

          {edu.detail && (
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {edu.detail}
            </p>
          )}
        </div>

        {/* Educational content */}
        {edu.why && (
          <div className="rounded-xl border-2 border-showcase-purple/15 bg-pastel-lavender/20 overflow-hidden">
            <button
              type="button"
              onClick={() => setEduOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-showcase-purple" />
                <span className="text-sm font-bold text-showcase-purple">
                  Why this matters
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-showcase-purple transition-transform duration-200 ${
                  eduOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {eduOpen && (
              <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-ink-dark leading-relaxed">
                  {edu.why}
                </p>

                {edu.keyPoints && edu.keyPoints.length > 0 && (
                  <ul className="space-y-1.5">
                    {edu.keyPoints.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-ink-muted"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-showcase-purple/50 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                {edu.references && edu.references.length > 0 && (
                  <div className="pt-2 border-t border-showcase-purple/10">
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wide mb-1">
                      References
                    </p>
                    {edu.references.map((ref, i) => (
                      <p key={i} className="text-[11px] text-ink-muted leading-snug">
                        {ref}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Decision buttons */}
        {!isOutcome && outEdges.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">
              Choose your path
            </p>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              {outEdges.map((edge) => (
                <button
                  key={edge.id}
                  type="button"
                  onClick={() => handleAdvance(edge.id)}
                  className="flex items-center justify-between gap-2 rounded-xl border-2 border-showcase-navy/15 bg-white px-4 py-3 text-left transition-all hover:border-showcase-purple/40 hover:bg-pastel-lavender/10 hover:shadow-sm active:scale-[0.98] min-h-[48px]"
                >
                  <span className="text-sm font-semibold text-ink-dark leading-snug">
                    {edge.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back button */}
      {path.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-4 sm:px-5 sm:pb-5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted hover:text-showcase-purple transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to previous step
          </button>
        </div>
      )}
    </div>
  );
}
