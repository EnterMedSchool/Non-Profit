"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Check, Beaker } from "lucide-react";

/* ── Symbol categories ────────────────────────────────────── */

interface SymbolItem {
  label: string;
  latex: string;
  display: string;
}

const SYMBOL_CATEGORIES: { name: string; symbols: SymbolItem[] }[] = [
  {
    name: "Greek Letters",
    symbols: [
      { label: "alpha", latex: "\\alpha", display: "α" },
      { label: "beta", latex: "\\beta", display: "β" },
      { label: "gamma", latex: "\\gamma", display: "γ" },
      { label: "delta", latex: "\\delta", display: "δ" },
      { label: "epsilon", latex: "\\epsilon", display: "ε" },
      { label: "zeta", latex: "\\zeta", display: "ζ" },
      { label: "eta", latex: "\\eta", display: "η" },
      { label: "theta", latex: "\\theta", display: "θ" },
      { label: "lambda", latex: "\\lambda", display: "λ" },
      { label: "mu", latex: "\\mu", display: "μ" },
      { label: "pi", latex: "\\pi", display: "π" },
      { label: "rho", latex: "\\rho", display: "ρ" },
      { label: "sigma", latex: "\\sigma", display: "σ" },
      { label: "tau", latex: "\\tau", display: "τ" },
      { label: "phi", latex: "\\phi", display: "φ" },
      { label: "chi", latex: "\\chi", display: "χ" },
      { label: "psi", latex: "\\psi", display: "ψ" },
      { label: "omega", latex: "\\omega", display: "ω" },
      { label: "Delta", latex: "\\Delta", display: "Δ" },
      { label: "Sigma", latex: "\\Sigma", display: "Σ" },
      { label: "Omega", latex: "\\Omega", display: "Ω" },
      { label: "Pi", latex: "\\Pi", display: "Π" },
    ],
  },
  {
    name: "Operators",
    symbols: [
      { label: "plus-minus", latex: "\\pm", display: "±" },
      { label: "minus-plus", latex: "\\mp", display: "∓" },
      { label: "times", latex: "\\times", display: "×" },
      { label: "divide", latex: "\\div", display: "÷" },
      { label: "centered dot", latex: "\\cdot", display: "·" },
      { label: "bullet", latex: "\\bullet", display: "•" },
      { label: "star", latex: "\\star", display: "⋆" },
      { label: "circle", latex: "\\circ", display: "∘" },
      { label: "nabla", latex: "\\nabla", display: "∇" },
      { label: "partial", latex: "\\partial", display: "∂" },
    ],
  },
  {
    name: "Relations",
    symbols: [
      { label: "less or equal", latex: "\\leq", display: "≤" },
      { label: "greater or equal", latex: "\\geq", display: "≥" },
      { label: "not equal", latex: "\\neq", display: "≠" },
      { label: "approximately", latex: "\\approx", display: "≈" },
      { label: "equivalent", latex: "\\equiv", display: "≡" },
      { label: "proportional", latex: "\\propto", display: "∝" },
      { label: "much less", latex: "\\ll", display: "≪" },
      { label: "much greater", latex: "\\gg", display: "≫" },
      { label: "subset", latex: "\\subset", display: "⊂" },
      { label: "superset", latex: "\\supset", display: "⊃" },
      { label: "in (element)", latex: "\\in", display: "∈" },
      { label: "not in", latex: "\\notin", display: "∉" },
    ],
  },
  {
    name: "Structures",
    symbols: [
      { label: "fraction", latex: "\\frac{a}{b}", display: "a/b" },
      { label: "square root", latex: "\\sqrt{x}", display: "√x" },
      { label: "nth root", latex: "\\sqrt[n]{x}", display: "ⁿ√x" },
      { label: "superscript", latex: "^{}", display: "x²" },
      { label: "subscript", latex: "_{}", display: "x₂" },
      { label: "sum", latex: "\\sum_{i=1}^{n}", display: "Σ" },
      { label: "product", latex: "\\prod_{i=1}^{n}", display: "Π" },
      { label: "integral", latex: "\\int_{a}^{b}", display: "∫" },
      { label: "limit", latex: "\\lim_{x \\to \\infty}", display: "lim" },
      { label: "infinity", latex: "\\infty", display: "∞" },
      { label: "overline", latex: "\\overline{x}", display: "x̄" },
      { label: "hat", latex: "\\hat{x}", display: "x̂" },
      { label: "vector", latex: "\\vec{x}", display: "x⃗" },
      { label: "dot", latex: "\\dot{x}", display: "ẋ" },
    ],
  },
  {
    name: "Arrows",
    symbols: [
      { label: "right arrow", latex: "\\rightarrow", display: "→" },
      { label: "left arrow", latex: "\\leftarrow", display: "←" },
      { label: "double right", latex: "\\Rightarrow", display: "⇒" },
      { label: "double left", latex: "\\Leftarrow", display: "⇐" },
      { label: "left-right", latex: "\\leftrightarrow", display: "↔" },
      { label: "double lr", latex: "\\Leftrightarrow", display: "⇔" },
      { label: "up arrow", latex: "\\uparrow", display: "↑" },
      { label: "down arrow", latex: "\\downarrow", display: "↓" },
      { label: "maps to", latex: "\\mapsto", display: "↦" },
    ],
  },
  {
    name: "Delimiters",
    symbols: [
      { label: "left paren", latex: "\\left(", display: "(" },
      { label: "right paren", latex: "\\right)", display: ")" },
      { label: "left bracket", latex: "\\left[", display: "[" },
      { label: "right bracket", latex: "\\right]", display: "]" },
      { label: "left brace", latex: "\\left\\{", display: "{" },
      { label: "right brace", latex: "\\right\\}", display: "}" },
      { label: "left angle", latex: "\\langle", display: "⟨" },
      { label: "right angle", latex: "\\rangle", display: "⟩" },
      { label: "left floor", latex: "\\lfloor", display: "⌊" },
      { label: "right floor", latex: "\\rfloor", display: "⌋" },
      { label: "left ceil", latex: "\\lceil", display: "⌈" },
      { label: "right ceil", latex: "\\rceil", display: "⌉" },
    ],
  },
];

