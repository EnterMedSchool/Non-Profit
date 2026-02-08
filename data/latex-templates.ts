import type { LaTeXTemplate } from "@/components/tools/latex-editor/types";

export const latexTemplates: LaTeXTemplate[] = [
  /* ─── 1. Hello LaTeX (beginner) ─────────────────────────── */
  {
    id: "hello-latex",
    title: "Hello LaTeX",
    description:
      "Your very first LaTeX document. Every line is explained with comments so you understand exactly what's happening.",
    category: "getting-started",
    difficulty: "beginner",
    icon: "Sparkles",
    tags: ["beginner", "tutorial", "commented"],
    previewDescription:
      "A minimal document that teaches you the basic structure of every LaTeX file.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `% ============================================================
% My First LaTeX Document
% ============================================================
% Lines starting with % are comments — they don't appear in
% the final document. Use them to leave notes for yourself!

% STEP 1: Tell LaTeX what type of document you're making.
% "article" is the most common type for essays and papers.
\\documentclass{article}

% STEP 2: Load packages — these add extra features.
\\usepackage[utf8]{inputenc}   % Allows special characters (é, ñ, ü)
\\usepackage[T1]{fontenc}      % Better font encoding
\\usepackage{amsmath}          % Better math support
\\usepackage{hyperref}         % Clickable links

% STEP 3: Set your document's title, author, and date.
\\title{My First LaTeX Document}
\\author{Your Name Here}
\\date{\\today}  % \\today automatically inserts today's date

% STEP 4: Begin the actual document content.
\\begin{document}

% This creates the title block from the info above
\\maketitle

% ── Sections ──
% Sections organize your document, like chapters in a book.
\\section{Introduction}
Hello! This is my first LaTeX document. If you can read this in the preview, everything is working perfectly.

LaTeX (pronounced "LAH-tek" or "LAY-tek") is a tool used by scientists, researchers, and students to create beautifully formatted documents. Unlike Word, you write \\_code\\_ that gets transformed into a polished document.

\\section{Why Use LaTeX?}
Here are some reasons medical students love LaTeX:

% \\begin{itemize} creates a bullet list
\\begin{itemize}
  \\item Beautiful mathematical equations
  \\item Automatic numbering of sections, figures, and tables
  \\item Professional-looking documents every time
  \\item Easy bibliography and citation management
  \\item Perfect for long documents like theses
\\end{itemize}

\\section{Your First Equation}
LaTeX is famous for beautiful math. Here's the Michaelis-Menten equation:

% \\begin{equation} creates a numbered equation
\\begin{equation}
  v = \\frac{V_{\\max} \\cdot [S]}{K_m + [S]}
\\end{equation}

And here's inline math: the Henderson-Hasselbalch equation is $pH = pK_a + \\log\\frac{[A^-]}{[HA]}$.

\\section{Text Formatting}
You can make text \\textbf{bold}, \\textit{italic}, or \\underline{underlined}.

You can also combine them: \\textbf{\\textit{bold and italic}}.

\\section{What's Next?}
Try these exercises:
\\begin{enumerate}
  \\item Change the title and author above
  \\item Add a new section with your own text
  \\item Write a math equation you know
  \\item Add more items to the bullet list
\\end{enumerate}

\\end{document}
`,
      },
    ],
  },

  /* ─── 2. Lecture Notes (beginner) ───────────────────────── */
  {
    id: "lecture-notes",
    title: "Lecture Notes",
    description:
      "Organize your lecture notes with sections, highlighted boxes, and math. Perfect for daily class notes.",
    category: "notes",
    difficulty: "beginner",
    icon: "NotebookPen",
    tags: ["notes", "lectures", "study", "medical"],
    previewDescription:
      "A clean note-taking template with sections, lists, math, and colored boxes for key concepts.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[11pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

% Page layout — generous margins for notes
\\geometry{a4paper, margin=2.5cm}

% Header
\\title{Lecture Notes: Cardiovascular Physiology}
\\author{Your Name}
\\date{Week 3 — \\today}

\\begin{document}
\\maketitle
\\tableofcontents
\\newpage

\\section{Cardiac Cycle Overview}
The cardiac cycle consists of two main phases:

\\begin{enumerate}
  \\item \\textbf{Systole} — contraction phase (ventricles pump blood)
  \\item \\textbf{Diastole} — relaxation phase (ventricles fill with blood)
\\end{enumerate}

\\subsection{Key Pressures}
\\begin{itemize}
  \\item Normal systolic BP: $\\sim 120$ mmHg
  \\item Normal diastolic BP: $\\sim 80$ mmHg
  \\item Mean Arterial Pressure (MAP):
\\end{itemize}

\\begin{equation}
  MAP = DBP + \\frac{1}{3}(SBP - DBP)
\\end{equation}

\\section{Cardiac Output}
Cardiac output is the volume of blood pumped per minute:

\\begin{equation}
  CO = HR \\times SV
\\end{equation}

Where:
\\begin{itemize}
  \\item $CO$ = Cardiac Output (L/min)
  \\item $HR$ = Heart Rate (beats/min)
  \\item $SV$ = Stroke Volume (mL/beat)
\\end{itemize}

\\textbf{Normal values:} $CO \\approx 5$ L/min at rest.

\\subsection{Factors Affecting Stroke Volume}
\\begin{enumerate}
  \\item \\textbf{Preload} — stretch of ventricle before contraction (Frank-Starling)
  \\item \\textbf{Afterload} — resistance the heart must pump against
  \\item \\textbf{Contractility} — strength of contraction (inotropic state)
\\end{enumerate}

\\section{Frank-Starling Law}
The Frank-Starling law states that the heart pumps out whatever volume is returned to it:

\\begin{quote}
"The greater the stretch of cardiac muscle fibers (within physiological limits), the greater the force of contraction."
\\end{quote}

\\section{Key Points to Remember}
\\begin{itemize}
  \\item $\\uparrow$ Preload $\\rightarrow$ $\\uparrow$ Stroke Volume
  \\item $\\uparrow$ Afterload $\\rightarrow$ $\\downarrow$ Stroke Volume
  \\item $\\uparrow$ Contractility $\\rightarrow$ $\\uparrow$ Stroke Volume
  \\item Ejection Fraction: $EF = \\frac{SV}{EDV} \\times 100\\%$ (normal $\\geq 55\\%$)
\\end{itemize}

\\section{Questions for Review}
\\begin{enumerate}
  \\item What happens to cardiac output during exercise?
  \\item How does heart failure affect the Frank-Starling curve?
  \\item Calculate MAP for BP 130/85 mmHg.
\\end{enumerate}

\\end{document}
`,
      },
    ],
  },

  /* ─── 3. Formula Sheet (beginner) ───────────────────────── */
  {
    id: "formula-sheet",
    title: "Formula Sheet",
    description:
      "A compact two-column formula reference sheet. Great for exam prep and quick review.",
    category: "notes",
    difficulty: "beginner",
    icon: "Calculator",
    tags: ["formulas", "math", "reference", "exam"],
    previewDescription:
      "A dense two-column layout perfect for fitting lots of formulas on one page.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[10pt,a4paper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{multicol}

% Tight margins for maximum content
\\geometry{margin=1.5cm}

% Reduce spacing
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{4pt}

\\begin{document}

\\begin{center}
  {\\Large \\textbf{Medical Formulas Quick Reference}}\\\\[4pt]
  {\\small Compiled by Your Name — \\today}
\\end{center}

\\begin{multicols}{2}

\\section*{Cardiovascular}
\\textbf{Cardiac Output:}
$CO = HR \\times SV$

\\textbf{Mean Arterial Pressure:}
$MAP = DBP + \\frac{1}{3}(SBP - DBP)$

\\textbf{Ejection Fraction:}
$EF = \\frac{SV}{EDV} \\times 100\\%$

\\textbf{Fick Principle:}
$CO = \\frac{VO_2}{C_a - C_v}$

\\section*{Respiratory}
\\textbf{Alveolar Gas Equation:}
$P_AO_2 = FiO_2(P_B - P_{H_2O}) - \\frac{P_aCO_2}{R}$

\\textbf{A-a Gradient:}
$A\\text{-}a = P_AO_2 - P_aO_2$

\\textbf{Compliance:}
$C = \\frac{\\Delta V}{\\Delta P}$

\\section*{Renal}
\\textbf{GFR (Clearance):}
$GFR = \\frac{U_x \\times V}{P_x}$

\\textbf{Filtration Fraction:}
$FF = \\frac{GFR}{RPF}$

\\textbf{Free Water Clearance:}
$C_{H_2O} = V - C_{osm}$

\\section*{Pharmacology}
\\textbf{Volume of Distribution:}
$V_d = \\frac{\\text{Amount of drug}}{\\text{Plasma concentration}}$

\\textbf{Half-life:}
$t_{1/2} = \\frac{0.693}{k_e}$

\\textbf{Loading Dose:}
$LD = \\frac{C_{target} \\times V_d}{F}$

\\textbf{Maintenance Dose:}
$MD = \\frac{C_{ss} \\times CL}{F}$

\\section*{Biostatistics}
\\textbf{Sensitivity:}
$Se = \\frac{TP}{TP + FN}$

\\textbf{Specificity:}
$Sp = \\frac{TN}{TN + FP}$

\\textbf{PPV:}
$PPV = \\frac{TP}{TP + FP}$

\\textbf{NPV:}
$NPV = \\frac{TN}{TN + FN}$

\\textbf{NNT:}
$NNT = \\frac{1}{ARR}$

\\end{multicols}

\\end{document}
`,
      },
    ],
  },

  /* ─── 4. Study Summary (beginner) ───────────────────────── */
  {
    id: "study-summary",
    title: "Study Summary",
    description:
      "A clean study summary template with organized sections, key terms, and important points.",
    category: "notes",
    difficulty: "beginner",
    icon: "BookCheck",
    tags: ["study", "summary", "review", "exam prep"],
    previewDescription:
      "Structured study notes with bold key terms, organized sections, and review questions.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[11pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\geometry{a4paper, margin=2cm}

\\title{Study Summary: Endocrine System}
\\author{Your Name}
\\date{Exam Date: Month Day, Year}

\\begin{document}
\\maketitle

\\section{Thyroid Gland}

\\subsection{Key Hormones}
\\begin{description}[style=nextline]
  \\item[T3 (Triiodothyronine)] The active form. More potent than T4. Mostly converted from T4 in peripheral tissues.
  \\item[T4 (Thyroxine)] The major secretory product. Converted to T3 by deiodinase enzymes. Longer half-life.
  \\item[Calcitonin] Produced by parafollicular C cells. Lowers blood calcium (opposes PTH).
\\end{description}

\\subsection{Regulation}
The hypothalamic-pituitary-thyroid axis:

\\begin{enumerate}
  \\item Hypothalamus releases \\textbf{TRH}
  \\item TRH stimulates anterior pituitary to release \\textbf{TSH}
  \\item TSH stimulates thyroid to produce \\textbf{T3/T4}
  \\item T3/T4 provide \\textbf{negative feedback} to hypothalamus and pituitary
\\end{enumerate}

\\subsection{Clinical Correlations}

\\textbf{Hyperthyroidism (Graves' Disease):}
\\begin{itemize}
  \\item TSH receptor antibodies (stimulating)
  \\item Weight loss, tachycardia, heat intolerance, tremor
  \\item Exophthalmos (eye bulging)
  \\item Treatment: methimazole, propylthiouracil, radioactive iodine
\\end{itemize}

\\textbf{Hypothyroidism (Hashimoto's):}
\\begin{itemize}
  \\item Anti-TPO antibodies (autoimmune destruction)
  \\item Weight gain, fatigue, cold intolerance, constipation
  \\item Treatment: levothyroxine (synthetic T4)
\\end{itemize}

\\section{Review Questions}
\\begin{enumerate}
  \\item Which is more active: T3 or T4?
  \\item What enzyme converts T4 to T3?
  \\item A patient presents with weight loss, palpitations, and bulging eyes. What is the most likely diagnosis?
  \\item How does negative feedback regulate thyroid hormone levels?
\\end{enumerate}

\\end{document}
`,
      },
    ],
  },

  /* ─── 5. University Essay (intermediate) ────────────────── */
  {
    id: "university-essay",
    title: "University Essay",
    description:
      "A properly formatted academic essay with title page, abstract, sections, and bibliography.",
    category: "essay",
    difficulty: "intermediate",
    icon: "PenTool",
    tags: ["essay", "academic", "university", "citations"],
    previewDescription:
      "Includes title page, abstract, structured sections, and a bibliography section.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[12pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{setspace}
\\usepackage{hyperref}

% Standard margins
\\geometry{a4paper, margin=2.5cm}
\\onehalfspacing

\\title{The Impact of Artificial Intelligence on Medical Diagnosis:\\\\
A Critical Analysis}
\\author{Your Name\\\\
\\small Student ID: 12345678\\\\
\\small Course: Medical Ethics 301\\\\
\\small Instructor: Dr. Smith}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This essay examines the growing role of artificial intelligence (AI) in medical diagnosis, analyzing both its potential benefits and ethical challenges. Through a review of current applications in radiology, pathology, and dermatology, we argue that while AI can significantly improve diagnostic accuracy, its implementation requires careful consideration of bias, transparency, and the patient-physician relationship. The essay concludes with recommendations for responsible AI integration in clinical practice.
\\end{abstract}

\\newpage
\\tableofcontents
\\newpage

\\section{Introduction}
The integration of artificial intelligence into healthcare represents one of the most significant transformations in modern medicine. As machine learning algorithms become increasingly sophisticated, their potential to assist in medical diagnosis has grown substantially.

This essay explores three key questions:
\\begin{enumerate}
  \\item How is AI currently being used in medical diagnosis?
  \\item What are the benefits and limitations of AI-assisted diagnosis?
  \\item What ethical considerations must guide its implementation?
\\end{enumerate}

\\section{Current Applications of AI in Diagnosis}

\\subsection{Radiology}
AI algorithms have shown remarkable accuracy in interpreting medical images. Deep learning models can detect pulmonary nodules on chest X-rays with sensitivity comparable to experienced radiologists.

\\subsection{Pathology}
Digital pathology combined with AI can identify cancerous cells in tissue samples, potentially reducing the workload on pathologists and improving consistency in diagnosis.

\\subsection{Dermatology}
Convolutional neural networks have been trained to classify skin lesions, achieving performance on par with board-certified dermatologists in distinguishing malignant from benign lesions.

\\section{Benefits and Limitations}

\\subsection{Benefits}
\\begin{itemize}
  \\item \\textbf{Speed:} AI can analyze images in seconds
  \\item \\textbf{Consistency:} Algorithms don't suffer from fatigue
  \\item \\textbf{Access:} Can bring specialist-level diagnosis to underserved areas
  \\item \\textbf{Pattern recognition:} May detect subtle patterns humans miss
\\end{itemize}

\\subsection{Limitations}
\\begin{itemize}
  \\item \\textbf{Data bias:} Training data may not represent all populations
  \\item \\textbf{Black box problem:} Difficulty explaining AI decisions
  \\item \\textbf{Liability:} Unclear legal responsibility for AI errors
  \\item \\textbf{Over-reliance:} Risk of deskilling human practitioners
\\end{itemize}

\\section{Ethical Considerations}
The deployment of AI in clinical settings raises important ethical questions about patient autonomy, informed consent, data privacy, and the fundamental nature of the doctor-patient relationship.

\\section{Conclusion}
AI has tremendous potential to improve medical diagnosis, but it must be implemented thoughtfully. We recommend a framework that emphasizes transparency, ongoing validation, and the preservation of clinical judgment alongside AI assistance.

\\section*{References}
\\begin{enumerate}
  \\item Topol, E.J. (2019). High-performance medicine: the convergence of human and artificial intelligence. \\textit{Nature Medicine}, 25(1), 44--56.
  \\item Esteva, A., et al. (2017). Dermatologist-level classification of skin cancer with deep neural networks. \\textit{Nature}, 542(7639), 115--118.
  \\item Rajpurkar, P., et al. (2017). CheXNet: Radiologist-level pneumonia detection on chest X-rays. \\textit{arXiv preprint arXiv:1711.05225}.
\\end{enumerate}

\\end{document}
`,
      },
    ],
  },

  /* ─── 6. Lab Report (intermediate) ──────────────────────── */
  {
    id: "lab-report",
    title: "Lab Report",
    description:
      "A structured lab report following the IMRAD format. Includes methods, results tables, and discussion.",
    category: "essay",
    difficulty: "intermediate",
    icon: "FlaskConical",
    tags: ["lab", "report", "IMRAD", "experiment", "science"],
    previewDescription:
      "Standard scientific lab report with Introduction, Methods, Results, and Discussion sections.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[12pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{booktabs}

\\geometry{a4paper, margin=2.5cm}

\\title{Determination of Blood Glucose Levels:\\\\
A Comparative Analysis of Two Measurement Methods}
\\author{Your Name\\\\
\\small Lab Partner: Partner Name\\\\
\\small Biochemistry Laboratory — Section B}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
This experiment compared the accuracy of a portable glucometer with the laboratory enzymatic (hexokinase) method for measuring blood glucose levels. Ten fasting blood samples were analyzed using both methods. Results showed a strong correlation ($r = 0.97$, $p < 0.001$) between the two methods, with the glucometer showing a mean bias of $+5.2$ mg/dL compared to the reference method.
\\end{abstract}

\\section{Introduction}
Accurate measurement of blood glucose is essential for the diagnosis and management of diabetes mellitus. While laboratory enzymatic methods remain the gold standard, point-of-care glucometers are widely used due to their convenience and rapid results.

The objective of this experiment was to compare the accuracy of a portable glucometer against the laboratory hexokinase method.

\\section{Materials and Methods}

\\subsection{Sample Collection}
Ten fasting venous blood samples were obtained from volunteer subjects following informed consent. Each sample was divided into two aliquots.

\\subsection{Measurement Methods}
\\begin{enumerate}
  \\item \\textbf{Glucometer:} Accu-Chek Active (Roche), calibrated according to manufacturer instructions
  \\item \\textbf{Laboratory method:} Hexokinase enzymatic assay on Cobas c 501 analyzer
\\end{enumerate}

\\subsection{Statistical Analysis}
Data were analyzed using paired t-test and Pearson correlation. Bland-Altman analysis was performed to assess agreement between methods.

\\section{Results}

\\begin{table}[h]
\\centering
\\caption{Blood Glucose Measurements (mg/dL)}
\\label{tab:results}
\\begin{tabular}{@{}lccc@{}}
\\toprule
\\textbf{Sample} & \\textbf{Glucometer} & \\textbf{Lab Method} & \\textbf{Difference} \\\\
\\midrule
1  & 98  & 92  & +6  \\\\
2  & 112 & 108 & +4  \\\\
3  & 85  & 81  & +4  \\\\
4  & 145 & 138 & +7  \\\\
5  & 76  & 72  & +4  \\\\
6  & 203 & 195 & +8  \\\\
7  & 91  & 87  & +4  \\\\
8  & 167 & 160 & +7  \\\\
9  & 88  & 83  & +5  \\\\
10 & 134 & 131 & +3  \\\\
\\midrule
\\textbf{Mean} & \\textbf{119.9} & \\textbf{114.7} & \\textbf{+5.2} \\\\
\\bottomrule
\\end{tabular}
\\end{table}

The correlation coefficient between the two methods was $r = 0.97$ ($p < 0.001$). The mean bias was $+5.2 \\pm 1.7$ mg/dL.

\\section{Discussion}
The results demonstrate that the portable glucometer provides readings that are consistently higher than the laboratory reference method, with a mean positive bias of 5.2 mg/dL. This is within the acceptable range specified by ISO 15197 standards for self-monitoring blood glucose devices.

\\subsection{Limitations}
\\begin{itemize}
  \\item Small sample size ($n = 10$)
  \\item All samples were from fasting subjects
  \\item Single glucometer model tested
\\end{itemize}

\\section{Conclusion}
The portable glucometer showed excellent correlation with the laboratory method and can be reliably used for routine blood glucose monitoring, with the understanding that readings may be slightly higher than laboratory values.

\\end{document}
`,
      },
    ],
  },

  /* ─── 7. Case Study (intermediate) ──────────────────────── */
  {
    id: "case-study",
    title: "Clinical Case Study",
    description:
      "A patient case study template following clinical presentation format with SOAP notes structure.",
    category: "essay",
    difficulty: "intermediate",
    icon: "Stethoscope",
    tags: ["clinical", "case study", "SOAP", "patient", "medical"],
    previewDescription:
      "Structured clinical case with patient presentation, differential diagnosis, and management plan.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[12pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\geometry{a4paper, margin=2.5cm}

\\title{Clinical Case Study:\\\\
Acute Chest Pain in a 55-Year-Old Male}
\\author{Your Name\\\\
\\small Internal Medicine Clerkship — Year 3}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Patient Information}
\\begin{description}[style=nextline, leftmargin=3cm]
  \\item[Age/Sex] 55-year-old male
  \\item[Chief Complaint] "Crushing chest pain for 2 hours"
  \\item[Setting] Emergency Department
