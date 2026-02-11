"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, Info, AlertTriangle, Heart, ChevronDown, Scale, ArrowDown, ArrowUp } from "lucide-react";
import type { VisibleSections } from "@/lib/embedTheme";

// ── WHO BMI categories ──────────────────────────────────────────────
interface BMICategory {
  key: string;
  riskKey: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  barColor: string;
}

const BMI_CATEGORIES: BMICategory[] = [
  { key: "severeThinness", riskKey: "veryLow", min: 0, max: 16, color: "text-blue-700", bgColor: "bg-blue-50", barColor: "bg-blue-500" },
  { key: "moderateThinness", riskKey: "low", min: 16, max: 17, color: "text-sky-700", bgColor: "bg-sky-50", barColor: "bg-sky-500" },
  { key: "mildThinness", riskKey: "low", min: 17, max: 18.5, color: "text-cyan-700", bgColor: "bg-cyan-50", barColor: "bg-cyan-500" },
  { key: "normal", riskKey: "average", min: 18.5, max: 25, color: "text-green-700", bgColor: "bg-green-50", barColor: "bg-green-500" },
  { key: "overweight", riskKey: "increased", min: 25, max: 30, color: "text-yellow-700", bgColor: "bg-yellow-50", barColor: "bg-yellow-500" },
  { key: "obeseI", riskKey: "high", min: 30, max: 35, color: "text-orange-700", bgColor: "bg-orange-50", barColor: "bg-orange-500" },
  { key: "obeseII", riskKey: "veryHigh", min: 35, max: 40, color: "text-red-600", bgColor: "bg-red-50", barColor: "bg-red-500" },
  { key: "obeseIII", riskKey: "extremelyHigh", min: 40, max: 100, color: "text-red-800", bgColor: "bg-red-100", barColor: "bg-red-700" },
];

function getBMICategory(bmi: number): BMICategory {
  return BMI_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

// ── Scale threshold positions ────────────────────────────────────────
const SCALE_LABELS = [10, 18.5, 25, 30, 35, 40, 50];
function scalePos(value: number): number {
  return ((value - 10) / 40) * 100;
}

// ── Math helpers ─────────────────────────────────────────────────────
function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function calcBMIPrime(bmi: number): number {
  return bmi / 25;
}

function calcPonderalIndex(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM * heightM);
}

function calcHealthyWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  return {
    min: 18.5 * heightM * heightM,
    max: 25 * heightM * heightM,
  };
}

function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

function kgToLbs(kg: number): number {
  return kg / 0.453592;
}

function ftInToCm(ft: number, inches: number): number {
  return (ft * 12 + inches) * 2.54;
}

// ── Validation ───────────────────────────────────────────────────────
interface ValidationErrors {
  height?: string;
  weight?: string;
  age?: string;
}

function validate(
  unit: "metric" | "imperial",
  heightCm: string,
  weightKg: string,
  heightFt: string,
  heightIn: string,
  weightLbs: string,
  age: string,
  t: ReturnType<typeof useTranslations>,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (unit === "metric") {
    const h = parseFloat(heightCm);
    if (heightCm && (h < 50 || h > 300)) {
      errors.height = t("labels.validationHeight", { min: "50", max: "300", unit: "cm" });
    }
    const w = parseFloat(weightKg);
    if (weightKg && (w < 10 || w > 700)) {
      errors.weight = t("labels.validationWeight", { min: "10", max: "700", unit: "kg" });
    }
  } else {
    const ft = parseFloat(heightFt) || 0;
    const inches = parseFloat(heightIn) || 0;
    const totalIn = ft * 12 + inches;
    if ((heightFt || heightIn) && (totalIn < 12 || totalIn > 108)) {
      errors.height = t("labels.validationHeight", { min: "1'0\"", max: "9'0\"", unit: "" });
    }
    const w = parseFloat(weightLbs);
    if (weightLbs && (w < 22 || w > 1543)) {
      errors.weight = t("labels.validationWeight", { min: "22", max: "1543", unit: "lbs" });
    }
  }

  const a = parseInt(age);
  if (age && (a < 2 || a > 120)) {
    errors.age = t("labels.validationAge");
  }

  return errors;
}