/* ── Medical equation templates ───────────────────────────── */

interface EquationTemplate {
  name: string;
  description: string;
  latex: string;
}

const MEDICAL_EQUATIONS: EquationTemplate[] = [
  {
    name: "BMI",
    description: "Body Mass Index",
    latex: "BMI = \\frac{\\text{weight (kg)}}{\\text{height (m)}^2}",
  },
  {
    name: "Henderson-Hasselbalch",
    description: "Acid-base chemistry",
    latex: "pH = pK_a + \\log \\frac{[A^-]}{[HA]}",
  },
  {
    name: "Cardiac Output",
    description: "Heart function",
    latex: "CO = HR \\times SV",
  },
  {
    name: "Michaelis-Menten",
    description: "Enzyme kinetics",
    latex: "v = \\frac{V_{\\max} \\cdot [S]}{K_m + [S]}",
  },
  {
    name: "Nernst Equation",
    description: "Electrochemistry",
    latex: "E = E^0 - \\frac{RT}{nF} \\ln Q",
  },
  {
    name: "Mean Arterial Pressure",
    description: "Blood pressure",
    latex: "MAP = DBP + \\frac{1}{3}(SBP - DBP)",
  },
  {
    name: "Ideal Gas Law",
    description: "Gas behavior",
    latex: "PV = nRT",
  },
  {
    name: "Clearance",
    description: "Renal clearance",
    latex: "C_x = \\frac{U_x \\cdot V}{P_x}",
  },
  {
    name: "GFR (Cockcroft-Gault)",
    description: "Kidney function estimate",
    latex: "CrCl = \\frac{(140 - \\text{age}) \\times \\text{weight}}{72 \\times S_{Cr}}",
  },
  {
    name: "Fick's Law",
    description: "Diffusion",
    latex: "J = -D \\frac{dC}{dx}",
  },
  {
    name: "Half-life",
    description: "Drug elimination",
    latex: "t_{1/2} = \\frac{0.693}{k_e}",
  },
  {
    name: "Alveolar Gas Equation",
    description: "Pulmonary physiology",
    latex: "P_A O_2 = F_I O_2 (P_B - P_{H_2O}) - \\frac{P_a CO_2}{R}",
  },
];

/* ── Component ────────────────────────────────────────────── */

interface EquationBuilderProps {
  onInsert: (code: string) => void;
  onClose: () => void;
}

