"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import type { DiseaseCharacter } from "@/data/disease-characters";
import { rarityConfig } from "@/data/disease-characters";

interface DiagnosisRevealProps {
  character: DiseaseCharacter;
  caseTitle: string;
  onComplete: () => void;
}

export default function DiagnosisReveal({
  character,
  caseTitle,
  onComplete,
}: DiagnosisRevealProps) {
  const [phase, setPhase] = useState<
    "diagnosis" | "character" | "items" | "complete"
  >("diagnosis");
  const [revealedItems, setRevealedItems] = useState(0);
  const rarity = rarityConfig[character.rarity];

  // Phase progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Show diagnosis text for 2.5s
    timers.push(setTimeout(() => setPhase("character"), 2500));

    // Show character for 2s, then start item reveals
    timers.push(setTimeout(() => setPhase("items"), 4500));

    // Reveal items one by one
    character.items.forEach((_, i) => {
      timers.push(
        setTimeout(() => setRevealedItems(i + 1), 5000 + i * 800)
      );
    });

    // Complete after all items revealed
    timers.push(
      setTimeout(
        () => setPhase("complete"),
        5000 + character.items.length * 800 + 1000
      )
    );

    return () => timers.forEach(clearTimeout);
  }, [character.items]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/95 backdrop-blur-xl"
    >
      <div className="max-w-lg w-full px-6 text-center">
        {/* Diagnosis text */}
        <AnimatePresence mode="wait">
          {(phase === "diagnosis" || phase === "character" || phase === "items" || phase === "complete") && (
            <m.div
              key="diagnosis-text"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <m.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-bold uppercase tracking-[0.3em] text-showcase-teal"
              >
                Diagnosis Confirmed
              </m.p>
              <m.h2
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl"
              >
                {caseTitle}
              </m.h2>
            </m.div>
          )}
        </AnimatePresence>

        {/* Character reveal */}
        {(phase === "character" || phase === "items" || phase === "complete") && (
          <m.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            className="mt-8"
          >
            {/* Character card */}
            <div
              className={`relative mx-auto w-64 rounded-2xl border-3 ${rarity.borderColor} bg-gradient-to-b from-white/10 to-white/5 p-6 ${rarity.glow}`}
            >
              {/* Rarity badge */}
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full ${rarity.bgColor} border-2 ${rarity.borderColor} px-3 py-0.5`}
              >
                <span className={`text-[10px] font-bold ${rarity.color}`}>
                  {rarity.label}
                </span>
              </div>

              {/* Character illustration placeholder */}
              <div className="relative mx-auto h-40 w-40 rounded-xl bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <Star className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-1 text-[9px] text-white/20">
                    Character Art
                  </p>
                </div>

                {/* Item overlays (revealed one by one) */}
                {character.items.slice(0, revealedItems).map((item, i) => (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Placeholder for item overlay */}
                  </m.div>
                ))}
              </div>

              {/* Character name */}
              <h3 className="mt-4 font-display text-lg font-bold text-white">
                {character.name}
              </h3>
              <p className={`text-xs font-medium ${rarity.color}`}>
                {character.subtitle}
              </p>
            </div>

            {/* Item reveals */}
            {phase === "items" || phase === "complete" ? (
              <div className="mt-6 space-y-2">
                {character.items.slice(0, revealedItems).map((item, i) => (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left"
                  >
                    <Sparkles className="h-4 w-4 text-showcase-yellow shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {item.revealText}
                      </p>
                    </div>
                  </m.div>
                ))}
              </div>
            ) : null}
          </m.div>
        )}

        {/* Flavor text + continue */}
        {phase === "complete" && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <p className="text-sm text-white/40 italic mx-auto max-w-sm">
              &ldquo;{character.flavorText}&rdquo;
            </p>
            <m.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              onClick={onComplete}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/10 px-8 py-3 font-display text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple/20 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              View Case Debrief
            </m.button>
          </m.div>
        )}
      </div>
    </m.div>
  );
}
