"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Volume2,
  Layers,
  Clock,
  Download,
  Code,
  Eye,
  Package,
  Loader2,
  Sparkles,
} from "lucide-react";
import StickerBadge from "@/components/shared/StickerBadge";
import AttributionReminderModal from "@/components/resources/AttributionReminderModal";
import AttributionBanner from "@/components/resources/AttributionBanner";
import {
  categoryColors,
  factCategoryConfig,
  type VisualLesson,
  type FactCategory,
} from "@/data/visuals";
import {
  loadAttribution,
  hasValidAttribution,
  generateBadgePngBlob,
  generateAttributionEmbedHtml,
  generateHowToAttributeText,
} from "@/lib/attribution";

interface LessonCardProps {
  lesson: VisualLesson;
  onOpenEmbed?: (lesson: VisualLesson) => void;
}

/* ── Category-specific accent colors for the stripe & gradients ── */
const accentMap: Record<string, { stripe: string; gradientFrom: string; gradientTo: string; layerBg: string; shadow: string }> = {
  GI: { stripe: "bg-showcase-green", gradientFrom: "from-showcase-green", gradientTo: "to-showcase-teal", layerBg: "bg-gradient-to-br from-showcase-green to-showcase-teal", shadow: "shadow-chunky-green" },
  Pharmacology: { stripe: "bg-showcase-purple", gradientFrom: "from-showcase-purple", gradientTo: "to-showcase-blue", layerBg: "bg-gradient-to-br from-showcase-purple to-showcase-blue", shadow: "shadow-chunky-purple" },
  Hematology: { stripe: "bg-showcase-coral", gradientFrom: "from-showcase-coral", gradientTo: "to-showcase-pink", layerBg: "bg-gradient-to-br from-showcase-coral to-showcase-pink", shadow: "shadow-chunky-coral" },
};

/* ── Fact category colors for fact card left borders ── */
const factBorderColors: Record<string, string> = {
  pathology: "border-l-red-400",
  drug: "border-l-purple-400",
  anatomy: "border-l-rose-400",
  symptom: "border-l-amber-400",
  diagnostic: "border-l-blue-400",
  treatment: "border-l-green-400",
  mnemonic: "border-l-yellow-400",
};

const factPillColors: Record<string, { active: string; inactive: string }> = {
  all: { active: "bg-showcase-navy text-white", inactive: "bg-white border border-showcase-navy/15 text-ink-muted hover:bg-gray-50" },
  pathology: { active: "bg-red-500 text-white", inactive: "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100" },
  drug: { active: "bg-purple-500 text-white", inactive: "bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100" },
  anatomy: { active: "bg-rose-500 text-white", inactive: "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100" },
  symptom: { active: "bg-amber-500 text-white", inactive: "bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100" },
  diagnostic: { active: "bg-blue-500 text-white", inactive: "bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100" },
  treatment: { active: "bg-green-500 text-white", inactive: "bg-green-50 border border-green-200 text-green-600 hover:bg-green-100" },
  mnemonic: { active: "bg-yellow-500 text-white", inactive: "bg-yellow-50 border border-yellow-200 text-yellow-600 hover:bg-yellow-100" },
};

