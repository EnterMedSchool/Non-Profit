/**
 * LaTeX Template Functions for EnterMedSchool PDF Generation
 *
 * Produces .tex source strings for three PDF types:
 *   1. Exam PDF        — questions + answer key (printable exam)
 *   2. Study Guide PDF — questions + highlighted answers + explanations
 *   3. Flashcard PDF   — double-sided print-and-cut cards
 *
 * All templates use brand colours and XeLaTeX for full Unicode support.
 */

// ── Brand colours ────────────────────────────────────────────────────
const PURPLE = "6C5CE7";
const TEAL = "00D9C0";
const NAVY = "1a1a2e";
const CREAM = "EDF2FF";
const CORAL = "7E22CE";

// ── LaTeX special-char escaper ───────────────────────────────────────
const UNICODE_SUB = { "₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9","₊":"+","₋":"-" };
const UNICODE_SUP = { "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁺":"+","⁻":"-" };

function tex(str) {
  if (!str) return "";
  let s = str;

  // ── Phase 1: Scientific notation → placeholders ─────────────────
  // Run BEFORE general escaping so _ ^ + - are consumed first.
  // Placeholders use @@ markers that the general escaper won't touch.

  // Ion charges — polyatomic first (NH4+, OH-, HCO3-)
  s = s.replace(/\b((?:[A-Z][a-z]?\d*){2,4})([-+])(?=[^A-Za-z0-9]|$)/g,
    (_, formula, sign) => `${formula}@@SUP@@${sign}@@/SUP@@`);

  // Ion charges — simple elements (Na+, Ca2+, Fe3+, Cl-, H+)
  s = s.replace(/\b([A-Z][a-z]?)(\d*)([-+])(?=[^A-Za-z0-9]|$)/g,
    (_, elem, num, sign) => `${elem}@@SUP@@${num}${sign}@@/SUP@@`);

  // Subscripts via _ (P_O2, n_i, P_total, rate_H2, f_s,max)
  s = s.replace(/([A-Za-z]+)_([A-Z][a-z]?\d*|[a-z]+(?:,[a-z]+)*\d*|\d+)/g,
    (_, base, sub) => `${base}@@SUB@@${sub}@@/SUB@@`);

  // Exponents via ^ (10^23, 2^n, r^4)
  s = s.replace(/\^(\d+|[a-z])/g,
    (_, exp) => `@@SUP@@${exp}@@/SUP@@`);

  // ── Phase 2: Standard LaTeX escaping ────────────────────────────
  s = s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}")
    .replace(/\|/g, "\\textbar{}")
    .replace(/[₀₁₂₃₄₅₆₇₈₉₊₋]+/g, m => `\\textsubscript{${[...m].map(c => UNICODE_SUB[c] || c).join("")}}`)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => `\\textsuperscript{${[...m].map(c => UNICODE_SUP[c] || c).join("")}}`);

  // ── Phase 3: Replace placeholders with LaTeX commands ───────────
  s = s
    .replace(/@@SUB@@/g, "\\textsubscript{")
    .replace(/@@\/SUB@@/g, "}")
    .replace(/@@SUP@@/g, "\\textsuperscript{")
    .replace(/@@\/SUP@@/g, "}");

  return s;
}

// ── Shared preamble ──────────────────────────────────────────────────
function preamble({ title, subject, keywords, url, logoDir: rawLogoDir }) {
  const logoDir = rawLogoDir.replace(/\\/g, "/");
  return `\\documentclass[11pt,a4paper]{article}

% ── Encoding & fonts ─────────────────────────────────────────────
\\usepackage{fontspec}
\\setmainfont{Latin Modern Sans}
\\usepackage{microtype}

% ── Layout ───────────────────────────────────────────────────────
\\usepackage[top=22mm,bottom=20mm,left=18mm,right=18mm]{geometry}
\\usepackage{parskip}
\\setlength{\\parindent}{0pt}

% ── Colours ──────────────────────────────────────────────────────
\\usepackage[dvipsnames,table]{xcolor}
\\definecolor{brand-purple}{HTML}{${PURPLE}}
\\definecolor{brand-teal}{HTML}{${TEAL}}
\\definecolor{brand-navy}{HTML}{${NAVY}}
\\definecolor{brand-cream}{HTML}{${CREAM}}
\\definecolor{brand-coral}{HTML}{${CORAL}}

% ── Symbols ──────────────────────────────────────────────────────
\\usepackage{amssymb}

% ── Boxes & lists ────────────────────────────────────────────────
\\usepackage[most]{tcolorbox}
\\usepackage{enumitem}
\\usepackage{multicol}

% ── Headers & footers ────────────────────────────────────────────
\\usepackage{fancyhdr}
\\usepackage{lastpage}

% ── Graphics & misc ──────────────────────────────────────────────
\\usepackage{tikz}
\\usepackage{graphicx}
\\graphicspath{{${logoDir}/}}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{calc}

% ── Hyperlinks & PDF metadata ────────────────────────────────────
\\usepackage[hidelinks]{hyperref}
\\hypersetup{
  pdftitle={${tex(title)}},
  pdfauthor={EnterMedSchool.org},
  pdfsubject={${tex(subject)}},
  pdfkeywords={${tex(keywords)}},
  pdfcreator={EnterMedSchool LaTeX Generator}
}

% ── QR codes ─────────────────────────────────────────────────────
\\usepackage{qrcode}

% ── Header / footer style ───────────────────────────────────────
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Gradient header bar with logo
\\fancyhead[C]{%
  \\begin{tikzpicture}[remember picture,overlay]
    \\shade[left color=brand-purple, right color=brand-teal!70!brand-purple]
      (current page.north west) rectangle
      ([yshift=-14mm]current page.north east);
    \\node[anchor=west, inner sep=0pt]
      at ([xshift=8mm,yshift=-7mm]current page.north west)
      {\\includegraphics[height=8mm]{logo}};
    \\node[anchor=west, white, font=\\bfseries\\small]
      at ([xshift=18mm,yshift=-7mm]current page.north west)
      {EnterMedSchool.org};
    \\node[anchor=west, white, font=\\scriptsize]
      at ([xshift=18mm,yshift=-11mm]current page.north west)
      {${tex(title)}};
    \\node[anchor=east, white, font=\\scriptsize]
      at ([xshift=-18mm,yshift=-9mm]current page.north east)
      {Page \\thepage\\ / \\pageref{LastPage}};
  \\end{tikzpicture}%
}

% Gradient footer accent with QR code
\\fancyfoot[C]{%
  \\begin{tikzpicture}[remember picture,overlay]
    \\shade[left color=brand-teal, right color=brand-purple, middle color=brand-teal!50!brand-purple]
      ([xshift=18mm,yshift=11.75mm]current page.south west) rectangle
      ([xshift=-18mm,yshift=12.25mm]current page.south east);
    \\node[anchor=center, font=\\scriptsize, text=gray]
      at ([xshift=-4mm,yshift=8mm]current page.south)
      {Source: entermedschool.org --- Free Medical Education Resources};
    \\node[anchor=south east, inner sep=0pt]
      at ([xshift=-18mm,yshift=5mm]current page.south east)
      {\\href{${url}}{\\qrcode[height=9mm,level=L]{${url}}}};
  \\end{tikzpicture}%
}

`;
}