\\end{description}

\\section{History of Present Illness}
Mr. X is a 55-year-old male who presents to the ED with severe substernal chest pain that started 2 hours ago while climbing stairs. The pain is described as "crushing" and "pressure-like," radiating to the left arm and jaw. Associated symptoms include diaphoresis, nausea, and shortness of breath. The pain is rated 8/10 and is not relieved by rest.

\\subsection{Past Medical History}
\\begin{itemize}
  \\item Hypertension (diagnosed 10 years ago)
  \\item Type 2 Diabetes Mellitus (diagnosed 5 years ago)
  \\item Hyperlipidemia
\\end{itemize}

\\subsection{Medications}
\\begin{itemize}
  \\item Metformin 1000 mg BID
  \\item Lisinopril 20 mg daily
  \\item Atorvastatin 40 mg daily
\\end{itemize}

\\subsection{Social History}
\\begin{itemize}
  \\item Smoking: 1 pack/day for 30 years (30 pack-years)
  \\item Alcohol: Social (2--3 drinks/week)
  \\item Family history: Father had MI at age 52
\\end{itemize}

\\section{Physical Examination}
\\begin{description}[style=nextline, leftmargin=3cm]
  \\item[Vitals] BP 160/95, HR 105, RR 22, SpO2 94\\%, Temp 37.1°C
  \\item[General] Anxious, diaphoretic, in acute distress
  \\item[Cardiovascular] Tachycardic, regular rhythm, S4 gallop, no murmurs
  \\item[Respiratory] Bilateral basal crackles
  \\item[Abdomen] Soft, non-tender
  \\item[Extremities] No edema, peripheral pulses intact