export default function LessonCard({ lesson, onOpenEmbed }: LessonCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showFacts, setShowFacts] = useState(false);
  const [factFilter, setFactFilter] = useState<FactCategory | "all">("all");
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const colors = categoryColors[lesson.category] || categoryColors.GI;
  const accent = accentMap[lesson.category] || accentMap.GI;

  const factCategories = useMemo(() => {
    const cats = new Set<FactCategory>();
    for (const f of lesson.keyFacts) cats.add(f.category);
    return Array.from(cats);
  }, [lesson.keyFacts]);

  const filteredFacts = useMemo(() => {
    if (factFilter === "all") return lesson.keyFacts;
    return lesson.keyFacts.filter((f) => f.category === factFilter);
  }, [lesson.keyFacts, factFilter]);

  // ─── Creator initials ───
  const initials = lesson.creator.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ─── Download All with attribution gating ───
  const buildAndDownloadZip = useCallback(
    async (name?: string, position?: string) => {
      setDownloading(true);
      setDownloadProgress(0);
      try {
        const details = name
          ? { name, position: position || "" }
          : loadAttribution() || { name: "User", position: "" };
        const [{ default: JSZip }, { saveAs }] = await Promise.all([
          import("jszip"),
          import("file-saver"),
        ]);
        const zip = new JSZip();
        const files: { path: string; url: string }[] = [];
        for (const layer of lesson.layers) {
          files.push({ path: `images/${layer.name.replace(/[^a-zA-Z0-9-_ ]/g, "")}-layer-${layer.index}.png`, url: layer.imagePath });
          files.push({ path: `audio/${layer.name.replace(/[^a-zA-Z0-9-_ ]/g, "")}-layer-${layer.index}.mp3`, url: layer.audioPath });
          if (layer.sfxPath) {
            files.push({ path: `sfx/${layer.name.replace(/[^a-zA-Z0-9-_ ]/g, "")}-layer-${layer.index}-sfx.mp3`, url: layer.sfxPath });
          }
        }
        let completed = 0;
        const total = files.length + 3;
        for (const file of files) {
          try {
            const resp = await fetch(file.url);
            if (resp.ok) zip.file(file.path, await resp.blob());
          } catch { /* skip */ }
          completed++;
          setDownloadProgress(Math.round((completed / total) * 100));
        }
        zip.file("attribution-badge.png", await generateBadgePngBlob(details));
        completed++;
        setDownloadProgress(Math.round((completed / total) * 100));
        zip.file("embed-code.html", `<!DOCTYPE html>\n<html><body>\n${generateAttributionEmbedHtml(details)}\n</body></html>`);
        completed++;
        setDownloadProgress(Math.round((completed / total) * 100));
        zip.file("HOW-TO-ATTRIBUTE.txt", generateHowToAttributeText(lesson.title, details));
        completed++;
        setDownloadProgress(100);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `entermedschool-${lesson.id}-assets.zip`);
      } catch (err) {
        console.error("ZIP generation failed:", err);
      } finally {
        setDownloading(false);
        setDownloadProgress(0);
      }
    },
    [lesson]
  );

  const handleDownloadAll = useCallback(() => {
    if (!hasValidAttribution()) { setShowAttrModal(true); return; }
    buildAndDownloadZip();
  }, [buildAndDownloadZip]);

  const handleAttrSaved = useCallback(
    (name: string, position: string) => { buildAndDownloadZip(name, position); },
    [buildAndDownloadZip]
  );

  return (
    <>
      <div className="group relative flex overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky transition-all duration-300 hover:-translate-y-1 hover:shadow-chunky-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-showcase-purple focus-visible:ring-offset-2">
        {/* ── Category accent stripe ── */}
        <div className={`hidden sm:block w-2 flex-shrink-0 ${accent.stripe}`} />

        <div className="flex-1">
          {/* ── Thumbnail + info header ── */}
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail with overlay & layer badge */}
            <div className="relative w-full sm:w-56 h-52 sm:h-auto flex-shrink-0 overflow-hidden bg-pastel-cream">
              <Image
                src={lesson.thumbnailPath}
                alt={lesson.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 224px"
              />
              {/* Subtle gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${accent.gradientFrom}/10 to-transparent pointer-events-none`} />
              {/* Layer count badge */}
              <div className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full ${accent.layerBg} text-xs font-bold text-white shadow-lg ring-2 ring-white`}>
                {lesson.layers.length}
              </div>
              {/* Mobile accent stripe */}
              <div className={`sm:hidden absolute top-0 left-0 right-0 h-1 ${accent.stripe}`} />
            </div>

            {/* Content area */}
            <div className="flex-1 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StickerBadge
                      color={lesson.category === "GI" ? "green" : lesson.category === "Pharmacology" ? "purple" : "coral"}
                      size="sm"
                    >
                      {lesson.category}
                    </StickerBadge>
                    {/* Creator chip with initials */}
                    <a
                      href={lesson.creator.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-navy/10 bg-pastel-lavender/50 pl-1 pr-2.5 py-0.5 text-[11px] font-bold text-ink-muted hover:bg-pastel-lavender transition-colors"
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold text-white ${accent.layerBg}`}>
                        {initials}
                      </span>
                      {lesson.creator.name}
                    </a>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-ink-dark sm:text-xl">
                    {lesson.title}
                  </h3>
                </div>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {lesson.description}
              </p>

              {/* Metadata pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-pastel-lavender/60 px-2.5 py-1 text-xs font-semibold text-showcase-purple">
                  <Layers className="h-3.5 w-3.5" /> {lesson.layers.length} layers
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-pastel-mint/60 px-2.5 py-1 text-xs font-semibold text-showcase-teal">
                  <Clock className="h-3.5 w-3.5" /> {lesson.duration}
                </span>
                {lesson.keyFacts.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pastel-peach/60 px-2.5 py-1 text-xs font-semibold text-showcase-coral">
                    <Eye className="h-3.5 w-3.5" /> {lesson.keyFacts.length} facts
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border-3 ${colors.border} ${colors.bg} px-4 py-2 text-xs font-bold ${colors.text} shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky focus-visible:ring-2 focus-visible:ring-showcase-purple focus-visible:ring-offset-2 active:scale-[0.97]`}
                >
                  {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {expanded ? "Hide Assets" : `View ${lesson.layers.length} Assets`}
                </button>
                {onOpenEmbed && (
                  <button
                    onClick={() => onOpenEmbed(lesson)}
                    className="inline-flex items-center gap-1.5 rounded-xl border-3 border-transparent bg-gradient-to-r from-showcase-purple to-showcase-teal px-4 py-2 text-xs font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky focus-visible:ring-2 focus-visible:ring-showcase-purple focus-visible:ring-offset-2 active:scale-[0.97] group/embed"
                  >
                    <Code className="h-3.5 w-3.5 transition-transform group-hover/embed:rotate-12" />
                    Add to Your Website
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Expanded section with framer-motion ── */}
          <AnimatePresence>
            {expanded && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t-3 border-showcase-navy/10 bg-pastel-cream/30 p-5 sm:p-6">
                  {/* Attribution banner / reminder */}
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-5"
                  >
                    <AttributionBanner />
                  </m.div>

                  {/* Download All -- Hero CTA */}
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-5"
                  >
                    <button
                      onClick={handleDownloadAll}
                      disabled={downloading}
                      className={`group/dl w-full rounded-2xl border-3 border-showcase-navy bg-gradient-to-r ${accent.gradientFrom} ${accent.gradientTo} px-6 py-4 text-center font-bold text-white transition-all ${accent.shadow} hover:-translate-y-0.5 hover:shadow-chunky-lg focus-visible:ring-2 focus-visible:ring-showcase-purple focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {downloading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Package className="h-5 w-5 transition-transform group-hover/dl:animate-bounce" />
                        )}
                        <span className="text-base">
                          {downloading ? `Building ZIP... ${downloadProgress}%` : "Download All Assets"}
                        </span>
                      </div>
                      {!downloading && (
                        <p className="mt-1 text-xs text-white/70 font-normal">
                          Images, audio, attribution badge & embed code
                        </p>
                      )}
                    </button>
                    {downloading && (
                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-showcase-navy/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-showcase-green via-showcase-teal to-showcase-purple transition-all duration-300"
                          style={{
                            width: `${downloadProgress}%`,
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s linear infinite",
                          }}
                        />
                      </div>
                    )}
                  </m.div>

                  {/* Asset list with staggered animations */}
                  <div className="space-y-2">
                    {lesson.layers.map((layer, idx) => (
                      <m.div
                        key={layer.index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white border-2 border-showcase-navy/10 p-3 transition-all hover:border-showcase-navy/20 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Layer number with gradient */}
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent.layerBg} text-xs font-bold text-white shadow-sm`}>
                            {layer.index}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink-dark truncate">
                              {layer.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={layer.imagePath}
                            download
                            className="inline-flex items-center gap-1 rounded-lg border-2 border-showcase-green/20 bg-showcase-green/5 px-2.5 py-1.5 text-xs font-bold text-showcase-green hover:bg-showcase-green hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-showcase-purple focus-visible:ring-offset-2 active:scale-[0.97]"
                            title="Download PNG"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">PNG</span>
                          </a>
                          <a
                            href={layer.audioPath}
                            download
                            className="inline-flex items-center gap-1 rounded-lg border-2 border-showcase-purple/20 bg-showcase-purple/5 px-2.5 py-1.5 text-xs font-bold text-showcase-purple hover:bg-showcase-purple hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-showcase-purple focus-visible:ring-offset-2 active:scale-[0.97]"
                            title="Download MP3"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">MP3</span>
                          </a>
                        </div>
                      </m.div>
                    ))}
                  </div>

                  {/* ── Key Facts Section ── */}
                  {lesson.keyFacts.length > 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowFacts(!showFacts)}
                        className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy/15 bg-white px-5 py-2.5 text-sm font-bold text-ink-dark transition-all hover:bg-pastel-cream hover:shadow-sm focus-visible:ring-2 focus-visible:ring-showcase-purple focus-visible:ring-offset-2 active:scale-[0.97]"
                      >
                        <Sparkles className="h-4 w-4 text-showcase-purple" />
                        {showFacts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        Key Facts ({lesson.keyFacts.length})
                      </button>

                      <AnimatePresence>
                        {showFacts && (
                          <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3">
                              {/* Category filter pills with colors */}
                              <div className="mb-3 flex flex-wrap gap-1.5">
                                <button
                                  onClick={() => setFactFilter("all")}
                                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                                    factFilter === "all" ? factPillColors.all.active : factPillColors.all.inactive
                                  }`}
                                >
                                  All ({lesson.keyFacts.length})
                                </button>
                                {factCategories.map((cat) => {
                                  const cfg = factCategoryConfig[cat];
                                  const count = lesson.keyFacts.filter((f) => f.category === cat).length;
                                  const pillCol = factPillColors[cat] || factPillColors.all;
                                  return (
                                    <button
                                      key={cat}
                                      onClick={() => setFactFilter(cat)}
                                      className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                                        factFilter === cat ? pillCol.active : pillCol.inactive
                                      }`}
                                    >
                                      {cfg.emoji} {cfg.label} ({count})
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Facts list with colored borders */}
                              <div className="space-y-2">
                                {filteredFacts.map((fact, i) => {
                                  const cfg = factCategoryConfig[fact.category];
                                  const borderColor = factBorderColors[fact.category] || "border-l-gray-300";
                                  return (
                                    <m.div
                                      key={`${fact.term}-${i}`}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.03 }}
                                      className={`rounded-xl border-2 border-showcase-navy/8 bg-white p-3 border-l-4 ${borderColor}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{cfg.emoji}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-ink-light">
                                          {cfg.label}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm font-semibold text-ink-dark">
                                        {fact.term}
                                      </p>
                                      <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">
                                        {fact.description}
                                      </p>
                                      {fact.visualCue && (
                                        <p className="mt-1.5 inline-flex items-start gap-1 rounded-lg bg-showcase-purple/8 px-2 py-1 text-xs text-showcase-purple">
                                          <Eye className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                          {fact.visualCue}
                                        </p>
                                      )}
                                    </m.div>
                                  );
                                })}
                              </div>
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AttributionReminderModal
        open={showAttrModal}
        onClose={() => setShowAttrModal(false)}
        onSaved={handleAttrSaved}
      />
    </>
  );
}
