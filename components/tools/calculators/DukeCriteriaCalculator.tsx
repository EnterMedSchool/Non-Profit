"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  RotateCcw,
  ChevronDown,
  HeartPulse,
  Microscope,
  ScanSearch,
  Scissors,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import type { VisibleSections } from "@/lib/embedTheme";

// ── Classification logic (2023 Duke-ISCVID) ────────────────────────
type Classification = "definite" | "possible" | "rejected";

interface ClassificationResult {
  classification: Classification;
  ruleKey: string | null;
}

function classifyIE(
  majorCount: number,
  minorCount: number,
): ClassificationResult {
  if (majorCount >= 2)
    return { classification: "definite", ruleKey: "rule2Major" };
  if (majorCount >= 1 && minorCount >= 3)
    return { classification: "definite", ruleKey: "rule1Major3Minor" };
  if (minorCount >= 5)
    return { classification: "definite", ruleKey: "rule5Minor" };
  if (majorCount >= 1 && minorCount >= 1)
    return { classification: "possible", ruleKey: "rule1Major1Minor" };
  if (minorCount >= 3)
    return { classification: "possible", ruleKey: "rule3Minor" };
  return { classification: "rejected", ruleKey: null };
}

// ── Criteria data structures ────────────────────────────────────────
interface SubCriterion {
  id: string;
  labelKey: string;
  detailKey?: string;
}

interface MajorDomain {
  id: string;
  labelKey: string;
  icon: typeof Microscope;
  criteria: SubCriterion[];
}

const MAJOR_DOMAINS: MajorDomain[] = [
  {
    id: "micro",
    labelKey: "microbiologic",
    icon: Microscope,
    criteria: [
      { id: "microTypical", labelKey: "microTypical", detailKey: "microTypicalDetail" },
      { id: "microNontypical", labelKey: "microNontypical" },
      { id: "microPCR", labelKey: "microPCR" },
      { id: "microCoxiella", labelKey: "microCoxiella" },
      { id: "microBartonella", labelKey: "microBartonella" },
    ],
  },
  {
    id: "imaging",
    labelKey: "imaging",
    icon: ScanSearch,
    criteria: [
      { id: "echoVegetation", labelKey: "echoVegetation" },
      { id: "echoRegurgitation", labelKey: "echoRegurgitation" },
      { id: "echoDehiscence", labelKey: "echoDehiscence" },
      { id: "petCT", labelKey: "petCT" },
    ],
  },
  {
    id: "surgical",
    labelKey: "surgical",
    icon: Scissors,
    criteria: [
      { id: "surgicalInspection", labelKey: "surgicalInspection" },
    ],
  },
];

interface MinorCriterion {
  id: string;
  labelKey: string;
  detailKey?: string;
}

const MINOR_CRITERIA: MinorCriterion[] = [
  { id: "predisposition", labelKey: "predisposition", detailKey: "predispositionDetail" },
  { id: "fever", labelKey: "fever" },
  { id: "vascular", labelKey: "vascular", detailKey: "vascularDetail" },
  { id: "immunologic", labelKey: "immunologic", detailKey: "immunologicDetail" },
  { id: "microMinor", labelKey: "microMinor", detailKey: "microMinorDetail" },
  { id: "imagingMinor", labelKey: "imagingMinor" },
  { id: "physicalExam", labelKey: "physicalExam" },
];

// ── Classification styling ──────────────────────────────────────────
const CLASSIFICATION_STYLES: Record<
  Classification,
  { bg: string; border: string; text: string; badgeBg: string; badgeText: string }
> = {
  definite: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-800",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
  },
  possible: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-800",
    badgeBg: "bg-amber-500",
    badgeText: "text-white",
  },
  rejected: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-800",
    badgeBg: "bg-green-600",
    badgeText: "text-white",
  },
};

// ── Props ─────────────────────────────────────────────────────────────
interface DukeCriteriaCalculatorProps {
  compact?: boolean;
  visibleSections?: VisibleSections;
  themed?: boolean;
}