\\end{description}

\\section{Differential Diagnosis}
\\begin{enumerate}
  \\item \\textbf{Acute ST-elevation myocardial infarction (STEMI)} — most likely
  \\item Unstable angina / NSTEMI
  \\item Aortic dissection
  \\item Pulmonary embolism
  \\item Tension pneumothorax
\\end{enumerate}

\\section{Investigations}
\\begin{itemize}
  \\item \\textbf{ECG:} ST elevation in leads II, III, aVF (inferior STEMI)
  \\item \\textbf{Troponin I:} 2.5 ng/mL (elevated, normal $<$ 0.04)
  \\item \\textbf{CXR:} Mild pulmonary congestion
  \\item \\textbf{CBC:} WBC 11.2, Hb 14.5, Plt 245
  \\item \\textbf{BMP:} Glucose 185, Creatinine 1.1, K 4.2
\\end{itemize}

\\section{Assessment and Plan}
\\textbf{Diagnosis:} Acute inferior STEMI

\\textbf{Immediate Management:}
\\begin{enumerate}
  \\item Aspirin 325 mg chewed
  \\item Nitroglycerin sublingual
  \\item Morphine for pain control
  \\item Heparin infusion
  \\item Activate cardiac catheterization lab for primary PCI
\\end{enumerate}

