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

  // ── Apply saved highlights ──
  const applyHighlights = useCallback(() => {
    if (!contentRef.current) return;
    const root = contentRef.current;
    const chapterHighlights = annotations.getChapterHighlights(
      currentChapter.slug,
    );

    // Remove previously applied highlights that no longer exist
    const existingMarks = root.querySelectorAll("mark[data-highlight-id]");
    existingMarks.forEach((mark) => {
      const id = mark.getAttribute("data-highlight-id");
      if (id && !chapterHighlights.find((h) => h.id === id)) {
        // Unwrap the mark
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
    });

    // Apply new highlights
    chapterHighlights.forEach((highlight) => {
      if (highlightsApplied.current.has(highlight.id)) return;
      try {
        applyHighlightToDOM(root, highlight);
        highlightsApplied.current.add(highlight.id);
      } catch {
        // Range resolution failed, skip this highlight
      }
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

// ─── DOM manipulation helper ────────────────────────────────────────────────

/**
 * Apply a highlight to the DOM using a TreeWalker to wrap individual
 * text nodes. This handles cross-element selections that
 * range.surroundContents() cannot.
 */
function applyHighlightToDOM(root: Node, highlight: Highlight): void {
  const startNode = resolveNodePath(root, highlight.startContainerPath);
  const endNode = resolveNodePath(root, highlight.endContainerPath);
  if (!startNode || !endNode) return;

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
          // Check if this text node is within the range
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

    // Handle the case where start and end are in the same text node
    if (textNodes.length === 0 && startNode === endNode && startNode.nodeType === Node.TEXT_NODE) {
      textNodes.push(startNode as Text);
    }

    // Wrap each text node in a <mark>
    for (const textNode of textNodes) {
      // Determine the portion of this text node that falls within the range
      let sliceStart = 0;
      let sliceEnd = textNode.textContent?.length ?? 0;

      if (textNode === startNode) {
        sliceStart = highlight.startOffset;
      }
      if (textNode === endNode) {
        sliceEnd = highlight.endOffset;
      }

      // Split the text node if needed
      const parent = textNode.parentNode;
      if (!parent) continue;

      // Skip nodes already wrapped in a highlight mark
      if (parent instanceof HTMLElement && parent.tagName === "MARK" && parent.hasAttribute("data-highlight-id")) {
        continue;
      }

      const fullText = textNode.textContent ?? "";
      const beforeText = fullText.slice(0, sliceStart);
      const highlightText = fullText.slice(sliceStart, sliceEnd);
      const afterText = fullText.slice(sliceEnd);

      if (!highlightText) continue;

      // Create the mark element
      const mark = document.createElement("mark");
      mark.setAttribute("data-highlight-id", highlight.id);
      mark.style.backgroundColor = colorToBg[highlight.color];
      mark.style.borderRadius = "2px";
      mark.style.padding = "1px 0";
      mark.style.cursor = "pointer";
      mark.title = "Click to remove";
      mark.textContent = highlightText;

      // Replace the text node with before + mark + after
      const fragment = document.createDocumentFragment();
      if (beforeText) fragment.appendChild(document.createTextNode(beforeText));
      fragment.appendChild(mark);
      if (afterText) fragment.appendChild(document.createTextNode(afterText));

      parent.replaceChild(fragment, textNode);
    }
  } catch {
    // If anything fails, silently skip
  }
}