// ── Title page helper ────────────────────────────────────────────────
function titlePage({ title, subtitle, deckDescription, questionCount, url, pdfType }) {
  return `
\\begin{titlepage}
\\thispagestyle{empty}
\\begin{tikzpicture}[remember picture,overlay]
  % Full-page gradient background (purple to navy)
  \\shade[top color=brand-purple, bottom color=brand-navy]
    (current page.north west) rectangle (current page.south east);

  % ── Decorative geometric shapes ────────────────────────────────
  \\fill[white, opacity=0.04]
    ([xshift=-25mm,yshift=15mm]current page.north east) circle (55mm);
  \\fill[brand-teal, opacity=0.06]
    ([xshift=35mm,yshift=-90mm]current page.north west) circle (35mm);
  \\fill[white, opacity=0.03]
    ([xshift=50mm,yshift=50mm]current page.south west) circle (40mm);

  % Diagonal band
  \\fill[white, opacity=0.025]
    ([yshift=-110mm]current page.north west) --
    ([xshift=100mm,yshift=-110mm]current page.north west) --
    ([yshift=-200mm]current page.north east) --
    ([xshift=-100mm,yshift=-200mm]current page.north east) -- cycle;

  % Dot grid pattern
  \\foreach \\i in {0,...,8} {
    \\foreach \\j in {0,...,5} {
      \\fill[white, opacity=0.04]
        ([xshift=\\i*20mm+15mm,yshift=-\\j*15mm-130mm]current page.north west) circle (0.4mm);
    }
  }

  % ── Logo with glow / shadow effect ────────────────────────────
  \\fill[white, opacity=0.08] ([yshift=-75mm]current page.north) circle (22mm);
  \\fill[brand-teal, opacity=0.05] ([xshift=2mm,yshift=-77mm]current page.north) circle (20mm);
  \\node[anchor=center, inner sep=0pt]
    at ([yshift=-75mm]current page.north)
    {\\includegraphics[height=24mm]{logo}};

  % ── "EnterMedSchool.org" wordmark ─────────────────────────────
  \\node[anchor=center, white, font=\\fontsize{28}{34}\\bfseries\\selectfont]
    at ([yshift=-102mm]current page.north)
    {EnterMedSchool.org};

  % ── Decorative accent line ────────────────────────────────────
  \\shade[left color=brand-teal, right color=brand-purple!60!brand-teal]
    ([xshift=25mm,yshift=-114mm]current page.north west) rectangle
    ([xshift=-25mm,yshift=-114.6mm]current page.north east);

  % ── Title (huge white bold) ───────────────────────────────────
  \\node[anchor=center, white, font=\\fontsize{24}{30}\\bfseries\\selectfont, text width=150mm, align=center]
    at ([yshift=-137mm]current page.north)
    {${tex(title)}};

  % ── Subtitle pill badge ───────────────────────────────────────
  \\node[anchor=center,
    fill=brand-teal, text=white,
    rounded corners=12pt, inner xsep=8mm, inner ysep=3mm,
    font=\\large\\bfseries]
    at ([yshift=-160mm]current page.north)
    {${tex(subtitle)}};

${deckDescription ? `
  % ── Description ───────────────────────────────────────────────
  \\node[anchor=center, white!80, font=\\small, text width=140mm, align=center]
    at ([yshift=-180mm]current page.north)
    {${tex(deckDescription)}};
` : ""}

  % ── Info strip at bottom ──────────────────────────────────────
  \\fill[black, opacity=0.25]
    ([yshift=40mm]current page.south west) rectangle (current page.south east);
  \\shade[left color=brand-teal, right color=brand-purple]
    ([yshift=40mm]current page.south west) rectangle
    ([yshift=40.5mm]current page.south east);

  \\node[anchor=west, white, font=\\small\\bfseries]
    at ([xshift=20mm,yshift=30mm]current page.south west)
    {${questionCount} ${questionCount === 1 ? "item" : "items"} --- ${tex(pdfType)}};

  \\node[anchor=east, white, font=\\small\\bfseries]
    at ([xshift=-20mm,yshift=30mm]current page.south east)
    {Free \\& Open-Source};

  \\node[anchor=center, white!70, font=\\scriptsize]
    at ([yshift=20mm]current page.south)
    {Licensed under Creative Commons --- Attribution required when sharing};

  \\node[anchor=west, white!60, font=\\scriptsize]
    at ([xshift=20mm,yshift=12mm]current page.south west)
    {Generated \\today};

  % ── QR code (bottom-right, below info strip) ──────────────────
  \\node[anchor=south east, fill=white, rounded corners=2pt, inner sep=1.5mm]
    at ([xshift=-20mm,yshift=2mm]current page.south east)
    {\\href{${url}}{\\qrcode[height=14mm,level=M]{${url}}}};
  \\node[anchor=south east, white, font=\\tiny\\bfseries]
    at ([xshift=-39mm,yshift=6mm]current page.south east)
    {Scan to visit online};

\\end{tikzpicture}
\\end{titlepage}
\\setcounter{page}{1}
`;
}

