"use client";

import { useState, useCallback, useMemo } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { GitFork, ListChecks } from "lucide-react";
import AlgorithmFlowchart from "./AlgorithmFlowchart";
import AlgorithmStepper from "./AlgorithmStepper";
import AlgorithmSummary from "./AlgorithmSummary";
import type { AlgorithmDefinition, PathEntry } from "@/lib/algorithmTypes";

interface AlgorithmViewerProps {
  definition: AlgorithmDefinition;
  compact?: boolean;
}

export default function AlgorithmViewer({
  definition,
  compact = false,
}: AlgorithmViewerProps) {
  const [currentNodeId, setCurrentNodeId] = useState(definition.startNodeId);
  const [path, setPath] = useState<PathEntry[]>([]);
  const [mobileTab, setMobileTab] = useState<"walkthrough" | "flowchart">(
    "walkthrough",
  );

  const currentNode = useMemo(
    () => definition.nodes.find((n) => n.id === currentNodeId),
    [definition, currentNodeId],
  );

  const isOutcome = currentNode?.type === "outcome";

  const handleAdvance = useCallback(
    (edgeId: string) => {
      const edge = definition.edges.find((e) => e.id === edgeId);
      if (!edge) return;

      setPath((prev) => [
        ...prev,
        { nodeId: currentNodeId, edgeId, edgeLabel: edge.label },
      ]);
      setCurrentNodeId(edge.target);
    },
    [definition, currentNodeId],
  );

  const handleBack = useCallback(() => {
    if (path.length === 0) return;
    const prev = path[path.length - 1];
    setPath((p) => p.slice(0, -1));
    setCurrentNodeId(prev.nodeId);
  }, [path]);

  const handleReset = useCallback(() => {
    setPath([]);
    setCurrentNodeId(definition.startNodeId);
  }, [definition]);

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      const idx = path.findIndex((p) => p.nodeId === nodeId);
      if (idx >= 0) {
        setPath(path.slice(0, idx));
        setCurrentNodeId(nodeId);
      }
    },
    [path],
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const idx = path.findIndex((p) => p.nodeId === nodeId);
      if (idx >= 0) {
        setPath(path.slice(0, idx));
        setCurrentNodeId(nodeId);
        setMobileTab("walkthrough");
      }
    },
    [path],
  );

  const handleDownloadPDF = useCallback(async () => {
    const { generateAlgorithmPDF } = await import("./AlgorithmPDF");
    generateAlgorithmPDF(definition, path, currentNodeId);
  }, [definition, path, currentNodeId]);

  if (compact) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky overflow-hidden">
          {isOutcome ? (
            <div className="p-4">
              <AlgorithmSummary
                definition={definition}
                path={path}
                currentNodeId={currentNodeId}
                onReset={handleReset}
                onDownloadPDF={handleDownloadPDF}
                compact
              />
            </div>
          ) : (
            <AlgorithmStepper
              definition={definition}
              currentNodeId={currentNodeId}
              path={path}
              onAdvance={handleAdvance}
              onBack={handleBack}
              onReset={handleReset}
              onNodeSelect={handleNodeSelect}
              compact
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Mobile tab switcher */}
      <div className="flex lg:hidden rounded-xl border-2 border-showcase-navy/10 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileTab("walkthrough")}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all min-h-[44px] ${
            mobileTab === "walkthrough"
              ? "bg-showcase-purple text-white shadow-sm"
              : "text-ink-muted hover:text-ink-dark"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Walkthrough
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("flowchart")}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all min-h-[44px] ${
            mobileTab === "flowchart"
              ? "bg-showcase-purple text-white shadow-sm"
              : "text-ink-muted hover:text-ink-dark"
          }`}
        >
          <GitFork className="w-4 h-4" />
          Full Algorithm
        </button>
      </div>

      {/* Desktop: side-by-side / Mobile: tab-based */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4 lg:gap-5 lg:min-h-[600px]">
        {/* Flowchart */}
        <div
          className={`${
            mobileTab !== "flowchart" ? "hidden lg:block" : "block"
          }`}
        >
          <ReactFlowProvider>
            <AlgorithmFlowchart
              definition={definition}
              currentNodeId={currentNodeId}
              path={path}
              onNodeClick={handleNodeClick}
            />
          </ReactFlowProvider>
        </div>

        {/* Stepper / Summary */}
        <div
          className={`${
            mobileTab !== "walkthrough" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky overflow-hidden lg:h-full">
            {isOutcome ? (
              <div className="p-4 sm:p-5">
                <AlgorithmSummary
                  definition={definition}
                  path={path}
                  currentNodeId={currentNodeId}
                  onReset={handleReset}
                  onDownloadPDF={handleDownloadPDF}
                />
              </div>
            ) : (
              <AlgorithmStepper
                definition={definition}
                currentNodeId={currentNodeId}
                path={path}
                onAdvance={handleAdvance}
                onBack={handleBack}
                onReset={handleReset}
                onNodeSelect={handleNodeSelect}
              />
            )}
          </div>
        </div>
      </div>

      {/* Guideline badge */}
      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-showcase-navy/10 bg-white px-3 py-1 text-xs font-semibold text-ink-muted shadow-sm">
          Based on {definition.guideline} Guidelines
          {definition.version && ` · v${definition.version}`}
        </span>
      </div>
    </div>
  );
}