// ── Component ────────────────────────────────────────────────────────
export default function DukeCriteriaCalculator({
  compact = false,
  visibleSections,
  themed = false,
}: DukeCriteriaCalculatorProps) {
  const t = useTranslations("tools.duke");

  const [majorChecked, setMajorChecked] = useState<Record<string, boolean>>({});
  const [minorChecked, setMinorChecked] = useState<Record<string, boolean>>({});
  const [expandedMajor, setExpandedMajor] = useState<Record<string, boolean>>({
    micro: true,
    imaging: true,
    surgical: true,
  });

  const showDisclaimer = visibleSections?.disclaimer ?? true;

  const themedCard = themed
    ? {
        backgroundColor: "var(--embed-bg)",
        borderWidth: "var(--embed-border-width)",
        borderRadius: "var(--embed-radius)",
        boxShadow: "var(--embed-shadow)",
        borderColor: "rgba(26,26,46,0.15)",
      }
    : undefined;

  // ── Count domains (not sub-options) ──────────────────────────────
  const majorCount = useMemo(() => {
    let count = 0;
    for (const domain of MAJOR_DOMAINS) {
      if (domain.criteria.some((c) => majorChecked[c.id])) {
        count++;
      }
    }
    return count;
  }, [majorChecked]);

  const minorCount = useMemo(() => {
    return MINOR_CRITERIA.filter((c) => minorChecked[c.id]).length;
  }, [minorChecked]);

  const result = useMemo(
    () => classifyIE(majorCount, minorCount),
    [majorCount, minorCount],
  );

  const hasAnySelection = useMemo(
    () =>
      Object.values(majorChecked).some(Boolean) ||
      Object.values(minorChecked).some(Boolean),
    [majorChecked, minorChecked],
  );

  const totalSelected = useMemo(() => {
    const majorSubs = Object.values(majorChecked).filter(Boolean).length;
    const minorSubs = Object.values(minorChecked).filter(Boolean).length;
    return majorSubs + minorSubs;
  }, [majorChecked, minorChecked]);

  const handleReset = useCallback(() => {
    setMajorChecked({});
    setMinorChecked({});
  }, []);

  const toggleMajor = useCallback((id: string) => {
    setMajorChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleMinor = useCallback((id: string) => {
    setMinorChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSection = useCallback((id: string) => {
    setExpandedMajor((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const style = CLASSIFICATION_STYLES[result.classification];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ── Major Criteria ──────────────────────────────────────── */}
      <div
        className="rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky overflow-hidden"
        style={themedCard}
      >
        <div className="px-5 py-4 sm:px-6 border-b-2 border-showcase-navy/10 bg-gradient-to-r from-red-50/50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-red-200 bg-red-50">
                <HeartPulse className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-ink-dark">
                  {t("labels.majorCriteria")}
                </h2>
                <p className="text-xs text-ink-muted">
                  {t("labels.majorCount", { count: majorCount })}
                </p>
              </div>
            </div>
            {hasAnySelection && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-navy/15 bg-white px-3 py-1.5 text-xs font-bold text-ink-muted transition-all hover:bg-pastel-cream"
              >
                <RotateCcw className="h-3 w-3" />
                {t("labels.reset")}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-showcase-navy/5">
          {MAJOR_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isExpanded = expandedMajor[domain.id] ?? true;
            const domainActive = domain.criteria.some(
              (c) => majorChecked[c.id],
            );

            return (
              <div key={domain.id}>
                <button
                  type="button"
                  onClick={() => toggleSection(domain.id)}
                  className={`w-full flex items-center justify-between px-5 py-3 sm:px-6 text-start transition-colors hover:bg-gray-50 ${
                    domainActive ? "bg-red-50/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-ink-muted" />
                    <span className="text-sm font-bold text-ink-dark">
                      {t(`major.${domain.labelKey}`)}
                    </span>
                    {domainActive && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-ink-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 sm:px-6 space-y-2">
                    {domain.criteria.map((criterion) => (
                      <label
                        key={criterion.id}
                        className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          majorChecked[criterion.id]
                            ? "border-red-300 bg-red-50/50"
                            : "border-showcase-navy/10 bg-white hover:border-showcase-navy/20 hover:bg-gray-50/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!majorChecked[criterion.id]}
                          onChange={() => toggleMajor(criterion.id)}
                          className="mt-0.5 h-4 w-4 rounded border-2 border-showcase-navy/30 text-red-600 focus:ring-red-500 accent-red-600"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-ink-dark leading-snug">
                            {t(`major.${criterion.labelKey}`)}
                          </span>
                          {!compact && criterion.detailKey && (
                            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                              {t(`major.${criterion.detailKey}`)}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Minor Criteria ──────────────────────────────────────── */}
      <div
        className="rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky overflow-hidden"
        style={themedCard}
      >
        <div className="px-5 py-4 sm:px-6 border-b-2 border-showcase-navy/10 bg-gradient-to-r from-amber-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-ink-dark">
                {t("labels.minorCriteria")}
              </h2>
              <p className="text-xs text-ink-muted">
                {t("labels.minorCount", { count: minorCount })}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6 space-y-2">
          {MINOR_CRITERIA.map((criterion) => (
            <label
              key={criterion.id}
              className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                minorChecked[criterion.id]
                  ? "border-amber-300 bg-amber-50/50"
                  : "border-showcase-navy/10 bg-white hover:border-showcase-navy/20 hover:bg-gray-50/50"
              }`}
            >
              <input
                type="checkbox"
                checked={!!minorChecked[criterion.id]}
                onChange={() => toggleMinor(criterion.id)}
                className="mt-0.5 h-4 w-4 rounded border-2 border-showcase-navy/30 text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-ink-dark leading-snug">
                  {t(`minor.${criterion.labelKey}`)}
                </span>
                {!compact && criterion.detailKey && (
                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                    {t(`minor.${criterion.detailKey}`)}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Result ──────────────────────────────────────────────── */}
      <div role="status" aria-live="polite">
        {hasAnySelection ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div
              className={`rounded-2xl border-3 ${style.border} ${style.bg} p-5 sm:p-6 shadow-chunky`}
              style={
                themed
                  ? {
                      borderWidth: "var(--embed-border-width)",
                      borderRadius: "var(--embed-radius)",
                      boxShadow: "var(--embed-shadow)",
                    }
                  : undefined
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-ink-muted uppercase tracking-wide">
                    {t("labels.result")}
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-display font-extrabold mt-1 ${style.text}`}
                  >
                    {t(`categories.${result.classification}`)}
                  </p>
                  {result.ruleKey && (
                    <p className="text-sm text-ink-muted mt-1">
                      {t("categories." + result.classification + "Desc", {
                        rule: t(`categories.${result.ruleKey}`),
                      })}
                    </p>
                  )}
                  {!result.ruleKey && (
                    <p className="text-sm text-ink-muted mt-1">
                      {t("categories.rejectedDesc")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      majorCount > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-ink-muted"
                    }`}
                  >
                    {t("labels.majorCount", { count: majorCount })}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      minorCount > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-ink-muted"
                    }`}
                  >
                    {t("labels.minorCount", { count: minorCount })}
                  </span>
                </div>
              </div>

              {/* Criteria summary bar */}
              <div className="mt-4 flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`major-${i}`}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i < majorCount ? "bg-red-500" : "bg-gray-200"
                    }`}
                    title={`Major ${i + 1}`}
                  />
                ))}
                <div className="w-1" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={`minor-${i}`}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i < minorCount ? "bg-amber-500" : "bg-gray-200"
                    }`}
                    title={`Minor ${i + 1}`}
                  />
                ))}
              </div>

              {/* Classification legend */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                {(["definite", "possible", "rejected"] as const).map((cls) => {
                  const s = CLASSIFICATION_STYLES[cls];
                  const active = result.classification === cls;
                  return (
                    <div
                      key={cls}
                      className={`rounded-lg py-1.5 transition-all ${
                        active
                          ? `${s.badgeBg} ${s.badgeText} shadow-sm`
                          : "bg-gray-100 text-ink-muted"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {active &&
                          (cls === "rejected" ? (
                            <X className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          ))}
                        {t(`categories.${cls}`).split("—")[0].trim()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-3 border-dashed border-showcase-navy/15 bg-gradient-to-br from-pastel-lavender/20 via-white to-pastel-mint/20 p-8 sm:p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-showcase-purple/20 bg-pastel-lavender/50">
              <HeartPulse className="h-7 w-7 text-showcase-purple/60" />
            </div>
            <p className="mt-4 font-display text-base font-bold text-ink-dark/70">
              {t("labels.emptyStateTitle")}
            </p>
            <p className="mt-1.5 text-sm text-ink-muted max-w-xs mx-auto">
              {t("labels.emptyStateDesc")}
            </p>
          </div>
        )}
      </div>

      {/* ── Disclaimer ──────────────────────────────────────────── */}
      {showDisclaimer && (
        <div
          className="rounded-xl border-2 border-dashed border-ink-light/30 bg-white p-4 text-center"
          style={themed ? { borderRadius: "var(--embed-radius)" } : undefined}
        >
          <p className="text-xs text-ink-muted leading-relaxed">
            {t("labels.disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}