// ── Question number badge helper ─────────────────────────────────────
function questionBadge(num) {
  return `\\tikz[baseline=(num.base)]{\\node[circle, fill=brand-purple, minimum size=5.5mm, inner sep=0pt, font=\\bfseries\\small\\color{white}](num){${num}};}`;
}

// ── Option letter badge helper ───────────────────────────────────────
function optionBadge(letter, color = "brand-purple") {
  return `\\tikz[baseline=-0.5ex]{\\node[rounded corners=2pt, fill=${color}!10, minimum size=5.5mm, inner sep=0pt, font=\\bfseries\\scriptsize\\color{${color}}]{${letter}};}`;
}

// ── Section divider helper ───────────────────────────────────────────
function sectionDivider() {
  return `\\vspace{1mm}
\\noindent\\begin{tikzpicture}
  \\shade[left color=white, right color=white, middle color=brand-purple!20]
    (0,0) rectangle (\\textwidth, 0.3pt);
\\end{tikzpicture}
\\vspace{2mm}
`;
}

// ═════════════════════════════════════════════════════════════════════
//  1.  EXAM PDF
// ═════════════════════════════════════════════════════════════════════
export function examTemplate({ title, categoryName, description, questions, url, tags, logoDir, categorySlug, deckSlug }) {
  const labels = ["A", "B", "C", "D", "E"];
  const kwStr = ["EnterMedSchool", "exam", categoryName, ...(tags || [])].join(", ");

  let body = preamble({
    title: `${title} — Exam`,
    subject: `Exam: ${categoryName}`,
    keywords: kwStr,
    url,
    logoDir,
  });

  body += "\\begin{document}\n";

  body += titlePage({
    title,
    subtitle: `Exam — ${categoryName}`,
    deckDescription: description,
    questionCount: questions.length,
    url,
    pdfType: "Printable Exam",
  });

  // Questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const opts = q.options || [];
    const qUrl = q.stableId ? `https://entermedschool.org/en/resources/questions/${categorySlug}/${deckSlug}/${q.stableId}` : "";

    body += `
\\begin{tcolorbox}[
  enhanced,
  colback=white,
  colframe=brand-purple!8,
  boxrule=0.4pt,
  arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-purple},
  left=5mm, right=5mm, top=4mm, bottom=4mm,
  breakable
]
\\begin{minipage}[t]{\\dimexpr\\linewidth-18mm\\relax}
  {\\bfseries\\color{brand-navy} ${questionBadge(i + 1)}\\ \\ ${tex(q.prompt)}}
\\end{minipage}%
\\hfill
\\begin{minipage}[t]{16mm}
  \\raggedleft
${qUrl ? `  \\href{${qUrl}}{\\qrcode[height=12mm,level=L]{${qUrl}}}` : ""}
\\end{minipage}

\\vspace{3mm}
`;
    for (let j = 0; j < opts.length && j < 5; j++) {
      const letter = labels[j] || String.fromCharCode(65 + j);
      body += `\\par\\noindent\\hspace{8mm}${optionBadge(letter)}\\hspace{2mm}${tex(opts[j].body)}\\vspace{2.5mm}\n`;
    }
    body += `\\end{tcolorbox}
`;
    if (i < questions.length - 1) {
      body += sectionDivider();
    } else {
      body += "\\vspace{2mm}\n";
    }
  }

  // ── Redesigned Answer Key page ──────────────────────────────────
  body += `
\\newpage

% Gradient header bar for Answer Key
\\begin{tikzpicture}[remember picture,overlay]
  \\shade[left color=brand-purple, right color=brand-teal!70!brand-purple]
    ([yshift=-14mm]current page.north west) rectangle
    (current page.north east);
  \\node[anchor=center, white, font=\\fontsize{18}{22}\\bfseries\\selectfont]
    at ([yshift=-7mm]current page.north) {Answer Key};
  \\node[anchor=east, inner sep=0pt]
    at ([xshift=-18mm,yshift=-7mm]current page.north east)
    {\\href{${url}}{\\qrcode[height=10mm,level=L]{${url}}}};
\\end{tikzpicture}

\\vspace{12mm}

{\\small
\\rowcolors{2}{brand-cream}{white}
\\begin{tabularx}{\\textwidth}{>{}p{10mm} >{\\centering\\arraybackslash}p{12mm} >{\\raggedright\\arraybackslash}X}
\\rowcolor{brand-purple!15}
\\textbf{\\color{brand-navy}\\#} & \\textbf{\\color{brand-navy}Ans} & \\textbf{\\color{brand-navy}Answer Text} \\\\[1mm]
\\hline
`;
  for (let i = 0; i < questions.length; i++) {
    const opts = questions[i].options || [];
    const correct = opts.find((o) => o.isCorrect);
    const ans = correct ? labels[opts.indexOf(correct)] || "?" : "?";
    const rawText = correct ? correct.body.substring(0, 72) : "---";
    const truncated = correct && correct.body.length > 72 ? "\\ldots" : "";
    body += `\\textbf{${i + 1}} & {\\color{brand-purple}\\bfseries ${ans}} & ${tex(rawText)}${truncated} \\\\\n`;
  }
  body += `\\end{tabularx}
}
`;

  body += "\\end{document}\n";
  return body;
}

