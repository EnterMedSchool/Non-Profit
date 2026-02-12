"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { m, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Star,
  Lock,
  X,
  Stethoscope,
  BookOpen,
  Trophy,
  HelpCircle,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  diseaseCharacters,
  rarityConfig,
  characterCategoryColors,
  type DiseaseCharacter,
} from "@/data/disease-characters";
import { useCharacterCollection } from "@/hooks/useCharacterCollection";

// ─── Character Card ─────────────────────────────────────────────────────────

function CharacterCard({
  character,
  isCaught,
  caseScore,
  onClick,
}: {
  character: DiseaseCharacter;
  isCaught: boolean;
  caseScore?: number;
  onClick: () => void;
}) {
  const rarity = rarityConfig[character.rarity];
  const catColors = characterCategoryColors[character.category];

  return (
    <m.button
      whileHover={isCaught ? { scale: 1.03, y: -4 } : {}}
      onClick={onClick}
      className={`relative flex flex-col items-center rounded-2xl border-3 p-4 text-center transition-all ${
        isCaught
          ? `${rarity.borderColor} bg-white cursor-pointer hover:shadow-chunky ${rarity.glow}`
          : "border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
      }`}
    >
      {/* Rarity badge */}
      {isCaught && (
        <span
          className={`absolute -top-2 right-3 rounded-full ${rarity.bgColor} border ${rarity.borderColor} px-2 py-0.5 text-[8px] font-bold ${rarity.color}`}
        >
          {rarity.label}
        </span>
      )}

      {/* Character thumbnail */}
      <div
        className={`relative h-24 w-24 rounded-xl border-2 flex items-center justify-center overflow-hidden ${
          isCaught ? "border-white/20 bg-pastel-lavender/30" : "border-gray-200 bg-gray-100"
        }`}
      >
        {isCaught ? (
          <Star className="h-8 w-8 text-showcase-purple/30" />
        ) : (
          <>
            <HelpCircle className="h-10 w-10 text-gray-300" />
            <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm" />
          </>
        )}
      </div>

      {/* Name or mystery */}
      {isCaught ? (
        <>
          <h3 className="mt-3 font-display text-sm font-bold text-ink-dark">
            {character.name}
          </h3>
          <p className="text-[10px] text-ink-muted">{character.subtitle}</p>
          {caseScore !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <Trophy className="h-3 w-3 text-showcase-yellow" />
              <span className="text-[10px] font-bold text-showcase-yellow">
                {caseScore} pts
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="mt-3 font-display text-sm font-bold text-gray-400">
            ???
          </h3>
          <p className="text-[10px] text-gray-300">{character.category}</p>
          <div className="mt-2 flex items-center gap-1">
            <Lock className="h-3 w-3 text-gray-300" />
            <span className="text-[10px] text-gray-300">
              Solve the case to unlock
            </span>
          </div>
        </>
      )}
    </m.button>
  );
}

// ─── Character Detail Modal ─────────────────────────────────────────────────

function CharacterDetailModal({
  character,
  caseScore,
  onClose,
}: {
  character: DiseaseCharacter;
  caseScore?: number;
  onClose: () => void;
}) {
  const locale = useLocale();
  const rarity = rarityConfig[character.rarity];

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <m.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border-3 ${rarity.borderColor} bg-white p-6 shadow-xl ${rarity.glow}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-lg p-1.5 text-ink-light hover:bg-gray-100 hover:text-ink-dark transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          {/* Character thumbnail */}
          <div className="mx-auto h-32 w-32 rounded-xl bg-pastel-lavender/30 border-2 border-showcase-navy/5 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-showcase-purple/20" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <h2 className="font-display text-2xl font-bold text-ink-dark">
              {character.name}
            </h2>
            <span
              className={`rounded-full ${rarity.bgColor} border ${rarity.borderColor} px-2.5 py-0.5 text-[10px] font-bold ${rarity.color}`}
            >
              {rarity.label}
            </span>
          </div>
          <p className="text-sm text-ink-muted">{character.subtitle}</p>
          <p className="mt-1 text-xs text-ink-light">{character.category}</p>

          {caseScore !== undefined && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-showcase-yellow/10 border border-showcase-yellow/20 px-3 py-1">
              <Trophy className="h-3.5 w-3.5 text-showcase-yellow" />
              <span className="text-xs font-bold text-showcase-yellow">
                Score: {caseScore}
              </span>
            </div>
          )}
        </div>

        {/* Flavor text */}
        <p className="mt-4 text-sm text-ink-muted italic text-center leading-relaxed">
          &ldquo;{character.flavorText}&rdquo;
        </p>

        {/* Items */}
        <div className="mt-6">
          <h3 className="font-display text-sm font-bold text-ink-dark mb-3">
            Character Items ({character.items.length})
          </h3>
          <div className="space-y-2">
            {character.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border-2 border-showcase-navy/8 bg-pastel-lavender/20 p-3"
              >
                <Sparkles className="h-4 w-4 text-showcase-yellow shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink-dark">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-muted leading-relaxed">
                    {item.medicalFact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <Link
            href={`/${locale}/case/${character.caseId}`}
            className="flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-purple bg-showcase-purple px-5 py-2.5 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky w-full"
          >
            <Stethoscope className="h-4 w-4" />
            Replay Case
          </Link>
          {character.relatedVisualIds.length > 0 && (
            <Link
              href={`/${locale}/resources/visuals/${character.relatedVisualIds[0]}`}
              className="flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-teal/30 bg-showcase-teal/5 px-5 py-2.5 font-display text-sm font-bold text-showcase-teal transition-all hover:bg-showcase-teal/10 w-full"
            >
              <BookOpen className="h-4 w-4" />
              Study Visual Resource
            </Link>
          )}
        </div>
      </m.div>
    </m.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const locale = useLocale();
  const { characters, isCharacterCaught, getCaughtCharacter, getCollectionStats } =
    useCharacterCollection();
  const [selectedCharacter, setSelectedCharacter] =
    useState<DiseaseCharacter | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const stats = useMemo(() => getCollectionStats(), [getCollectionStats]);

  const categories = [
    "all",
    ...Array.from(new Set(diseaseCharacters.map((c) => c.category))),
  ];

  const filteredCharacters =
    filterCategory === "all"
      ? diseaseCharacters
      : diseaseCharacters.filter((c) => c.category === filterCategory);

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <PageHero
          titlePre="Your "
          titleHighlight="Collection"
          titlePost=""
          gradient="from-showcase-yellow via-showcase-coral to-showcase-purple"
          annotation={`${stats.totalCaught}/${stats.totalAvailable} caught`}
          annotationColor="text-showcase-yellow"
          subtitle="Solve clinical cases to unlock disease characters. Each character is a mnemonic device — every accessory teaches a medical fact."
          floatingIcons={
            <>
              <Sparkles
                className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-yellow/15 animate-float-gentle"
                style={{ animationDelay: "0s" }}
              />
              <Star
                className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-purple/15 animate-float-playful"
                style={{ animationDelay: "1s" }}
              />
            </>
          }
        />

        {/* Completion stats */}
        <AnimatedSection delay={0.15} animation="fadeUp">
          <div className="mt-10">
            {/* Overall progress bar */}
            <div className="rounded-2xl border-3 border-showcase-navy/10 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-sm font-bold text-ink-dark">
                  Overall Progress
                </span>
                <span className="text-sm font-bold text-showcase-purple">
                  {stats.completionPercent}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-pastel-lavender/50">
                <m.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${stats.completionPercent}%`,
                  }}
                  transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-showcase-purple to-showcase-teal"
                />
              </div>

              {/* Per-category stats */}
              {Object.entries(stats.byCategory).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(stats.byCategory).map(([cat, data]) => (
                    <div
                      key={cat}
                      className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5"
                    >
                      <span className="text-[10px] font-bold text-ink-muted">
                        {cat}
                      </span>
                      <span className="text-[10px] font-bold text-showcase-purple">
                        {data.caught}/{data.total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Category filter */}
        <AnimatedSection delay={0.2} animation="fadeUp">
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                  filterCategory === cat
                    ? "border-showcase-navy bg-showcase-navy text-white shadow-chunky-sm -translate-y-0.5"
                    : "border-showcase-navy/20 bg-white text-ink-muted hover:border-showcase-navy/40"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Character Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredCharacters.map((char, i) => {
            const caught = isCharacterCaught(char.id);
            const caughtData = getCaughtCharacter(char.id);

            return (
              <AnimatedSection
                key={char.id}
                delay={0.05 * i}
                animation="popIn"
              >
                <CharacterCard
                  character={char}
                  isCaught={caught}
                  caseScore={caughtData?.caseScore}
                  onClick={() => {
                    if (caught) setSelectedCharacter(char);
                  }}
                />
              </AnimatedSection>
            );
          })}
        </div>

        {/* Empty state if no characters at all */}
        {filteredCharacters.length === 0 && (
          <div className="mt-20 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-showcase-purple/20" />
            <p className="mt-4 font-handwritten text-xl text-ink-muted">
              No characters in this category yet
            </p>
          </div>
        )}

        {/* CTA to play cases */}
        {stats.totalCaught === 0 && (
          <AnimatedSection delay={0.3} animation="fadeUp">
            <div className="mt-12 text-center">
              <p className="text-sm text-ink-muted mb-4">
                Your collection is empty! Solve clinical cases to catch
                characters.
              </p>
              <Link
                href={`/${locale}/resources/clinical-cases`}
                className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-purple bg-showcase-purple px-6 py-3 font-display text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
              >
                <Stethoscope className="h-4 w-4" />
                Browse Clinical Cases
              </Link>
            </div>
          </AnimatedSection>
        )}
      </div>

      {/* Character Detail Modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetailModal
            character={selectedCharacter}
            caseScore={getCaughtCharacter(selectedCharacter.id)?.caseScore}
            onClose={() => setSelectedCharacter(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