\\section{Discussion}
This case illustrates a classic presentation of acute myocardial infarction with multiple risk factors including age, smoking, diabetes, hypertension, hyperlipidemia, and positive family history.

\\section{Learning Points}
\\begin{itemize}
  \\item Classic MI symptoms: crushing chest pain, radiation, diaphoresis
  \\item Time is muscle — door-to-balloon time $<$ 90 minutes
  \\item Inferior STEMI affects RCA territory (leads II, III, aVF)
  \\item Always consider and rule out aortic dissection before thrombolytics
\\end{itemize}

\\end{document}
`,
      },
    ],
  },

  /* ─── 8. Research Article (advanced) ────────────────────── */
  {
    id: "research-article",
    title: "Research Article",
    description:
      "A full scientific research paper following IMRAD structure with abstract, figures, tables, and references.",
    category: "research",
    difficulty: "advanced",
    icon: "Microscope",
    tags: ["research", "paper", "IMRAD", "scientific", "publication"],
    previewDescription:
      "Publication-ready article with structured abstract, methodology, results, and bibliography.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[12pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{booktabs}

\\geometry{a4paper, margin=2.5cm}

\\title{Efficacy of Telemedicine Follow-up in Post-Surgical\\\\
Wound Management: A Prospective Cohort Study}

\\author{
  First Author$^{1}$, Second Author$^{2}$, Third Author$^{1,3}$\\\\[8pt]
  \\small $^{1}$Department of Surgery, University Hospital\\\\
  \\small $^{2}$Department of Public Health, Medical University\\\\
  \\small $^{3}$Institute of Digital Health
}

\\date{}

\\begin{document}
\\maketitle

\\begin{abstract}
\\textbf{Background:} Post-surgical wound complications remain a significant cause of hospital readmission. Telemedicine may offer an effective alternative to in-person follow-up for wound assessment.

\\textbf{Objective:} To compare the efficacy of telemedicine-based wound follow-up with standard in-person visits in detecting post-surgical wound complications.

\\textbf{Methods:} A prospective cohort study was conducted at a tertiary care center from January to December 2025. Patients undergoing elective abdominal surgery were assigned to either telemedicine ($n = 85$) or in-person follow-up ($n = 92$). Primary outcome was wound complication detection rate at 30 days.

\\textbf{Results:} Wound complication rates were comparable between groups (telemedicine: 12.9\\% vs. in-person: 13.0\\%; $p = 0.98$). Patient satisfaction was significantly higher in the telemedicine group ($4.3 \\pm 0.6$ vs. $3.7 \\pm 0.8$; $p < 0.01$). Travel time savings averaged 2.3 hours per visit.

\\textbf{Conclusion:} Telemedicine follow-up is non-inferior to in-person visits for post-surgical wound assessment and is associated with higher patient satisfaction and reduced travel burden.

\\textbf{Keywords:} telemedicine, wound management, post-surgical care, follow-up, patient satisfaction
\\end{abstract}

\\section{Introduction}
Surgical site infections (SSIs) and wound complications affect approximately 2--5\\% of patients undergoing surgical procedures and represent a major source of morbidity, prolonged hospitalization, and increased healthcare costs.

Traditional post-operative wound assessment requires in-person clinic visits, which may pose challenges for patients in rural or underserved areas. The COVID-19 pandemic accelerated the adoption of telemedicine, raising the question of whether virtual wound assessment can effectively replace or supplement in-person evaluation.

The objective of this study was to evaluate the non-inferiority of telemedicine-based wound follow-up compared to standard in-person follow-up in detecting post-surgical wound complications.

\\section{Materials and Methods}

\\subsection{Study Design}
This was a prospective, non-randomized cohort study conducted at a tertiary care university hospital between January and December 2025.

\\subsection{Participants}
Inclusion criteria:
\\begin{itemize}
  \\item Adults ($\\geq 18$ years) undergoing elective abdominal surgery
  \\item Access to a smartphone with camera capability
  \\item Informed consent obtained
\\end{itemize}

Exclusion criteria:
\\begin{itemize}
  \\item Emergency surgery
  \\item Known immunocompromised state
  \\item Inability to use telemedicine technology
\\end{itemize}

\\subsection{Outcomes}
The primary outcome was wound complication rate at 30 days post-surgery, including SSI, dehiscence, seroma, and hematoma.

\\subsection{Statistical Analysis}
Continuous variables were compared using Student's t-test and categorical variables using chi-square test. A $p$-value $< 0.05$ was considered statistically significant.

\\section{Results}

\\subsection{Patient Characteristics}

\\begin{table}[h]
\\centering
\\caption{Baseline Patient Characteristics}
\\label{tab:baseline}
\\begin{tabular}{@{}lccc@{}}
\\toprule
\\textbf{Variable} & \\textbf{Telemedicine ($n=85$)} & \\textbf{In-person ($n=92$)} & \\textbf{$p$-value} \\\\
\\midrule
Age (years)        & $54.2 \\pm 12.1$ & $55.8 \\pm 11.4$ & 0.38 \\\\
Female (\\%)        & 48.2\\%          & 51.1\\%          & 0.71 \\\\
BMI (kg/m$^2$)     & $27.3 \\pm 4.2$  & $26.9 \\pm 4.5$  & 0.55 \\\\
Diabetes (\\%)      & 18.8\\%          & 20.7\\%          & 0.76 \\\\
ASA score (mean)   & $2.1 \\pm 0.6$   & $2.2 \\pm 0.5$   & 0.24 \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\subsection{Primary Outcome}
Wound complications at 30 days were observed in 11 patients (12.9\\%) in the telemedicine group and 12 patients (13.0\\%) in the in-person group ($p = 0.98$).

\\subsection{Secondary Outcomes}
Patient satisfaction scores were significantly higher in the telemedicine group ($4.3 \\pm 0.6$ vs. $3.7 \\pm 0.8$; $p < 0.01$).

\\section{Discussion}
Our findings demonstrate that telemedicine-based wound follow-up is non-inferior to traditional in-person assessment for detecting post-surgical complications. The comparable complication detection rates between groups suggest that photographic wound assessment via telemedicine provides sufficient clinical information for routine post-operative monitoring.

\\subsection{Limitations}
\\begin{enumerate}
  \\item Non-randomized design introduces potential selection bias
  \\item Single-center study limits generalizability
  \\item Patients who opted for telemedicine may be inherently different
\\end{enumerate}

\\section{Conclusion}
Telemedicine follow-up is a viable and effective alternative to in-person wound assessment after elective abdominal surgery, with comparable complication detection rates and superior patient satisfaction.

\\section*{References}
\\begin{enumerate}
  \\item Anderson, D.J., et al. (2014). Strategies to prevent surgical site infections. \\textit{Infection Control \\& Hospital Epidemiology}, 35(6), 605--627.
  \\item Smith, A.C., et al. (2020). Telehealth for global emergencies. \\textit{Journal of Telemedicine and Telecare}, 26(5), 309--313.
\\end{enumerate}

\\end{document}
`,
      },
    ],
  },

  /* ─── 9. Literature Review (advanced) ───────────────────── */
  {
    id: "literature-review",
    title: "Literature Review",
    description:
      "A structured literature review with proper citation format, thematic organization, and critical analysis.",
    category: "research",
    difficulty: "advanced",
    icon: "Library",
    tags: ["review", "literature", "citations", "research"],
    previewDescription:
      "Organized by themes with critical analysis, synthesis, and proper academic citation format.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[12pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{setspace}
\\usepackage{hyperref}

\\geometry{a4paper, margin=2.5cm}
\\onehalfspacing

\\title{The Role of Gut Microbiome in Autoimmune Disease:\\\\
A Literature Review}
\\author{Your Name\\\\
\\small Department of Immunology\\\\
\\small Medical University}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
This literature review examines the current evidence linking gut microbiome composition to the development and progression of autoimmune diseases. Drawing from studies published between 2015 and 2025, we analyze the mechanisms by which dysbiosis may trigger autoimmunity, review disease-specific microbiome alterations, and discuss therapeutic implications including probiotics and fecal microbiota transplantation. The evidence suggests a strong bidirectional relationship between gut microbiota and immune regulation, with potential for microbiome-based interventions.
\\end{abstract}

\\tableofcontents
\\newpage

\\section{Introduction}
The human gut harbors approximately $10^{13}$ to $10^{14}$ microorganisms, collectively known as the gut microbiome. Over the past decade, research has increasingly demonstrated the critical role of these organisms in immune system development, regulation, and homeostasis.

Autoimmune diseases, in which the immune system attacks self-tissues, affect approximately 5--8\\% of the global population. The rising incidence of autoimmune conditions in industrialized nations has prompted investigation into environmental factors, including alterations in gut microbiota.

\\subsection{Objectives}
This review aims to:
\\begin{enumerate}
  \\item Summarize current evidence on gut microbiome-autoimmunity relationships
  \\item Identify common patterns of dysbiosis across autoimmune conditions
  \\item Evaluate potential therapeutic interventions targeting the microbiome
\\end{enumerate}

\\section{Methods}
A systematic search of PubMed, Scopus, and Web of Science databases was conducted using the terms "gut microbiome," "autoimmune disease," "dysbiosis," and specific disease names. Studies published between 2015 and 2025 in English were included.

\\section{Mechanisms of Microbiome-Immune Interaction}

\\subsection{Intestinal Barrier Function}
The gut epithelium serves as a critical barrier between the microbiome and the systemic immune system. Disruption of this barrier—termed "leaky gut"—may allow microbial products to enter the circulation and trigger immune responses.

\\subsection{Molecular Mimicry}
Certain microbial antigens share structural similarity with host proteins, potentially leading to cross-reactive immune responses against self-tissues.

\\subsection{T-cell Regulation}
The gut microbiome plays a crucial role in the differentiation of regulatory T cells (Tregs) and the balance between Th17 and Treg populations.

\\section{Disease-Specific Findings}

\\subsection{Rheumatoid Arthritis}
Multiple studies have identified increased abundance of \\textit{Prevotella copri} in early rheumatoid arthritis patients. This enrichment correlates with disease activity and may precede symptom onset.

\\subsection{Type 1 Diabetes}
Children who develop T1D show decreased microbial diversity and reduced \\textit{Bacteroides} species compared to healthy controls. Changes are detectable before clinical diagnosis.

\\subsection{Multiple Sclerosis}
MS patients demonstrate reduced \\textit{Butyricimonas} and increased \\textit{Methanobrevibacter} species. Butyrate-producing bacteria are particularly depleted.

\\section{Therapeutic Implications}

\\subsection{Probiotics}
Several clinical trials have explored probiotic supplementation in autoimmune conditions with mixed results. The specificity of probiotic strains appears critical.

\\subsection{Fecal Microbiota Transplantation}
FMT has shown promise in restoring microbial diversity, though evidence in autoimmune diseases remains preliminary.

\\subsection{Diet}
Mediterranean and plant-based diets are associated with increased microbial diversity and may have protective effects.

\\section{Discussion}
The evidence reviewed supports a significant role for the gut microbiome in autoimmune disease pathogenesis. However, several limitations must be acknowledged: most studies are cross-sectional, sample sizes are often small, and causality is difficult to establish.

\\section{Conclusion}
The gut microbiome represents a promising target for both understanding and treating autoimmune diseases. Future research should focus on large-scale longitudinal studies and personalized microbiome-based interventions.

\\section*{References}
\\begin{enumerate}
  \\item Belkaid, Y., Hand, T.W. (2014). Role of the microbiota in immunity and inflammation. \\textit{Cell}, 157(1), 121--141.
  \\item Scher, J.U., et al. (2013). Expansion of intestinal \\textit{Prevotella copri} correlates with enhanced susceptibility to arthritis. \\textit{eLife}, 2, e01202.
  \\item Kostic, A.D., et al. (2015). The dynamics of the human infant gut microbiome in development and in progression toward type 1 diabetes. \\textit{Cell Host \\& Microbe}, 17(2), 260--273.
\\end{enumerate}

\\end{document}
`,
      },
    ],
  },

  /* ─── 10. Thesis Chapter (advanced) ─────────────────────── */
  {
    id: "thesis-chapter",
    title: "Thesis Chapter",
    description:
      "A thesis/dissertation chapter template with proper academic structure, cross-references, and appendices.",
    category: "thesis",
    difficulty: "advanced",
    icon: "GraduationCap",
    tags: ["thesis", "dissertation", "chapter", "academic"],
    previewDescription:
      "Full thesis chapter with list of figures/tables, cross-references, and appendices.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[12pt]{report}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{setspace}
\\usepackage{hyperref}
\\usepackage{booktabs}

\\geometry{a4paper, left=3.5cm, right=2.5cm, top=2.5cm, bottom=2.5cm}
\\onehalfspacing

\\begin{document}

% ── Title Page ──
\\begin{titlepage}
\\centering
\\vspace*{2cm}

{\\Large\\textbf{UNIVERSITY NAME}}\\\\[0.5cm]
{\\large Faculty of Medicine}\\\\[2cm]

{\\LARGE\\textbf{The Effect of Exercise Intensity on\\\\
Cardiac Biomarkers in Young Athletes}}\\\\[2cm]

{\\large\\textbf{A Thesis Submitted in Partial Fulfillment\\\\
of the Requirements for the Degree of\\\\
Doctor of Medicine (M.D.)}}\\\\[2cm]

{\\large
  \\textbf{Author:} Your Full Name\\\\[0.3cm]
  \\textbf{Supervisor:} Prof. Dr. Supervisor Name\\\\[0.3cm]
  \\textbf{Co-supervisor:} Dr. Co-Supervisor Name\\\\[2cm]
  City, Country\\\\
  2026
}

\\end{titlepage}

% ── Front Matter ──
\\pagenumbering{roman}

\\chapter*{Acknowledgments}
I would like to express my sincere gratitude to my supervisor, Prof. Dr. Supervisor Name, for their invaluable guidance and support throughout this research project.

\\tableofcontents
\\listoftables

\\newpage
\\pagenumbering{arabic}

% ── Chapter 1: Introduction ──
\\chapter{Introduction}

\\section{Background}
Cardiovascular disease remains the leading cause of mortality worldwide. Regular physical exercise is well established as a protective factor against cardiovascular disease. However, the acute effects of high-intensity exercise on cardiac biomarkers in young athletes remain incompletely understood.

\\section{Problem Statement}
While exercise is generally beneficial, extreme exertion can transiently elevate cardiac biomarkers such as troponin and BNP, mimicking patterns seen in cardiac injury. Understanding the physiological basis of these changes is essential for proper clinical interpretation.

\\section{Objectives}
\\subsection{General Objective}
To evaluate the effect of exercise intensity on cardiac biomarker levels in healthy young athletes.

\\subsection{Specific Objectives}
\\begin{enumerate}
  \\item To measure baseline cardiac troponin I and NT-proBNP levels in young athletes
  \\item To compare biomarker levels after moderate vs. high-intensity exercise
  \\item To determine the time course of biomarker normalization
  \\item To identify factors associated with greater biomarker elevation
\\end{enumerate}

\\section{Hypotheses}
\\begin{enumerate}
  \\item $H_0$: There is no significant difference in cardiac biomarker elevation between moderate and high-intensity exercise groups.
  \\item $H_1$: High-intensity exercise produces significantly greater cardiac biomarker elevation than moderate-intensity exercise.
\\end{enumerate}

% ── Chapter 2: Literature Review ──
\\chapter{Literature Review}

\\section{Cardiac Biomarkers}
Cardiac troponins (cTnI and cTnT) are the gold standard biomarkers for myocardial injury. B-type natriuretic peptide (BNP) and its N-terminal fragment (NT-proBNP) reflect myocardial wall stress.

\\section{Exercise-Induced Cardiac Biomarker Release}
Multiple studies have documented transient elevation of cardiac biomarkers following prolonged or intense exercise. A meta-analysis of 1,120 athletes found that exercise-induced troponin elevation occurred in approximately 47\\% of participants.

\\section{Clinical Significance}
The key clinical question is whether exercise-induced biomarker elevation represents reversible physiological strain or subclinical myocardial damage. Current evidence favors a benign mechanism involving increased membrane permeability rather than myocyte necrosis.

% ── Chapter 3: Methods ──
\\chapter{Materials and Methods}

\\section{Study Design}
A prospective, controlled, crossover study design was employed. Each participant underwent both moderate-intensity and high-intensity exercise protocols with a two-week washout period.

\\section{Study Population}
\\begin{itemize}
  \\item 60 healthy young athletes aged 18--25 years
  \\item Recruited from university sports teams
  \\item Written informed consent obtained
  \\item Ethics approval: University Ethics Committee (Protocol \\#2025-0142)
\\end{itemize}

\\section{Data Analysis}
Statistical analysis was performed using SPSS version 28.0. Results are presented as mean $\\pm$ standard deviation. Paired t-tests were used for within-group comparisons. A $p$-value $< 0.05$ was considered statistically significant.

% ── Appendices ──
\\appendix
\\chapter{Data Collection Form}
[Data collection forms would be included here]

\\chapter{Ethics Approval Letter}
[Ethics committee approval letter would be included here]

\\chapter{Informed Consent Form}
[Patient information sheet and consent form would be included here]

\\end{document}
`,
      },
    ],
  },

  /* ─── 11. Beamer Presentation (intermediate) ────────────── */
  {
    id: "beamer-presentation",
    title: "Beamer Presentation",
    description:
      "Create presentation slides using LaTeX Beamer. Perfect for journal clubs, case presentations, and lectures.",
    category: "presentation",
    difficulty: "intermediate",
    icon: "Presentation",
    tags: ["presentation", "slides", "beamer", "lecture"],
    previewDescription:
      "Slide-based presentation with frames, columns, and formatted content blocks.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass{beamer}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{booktabs}

% Theme
\\usetheme{Madrid}
\\usecolortheme{default}

% Title info
\\title{Antibiotic Resistance: A Growing Crisis}
\\subtitle{Journal Club Presentation}
\\author{Your Name}
\\institute{Department of Microbiology}
\\date{\\today}

\\begin{document}

% ── Title Slide ──
\\begin{frame}
  \\titlepage
\\end{frame}

% ── Outline ──
\\begin{frame}{Outline}
  \\tableofcontents
\\end{frame}

% ── Section 1 ──
\\section{Introduction}

\\begin{frame}{What is Antibiotic Resistance?}
  \\begin{itemize}
    \\item Bacteria evolve to survive antibiotic exposure
    \\item Natural process accelerated by human activities
    \\item WHO: "One of the biggest threats to global health"
  \\end{itemize}

  \\vspace{0.5cm}
  \\textbf{Key Statistics:}
  \\begin{itemize}
    \\item 1.27 million deaths attributed to AMR in 2019
    \\item Projected 10 million annual deaths by 2050
  \\end{itemize}
\\end{frame}

% ── Section 2 ──
\\section{Mechanisms}

\\begin{frame}{Mechanisms of Resistance}
  \\begin{columns}
    \\begin{column}{0.5\\textwidth}
      \\textbf{Intrinsic:}
      \\begin{itemize}
        \\item Efflux pumps
        \\item Enzyme degradation
        \\item Target modification
      \\end{itemize}
    \\end{column}
    \\begin{column}{0.5\\textwidth}
      \\textbf{Acquired:}
      \\begin{itemize}
        \\item Horizontal gene transfer
        \\item Plasmid-mediated
        \\item Transposon-mediated
      \\end{itemize}
    \\end{column}
  \\end{columns}
\\end{frame}

% ── Section 3 ──
\\section{Clinical Impact}

\\begin{frame}{ESKAPE Pathogens}
  \\begin{table}
    \\centering
    \\small
    \\begin{tabular}{@{}ll@{}}
      \\toprule
      \\textbf{Pathogen} & \\textbf{Key Resistance} \\\\
      \\midrule
      \\textit{E. faecium} & Vancomycin-resistant (VRE) \\\\
      \\textit{S. aureus} & Methicillin-resistant (MRSA) \\\\
      \\textit{K. pneumoniae} & Carbapenem-resistant \\\\
      \\textit{A. baumannii} & Multi-drug resistant \\\\
      \\textit{P. aeruginosa} & Carbapenem-resistant \\\\
      \\textit{Enterobacter} spp. & ESBL-producing \\\\
      \\bottomrule
    \\end{tabular}
  \\end{table}
\\end{frame}

% ── Section 4 ──
\\section{Solutions}

\\begin{frame}{Strategies to Combat AMR}
  \\begin{enumerate}
    \\item \\textbf{Antibiotic Stewardship}
    \\begin{itemize}
      \\item Narrow-spectrum when possible
      \\item Appropriate duration
      \\item De-escalation based on cultures
    \\end{itemize}
    \\item \\textbf{Infection Prevention}
    \\begin{itemize}
      \\item Hand hygiene
      \\item Isolation protocols
      \\item Vaccination
    \\end{itemize}
    \\item \\textbf{New Approaches}
    \\begin{itemize}
      \\item Bacteriophage therapy
      \\item Antimicrobial peptides
      \\item CRISPR-based strategies
    \\end{itemize}
  \\end{enumerate}
\\end{frame}

% ── Conclusion ──
\\section{Conclusion}

\\begin{frame}{Take-Home Messages}
  \\begin{block}{Key Points}
    \\begin{enumerate}
      \\item AMR is a global health emergency
      \\item Every clinician plays a role in antibiotic stewardship
      \\item Prevention is more effective than treatment
      \\item New therapeutic strategies are urgently needed
    \\end{enumerate}
  \\end{block}

  \\vspace{0.5cm}
  \\centering
  \\textbf{Thank you! Questions?}
\\end{frame}

\\end{document}
`,
      },
    ],
  },

  /* ─── 12. Academic CV (intermediate) ────────────────────── */
  {
    id: "academic-cv",
    title: "Academic CV",
    description:
      "A clean academic curriculum vitae template for medical students and researchers.",
    category: "cv",
    difficulty: "intermediate",
    icon: "User",
    tags: ["cv", "resume", "academic", "career"],
    previewDescription:
      "Professional CV layout with education, publications, research experience, and skills.",
    files: [
      {
        name: "main.tex",
        isMain: true,
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\geometry{margin=2cm}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

% Custom section formatting
\\newcommand{\\cvsection}[1]{%
  \\vspace{0.6cm}
  {\\large\\textbf{\\uppercase{#1}}}\\\\[-0.3cm]
  \\rule{\\textwidth}{1.5pt}\\\\[0.2cm]
}

\\newcommand{\\cventry}[4]{%
  \\textbf{#1} \\hfill \\textit{#2}\\\\
  \\textit{#3}\\\\
  #4\\\\[0.3cm]
}

\\begin{document}

% ── Header ──
\\begin{center}
  {\\LARGE\\textbf{YOUR FULL NAME, M.D. Candidate}}\\\\[0.3cm]
  {\\small
    123 Medical Street, City, Country $\\vert$
    +1 (555) 123-4567 $\\vert$
    \\href{mailto:your.email@university.edu}{your.email@university.edu}\\\\
    \\href{https://orcid.org/0000-0000-0000-0000}{ORCID: 0000-0000-0000-0000} $\\vert$
    \\href{https://linkedin.com/in/yourprofile}{LinkedIn}
  }
\\end{center}

\\cvsection{Education}

\\cventry{Doctor of Medicine (M.D.)}{Expected 2027}
{University of Medicine, City, Country}
{GPA: 9.2/10.0. Relevant coursework: Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Clinical Medicine.}

\\cventry{Bachelor of Science in Biology}{2019 -- 2022}
{University Name, City, Country}
{Graduated with Honors. Thesis: "Effects of exercise on cardiovascular biomarkers."}

\\cvsection{Research Experience}

\\cventry{Research Assistant}{Jan 2025 -- Present}
{Department of Cardiology, University Hospital}
{Investigating the role of cardiac MRI in early detection of myocarditis. Responsibilities include patient recruitment, data collection, and statistical analysis using SPSS.}

\\cventry{Summer Research Fellow}{Jun -- Aug 2024}
{Institute of Molecular Medicine}
{Studied inflammatory pathways in atherosclerosis using cell culture and ELISA assays. Presented findings at the National Student Research Conference.}

\\cvsection{Publications}

\\begin{enumerate}[leftmargin=*, label={[\\arabic*]}]
  \\item \\textbf{Your Name}, Co-Author A, Co-Author B. "Title of Your Published Paper." \\textit{Journal Name}, 2025; 12(3): 45--52.
  \\item Co-Author A, \\textbf{Your Name}, Co-Author C. "Title of Another Paper." \\textit{Another Journal}, 2024; 8(1): 112--118.
\\end{enumerate}

\\cvsection{Clinical Experience}

\\cventry{Clinical Clerkship — Internal Medicine}{Sep -- Dec 2025}
{University Hospital, Department of Internal Medicine}
{Rotated through cardiology, pulmonology, and gastroenterology. Participated in daily rounds, patient history taking, and case presentations.}

\\cventry{Clinical Clerkship — Surgery}{Jan -- Apr 2025}
{University Hospital, Department of General Surgery}
{Assisted in 15+ surgical procedures including appendectomies and cholecystectomies. Managed pre-operative assessments and post-operative wound care.}

\\cvsection{Awards and Honors}
\\begin{itemize}[leftmargin=*]
  \\item Dean's List, All Semesters (2023--2026)
  \\item Best Poster Award, National Medical Student Conference (2025)
  \\item University Merit Scholarship (2022--2026)
\\end{itemize}

\\cvsection{Skills}
\\begin{itemize}[leftmargin=*]
  \\item \\textbf{Languages:} English (fluent), Spanish (intermediate), Italian (native)
  \\item \\textbf{Technical:} SPSS, R, LaTeX, Microsoft Office Suite
  \\item \\textbf{Clinical:} BLS/ACLS certified, suturing, IV cannulation, ECG interpretation
  \\item \\textbf{Research:} Literature review, systematic review methodology, biostatistics
\\end{itemize}

\\cvsection{Volunteer Experience}

\\cventry{Medical Volunteer}{2023 -- Present}
{Free Clinic for Uninsured Patients}
{Volunteer physician assistant providing basic health screenings and patient education on chronic disease management.}

\\end{document}
`,
      },
    ],
  },
];

/** Get all templates */
export function getAllTemplates(): LaTeXTemplate[] {
  return latexTemplates;
}

/** Get templates by category */
export function getTemplatesByCategory(category: string): LaTeXTemplate[] {
  return latexTemplates.filter((t) => t.category === category);
}

/** Get a single template by ID */
export function getTemplateById(id: string): LaTeXTemplate | undefined {
  return latexTemplates.find((t) => t.id === id);
}