// ═════════════════════════════════════════════════════════════════════
//  2.  STUDY GUIDE PDF
// ═════════════════════════════════════════════════════════════════════
export function studyGuideTemplate({ title, categoryName, description, questions, url, tags, logoDir, categorySlug, deckSlug }) {
  const labels = ["A", "B", "C", "D", "E"];
  const kwStr = ["EnterMedSchool", "study guide", categoryName, ...(tags || [])].join(", ");

  let body = preamble({
    title: `${title} — Study Guide`,
    subject: `Study Guide: ${categoryName}`,
    keywords: kwStr,
    url,
    logoDir,
  });

  body += "\\begin{document}\n";

  body += titlePage({
    title,
    subtitle: `Study Guide — ${categoryName}`,
    deckDescription: description,
    questionCount: questions.length,
    url,
    pdfType: "Study Guide with Answers",
  });

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const opts = q.options || [];
    const qUrl = q.stableId ? `https://entermedschool.org/en/resources/questions/${categorySlug}/${deckSlug}/${q.stableId}` : "";

    body += `
\\begin{tcolorbox}[
  enhanced,
  colback=white,
  colframe=brand-purple!8,
  boxrule=0.4pt,
  arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-purple},
  left=5mm, right=5mm, top=4mm, bottom=4mm,
  breakable
]
\\begin{minipage}[t]{\\dimexpr\\linewidth-18mm\\relax}
  {\\bfseries\\color{brand-navy} ${questionBadge(i + 1)}\\ \\ ${tex(q.prompt)}}
\\end{minipage}%
\\hfill
\\begin{minipage}[t]{16mm}
  \\raggedleft
${qUrl ? `  \\href{${qUrl}}{\\qrcode[height=12mm,level=L]{${qUrl}}}` : ""}
\\end{minipage}

\\vspace{3mm}
`;
    // Render options manually for full control over correct-answer styling
    for (let j = 0; j < opts.length && j < 5; j++) {
      const opt = opts[j];
      const letter = labels[j] || String.fromCharCode(65 + j);
      if (opt.isCorrect) {
        body += `\\begin{tcolorbox}[blanker, colback=brand-teal!8, arc=3pt,
  left=2mm, right=2mm, top=1.5mm, bottom=1.5mm, before skip=1mm, after skip=1mm]
\\hspace{6mm}${optionBadge(letter, "brand-teal")}\\hspace{2mm}{\\bfseries\\color{brand-navy} ${tex(opt.body)}} {\\color{brand-teal}$\\checkmark$}
\\end{tcolorbox}
`;
      } else {
        body += `\\par\\noindent\\hspace{8mm}${optionBadge(letter)}\\hspace{2mm}${tex(opt.body)}\\vspace{2mm}\n`;
      }
    }

    if (q.explanation) {
      body += `
\\vspace{2mm}
\\begin{tcolorbox}[
  colback=brand-teal!5,
  colframe=white,
  boxrule=0pt,
  arc=3pt,
  borderline west={3pt}{0pt}{brand-teal},
  left=5mm, right=3mm, top=2mm, bottom=2mm
]
{\\small\\color{brand-navy}{\\color{brand-teal}\\bfseries $\\blacktriangleright$\\ Explanation:} ${tex(q.explanation)}}
\\end{tcolorbox}
`;
    }

    body += `\\end{tcolorbox}
`;
    if (i < questions.length - 1) {
      body += sectionDivider();
    } else {
      body += "\\vspace{2mm}\n";
    }
  }

  body += "\\end{document}\n";
  return body;
}

// ═════════════════════════════════════════════════════════════════════
//  3.  FLASHCARD PDF  (double-sided print-and-cut)
// ═════════════════════════════════════════════════════════════════════

const CARD_W = 85; // mm
const CARD_H = 55; // mm
const COLS = 2;
const ROWS = 4;
const CARDS_PER_PAGE = COLS * ROWS;
const HEADER_H = 14; // header bar height mm
const BOTTOM_MARGIN = 8; // bottom margin mm

function round2(n) {
  return Math.round(n * 100) / 100;
}

function flashcardGrid(cards, isFront, { categorySlug, deckSlug } = {}) {
  const pageW = 210; // A4
  const usableH = 297 - HEADER_H - BOTTOM_MARGIN;
  const gapX = (pageW - COLS * CARD_W) / (COLS + 1);
  const gapY = (usableH - ROWS * CARD_H) / (ROWS + 1);

  let tikzBody = "";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      if (idx >= cards.length) continue;

      const card = cards[idx];
      const text = isFront ? (card.front || "") : (card.back || "");
      const displayCol = isFront ? c : (COLS - 1 - c);

      const x = gapX + displayCol * (CARD_W + gapX);
      const yTop = HEADER_H + gapY + r * (CARD_H + gapY);

      const xL = round2(x);
      const xR = round2(x + CARD_W);
      const yT = round2(yTop);
      const yB = round2(yTop + CARD_H);

      tikzBody += `  \\draw[dashed, gray!50] ([xshift=${xL}mm,yshift=-${yT}mm]current page.north west) rectangle ([xshift=${xR}mm,yshift=-${yB}mm]current page.north west);\n`;

      const cardNum = card._globalIdx != null ? card._globalIdx + 1 : idx + 1;
      tikzBody += `  \\node[anchor=north west, font=\\tiny\\color{gray}] at ([xshift=${round2(x + 1.5)}mm,yshift=-${round2(yTop + 1)}mm]current page.north west) {${cardNum}};\n`;

      const textX = round2(x + CARD_W / 2);
      const textY = round2(yTop + CARD_H / 2);
      const maxTextW = CARD_W - 8;
      tikzBody += `  \\node[anchor=center, text width=${maxTextW}mm, align=center, font={\\small\\hyphenpenalty=10000}, text=brand-navy] at ([xshift=${textX}mm,yshift=-${textY}mm]current page.north west) {${tex(text)}};\n`;

      if (!isFront) {
        tikzBody += `  \\node[anchor=south, font=\\tiny\\color{brand-purple!50}] at ([xshift=${textX}mm,yshift=-${round2(yTop + CARD_H - 1.5)}mm]current page.north west) {entermedschool.org};\n`;

        // 3 blank writing lines for student notes
        const lineStartX = round2(x + 4);
        const lineEndX = round2(x + CARD_W - 4);
        for (let ln = 0; ln < 3; ln++) {
          const lineY = round2(yTop + CARD_H - 10 - ln * 4);
          tikzBody += `  \\draw[gray!30, line width=0.3pt] ([xshift=${lineStartX}mm,yshift=-${lineY}mm]current page.north west) -- ([xshift=${lineEndX}mm,yshift=-${lineY}mm]current page.north west);\n`;
        }
      }
    }
  }

  return tikzBody;
}