// ── Input class helper (pure) ──────────────────────────────────────────
function inputCls(hasError: boolean): string {
  return `w-full rounded-xl border-3 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-showcase-purple ${
    hasError ? "border-red-400" : "border-showcase-navy/20"
  }`;
}

// ── Props ─────────────────────────────────────────────────────────────
interface BMICalculatorProps {
  /** When true, hide secondary metrics and show only main result */
  compact?: boolean;
  /** Control which result sections are visible */
  visibleSections?: VisibleSections;
  /** When true, component reads CSS custom properties for theming */
  themed?: boolean;
}

// ── Component ────────────────────────────────────────────────────────
export default function BMICalculator({
  compact = false,
  visibleSections,
  themed = false,
}: BMICalculatorProps) {
  const t = useTranslations("tools.bmi");

  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [showWhoTable, setShowWhoTable] = useState(false);

  // ── Section visibility (default all visible) ──────────────────────
  const sections = visibleSections ?? {
    bmiPrime: true,
    ponderalIndex: true,
    waistGuidance: true,
    ageContext: true,
    disclaimer: true,
  };

  // In compact mode, override all secondary sections off
  const showBmiPrime = !compact && sections.bmiPrime;
  const showPonderalIndex = !compact && sections.ponderalIndex;
  const showWaistGuidance = !compact && sections.waistGuidance;
  const showAgeContext = !compact && sections.ageContext;
  const showDisclaimer = sections.disclaimer;

  // ── Themed inline styles ──────────────────────────────────────────
  const themedCard = themed
    ? {
        backgroundColor: "var(--embed-bg)",
        borderWidth: "var(--embed-border-width)",
        borderRadius: "var(--embed-radius)",
        boxShadow: "var(--embed-shadow)",
        borderColor: "rgba(26,26,46,0.15)",
      }
    : undefined;

  const themedSecondaryCard = themed
    ? {
        backgroundColor: "var(--embed-bg)",
        borderWidth: "var(--embed-border-width)",
        borderRadius: "var(--embed-radius)",
        boxShadow: "var(--embed-shadow)",
        borderColor: "rgba(26,26,46,0.1)",
      }
    : undefined;

  // ── Validation ──────────────────────────────────────────────────────
  const errors = useMemo(
    () => validate(unit, heightCm, weightKg, heightFt, heightIn, weightLbs, age, t),
    [unit, heightCm, weightKg, heightFt, heightIn, weightLbs, age, t],
  );
  const hasErrors = Object.keys(errors).length > 0;

  // ── Real-time derived values (compute automatically when inputs are valid) ──
  const result = useMemo(() => {
    if (hasErrors) return null;

    let wKg: number;
    let hCm: number;

    if (unit === "metric") {
      wKg = parseFloat(weightKg);
      hCm = parseFloat(heightCm);
    } else {
      wKg = lbsToKg(parseFloat(weightLbs));
      hCm = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0);
    }

    if (!wKg || !hCm || wKg <= 0 || hCm <= 0) return null;

    const bmi = calcBMI(wKg, hCm);
    const bmiPrime = calcBMIPrime(bmi);
    const ponderalIndex = calcPonderalIndex(wKg, hCm);
    const category = getBMICategory(bmi);
    const healthyRange = calcHealthyWeightRange(hCm);

    return { bmi, bmiPrime, ponderalIndex, category, weightKg: wKg, heightCm: hCm, healthyRange };
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn, hasErrors]);

  const handleReset = () => {
    setHeightCm("");
    setWeightKg("");
    setHeightFt("");
    setHeightIn("");
    setWeightLbs("");
    setAge("");
    setSex("male");
  };

  // ── BMI scale bar position (clamped 10-50) ─────────────────────────
  const scalePercent = result ? Math.min(Math.max(scalePos(result.bmi), 0), 100) : 0;

  // ── Weight difference from healthy range ───────────────────────────
  const weightDiff = useMemo(() => {
    if (!result) return null;
    const { weightKg: wKg, healthyRange } = result;
    if (wKg < healthyRange.min) {
      const diff = healthyRange.min - wKg;
      return { status: "below" as const, diffKg: diff, diffLbs: kgToLbs(diff) };
    }
    if (wKg > healthyRange.max) {
      const diff = wKg - healthyRange.max;
      return { status: "above" as const, diffKg: diff, diffLbs: kgToLbs(diff) };
    }
    return { status: "within" as const, diffKg: 0, diffLbs: 0 };
  }, [result]);

  // Check if user has started entering data
  const hasInput = unit === "metric"
    ? !!(heightCm || weightKg)
    : !!(heightFt || heightIn || weightLbs);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ── Unit toggle ───────────────────────────────────────────── */}
      <div
        role="radiogroup"
        aria-label={`${t("labels.metric")} / ${t("labels.imperial")}`}
        className="flex items-center justify-center gap-1 rounded-xl border-3 border-showcase-navy/20 bg-white p-1 w-fit mx-auto"
        style={themed ? { borderRadius: "var(--embed-radius)", borderWidth: "var(--embed-border-width)" } : undefined}
      >
        <button
          type="button"
          role="radio"
          aria-checked={unit === "metric"}
          onClick={() => setUnit("metric")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            unit === "metric"
              ? "bg-showcase-purple text-white shadow-sm"
              : "text-ink-muted hover:bg-pastel-lavender"
          }`}
          style={unit === "metric" && themed ? { backgroundColor: "var(--embed-accent)" } : undefined}
        >
          {t("labels.metric")}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={unit === "imperial"}
          onClick={() => setUnit("imperial")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            unit === "imperial"
              ? "bg-showcase-purple text-white shadow-sm"
              : "text-ink-muted hover:bg-pastel-lavender"
          }`}
          style={unit === "imperial" && themed ? { backgroundColor: "var(--embed-accent)" } : undefined}
        >
          {t("labels.imperial")}
        </button>
      </div>

      {/* ── Input form ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border-3 border-showcase-navy bg-white p-5 sm:p-6 shadow-chunky"
        style={themedCard}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Height */}
          {unit === "metric" ? (
            <div>
              <label htmlFor="bmi-height-cm" className="block text-sm font-bold text-ink-dark mb-1.5">
                {t("labels.height")} ({t("labels.cm")})
              </label>
              <input
                id="bmi-height-cm"
                type="number"
                inputMode="decimal"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170"
                min="50"
                max="300"
                aria-invalid={!!errors.height}
                aria-describedby={errors.height ? "bmi-height-error" : undefined}
                className={inputCls(!!errors.height)}
              />
              {errors.height && (
                <p id="bmi-height-error" className="mt-1 text-xs text-red-600">{errors.height}</p>
              )}
            </div>
          ) : (
            <div>
              <label id="bmi-height-label" className="block text-sm font-bold text-ink-dark mb-1.5">
                {t("labels.height")}
              </label>
              <div className="flex gap-2" role="group" aria-labelledby="bmi-height-label">
                <div className="flex-1">
                  <input
                    id="bmi-height-ft"
                    type="number"
                    inputMode="numeric"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    min="1"
                    max="9"
                    aria-label={t("labels.ft")}
                    aria-invalid={!!errors.height}
                    className={inputCls(!!errors.height)}
                  />
                  <span className="text-xs text-ink-muted mt-0.5 block text-center" aria-hidden="true">{t("labels.ft")}</span>
                </div>
                <div className="flex-1">
                  <input
                    id="bmi-height-in"
                    type="number"
                    inputMode="numeric"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="7"
                    min="0"
                    max="11"
                    aria-label={t("labels.in")}
                    aria-invalid={!!errors.height}
                    className={inputCls(!!errors.height)}
                  />
                  <span className="text-xs text-ink-muted mt-0.5 block text-center" aria-hidden="true">{t("labels.in")}</span>
                </div>
              </div>
              {errors.height && (
                <p id="bmi-height-error" className="mt-1 text-xs text-red-600">{errors.height}</p>
              )}
            </div>
          )}

          {/* Weight */}
          <div>
            <label htmlFor="bmi-weight" className="block text-sm font-bold text-ink-dark mb-1.5">
              {t("labels.weight")} ({unit === "metric" ? t("labels.kg") : t("labels.lbs")})
            </label>
            <input
              id="bmi-weight"
              type="number"
              inputMode="decimal"
              value={unit === "metric" ? weightKg : weightLbs}
              onChange={(e) => {
                if (unit === "metric") setWeightKg(e.target.value);
                else setWeightLbs(e.target.value);
              }}
              placeholder={unit === "metric" ? "70" : "154"}
              min="1"
              aria-invalid={!!errors.weight}
              aria-describedby={errors.weight ? "bmi-weight-error" : undefined}
              className={inputCls(!!errors.weight)}
            />
            {errors.weight && (
              <p id="bmi-weight-error" className="mt-1 text-xs text-red-600">{errors.weight}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label htmlFor="bmi-age" className="block text-sm font-bold text-ink-dark mb-1.5">
              {t("labels.age")}
            </label>
            <input
              id="bmi-age"
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
              min="2"
              max="120"
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? "bmi-age-error" : undefined}
              className={inputCls(!!errors.age)}
            />
            {errors.age && (
              <p id="bmi-age-error" className="mt-1 text-xs text-red-600">{errors.age}</p>
            )}
          </div>

          {/* Sex */}
          <div>
            <span id="bmi-sex-label" className="block text-sm font-bold text-ink-dark mb-1.5">
              {t("labels.sex")}
            </span>
            <div className="flex gap-2" role="radiogroup" aria-labelledby="bmi-sex-label">
              <button
                type="button"
                role="radio"
                aria-checked={sex === "male"}
                onClick={() => setSex("male")}
                className={`flex-1 rounded-xl border-3 px-4 py-2.5 text-sm font-bold transition-all ${
                  sex === "male"
                    ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                    : "border-showcase-navy/20 bg-white text-ink-muted hover:bg-pastel-lavender"
                }`}
                style={sex === "male" && themed ? { borderColor: "var(--embed-accent)", color: "var(--embed-accent)" } : undefined}
              >
                {t("labels.male")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={sex === "female"}
                onClick={() => setSex("female")}
                className={`flex-1 rounded-xl border-3 px-4 py-2.5 text-sm font-bold transition-all ${
                  sex === "female"
                    ? "border-showcase-purple bg-showcase-purple/10 text-showcase-purple"
                    : "border-showcase-navy/20 bg-white text-ink-muted hover:bg-pastel-lavender"
                }`}
                style={sex === "female" && themed ? { borderColor: "var(--embed-accent)", color: "var(--embed-accent)" } : undefined}
              >
                {t("labels.female")}
              </button>
            </div>
          </div>
        </div>

        {/* Reset button */}
        {hasInput && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy/20 bg-white px-4 py-2.5 text-sm font-bold text-ink-muted transition-all hover:bg-pastel-cream"
            >
              <RotateCcw className="h-4 w-4" />
              {t("labels.reset")}
            </button>
          </div>
        )}
      </div>

      {/* ── Results (aria-live so screen readers announce changes) ── */}
      <div role="status" aria-live="polite">
        {result ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Main BMI result */}
            <div
              className={`rounded-2xl border-3 border-showcase-navy p-5 sm:p-6 shadow-chunky ${result.category.bgColor}`}
              style={themed ? { borderWidth: "var(--embed-border-width)", borderRadius: "var(--embed-radius)", boxShadow: "var(--embed-shadow)" } : undefined}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-ink-muted uppercase tracking-wide">{t("labels.result")}</p>
                  <p className={`text-5xl font-display font-extrabold mt-1 ${result.category.color}`}>
                    {result.bmi.toFixed(1)}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">kg/m²</p>
                </div>
                <div className="text-start sm:text-end">
                  <p className="text-sm font-bold text-ink-muted uppercase tracking-wide">{t("labels.whoCategory")}</p>
                  <p className={`text-lg font-display font-bold mt-1 ${result.category.color}`}>
                    {t(`categories.${result.category.key}`)}
                  </p>
                  <p className="text-sm text-ink-muted mt-0.5">
                    {t("labels.riskLevel")}: {t(`risks.${result.category.riskKey}`)}
                  </p>
                </div>
              </div>

              {/* Color scale bar */}
              <div className="mt-5" aria-hidden="true">
                <div className="relative h-4 rounded-full overflow-hidden flex">
                  {BMI_CATEGORIES.map((cat) => {
                    const totalRange = 40; // 10 to 50
                    const catWidth = ((Math.min(cat.max, 50) - Math.max(cat.min, 10)) / totalRange) * 100;
                    return (
                      <div
                        key={cat.key}
                        className={`h-full ${cat.barColor}`}
                        style={{ width: `${Math.max(catWidth, 0)}%` }}
                      />
                    );
                  })}
                </div>
                {/* Pointer */}
                <div className="relative h-6 mt-0.5">
                  <div
                    className="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                    style={{ left: `${scalePercent}%` }}
                  >
                    <div className="w-0 h-0 border-s-[6px] border-e-[6px] border-b-[8px] border-s-transparent border-e-transparent border-b-showcase-navy" />
                    <span className="text-[10px] font-bold text-ink-dark mt-0.5">{result.bmi.toFixed(1)}</span>
                  </div>
                </div>
                {/* Scale labels */}
                <div className="relative h-4 mt-0.5">
                  {SCALE_LABELS.map((value) => (
                    <span
                      key={value}
                      className="absolute -translate-x-1/2 text-[10px] text-ink-muted"
                      style={{ left: `${scalePos(value)}%` }}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <p className="sr-only">{t("labels.scaleAlt")}</p>
            </div>

            {/* Healthy weight range with weight difference feedback */}
            <div
              className="rounded-2xl border-3 border-showcase-navy/20 bg-white p-4 shadow-chunky-sm"
              style={themedSecondaryCard}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-green-200 bg-green-50">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink-dark">
                    {unit === "metric"
                      ? t("labels.healthyRange", {
                          min: result.healthyRange.min.toFixed(1),
                          max: result.healthyRange.max.toFixed(1),
                          unit: "kg",
                        })
                      : t("labels.healthyRange", {
                          min: kgToLbs(result.healthyRange.min).toFixed(0),
                          max: kgToLbs(result.healthyRange.max).toFixed(0),
                          unit: "lbs",
                        })}
                  </p>
                  {/* Weight difference feedback */}
                  {weightDiff && weightDiff.status !== "within" && (
                    <p className="mt-1.5 text-xs text-ink-muted flex items-center gap-1">
                      {weightDiff.status === "above" ? (
                        <>
                          <ArrowUp className="h-3 w-3 text-orange-500" />
                          {unit === "metric"
                            ? t("labels.weightAbove", { value: weightDiff.diffKg.toFixed(1), unit: "kg" })
                            : t("labels.weightAbove", { value: weightDiff.diffLbs.toFixed(0), unit: "lbs" })}
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-3 w-3 text-blue-500" />
                          {unit === "metric"
                            ? t("labels.weightBelow", { value: weightDiff.diffKg.toFixed(1), unit: "kg" })
                            : t("labels.weightBelow", { value: weightDiff.diffLbs.toFixed(0), unit: "lbs" })}
                        </>
                      )}
                    </p>
                  )}
                  {weightDiff && weightDiff.status === "within" && (
                    <p className="mt-1.5 text-xs text-green-600 font-medium">
                      {t("labels.weightWithin")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Secondary metrics */}
            {(showBmiPrime || showPonderalIndex) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {showBmiPrime && (
                  <div
                    className="rounded-2xl border-3 border-showcase-navy/20 bg-white p-4 shadow-chunky-sm"
                    style={themedSecondaryCard}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-showcase-purple/20 bg-pastel-lavender">
                        <Info className="h-4 w-4 text-showcase-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-dark">{t("labels.bmiPrime")}</p>
                        <p className={`text-2xl font-display font-extrabold ${result.bmiPrime <= 1 ? "text-green-600" : "text-orange-600"}`}>
                          {result.bmiPrime.toFixed(2)}
                        </p>
                        <p className="text-xs text-ink-muted mt-1 leading-relaxed">{t("labels.bmiPrimeDesc")}</p>
                      </div>
                    </div>
                  </div>
                )}

                {showPonderalIndex && (
                  <div
                    className="rounded-2xl border-3 border-showcase-navy/20 bg-white p-4 shadow-chunky-sm"
                    style={themedSecondaryCard}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-showcase-teal/20 bg-pastel-mint">
                        <Info className="h-4 w-4 text-showcase-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-dark">{t("labels.ponderalIndex")}</p>
                        <p className="text-2xl font-display font-extrabold text-ink-dark">
                          {result.ponderalIndex.toFixed(1)}
                          <span className="text-sm font-normal text-ink-muted ms-1">kg/m³</span>
                        </p>
                        <p className="text-xs text-ink-muted mt-1 leading-relaxed">{t("labels.ponderalIndexDesc")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Waist circumference guidance */}
            {showWaistGuidance && (
              <div
                className="rounded-2xl border-3 border-showcase-navy/20 bg-pastel-cream p-4 shadow-chunky-sm"
                style={themedSecondaryCard}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-showcase-yellow/30 bg-showcase-yellow/10">
                    <AlertTriangle className="h-4 w-4 text-showcase-yellow" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-dark">{t("labels.waistGuidance")}</p>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">{t("labels.waistGuidanceDesc")}</p>
                    <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                      <li>{t("labels.waistMaleRisk")}</li>
                      <li>{t("labels.waistFemaleRisk")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Age & sex context */}
            {showAgeContext && age && parseInt(age) > 0 && (
              <div
                className="rounded-2xl border-3 border-showcase-navy/20 bg-pastel-lavender/30 p-4 shadow-chunky-sm"
                style={themedSecondaryCard}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-showcase-purple/20 bg-showcase-purple/10">
                    <Info className="h-4 w-4 text-showcase-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-dark">{t("labels.ageContext")}</p>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                      {parseInt(age) < 20 ? t("labels.ageContextUnder20") : t("labels.ageContextDesc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible WHO BMI Classification Table */}
            {!compact && (
              <div
                className="rounded-2xl border-3 border-showcase-navy/20 bg-white shadow-chunky-sm overflow-hidden"
                style={themedSecondaryCard}
              >
                <button
                  type="button"
                  onClick={() => setShowWhoTable((v) => !v)}
                  className="w-full flex items-center justify-between p-4 text-start hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-showcase-teal/20 bg-pastel-mint">
                      <Scale className="h-4 w-4 text-showcase-teal" />
                    </div>
                    <p className="text-sm font-bold text-ink-dark">{t("labels.whoTableTitle")}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-ink-muted transition-transform duration-200 ${showWhoTable ? "rotate-180" : ""}`}
                  />
                </button>
                {showWhoTable && (
                  <div className="px-4 pb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b-2 border-showcase-navy/10">
                            <th className="text-start py-2 pe-3 font-bold text-ink-dark">{t("labels.whoTableCategory")}</th>
                            <th className="text-start py-2 pe-3 font-bold text-ink-dark">{t("labels.whoTableRange")}</th>
                            <th className="text-start py-2 font-bold text-ink-dark">{t("labels.whoTableRisk")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {BMI_CATEGORIES.map((cat) => (
                            <tr
                              key={cat.key}
                              className={`border-b border-showcase-navy/5 ${
                                result && result.category.key === cat.key ? cat.bgColor + " font-bold" : ""
                              }`}
                            >
                              <td className={`py-2 pe-3 ${cat.color}`}>
                                {t(`categories.${cat.key}`)}
                              </td>
                              <td className="py-2 pe-3 text-ink-muted">
                                {cat.min === 0 ? `< ${cat.max}` : cat.max === 100 ? `>= ${cat.min}` : `${cat.min} - ${cat.max}`}
                              </td>
                              <td className="py-2 text-ink-muted">
                                {t(`risks.${cat.riskKey}`)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
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
        ) : (
          /* ── Empty state — shown when no valid result yet ─────── */
          <div className="rounded-2xl border-3 border-dashed border-showcase-navy/15 bg-gradient-to-br from-pastel-lavender/20 via-white to-pastel-mint/20 p-8 sm:p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-showcase-purple/20 bg-pastel-lavender/50">
              <Scale className="h-7 w-7 text-showcase-purple/60" />
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
    </div>
  );
}
