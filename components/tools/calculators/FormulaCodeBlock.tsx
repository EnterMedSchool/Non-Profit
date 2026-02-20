"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Check, ExternalLink, Braces } from "lucide-react";
import { useTranslations } from "next-intl";

const FORMULA_CODE = `// BMI = weight (kg) / height (m)\u00B2
function calcBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// BMI Prime = BMI / 25 (ratio to upper normal limit)
function calcBMIPrime(bmi) {
  return bmi / 25;
}

// Ponderal Index = weight (kg) / height (m)\u00B3
function calcPonderalIndex(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM * heightM);
}

// Healthy weight range for BMI 18.5\u201325
function calcHealthyWeightRange(heightCm) {
  const heightM = heightCm / 100;
  return {
    min: 18.5 * heightM * heightM,
    max: 25 * heightM * heightM,
  };
}`;

function tokenizeJS(code: string) {
  const tokens: { type: string; value: string }[] = [];
  const re =
    /(\/\/[^\n]*)|(\b(?:function|const|return)\b)|(\b\d+(?:\.\d+)?\b)|([{}()=;:,*/+\-])|([a-zA-Z_]\w*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m[1]) tokens.push({ type: "comment", value: m[1] });
    else if (m[2]) tokens.push({ type: "keyword", value: m[2] });
    else if (m[3]) tokens.push({ type: "number", value: m[3] });
    else if (m[4]) tokens.push({ type: "punctuation", value: m[4] });
    else if (m[5]) tokens.push({ type: "text", value: m[5] });
    else tokens.push({ type: "text", value: m[0] });
  }
  return tokens;
}

const TOKEN_COLORS: Record<string, string> = {
  comment: "text-gray-500 italic",
  keyword: "text-purple-400",
  number: "text-amber-300",
  punctuation: "text-gray-400",
  text: "text-gray-300",
};

interface FormulaCodeBlockProps {
  sourceUrl?: string;
}

export default function FormulaCodeBlock({ sourceUrl }: FormulaCodeBlockProps) {
  const t = useTranslations("tools.bmi.openSource");
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => tokenizeJS(FORMULA_CODE), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FORMULA_CODE);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = FORMULA_CODE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  return (
    <div className="rounded-2xl border-3 border-showcase-navy/15 bg-white p-6 sm:p-8 shadow-chunky-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-teal/20 bg-pastel-mint">
          <Braces className="h-5 w-5 text-showcase-teal" />
        </div>
        <h2 className="font-display text-lg font-bold text-ink-dark">
          {t("title")}
        </h2>
      </div>
      <p className="text-sm leading-relaxed text-ink-muted mb-4">
        {t("description")}
      </p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-ink-dark">JavaScript</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            copied
              ? "bg-showcase-green text-white shadow-sm scale-105"
              : "bg-showcase-purple/10 text-showcase-purple hover:bg-showcase-purple/20 hover:shadow-sm"
          }`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? t("copiedCode") : t("copyCode")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-showcase-navy bg-showcase-navy p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all">
        {tokens.map((tok, i) => (
          <span key={i} className={TOKEN_COLORS[tok.type] || "text-gray-300"}>
            {tok.value}
          </span>
        ))}
      </div>

      {sourceUrl && (
        <div className="mt-3 flex justify-end">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-showcase-purple hover:underline"
          >
            {t("viewFullSource")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