export function flashcardTemplate({ title, categoryName, description, cards, url, tags, logoDir: rawLogoDir, categorySlug, deckSlug }) {
  const logoDir = rawLogoDir.replace(/\\/g, "/");
  const kwStr = ["EnterMedSchool", "flashcards", categoryName, ...(tags || [])].join(", ");

  let body = `\\documentclass[11pt,a4paper]{article}

\\usepackage{fontspec}
\\setmainfont{Latin Modern Sans}
\\usepackage{microtype}
\\usepackage[top=5mm,bottom=8mm,left=5mm,right=5mm]{geometry}
\\usepackage[dvipsnames]{xcolor}
\\definecolor{brand-purple}{HTML}{${PURPLE}}
\\definecolor{brand-teal}{HTML}{${TEAL}}
\\definecolor{brand-navy}{HTML}{${NAVY}}
\\definecolor{brand-cream}{HTML}{${CREAM}}
\\usepackage{tikz}
\\usepackage{graphicx}
\\graphicspath{{${logoDir}/}}
\\usepackage{lastpage}
\\usepackage[hidelinks]{hyperref}
\\hypersetup{
  pdftitle={${tex(title)} --- Flashcards},
  pdfauthor={EnterMedSchool.org},
  pdfsubject={Flashcards: ${tex(categoryName)}},
  pdfkeywords={${tex(kwStr)}},
  pdfcreator={EnterMedSchool LaTeX Generator}
}
\\usepackage{qrcode}
\\pagestyle{empty}

\\begin{document}
`;

  // ── Magazine-quality title page ───────────────────────────────────
  body += `
\\begin{tikzpicture}[remember picture,overlay]
  % Full-page gradient background (purple to navy)
  \\shade[top color=brand-purple, bottom color=brand-navy]
    (current page.north west) rectangle (current page.south east);

  % Decorative geometric shapes
  \\fill[white, opacity=0.04]
    ([xshift=-25mm,yshift=15mm]current page.north east) circle (55mm);
  \\fill[brand-teal, opacity=0.06]
    ([xshift=35mm,yshift=-90mm]current page.north west) circle (35mm);
  \\fill[white, opacity=0.03]
    ([xshift=50mm,yshift=50mm]current page.south west) circle (40mm);

  \\fill[white, opacity=0.025]
    ([yshift=-110mm]current page.north west) --
    ([xshift=100mm,yshift=-110mm]current page.north west) --
    ([yshift=-200mm]current page.north east) --
    ([xshift=-100mm,yshift=-200mm]current page.north east) -- cycle;

  \\foreach \\i in {0,...,8} {
    \\foreach \\j in {0,...,5} {
      \\fill[white, opacity=0.04]
        ([xshift=\\i*20mm+15mm,yshift=-\\j*15mm-130mm]current page.north west) circle (0.4mm);
    }
  }

  % Logo with glow / shadow
  \\fill[white, opacity=0.08] ([yshift=-75mm]current page.north) circle (22mm);
  \\fill[brand-teal, opacity=0.05] ([xshift=2mm,yshift=-77mm]current page.north) circle (20mm);
  \\node[anchor=center, inner sep=0pt]
    at ([yshift=-75mm]current page.north)
    {\\includegraphics[height=24mm]{logo}};

  % Wordmark
  \\node[anchor=center, white, font=\\fontsize{28}{34}\\bfseries\\selectfont]
    at ([yshift=-102mm]current page.north)
    {EnterMedSchool.org};

  % Accent line
  \\shade[left color=brand-teal, right color=brand-purple!60!brand-teal]
    ([xshift=25mm,yshift=-114mm]current page.north west) rectangle
    ([xshift=-25mm,yshift=-114.6mm]current page.north east);

  % Title
  \\node[anchor=center, white, font=\\fontsize{24}{30}\\bfseries\\selectfont, text width=150mm, align=center]
    at ([yshift=-137mm]current page.north)
    {${tex(title)}};

  % Subtitle pill badge
  \\node[anchor=center,
    fill=brand-teal, text=white,
    rounded corners=12pt, inner xsep=8mm, inner ysep=3mm,
    font=\\large\\bfseries]
    at ([yshift=-160mm]current page.north)
    {Printable Flashcards --- ${tex(categoryName)}};

${description ? `
  \\node[anchor=center, white!80, font=\\small, text width=140mm, align=center]
    at ([yshift=-180mm]current page.north)
    {${tex(description)}};
` : ""}

  \\node[anchor=center, white!70, font=\\small, text width=140mm, align=center]
    at ([yshift=-195mm]current page.north)
    {${cards.length} cards --- Print double-sided, flip on long edge, then cut along dashed lines.};

  % Info strip
  \\fill[black, opacity=0.25]
    ([yshift=40mm]current page.south west) rectangle (current page.south east);
  \\shade[left color=brand-teal, right color=brand-purple]
    ([yshift=40mm]current page.south west) rectangle
    ([yshift=40.5mm]current page.south east);

  \\node[anchor=west, white, font=\\small\\bfseries]
    at ([xshift=20mm,yshift=30mm]current page.south west)
    {${cards.length} cards --- Printable Flashcards};

  \\node[anchor=east, white, font=\\small\\bfseries]
    at ([xshift=-20mm,yshift=30mm]current page.south east)
    {Free \\& Open-Source};

  \\node[anchor=center, white!70, font=\\scriptsize]
    at ([yshift=20mm]current page.south)
    {Licensed under Creative Commons --- Attribution required when sharing};

  \\node[anchor=west, white!60, font=\\scriptsize]
    at ([xshift=20mm,yshift=12mm]current page.south west)
    {Generated \\today};

  % QR code (bottom-right, below info strip)
  \\node[anchor=south east, fill=white, rounded corners=2pt, inner sep=1.5mm]
    at ([xshift=-20mm,yshift=2mm]current page.south east)
    {\\href{${url}}{\\qrcode[height=14mm,level=M]{${url}}}};
  \\node[anchor=south east, white, font=\\tiny\\bfseries]
    at ([xshift=-39mm,yshift=6mm]current page.south east)
    {Scan to visit online};

\\end{tikzpicture}

\\newpage
`;

  const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);

  for (let p = 0; p < totalPages; p++) {
    const chunk = cards.slice(p * CARDS_PER_PAGE, (p + 1) * CARDS_PER_PAGE);
    chunk.forEach((card, i) => { card._globalIdx = p * CARDS_PER_PAGE + i; });

    body += `
% ── Sheet ${p + 1}/${totalPages} FRONT ──
\\begin{tikzpicture}[remember picture,overlay]
  \\shade[left color=brand-purple, right color=brand-teal!70!brand-purple]
    (current page.north west) rectangle
    ([yshift=-${HEADER_H}mm]current page.north east);
  \\node[anchor=west, inner sep=0pt]
    at ([xshift=5mm,yshift=-7mm]current page.north west)
    {\\includegraphics[height=7mm]{logo}};
  \\node[anchor=west, white, font=\\bfseries\\small]
    at ([xshift=14mm,yshift=-7mm]current page.north west)
    {EnterMedSchool.org --- ${tex(title)}};
  \\node[anchor=east, white, font=\\scriptsize]
    at ([xshift=-8mm,yshift=-7mm]current page.north east)
    {Sheet ${p + 1}/${totalPages} --- FRONT};
  \\node[anchor=east, white, font=\\scriptsize]
    at ([xshift=-8mm,yshift=-11mm]current page.north east)
    {Print double-sided, flip on long edge};
${flashcardGrid(chunk, true)}\\end{tikzpicture}
\\newpage

% ── Sheet ${p + 1}/${totalPages} BACK ──
\\begin{tikzpicture}[remember picture,overlay]
  \\shade[left color=brand-cream, right color=white]
    (current page.north west) rectangle
    ([yshift=-${HEADER_H}mm]current page.north east);
  \\shade[left color=brand-teal, right color=brand-purple]
    ([yshift=-${HEADER_H}mm]current page.north west) rectangle
    ([yshift=-${HEADER_H}.6mm]current page.north west -| current page.north east);
  \\node[anchor=west, inner sep=0pt]
    at ([xshift=5mm,yshift=-7mm]current page.north west)
    {\\includegraphics[height=7mm]{logo}};
  \\node[anchor=west, brand-purple, font=\\bfseries\\small]
    at ([xshift=14mm,yshift=-7mm]current page.north west)
    {EnterMedSchool.org --- ${tex(title)}};
  \\node[anchor=east, brand-navy, font=\\scriptsize]
    at ([xshift=-8mm,yshift=-7mm]current page.north east)
    {Sheet ${p + 1}/${totalPages} --- BACK};
${flashcardGrid(chunk, false, { categorySlug, deckSlug })}\\end{tikzpicture}
\\newpage
`;
  }

  body += "\\end{document}\n";
  return body;
}