export default function EquationBuilder({ onInsert, onClose }: EquationBuilderProps) {
  const t = useTranslations("tools.latexEditor.ui");
  const [activeCategory, setActiveCategory] = useState(SYMBOL_CATEGORIES[0].name);
  const [activeTab, setActiveTab] = useState<"symbols" | "medical">("symbols");
  const [equation, setEquation] = useState("");
  const [wrapMode, setWrapMode] = useState<"inline" | "display">("display");

  const handleSymbolClick = (latex: string) => {
    setEquation((prev) => prev + latex + " ");
  };

  const handleInsertEquation = () => {
    if (!equation.trim()) return;
    const wrapped =
      wrapMode === "display"
        ? `$$\n  ${equation.trim()}\n$$\n`
        : `$${equation.trim()}$`;
    onInsert(wrapped);
    onClose();
  };

  const handleInsertTemplate = (template: EquationTemplate) => {
    const wrapped =
      wrapMode === "display"
        ? `$$\n  ${template.latex}\n$$\n`
        : `$${template.latex}$`;
    onInsert(wrapped);
    onClose();
  };

  const handleInsertSymbolDirectly = (latex: string) => {
    onInsert(latex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-2 border-ink-dark/10 shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-dark/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">∫</span>
            <h2 className="text-base font-bold text-ink-dark">{t("equationBuilder")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-pastel-cream text-ink-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Equation workspace */}
        <div className="px-5 pt-4 pb-3 border-b border-ink-dark/5 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-semibold text-ink-dark">{t("yourEquation")}</label>
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setWrapMode("inline")}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  wrapMode === "inline"
                    ? "bg-showcase-purple/10 text-showcase-purple"
                    : "text-ink-muted hover:bg-pastel-cream"
                }`}
              >
                {t("inlineMath")}
              </button>
              <button
                onClick={() => setWrapMode("display")}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  wrapMode === "display"
                    ? "bg-showcase-purple/10 text-showcase-purple"
                    : "text-ink-muted hover:bg-pastel-cream"
                }`}
              >
                {t("displayMath")}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="Click symbols below or type LaTeX..."
              className="flex-1 px-3 py-2 text-sm font-mono rounded-lg border border-ink-dark/10 focus:outline-none focus:border-showcase-purple/40 bg-gray-50"
            />
            <button
              onClick={handleInsertEquation}
              disabled={!equation.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-showcase-purple text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              Insert
            </button>
          </div>
          {equation.trim() && (
            <p className="mt-1.5 text-[10px] text-ink-muted font-mono">
              {t("previewLabel")} {wrapMode === "display" ? `$$ ${equation.trim()} $$` : `$${equation.trim()}$`}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ink-dark/5 flex-shrink-0">
          <button
            onClick={() => setActiveTab("symbols")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              activeTab === "symbols"
                ? "text-showcase-purple border-b-2 border-showcase-purple"
                : "text-ink-muted"
            }`}
          >
            {t("mathSymbols")}
          </button>
          <button
            onClick={() => setActiveTab("medical")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "medical"
                ? "text-showcase-purple border-b-2 border-showcase-purple"
                : "text-ink-muted"
            }`}
          >
            <Beaker size={12} />
            {t("medicalEquations")}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "symbols" ? (
            <div className="flex">
              {/* Category sidebar */}
              <div className="w-36 border-r border-ink-dark/5 py-2 flex-shrink-0">
                {SYMBOL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors ${
                      activeCategory === cat.name
                        ? "bg-showcase-purple/10 text-showcase-purple"
                        : "text-ink-muted hover:bg-pastel-cream"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Symbol grid */}
              <div className="flex-1 p-3">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {SYMBOL_CATEGORIES.find((c) => c.name === activeCategory)?.symbols.map(
                    (sym) => (
                      <button
                        key={sym.label}
                        onClick={() => handleSymbolClick(sym.latex)}
                        title={`${sym.label} — ${sym.latex}`}
                        className="group relative flex flex-col items-center justify-center py-2 px-1 rounded-lg border border-ink-dark/5 hover:border-showcase-purple/30 hover:bg-showcase-purple/5 transition-all"
                      >
                        <span className="text-lg leading-none">{sym.display}</span>
                        <span className="text-[8px] text-ink-light mt-1 truncate w-full text-center font-mono">
                          {sym.latex}
                        </span>
                        {/* Quick insert tooltip */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertSymbolDirectly(sym.latex);
                            onClose();
                          }}
                          className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 items-center justify-center rounded-full bg-showcase-purple text-white text-[8px]"
                          title={t("insertDirectly")}
                        >
                          +
                        </button>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Medical equations */
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MEDICAL_EQUATIONS.map((eq) => (
                <button
                  key={eq.name}
                  onClick={() => handleInsertTemplate(eq)}
                  className="flex flex-col items-start p-3 rounded-xl border-2 border-ink-dark/8 hover:border-showcase-purple/30 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-ink-dark">{eq.name}</span>
                    <span className="text-[10px] text-ink-light">{eq.description}</span>
                  </div>
                  <code className="text-[11px] font-mono text-showcase-purple bg-showcase-purple/5 px-2 py-1 rounded w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {eq.latex}
                  </code>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="px-5 py-2 border-t border-ink-dark/5 bg-pastel-cream/30 flex-shrink-0">
          <p className="text-[10px] text-ink-muted text-center">
            {t("equationBuilderTip")}
          </p>
        </div>
      </div>
    </div>
  );
}
