"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePDFViewer } from "./PDFViewerContext";
import {
  getNodePath,
  resolveNodePath,
  type Highlight,
  type HighlightColor,
} from "@/hooks/useAnnotations";

/** Map highlight colors to CSS background classes */
const colorToBg: Record<HighlightColor, string> = {
  yellow: "rgba(253, 224, 71, 0.4)",
  green: "rgba(110, 231, 183, 0.4)",
  blue: "rgba(147, 197, 253, 0.4)",
  pink: "rgba(249, 168, 212, 0.4)",
  orange: "rgba(253, 186, 116, 0.4)",
};

interface HighlightLayerProps {
  /** Ref to the content container element */
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export default function HighlightLayer({ contentRef }: HighlightLayerProps) {
  const {
    highlightMode,
    activeHighlightColor,
    annotations,
    currentChapter,
  } = usePDFViewer();

  const highlightsApplied = useRef<Set<string>>(new Set());

  // ── Apply saved highlights (batched via rAF to avoid layout thrashing) ──
  const applyHighlights = useCallback(() => {
    if (!contentRef.current) return;
    const root = contentRef.current;
    const chapterHighlights = annotations.getChapterHighlights(
      currentChapter.slug,
    );

    // Phase 1 (sync): Collect all DOM operations
    const removals: { mark: Element; id: string }[] = [];
    const replacements: { parent: Node; textNode: Text; fragment: DocumentFragment }[] = [];
    const idsToAdd: string[] = [];

    // Collect marks to remove
    const existingMarks = root.querySelectorAll("mark[data-highlight-id]");
    existingMarks.forEach((mark) => {
      const id = mark.getAttribute("data-highlight-id");
      if (id && !chapterHighlights.find((h) => h.id === id)) {
        removals.push({ mark, id });
      }
    });

    // Collect replacements for new highlights
    chapterHighlights.forEach((highlight) => {
      if (highlightsApplied.current.has(highlight.id)) return;
      try {
        const ops = collectHighlightOperations(root, highlight);
        if (ops.length > 0) {
          replacements.push(...ops);
          idsToAdd.push(highlight.id);
        }
      } catch {
        // Range resolution failed, skip this highlight
      }
    });

    // Phase 2 (deferred): Apply all DOM changes in a single rAF
    if (removals.length === 0 && replacements.length === 0) return;

    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      // Apply removals first
      for (const { mark, id } of removals) {
        const parent = mark.parentNode;
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
          }
          parent.removeChild(mark);
          parent.normalize();
          highlightsApplied.current.delete(id);
        }
      }
      // Apply replacements (in reverse order to avoid DOM reference invalidation)
      for (let i = replacements.length - 1; i >= 0; i--) {
        const { parent, textNode, fragment } = replacements[i];
        if (textNode.parentNode === parent) {
          parent.replaceChild(fragment, textNode);
        }
      }
      idsToAdd.forEach((id) => highlightsApplied.current.add(id));
    });
  }, [annotations, contentRef, currentChapter.slug]);

  useEffect(() => {
    // Small delay to let content render
    const timer = setTimeout(applyHighlights, 100);
    return () => clearTimeout(timer);
  }, [applyHighlights]);

  // ── Handle click on highlight marks for removal ──
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!contentRef.current) return;
      const target = e.target as HTMLElement;
      const mark = target.closest("mark[data-highlight-id]");
      if (!mark) return;

      const id = mark.getAttribute("data-highlight-id");
      if (!id) return;

      // Remove the highlight
      annotations.removeHighlight(id);

      // Unwrap the mark element from DOM
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
        highlightsApplied.current.delete(id);
      }
    },
    [contentRef, annotations],
  );

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [handleClick, contentRef]);

  // ── Handle text selection for new highlights ──
  const handleMouseUp = useCallback(() => {
    if (!highlightMode || !contentRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const root = contentRef.current;

    // Make sure selection is within our content
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
      return;
    }

    const text = selection.toString().trim();
    if (!text) return;

    // Serialize the range
    const startContainerPath = getNodePath(root, range.startContainer);
    const endContainerPath = getNodePath(root, range.endContainer);

    // Create the highlight
    annotations.addHighlight({
      chapterSlug: currentChapter.slug,
      text,
      color: activeHighlightColor,
      startContainerPath,
      startOffset: range.startOffset,
      endContainerPath,
      endOffset: range.endOffset,
    });

    // Clear selection
    selection.removeAllRanges();

    // Re-apply highlights to include the new one
    setTimeout(applyHighlights, 50);
  }, [
    highlightMode,
    activeHighlightColor,
    contentRef,
    currentChapter.slug,
    annotations,
    applyHighlights,
  ]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // ── Touch selection handler for mobile ──
  useEffect(() => {
    const handleTouchEnd = () => {
      // Slight delay to let the selection finalize
      setTimeout(handleMouseUp, 200);
    };
    document.addEventListener("touchend", handleTouchEnd);
    return () => document.removeEventListener("touchend", handleTouchEnd);
  }, [handleMouseUp]);

  return null; // This component operates via DOM side-effects
}

// ─── DOM manipulation helpers ───────────────────────────────────────────────

type ReplacementOp = {
  parent: Node;
  textNode: Text;
  fragment: DocumentFragment;
};

/**
 * Collect highlight replacement operations without applying them.
 * Uses TreeWalker to find text nodes and builds DocumentFragments for each.
 * Operations are applied later in a single requestAnimationFrame to avoid layout thrashing.
 */
function collectHighlightOperations(
  root: Node,
  highlight: Highlight,
): ReplacementOp[] {
  const startNode = resolveNodePath(root, highlight.startContainerPath);
  const endNode = resolveNodePath(root, highlight.endContainerPath);
  if (!startNode || !endNode) return [];

  const operations: ReplacementOp[] = [];

  try {
    const range = document.createRange();
    range.setStart(startNode, highlight.startOffset);
    range.setEnd(endNode, highlight.endOffset);

    // Collect all text nodes within the range
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
          if (
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      },
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    if (textNodes.length === 0 && startNode === endNode && startNode.nodeType === Node.TEXT_NODE) {
      textNodes.push(startNode as Text);
    }

    for (const textNode of textNodes) {
      let sliceStart = 0;
      let sliceEnd = textNode.textContent?.length ?? 0;

      if (textNode === startNode) sliceStart = highlight.startOffset;
      if (textNode === endNode) sliceEnd = highlight.endOffset;

      const parent = textNode.parentNode;
      if (!parent) continue;

      if (
        parent instanceof HTMLElement &&
        parent.tagName === "MARK" &&
        parent.hasAttribute("data-highlight-id")
      ) {
        continue;
      }

      const fullText = textNode.textContent ?? "";
      const beforeText = fullText.slice(0, sliceStart);
      const highlightText = fullText.slice(sliceStart, sliceEnd);
      const afterText = fullText.slice(sliceEnd);

      if (!highlightText) continue;

      const mark = document.createElement("mark");
      mark.setAttribute("data-highlight-id", highlight.id);
      mark.style.backgroundColor = colorToBg[highlight.color];
      mark.style.borderRadius = "2px";
      mark.style.padding = "1px 0";
      mark.style.cursor = "pointer";
      mark.title = "Click to remove";
      mark.textContent = highlightText;

      const fragment = document.createDocumentFragment();
      if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
      fragment.appendChild(mark);
      if (afterText) fragment.appendChild(document.createTextNode(afterText));

      operations.push({ parent, textNode, fragment });
    }
  } catch {
    // If anything fails, return empty
  }

  return operations;
}