// ═════════════════════════════════════════════════════════════════════
//  4.  ITALIAN LESSON PDF (full lesson — all step types combined)
// ═════════════════════════════════════════════════════════════════════

function speakerBadge(speaker, role) {
  const roleColors = {
    doctor: "brand-blue",
    patient: "brand-teal",
    student: "brand-green",
    other: "brand-purple",
  };
  const color = roleColors[role] || "brand-purple";
  return `\\tikz[baseline=-0.5ex]{\\node[rounded corners=2pt, fill=${color}!15, minimum size=5mm, inner xsep=3mm, inner sep=1.5mm, font=\\bfseries\\scriptsize\\color{${color}}]{${tex(speaker)}};}`;
}

function resolveRole(speaker) {
  const norm = (speaker || "").toLowerCase();
  if (norm.includes("paziente") || norm.includes("patient")) return "patient";
  if (norm.includes("dott") || norm.includes("medico") || norm.includes("primario") || norm.includes("infermier") || norm.includes("strumentista") || norm.includes("capo sala")) return "doctor";
  if (norm === "tu" || norm.includes("studente") || norm.includes("studentessa") || norm.includes("student")) return "student";
  return "other";
}

const ROLE_BORDER = { doctor: "brand-blue", patient: "brand-teal", student: "brand-green", other: "brand-purple" };

