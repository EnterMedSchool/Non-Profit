"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Pencil, Check, X } from "lucide-react";
import { useFlashcards } from "./FlashcardContext";
import { solidBackgrounds, getBackgroundById } from "@/data/flashcard-assets";

// ── Component ────────────────────────────────────────────────────────
export default function CardPreview() {
  const { cards, selectedCardIndex, setSelectedCardIndex, updateCard, theme } =
    useFlashcards();
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Bounds-safe card access: clamp index to valid range
  const safeIndex =
    cards.length === 0 ? -1 : Math.min(selectedCardIndex, cards.length - 1);
  const card = safeIndex >= 0 ? cards[safeIndex] : undefined;

  // Reset flip & edit when card changes
  useEffect(() => {
    setFlipped(false);
    setEditing(false);
  }, [safeIndex]);

  // ── Keyboard navigation ──────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setFlipped(false);
          setSelectedCardIndex(Math.max(0, safeIndex - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          if (safeIndex < cards.length - 1) {
            setFlipped(false);
            setSelectedCardIndex(safeIndex + 1);
          }
          break;
        case " ":
          e.preventDefault();
          setFlipped((f) => !f);
          break;
      }
    },
    [safeIndex, cards.length, setSelectedCardIndex],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Edit handlers ───────────────────────────────────────────────
  const startEdit = useCallback(() => {
    if (!card) return;
    setEditFront(card.front);
    setEditBack(card.back);
    setEditing(true);
    setFlipped(false);
  }, [card]);

  const saveEdit = useCallback(() => {
    if (!card) return;
    updateCard(card.id, { front: editFront, back: editBack });
    setEditing(false);
  }, [card, editFront, editBack, updateCard]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  // Resolve background
  const bgStyle = useMemo(() => {
    if (!theme.backgroundId) return {};
    const solid = solidBackgrounds.find((b) => b.id === theme.backgroundId);
    if (solid) return { backgroundColor: solid.color };
    const imgBg = getBackgroundById(theme.backgroundId);
    if (imgBg)
      return {
        backgroundImage: `url(${imgBg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    return {};
  }, [theme.backgroundId]);

  // Shared card style
  const cardStyle = useMemo(
    () => ({
      fontFamily: theme.fontFamily,
      color: theme.textColor,
      borderStyle:
        theme.borderStyle === "none" ? undefined : theme.borderStyle,
      borderColor:
        theme.borderStyle !== "none" ? theme.borderColor : undefined,
      borderWidth:
        theme.borderStyle !== "none" ? `${theme.borderWidth}px` : undefined,
      ...bgStyle,
    }),
    [theme, bgStyle],
  );

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-3 border-dashed border-ink-light/30 bg-pastel-cream/30">
          <span className="text-3xl" role="img" aria-label="Cards">
            🃏
          </span>
        </div>
        <div>
          <p className="font-display font-bold text-ink-dark">No cards yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            Import a CSV or TSV file to get started
          </p>
        </div>
      </div>
    );
  }

  // ── Edit mode ───────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <p className="text-sm font-bold text-ink-muted">
          Editing card {safeIndex + 1} of {cards.length}
        </p>

        <div className="w-full max-w-md flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-ink-dark uppercase tracking-wide">
              Front
            </span>
            <textarea
              value={editFront}
              onChange={(e) => setEditFront(e.target.value)}
              rows={3}
              className="rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none resize-none"
              autoFocus
              placeholder="Enter the question or term..."
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-ink-dark uppercase tracking-wide">
              Back
            </span>
            <textarea
              value={editBack}
              onChange={(e) => setEditBack(e.target.value)}
              rows={3}
              className="rounded-xl border-2 border-ink-light/30 bg-white px-3 py-2 text-sm text-ink-dark focus:border-showcase-teal focus:outline-none resize-none"
              placeholder="Enter the answer or definition..."
            />
          </label>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 rounded-xl border-2 border-ink-light/30 px-3 py-2 text-sm font-bold text-ink-muted hover:border-ink-light/50 transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="inline-flex items-center gap-1 rounded-xl border-3 border-showcase-navy bg-showcase-teal px-4 py-2 text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center h-full gap-4"
      tabIndex={-1}
    >
      {/* Card count */}
      <p className="text-sm font-bold text-ink-muted" aria-live="polite">
        Card {safeIndex + 1} of {cards.length}
      </p>

      {/* Flip card container */}
      <div
        className="relative cursor-pointer group"
        style={{
          perspective: 1000,
          width: "100%",
          maxWidth: 400,
          aspectRatio: "3/2",
        }}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard. ${flipped ? "Showing back" : "Showing front"}. Press space to flip.`}
      >
        {/* Edit button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            startEdit();
          }}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 border border-ink-light/20 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-showcase-purple"
          aria-label="Edit card"
          title="Edit card"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
          }}
          className="relative"
        >
          {/* Front face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 shadow-chunky backface-hidden overflow-hidden"
            style={{
              ...cardStyle,
              backfaceVisibility: "hidden",
              fontSize: theme.frontFontSize,
            }}
          >
            <span className="absolute top-2 left-3 text-[10px] font-bold text-ink-muted/40 uppercase tracking-wide">
              Front
            </span>
            <p className="text-center leading-relaxed break-words max-w-full overflow-y-auto max-h-full">
              {card.front || (
                <span className="text-ink-muted/50 italic">No content</span>
              )}
            </p>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 shadow-chunky backface-hidden overflow-hidden"
            style={{
              ...cardStyle,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              fontSize: theme.backFontSize,
            }}
          >
            <span className="absolute top-2 left-3 text-[10px] font-bold text-ink-muted/40 uppercase tracking-wide">
              Back
            </span>
            <p className="text-center leading-relaxed break-words max-w-full overflow-y-auto max-h-full">
              {card.back || (
                <span className="text-ink-muted/50 italic">No content</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Flip hint */}
      <p className="text-xs text-ink-muted flex items-center gap-1">
        <RotateCcw className="h-3 w-3" />
        Click or press Space to flip
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setFlipped(false);
            setSelectedCardIndex(Math.max(0, safeIndex - 1));
          }}
          disabled={safeIndex === 0}
          aria-label="Previous card"
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink-light/30 bg-white transition-all hover:border-showcase-teal disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 text-ink-dark" />
        </button>

        {/* Page dots -- smart pagination around active card */}
        <div className="flex items-center gap-1" role="navigation" aria-label="Card navigation">
          {(() => {
            const total = cards.length;
            const maxDots = 9;
            if (total <= maxDots) {
              return cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setFlipped(false);
                    setSelectedCardIndex(i);
                  }}
                  aria-label={`Go to card ${i + 1}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                  className={`h-6 w-6 flex items-center justify-center rounded-full transition-all ${
                    i === safeIndex
                      ? ""
                      : ""
                  }`}
                >
                  <span
                    className={`block h-2 w-2 rounded-full transition-all ${
                      i === safeIndex
                        ? "bg-showcase-teal scale-125"
                        : "bg-ink-light/30 hover:bg-ink-light/50"
                    }`}
                  />
                </button>
              ));
            }
            // Show: [0] ... [active-1] [active] [active+1] ... [last]
            const visible = new Set<number>();
            visible.add(0);
            visible.add(total - 1);
            for (let d = -2; d <= 2; d++) {
              const idx = safeIndex + d;
              if (idx >= 0 && idx < total) visible.add(idx);
            }
            const sorted = [...visible].sort((a, b) => a - b);
            const elements: React.ReactNode[] = [];
            for (let k = 0; k < sorted.length; k++) {
              const i = sorted[k];
              if (k > 0 && sorted[k] - sorted[k - 1] > 1) {
                elements.push(
                  <span
                    key={`gap-${k}`}
                    className="text-[10px] text-ink-muted px-0.5"
                    aria-hidden="true"
                  >
                    ...
                  </span>,
                );
              }
              elements.push(
                <button
                  key={i}
                  onClick={() => {
                    setFlipped(false);
                    setSelectedCardIndex(i);
                  }}
                  aria-label={`Go to card ${i + 1}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                  className="h-6 w-6 flex items-center justify-center rounded-full"
                >
                  <span
                    className={`block h-2 w-2 rounded-full transition-all ${
                      i === safeIndex
                        ? "bg-showcase-teal scale-125"
                        : "bg-ink-light/30 hover:bg-ink-light/50"
                    }`}
                  />
                </button>,
              );
            }
            return elements;
          })()}
        </div>

        <button
          onClick={() => {
            setFlipped(false);
            setSelectedCardIndex(Math.min(cards.length - 1, safeIndex + 1));
          }}
          disabled={safeIndex === cards.length - 1}
          aria-label="Next card"
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink-light/30 bg-white transition-all hover:border-showcase-teal disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4 text-ink-dark" />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-[10px] text-ink-muted/50 hidden lg:block">
        Use arrow keys to navigate
      </p>
    </div>
  );
}
