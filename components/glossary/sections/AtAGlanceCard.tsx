import type { GlossaryTerm, LabInterpretation } from "@/types/glossary";

interface AtAGlanceCardProps {
  term: GlossaryTerm;
  categoryName: string;
  accent: string;
}

function truncateText(text: string, max: number): string {
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/<u>(.*?)<\/u>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut) + "...";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1.5 text-sm">
      <span className="flex-shrink-0 font-semibold text-ink-muted w-28 sm:w-32">
        {label}
      </span>
      <span className="text-ink-dark leading-relaxed">{value}</span>
    </div>
  );
}

function MedicalGlance({ term, categoryName }: { term: GlossaryTerm; categoryName: string }) {
  const symptoms = term.how_youll_see_it?.slice(0, 2)
    .map((s) => truncateText(s, 60))
    .join("; ");
  const treatment = term.treatment?.[0] ? truncateText(term.treatment[0], 80) : null;
  const mnemonic = term.tricks?.[0] ? truncateText(term.tricks[0], 80) : null;

  return (
    <>
      <Row label="Specialty" value={categoryName} />
      {symptoms && <Row label="Key findings" value={symptoms} />}
      {treatment && <Row label="Treatment" value={treatment} />}
      {mnemonic && <Row label="Mnemonic" value={mnemonic} />}
    </>
  );
}

function FormulaGlance({ term }: { term: GlossaryTerm }) {
  const pearl = term.pearls?.[0] ? truncateText(term.pearls[0], 80) : null;
  return (
    <>
      {term.formula?.expression && (
        <Row label="Formula" value={term.formula.expression} />
      )}
      {term.formula?.unit && <Row label="Unit" value={term.formula.unit} />}
      {pearl && <Row label="Key pearl" value={pearl} />}
    </>
  );
}

function LabValueGlance({ term }: { term: GlossaryTerm }) {
  const r = term.reference_range;
  const interp = term.interpretation as LabInterpretation | undefined;
  return (
    <>
      {r && (
        <Row
          label="Normal range"
          value={`${r.low}–${r.high} ${r.unit}`}
        />
      )}
      {r?.critical_low != null && r?.critical_high != null && (
        <Row
          label="Critical"
          value={`<${r.critical_low} or >${r.critical_high} ${r.unit}`}
        />
      )}
      {interp?.high?.term && <Row label="High" value={interp.high.term} />}
      {interp?.low?.term && <Row label="Low" value={interp.low.term} />}
      {term.key_concepts?.[0] && (
        <Row label="Key concept" value={truncateText(term.key_concepts[0], 80)} />
      )}
    </>
  );
}

function PremedGlance({ term, categoryName }: { term: GlossaryTerm; categoryName: string }) {
  const tip = term.tips?.[0] ? truncateText(term.tips[0], 80) : null;
  return (
    <>
      <Row label="Category" value={categoryName} />
      {tip && <Row label="Study tip" value={tip} />}
    </>
  );
}

function PhysiologicalGlance({ term }: { term: GlossaryTerm }) {
  const raw = term as unknown as Record<string, unknown>;
  const nv = raw.normal_value as { value: number; unit: string; per_kg?: string } | undefined;
  const calc = raw.calculation as { formula: string } | undefined;
  const pearl = term.pearls?.[0] ? truncateText(term.pearls[0], 80) : null;
  return (
    <>
      {nv && <Row label="Normal value" value={`${nv.value} ${nv.unit}${nv.per_kg ? ` (${nv.per_kg})` : ""}`} />}
      {calc?.formula && <Row label="Calculation" value={calc.formula} />}
      {pearl && <Row label="Key pearl" value={pearl} />}
    </>
  );
}

export default function AtAGlanceCard({
  term,
  categoryName,
  accent,
}: AtAGlanceCardProps) {
  const hasExam = !!(term.exam_appearance?.length || term.cases?.length);

  return (
    <section
      id="at-a-glance"
      className="scroll-mt-20"
      data-speakable="summary"
    >
      <div
        className="rounded-2xl border-2 bg-white/80 backdrop-blur-sm overflow-hidden"
        style={{ borderColor: `${accent}40` }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b"
          style={{ borderColor: `${accent}20`, backgroundColor: `${accent}08` }}
        >
          <h2 className="font-display text-sm font-bold text-ink-dark flex items-center gap-2">
            <span className="text-base">&#9889;</span>
            At a Glance
          </h2>
          {hasExam && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
              High-Yield
            </span>
          )}
        </div>

        <div className="px-5 py-3 divide-y divide-ink-dark/5">
          {term.level === "formula" && <FormulaGlance term={term} />}
          {term.level === "lab-value" && <LabValueGlance term={term} />}
          {term.level === "premed" && <PremedGlance term={term} categoryName={categoryName} />}
          {term.level === "physiological" && <PhysiologicalGlance term={term} />}
          {(!term.level || (term.level !== "formula" && term.level !== "lab-value" && term.level !== "premed" && term.level !== "physiological")) && (
            <MedicalGlance term={term} categoryName={categoryName} />
          )}
        </div>
      </div>
    </section>
  );
}