export function italianLessonTemplate({ title, lessonNumber, description, steps, url, logoDir }) {
  const kwStr = ["EnterMedSchool", "Medical Italian", title].join(", ");

  let body = preamble({
    title: `${title} — Medical Italian Lesson ${lessonNumber}`,
    subject: `Medical Italian Lesson ${lessonNumber}`,
    keywords: kwStr,
    url,
    logoDir,
  });

  // brand-blue / brand-green not yet defined in shared preamble
  body += `\\definecolor{brand-blue}{HTML}{54A0FF}
\\definecolor{brand-green}{HTML}{10B981}
`;

  body += "\\begin{document}\n";

  body += titlePage({
    title: `Medical Italian: ${title}`,
    subtitle: `Lesson ${lessonNumber} — Complete`,
    deckDescription: description || "Interactive lesson with dialogues, vocabulary, quizzes, and clinical cases.",
    questionCount: steps.length,
    url,
    pdfType: "Complete Lesson",
  });

  for (let si = 0; si < steps.length; si++) {
    const step = steps[si];

    if (step.stepType === "glossary" && step.config?.terms) {
      body += `
\\begin{tcolorbox}[
  enhanced, colback=white, colframe=brand-teal!15,
  boxrule=0.4pt, arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-teal},
  left=5mm, right=5mm, top=4mm, bottom=4mm, breakable,
  title={\\color{white}\\bfseries ${tex(step.title || "Vocabulary")}},
  coltitle=white, colbacktitle=brand-teal, fonttitle=\\bfseries\\small
]
{\\small
\\rowcolors{2}{brand-cream}{white}
\\begin{tabularx}{\\textwidth}{>{\\bfseries\\raggedright}p{0.48\\textwidth} >{\\raggedright\\arraybackslash}X}
\\rowcolor{brand-teal!10}
\\textbf{\\color{brand-navy}Italiano} & \\textbf{\\color{brand-navy}English} \\\\[1mm]
\\hline
`;
      for (const term of step.config.terms) {
        body += `${tex(term.lemma)} & ${tex(term.english)} \\\\\n`;
      }
      body += `\\end{tabularx}
}
\\end{tcolorbox}
`;
    } else if (step.stepType === "dialogue" && step.config?.lines) {
      body += `
\\begin{tcolorbox}[
  enhanced, colback=white, colframe=brand-blue!15,
  boxrule=0.4pt, arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-blue},
  left=5mm, right=5mm, top=4mm, bottom=4mm, breakable,
  title={\\color{white}\\bfseries ${tex(step.title || "Dialogue")}},
  coltitle=white, colbacktitle=brand-blue, fonttitle=\\bfseries\\small
]
`;
      for (const line of step.config.lines) {
        const role = resolveRole(line.speaker);
        const borderColor = ROLE_BORDER[role] || "brand-purple";
        body += `\\begin{tcolorbox}[blanker, borderline west={2pt}{0pt}{${borderColor}},
  left=4mm, right=2mm, top=1.5mm, bottom=1.5mm, before skip=2mm, after skip=1mm]
${speakerBadge(line.speaker || "Speaker", role)}\\\\[1mm]
{\\bfseries ${tex(line.italian)}}\\\\
{\\small\\color{gray} ${tex(line.english)}}
\\end{tcolorbox}
`;
      }
      body += `\\end{tcolorbox}
`;
    } else if (step.stepType === "multi_choice" && step.config?.questions) {
      body += `
\\begin{tcolorbox}[
  enhanced, colback=white, colframe=brand-purple!15,
  boxrule=0.4pt, arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-purple},
  left=5mm, right=5mm, top=4mm, bottom=4mm, breakable,
  title={\\color{white}\\bfseries ${tex(step.title || "Comprehension Quiz")}},
  coltitle=white, colbacktitle=brand-purple, fonttitle=\\bfseries\\small
]
`;
      const labels = ["A", "B", "C", "D", "E"];
      for (let qi = 0; qi < step.config.questions.length; qi++) {
        const q = step.config.questions[qi];
        body += `\\vspace{2mm}
{\\bfseries\\color{brand-navy} ${questionBadge(qi + 1)}\\ \\ ${tex(q.prompt)}}\\\\[2mm]
`;
        for (let oi = 0; oi < q.options.length && oi < 5; oi++) {
          const letter = labels[oi];
          const isCorrect = oi === q.answer;
          if (isCorrect) {
            body += `\\hspace{4mm}${optionBadge(letter, "brand-teal")}\\hspace{2mm}{\\bfseries\\color{brand-navy} ${tex(q.options[oi])}} {\\color{brand-teal}$\\checkmark$}\\\\[1.5mm]\n`;
          } else {
            body += `\\hspace{4mm}${optionBadge(letter)}\\hspace{2mm}${tex(q.options[oi])}\\\\[1.5mm]\n`;
          }
        }
      }
      body += `\\end{tcolorbox}
`;
    } else if ((step.stepType === "read_respond") && step.config?.passage) {
      body += `
\\begin{tcolorbox}[
  enhanced, colback=white, colframe=brand-coral!15,
  boxrule=0.4pt, arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-coral},
  left=5mm, right=5mm, top=4mm, bottom=4mm, breakable,
  title={\\color{white}\\bfseries ${tex(step.title || "Clinical Case")}},
  coltitle=white, colbacktitle=brand-coral, fonttitle=\\bfseries\\small
]
{\\small\\itshape ${tex(step.config.passage)}}

\\vspace{3mm}
{\\bfseries\\color{brand-navy} ${tex(step.config.question)}}\\\\[2mm]
`;
      const labels2 = ["A", "B", "C", "D", "E"];
      for (let oi = 0; oi < step.config.options.length && oi < 5; oi++) {
        const isCorrect = oi === step.config.answer;
        if (isCorrect) {
          body += `\\hspace{4mm}${optionBadge(labels2[oi], "brand-teal")}\\hspace{2mm}{\\bfseries\\color{brand-navy} ${tex(step.config.options[oi])}} {\\color{brand-teal}$\\checkmark$}\\\\[1.5mm]\n`;
        } else {
          body += `\\hspace{4mm}${optionBadge(labels2[oi])}\\hspace{2mm}${tex(step.config.options[oi])}\\\\[1.5mm]\n`;
        }
      }
      body += `\\end{tcolorbox}
`;
    }

    if (si < steps.length - 1) body += sectionDivider();
  }

  body += "\\end{document}\n";
  return body;
}

// ═════════════════════════════════════════════════════════════════════
//  5.  ITALIAN DIALOGUE BOOKLET
// ═════════════════════════════════════════════════════════════════════

export function italianDialogueTemplate({ title, lessonNumber, dialogues, url, logoDir }) {
  const kwStr = ["EnterMedSchool", "Medical Italian", "Dialogue", title].join(", ");

  let body = preamble({
    title: `${title} — Dialogues`,
    subject: `Medical Italian Dialogues — Lesson ${lessonNumber}`,
    keywords: kwStr,
    url,
    logoDir,
  });

  body += `\\definecolor{brand-blue}{HTML}{54A0FF}
\\definecolor{brand-green}{HTML}{10B981}
`;

  body += "\\begin{document}\n";

  body += titlePage({
    title: `Medical Italian: ${title}`,
    subtitle: `Lesson ${lessonNumber} — Dialogue Booklet`,
    deckDescription: `${dialogues.length} clinical dialogues with bilingual text (Italian / English).`,
    questionCount: dialogues.length,
    url,
    pdfType: "Dialogue Booklet",
  });

  for (let di = 0; di < dialogues.length; di++) {
    const d = dialogues[di];
    body += `
\\begin{tcolorbox}[
  enhanced, colback=white, colframe=brand-blue!15,
  boxrule=0.4pt, arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-blue},
  left=5mm, right=5mm, top=4mm, bottom=4mm, breakable,
  title={\\color{white}\\bfseries Scene ${di + 1}: ${tex(d.title || "Dialogue")}},
  coltitle=white, colbacktitle=brand-blue, fonttitle=\\bfseries\\small
]
`;
    for (const line of d.lines) {
      const role = resolveRole(line.speaker);
      const borderColor = ROLE_BORDER[role] || "brand-purple";
      body += `\\begin{tcolorbox}[blanker, borderline west={2pt}{0pt}{${borderColor}},
  left=4mm, right=2mm, top=1.5mm, bottom=1.5mm, before skip=2mm, after skip=1mm]
${speakerBadge(line.speaker || "Speaker", role)}\\\\[1mm]
{\\bfseries ${tex(line.italian)}}\\hfill{\\small\\color{gray}\\itshape ${tex(line.english)}}
\\end{tcolorbox}
`;
    }
    body += `\\end{tcolorbox}
`;
    if (di < dialogues.length - 1) body += sectionDivider();
  }

  body += "\\end{document}\n";
  return body;
}

// ═════════════════════════════════════════════════════════════════════
//  6.  ITALIAN QUIZ BOOKLET
// ═════════════════════════════════════════════════════════════════════

export function italianQuizTemplate({ title, lessonNumber, quizSteps, url, logoDir }) {
  const kwStr = ["EnterMedSchool", "Medical Italian", "Quiz", title].join(", ");

  const totalQuestions = quizSteps.reduce((sum, s) => {
    if (s.stepType === "multi_choice") return sum + (s.config?.questions?.length || 0);
    if (s.stepType === "read_respond") return sum + 1;
    return sum;
  }, 0);

  let body = preamble({
    title: `${title} — Quiz`,
    subject: `Medical Italian Quiz — Lesson ${lessonNumber}`,
    keywords: kwStr,
    url,
    logoDir,
  });

  body += `\\definecolor{brand-blue}{HTML}{54A0FF}
\\definecolor{brand-green}{HTML}{10B981}
`;

  body += "\\begin{document}\n";

  body += titlePage({
    title: `Medical Italian: ${title}`,
    subtitle: `Lesson ${lessonNumber} — Quiz Booklet`,
    deckDescription: `${totalQuestions} comprehension questions from clinical dialogues and cases.`,
    questionCount: totalQuestions,
    url,
    pdfType: "Quiz Booklet",
  });

  const labels = ["A", "B", "C", "D", "E"];
  let globalQ = 0;
  const answerList = [];

  for (const step of quizSteps) {
    if (step.stepType === "multi_choice" && step.config?.questions) {
      for (const q of step.config.questions) {
        globalQ++;
        body += `
\\begin{tcolorbox}[
  enhanced, colback=white, colframe=brand-purple!8,
  boxrule=0.4pt, arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-purple},
  left=5mm, right=5mm, top=4mm, bottom=4mm, breakable
]
{\\bfseries\\color{brand-navy} ${questionBadge(globalQ)}\\ \\ ${tex(q.prompt)}}
\\vspace{3mm}
`;
        for (let oi = 0; oi < q.options.length && oi < 5; oi++) {
          body += `\\par\\noindent\\hspace{8mm}${optionBadge(labels[oi])}\\hspace{2mm}${tex(q.options[oi])}\\vspace{2.5mm}\n`;
        }
        body += `\\end{tcolorbox}\n`;
        answerList.push({ num: globalQ, ans: labels[q.answer] || "?", text: q.options[q.answer]?.substring(0, 60) || "---" });
        body += sectionDivider();
      }
    } else if (step.stepType === "read_respond" && step.config?.passage) {
      globalQ++;
      body += `
\\begin{tcolorbox}[
  enhanced, colback=white, colframe=brand-coral!8,
  boxrule=0.4pt, arc=6pt,
  shadow={1.5mm}{-1mm}{0mm}{black!8},
  borderline west={3pt}{0pt}{brand-coral},
  left=5mm, right=5mm, top=4mm, bottom=4mm, breakable
]
{\\small\\itshape ${tex(step.config.passage)}}

\\vspace{3mm}
{\\bfseries\\color{brand-navy} ${questionBadge(globalQ)}\\ \\ ${tex(step.config.question)}}
\\vspace{3mm}
`;
      for (let oi = 0; oi < step.config.options.length && oi < 5; oi++) {
        body += `\\par\\noindent\\hspace{8mm}${optionBadge(labels[oi])}\\hspace{2mm}${tex(step.config.options[oi])}\\vspace{2.5mm}\n`;
      }
      body += `\\end{tcolorbox}\n`;
      answerList.push({ num: globalQ, ans: labels[step.config.answer] || "?", text: step.config.options[step.config.answer]?.substring(0, 60) || "---" });
      body += sectionDivider();
    }
  }

  // Answer key
  body += `
\\newpage
\\begin{tikzpicture}[remember picture,overlay]
  \\shade[left color=brand-purple, right color=brand-teal!70!brand-purple]
    ([yshift=-14mm]current page.north west) rectangle (current page.north east);
  \\node[anchor=center, white, font=\\fontsize{18}{22}\\bfseries\\selectfont]
    at ([yshift=-7mm]current page.north) {Answer Key};
\\end{tikzpicture}

\\vspace{12mm}

{\\small
\\rowcolors{2}{brand-cream}{white}
\\begin{tabularx}{\\textwidth}{>{}p{10mm} >{\\centering\\arraybackslash}p{12mm} >{\\raggedright\\arraybackslash}X}
\\rowcolor{brand-purple!15}
\\textbf{\\color{brand-navy}\\#} & \\textbf{\\color{brand-navy}Ans} & \\textbf{\\color{brand-navy}Answer Text} \\\\[1mm]
\\hline
`;
  for (const a of answerList) {
    body += `\\textbf{${a.num}} & {\\color{brand-purple}\\bfseries ${a.ans}} & ${tex(a.text)} \\\\\n`;
  }
  body += `\\end{tabularx}
}
`;

  body += "\\end{document}\n";
  return body;
}
