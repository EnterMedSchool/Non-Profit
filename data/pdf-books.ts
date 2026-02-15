import { blobAsset } from "@/lib/blob-url";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PDFBook {
  id: string;
  language: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription: string;
  coverImage: string;
  subject: string;
  tags: string[];
  authors: { name: string; affiliation?: string }[];
  license: { type: string; url: string; attribution: string };
  lastUpdated: string;
  version: string;
  totalPages: number;
  estimatedReadTime: number;
  pdfUrl: string;
  chapters: PDFChapter[];
}

export interface PDFChapter {
  id: string;
  number: number;
  title: string;
  slug: string;
  description: string;
  pdfUrl?: string;
  estimatedReadTime: number;
  keyTopics: string[];
  sections: PDFSection[];
}

export interface PDFSection {
  id: string;
  number: string;
  title: string;
  content: string;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

export function getBookBySlug(slug: string): PDFBook | undefined {
  return pdfBooks.find((b) => b.slug === slug);
}

export function getChapterBySlug(
  book: PDFBook,
  chapterSlug: string,
): PDFChapter | undefined {
  return book.chapters.find((c) => c.slug === chapterSlug);
}

export function getAdjacentChapters(
  book: PDFBook,
  chapterSlug: string,
): { prev: PDFChapter | null; next: PDFChapter | null } {
  const idx = book.chapters.findIndex((c) => c.slug === chapterSlug);
  return {
    prev: idx > 0 ? book.chapters[idx - 1] : null,
    next: idx < book.chapters.length - 1 ? book.chapters[idx + 1] : null,
  };
}

// ─── Sample Book Data ───────────────────────────────────────────────────────

export const pdfBooks: PDFBook[] = [
  {
    id: "biochem-essentials",
    language: "en",
    slug: "biochemistry-essentials",
    title: "Biochemistry Essentials",
    subtitle: "A Concise Guide for Medical Students",
    description:
      "A free, open-source biochemistry reference covering amino acids, enzyme kinetics, and carbohydrate metabolism — designed for medical students who need to understand clinical relevance, not just memorize pathways.",
    longDescription:
      "This open-source textbook distills the most clinically relevant biochemistry topics into a concise, readable format. Rather than overwhelming you with every detail, we focus on the concepts most likely to appear on exams and in clinical practice. Each chapter includes clinical correlations, key enzyme deficiencies, and real-world applications to help you think like a clinician from day one.",
    coverImage: blobAsset("/assets/pdf-covers/biochem-essentials.svg"),
    subject: "Biochemistry",
    tags: [
      "biochemistry",
      "amino acids",
      "enzymes",
      "metabolism",
      "medical school",
      "USMLE",
    ],
    authors: [
      {
        name: "EnterMedSchool Team",
        affiliation: "EnterMedSchool.org",
      },
    ],
    license: {
      type: "Free for non-commercial educational use",
      url: "/en/license",
      attribution:
        "EnterMedSchool.org — Free for non-commercial educational use with attribution.",
    },
    lastUpdated: "2026-02-01",
    version: "1.0",
    totalPages: 42,
    estimatedReadTime: 90,
    pdfUrl: "/pdfs/biochemistry-essentials/full.pdf",
    chapters: [
      // ── Chapter 1: Amino Acids & Proteins ──
      {
        id: "ch1",
        number: 1,
        title: "Amino Acids & Protein Structure",
        slug: "amino-acids-and-protein-structure",
        description:
          "The 20 standard amino acids, their properties, peptide bond formation, and the four levels of protein structure — with clinical correlations including sickle cell disease and collagen disorders.",
        pdfUrl: "/pdfs/biochemistry-essentials/ch-1.pdf",
        estimatedReadTime: 25,
        keyTopics: [
          "Amino acid classification",
          "Peptide bonds",
          "Protein folding",
          "Sickle cell disease",
          "Collagen disorders",
        ],
        sections: [
          {
            id: "s1-1",
            number: "1.1",
            title: "The 20 Standard Amino Acids",
            content: `<p>Amino acids are the building blocks of proteins. Each amino acid contains an <strong>amino group (−NH₂)</strong>, a <strong>carboxyl group (−COOH)</strong>, a <strong>hydrogen atom</strong>, and a distinctive <strong>R group (side chain)</strong> — all bonded to a central α-carbon.</p>

<p>The 20 standard amino acids encoded by DNA can be classified by the chemical properties of their R groups:</p>

<h4>Nonpolar (Hydrophobic) Amino Acids</h4>
<p>These amino acids have hydrocarbon or aromatic R groups that avoid water. They are typically found in the <strong>interior of globular proteins</strong> and in <strong>transmembrane domains</strong>.</p>
<ul>
  <li><strong>Glycine (Gly, G)</strong> — The smallest amino acid with just a hydrogen as its R group. Its small size gives it exceptional conformational flexibility, which is why it is found at tight turns in protein structure and is the most abundant amino acid in collagen.</li>
  <li><strong>Alanine (Ala, A)</strong> — A simple methyl group side chain. Important in the glucose-alanine cycle between muscle and liver.</li>
  <li><strong>Valine (Val, V), Leucine (Leu, L), Isoleucine (Ile, I)</strong> — The <em>branched-chain amino acids (BCAAs)</em>. These are essential amino acids degraded primarily in muscle tissue rather than liver. Their accumulation is the hallmark of <strong>Maple Syrup Urine Disease</strong>, caused by deficiency of branched-chain α-keto acid dehydrogenase.</li>
  <li><strong>Proline (Pro, P)</strong> — Unique because its side chain cyclizes back to the amino group, forming a rigid ring. This introduces <em>kinks</em> in polypeptide chains and is particularly important in the triple helix of collagen.</li>
  <li><strong>Phenylalanine (Phe, F)</strong> — Contains a benzyl group. Accumulation of phenylalanine due to deficiency of phenylalanine hydroxylase causes <strong>Phenylketonuria (PKU)</strong>, one of the most commonly tested metabolic disorders.</li>
  <li><strong>Tryptophan (Trp, W)</strong> — Contains an indole ring; precursor to serotonin, melatonin, and niacin (vitamin B3).</li>
  <li><strong>Methionine (Met, M)</strong> — Contains a thioether group and serves as the universal <em>start codon</em> amino acid (AUG). It is also the precursor to S-adenosylmethionine (SAM), the principal methyl group donor in biological reactions.</li>
</ul>

<h4>Polar (Uncharged) Amino Acids</h4>
<p>These can form hydrogen bonds with water and are often found on protein surfaces.</p>
<ul>
  <li><strong>Serine (Ser, S) and Threonine (Thr, T)</strong> — Hydroxyl groups that can be phosphorylated by kinases, acting as molecular on/off switches in cell signaling.</li>
  <li><strong>Asparagine (Asn, N) and Glutamine (Gln, Q)</strong> — Amide derivatives of aspartate and glutamate; glutamine is the most abundant amino acid in blood and is critical for nitrogen transport.</li>
  <li><strong>Tyrosine (Tyr, Y)</strong> — A hydroxylated phenylalanine. Precursor to catecholamines (dopamine, norepinephrine, epinephrine), thyroid hormones, and melanin. Also a target for phosphorylation in receptor tyrosine kinases.</li>
  <li><strong>Cysteine (Cys, C)</strong> — Contains a thiol (−SH) group that can form <em>disulfide bonds (−S−S−)</em> with other cysteine residues, critical for stabilizing extracellular proteins like immunoglobulins.</li>
</ul>

<h4>Charged Amino Acids</h4>
<p>At physiological pH (7.4), some amino acids carry a net charge:</p>
<ul>
  <li><strong>Positively charged (basic):</strong> Lysine (Lys, K), Arginine (Arg, R), Histidine (His, H). Histidine is special because its pKa (~6.0) is near physiological pH, allowing it to act as a proton shuttle — this is why it is found in the active site of many enzymes and in hemoglobin's buffering system.</li>
  <li><strong>Negatively charged (acidic):</strong> Aspartate (Asp, D) and Glutamate (Glu, E). Glutamate is also the primary excitatory neurotransmitter in the central nervous system.</li>
</ul>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Essential Amino Acids</h4>
  <p>Humans cannot synthesize 9 amino acids and must obtain them from diet: <strong>Phe, Val, Trp, Thr, Ile, Met, His, Arg (conditionally), Leu, Lys</strong>. The mnemonic <em>"PVT TIM HaLL"</em> is the classic way to remember them.</p>
</div>`,
          },
          {
            id: "s1-2",
            number: "1.2",
            title: "Peptide Bonds & Primary Structure",
            content: `<p>Amino acids are linked together by <strong>peptide bonds</strong> — a type of covalent amide bond formed between the α-carboxyl group of one amino acid and the α-amino group of the next, with the release of a water molecule (condensation reaction).</p>

<h4>Key Properties of the Peptide Bond</h4>
<ul>
  <li><strong>Partial double-bond character</strong> — Due to resonance, the C−N bond in the peptide linkage has ~40% double-bond character, making it <em>rigid and planar</em>. This restricts rotation around the peptide bond.</li>
  <li><strong>Trans configuration</strong> — Almost all peptide bonds adopt the <em>trans</em> configuration (the α-carbons on opposite sides of the bond), which minimizes steric clashes between R groups. The exception is bonds preceding proline, which can adopt <em>cis</em> configuration (~10% of the time).</li>
  <li><strong>No charge at physiological pH</strong> — The peptide bond itself is uncharged, but the free amino and carboxyl termini of the polypeptide chain carry charges.</li>
</ul>

<p>The <strong>primary structure</strong> of a protein is simply the linear sequence of amino acids from the N-terminus to the C-terminus. This sequence is directly encoded by the mRNA and determines all higher levels of protein structure.</p>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Sickle Cell Disease</h4>
  <p>A single amino acid substitution in the primary structure — <strong>Glu → Val at position 6 of the β-globin chain</strong> — causes sickle cell disease. The hydrophobic valine residue causes hemoglobin S molecules to polymerize under low-oxygen conditions, distorting red blood cells into a sickle shape. This illustrates how even one change in primary structure can have devastating clinical consequences.</p>
</div>`,
          },
          {
            id: "s1-3",
            number: "1.3",
            title: "Higher-Order Protein Structure",
            content: `<p>Proteins fold into complex three-dimensional shapes that determine their function. There are four levels of protein structure:</p>

<h4>Secondary Structure</h4>
<p>Local folding patterns stabilized by <strong>hydrogen bonds between backbone atoms</strong> (not R groups):</p>
<ul>
  <li><strong>α-Helix</strong> — A right-handed coil where each backbone C=O forms a hydrogen bond with the N−H four residues ahead. Common in transmembrane proteins and structural proteins like keratin. Proline residues break α-helices because proline's ring prevents the necessary backbone geometry.</li>
  <li><strong>β-Sheet</strong> — Extended strands that run alongside each other, connected by hydrogen bonds. Can be parallel (strands run in the same direction) or antiparallel (opposite directions). Antiparallel sheets have stronger hydrogen bonds. Found in silk fibroin and many globular proteins.</li>
  <li><strong>β-Turns and Loops</strong> — Short segments that connect α-helices and β-sheets, often found on the protein surface. Glycine and proline are commonly found in turns.</li>
</ul>

<h4>Tertiary Structure</h4>
<p>The overall 3D arrangement of a single polypeptide chain, stabilized by interactions between R groups:</p>
<ul>
  <li><strong>Hydrophobic interactions</strong> — Nonpolar R groups cluster in the protein interior, away from water. This is the primary driving force of protein folding.</li>
  <li><strong>Hydrogen bonds</strong> — Between polar R groups.</li>
  <li><strong>Ionic bonds (salt bridges)</strong> — Between oppositely charged R groups.</li>
  <li><strong>Disulfide bonds</strong> — Covalent bonds between cysteine residues, especially important in extracellular proteins (e.g., antibodies, insulin).</li>
  <li><strong>Van der Waals forces</strong> — Weak but numerous interactions between closely packed atoms.</li>
</ul>

<h4>Quaternary Structure</h4>
<p>The arrangement of multiple polypeptide subunits into a functional complex. Not all proteins have quaternary structure — only those with more than one subunit.</p>
<ul>
  <li><strong>Hemoglobin</strong> — A tetramer of two α and two β subunits (α₂β₂), exhibiting cooperative oxygen binding.</li>
  <li><strong>Collagen</strong> — A triple helix of three polypeptide chains (tropocollagen), providing tensile strength to connective tissues.</li>
</ul>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Collagen Disorders</h4>
  <p><strong>Osteogenesis Imperfecta</strong> — Mutations in type I collagen genes (COL1A1/COL1A2) cause brittle bones, blue sclerae, and hearing loss. The most common form involves glycine substitutions in the Gly-X-Y repeat sequence that is essential for the tight triple helix.</p>
  <p><strong>Ehlers-Danlos Syndrome</strong> — A group of disorders affecting collagen synthesis, cross-linking, or structure, leading to hyperextensible skin, hypermobile joints, and tissue fragility.</p>
  <p><strong>Scurvy</strong> — Vitamin C deficiency impairs the hydroxylation of proline and lysine residues in collagen (by prolyl hydroxylase and lysyl hydroxylase), weakening collagen structure and leading to bleeding gums, poor wound healing, and weakened blood vessels.</p>
</div>`,
          },
        ],
      },

      // ── Chapter 2: Enzyme Kinetics ──
      {
        id: "ch2",
        number: 2,
        title: "Enzyme Kinetics & Regulation",
        slug: "enzyme-kinetics-and-regulation",
        description:
          "Michaelis-Menten kinetics, Lineweaver-Burk plots, enzyme inhibition types, and allosteric regulation — with clinical examples of enzyme deficiencies and drug mechanisms.",
        pdfUrl: "/pdfs/biochemistry-essentials/ch-2.pdf",
        estimatedReadTime: 30,
        keyTopics: [
          "Michaelis-Menten equation",
          "Lineweaver-Burk plot",
          "Competitive vs noncompetitive inhibition",
          "Allosteric regulation",
          "Clinical enzyme deficiencies",
        ],
        sections: [
          {
            id: "s2-1",
            number: "2.1",
            title: "Enzyme Fundamentals",
            content: `<p>Enzymes are biological catalysts — they accelerate chemical reactions without being consumed in the process. The vast majority of enzymes are <strong>proteins</strong>, though some RNA molecules (ribozymes) also have catalytic activity.</p>

<h4>How Enzymes Work</h4>
<p>Enzymes lower the <strong>activation energy (Ea)</strong> of a reaction, making it proceed faster. They do not change the equilibrium of the reaction or the overall free energy change (ΔG) — they simply allow the reaction to reach equilibrium more quickly.</p>

<p>The <strong>active site</strong> is a specific three-dimensional pocket or cleft on the enzyme where the substrate binds and catalysis occurs. Two models describe substrate binding:</p>
<ul>
  <li><strong>Lock and Key Model</strong> — The active site has a rigid shape perfectly complementary to the substrate. This model is oversimplified but useful for understanding specificity.</li>
  <li><strong>Induced Fit Model</strong> (more accurate) — The active site changes shape upon substrate binding, wrapping around the substrate for optimal catalysis. This conformational change can strain the substrate, stabilize the transition state, or bring catalytic residues into position.</li>
</ul>

<h4>Cofactors and Coenzymes</h4>
<p>Many enzymes require non-protein helpers to function:</p>
<ul>
  <li><strong>Cofactors</strong> — Inorganic ions such as Zn²⁺, Mg²⁺, Fe²⁺, or Cu²⁺ that assist in catalysis.</li>
  <li><strong>Coenzymes</strong> — Organic molecules, often derived from vitamins, that serve as carriers of chemical groups. Examples include NAD⁺ (from niacin/B3), FAD (from riboflavin/B2), coenzyme A (from pantothenic acid/B5), and pyridoxal phosphate (PLP, from B6).</li>
  <li><strong>Holoenzyme</strong> = apoenzyme (protein) + cofactor/coenzyme (complete, active form).</li>
</ul>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Enzyme Nomenclature in the Clinic</h4>
  <p>Serum enzyme levels are used as diagnostic markers. Elevated <strong>AST and ALT</strong> (aminotransferases, which use PLP as coenzyme) indicate liver damage. Elevated <strong>troponin</strong> and <strong>CK-MB</strong> (creatine kinase-MB isoform) indicate myocardial infarction. Understanding which enzymes are concentrated in which tissues helps you interpret lab results.</p>
</div>`,
          },
          {
            id: "s2-2",
            number: "2.2",
            title: "Michaelis-Menten Kinetics",
            content: `<p>The <strong>Michaelis-Menten equation</strong> describes the rate of enzyme-catalyzed reactions as a function of substrate concentration:</p>

<div class="equation">
  <p><strong>v = (V<sub>max</sub> × [S]) / (K<sub>m</sub> + [S])</strong></p>
</div>

<p>Where:</p>
<ul>
  <li><strong>v</strong> — Reaction velocity (rate)</li>
  <li><strong>V<sub>max</sub></strong> — Maximum velocity achieved when all enzyme molecules are saturated with substrate</li>
  <li><strong>[S]</strong> — Substrate concentration</li>
  <li><strong>K<sub>m</sub></strong> (Michaelis constant) — The substrate concentration at which the reaction rate is <em>half of V<sub>max</sub></em>. K<sub>m</sub> is a measure of the enzyme's affinity for its substrate: <strong>low K<sub>m</sub> = high affinity</strong> (the enzyme needs very little substrate to reach half-maximal velocity).</li>
</ul>

<h4>The Michaelis-Menten Curve</h4>
<p>When you plot <strong>v vs. [S]</strong>, you get a <em>rectangular hyperbola</em>:</p>
<ul>
  <li>At <strong>low [S]</strong>: The reaction rate increases almost linearly (first-order kinetics — rate depends on [S]).</li>
  <li>At <strong>high [S]</strong>: The curve plateaus at V<sub>max</sub> as all enzyme active sites are occupied (zero-order kinetics — rate is independent of [S]).</li>
  <li>At <strong>[S] = K<sub>m</sub></strong>: v = V<sub>max</sub>/2 by definition.</li>
</ul>

<h4>Lineweaver-Burk (Double Reciprocal) Plot</h4>
<p>Taking the reciprocal of both sides of the Michaelis-Menten equation yields a straight line when plotting <strong>1/v vs. 1/[S]</strong>:</p>
<div class="equation">
  <p><strong>1/v = (K<sub>m</sub>/V<sub>max</sub>)(1/[S]) + 1/V<sub>max</sub></strong></p>
</div>
<ul>
  <li><strong>Y-intercept</strong> = 1/V<sub>max</sub></li>
  <li><strong>X-intercept</strong> = −1/K<sub>m</sub></li>
  <li><strong>Slope</strong> = K<sub>m</sub>/V<sub>max</sub></li>
</ul>
<p>This plot is particularly useful for distinguishing between types of enzyme inhibition, as each type produces a characteristic pattern of line changes.</p>`,
          },
          {
            id: "s2-3",
            number: "2.3",
            title: "Enzyme Inhibition",
            content: `<p>Enzyme inhibitors reduce the rate of enzyme-catalyzed reactions. Understanding inhibition types is essential for pharmacology, as many drugs work as enzyme inhibitors.</p>

<h4>Reversible Inhibition</h4>

<p><strong>1. Competitive Inhibition</strong></p>
<ul>
  <li>The inhibitor <em>resembles the substrate</em> and binds to the active site, competing with the substrate.</li>
  <li>Effect on kinetics: <strong>K<sub>m</sub> increases</strong> (apparent lower affinity); <strong>V<sub>max</sub> unchanged</strong> (can be overcome by adding more substrate).</li>
  <li>On Lineweaver-Burk plot: Lines intersect at the <strong>same y-intercept</strong> (same 1/V<sub>max</sub>) but the slope increases.</li>
  <li>Clinical example: <strong>Methotrexate</strong> competitively inhibits dihydrofolate reductase (DHFR), blocking folate synthesis. Used in cancer chemotherapy and autoimmune diseases. <strong>Statins</strong> (e.g., atorvastatin) competitively inhibit HMG-CoA reductase, the rate-limiting enzyme of cholesterol synthesis.</li>
</ul>

<p><strong>2. Noncompetitive Inhibition</strong></p>
<ul>
  <li>The inhibitor binds to a site <em>other than the active site</em> (an allosteric site), reducing catalytic activity without affecting substrate binding.</li>
  <li>Effect on kinetics: <strong>V<sub>max</sub> decreases</strong>; <strong>K<sub>m</sub> unchanged</strong>.</li>
  <li>On Lineweaver-Burk plot: Lines intersect at the <strong>same x-intercept</strong> (same −1/K<sub>m</sub>) but the y-intercept increases.</li>
  <li>Cannot be overcome by adding more substrate.</li>
</ul>

<p><strong>3. Uncompetitive Inhibition</strong></p>
<ul>
  <li>The inhibitor binds only to the <em>enzyme-substrate complex</em>, not to the free enzyme.</li>
  <li>Effect on kinetics: <strong>Both V<sub>max</sub> and K<sub>m</sub> decrease</strong> proportionally.</li>
  <li>On Lineweaver-Burk plot: <strong>Parallel lines</strong> (same slope, different intercepts).</li>
</ul>

<h4>Irreversible Inhibition</h4>
<p>The inhibitor forms a <strong>covalent bond</strong> with the enzyme, permanently inactivating it. The enzyme must be degraded and resynthesized.</p>
<ul>
  <li><strong>Aspirin</strong> — Irreversibly acetylates cyclooxygenase (COX-1), inhibiting prostaglandin and thromboxane synthesis. Because platelets lack nuclei and cannot synthesize new COX, the effect lasts the lifetime of the platelet (~7-10 days).</li>
  <li><strong>Organophosphates</strong> (nerve agents, some pesticides) — Irreversibly inhibit acetylcholinesterase, causing accumulation of acetylcholine at synapses. Treated with atropine and pralidoxime.</li>
</ul>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Why Inhibition Type Matters</h4>
  <p>Understanding whether a drug is a competitive or irreversible inhibitor affects dosing strategy. Competitive inhibitors can be "outcompeted" by high substrate concentrations — for example, methanol poisoning is treated with <strong>ethanol or fomepizole</strong>, which compete with methanol for alcohol dehydrogenase. Irreversible inhibitors require waiting for new enzyme synthesis, which determines the duration of drug effect.</p>
</div>`,
          },
        ],
      },

      // ── Chapter 3: Carbohydrate Metabolism ──
      {
        id: "ch3",
        number: 3,
        title: "Carbohydrate Metabolism",
        slug: "carbohydrate-metabolism",
        description:
          "Glycolysis, the citric acid cycle, gluconeogenesis, and glycogen metabolism — with clinical correlations including diabetes, glycogen storage diseases, and inborn errors of metabolism.",
        pdfUrl: "/pdfs/biochemistry-essentials/ch-3.pdf",
        estimatedReadTime: 35,
        keyTopics: [
          "Glycolysis",
          "Citric acid cycle",
          "Gluconeogenesis",
          "Glycogen storage diseases",
          "Pyruvate dehydrogenase complex",
        ],
        sections: [
          {
            id: "s3-1",
            number: "3.1",
            title: "Glycolysis: The Universal Pathway",
            content: `<p><strong>Glycolysis</strong> is the sequence of 10 enzymatic reactions that converts one molecule of <strong>glucose (6C)</strong> into two molecules of <strong>pyruvate (3C)</strong>, generating a net yield of <strong>2 ATP</strong> and <strong>2 NADH</strong>. It occurs in the <strong>cytoplasm</strong> of virtually all cells and does not require oxygen.</p>

<h4>The Two Phases of Glycolysis</h4>

<p><strong>Energy Investment Phase (Steps 1–5):</strong></p>
<p>Two ATP molecules are consumed to phosphorylate glucose and its intermediates, trapping them inside the cell and preparing them for cleavage.</p>
<ul>
  <li><strong>Step 1:</strong> Glucose → Glucose-6-phosphate (enzyme: <em>hexokinase</em> in most tissues; <em>glucokinase</em> in liver and pancreatic β-cells). This is the first committed step.</li>
  <li><strong>Step 3:</strong> Fructose-6-phosphate → Fructose-1,6-bisphosphate (enzyme: <em>phosphofructokinase-1, PFK-1</em>). This is the <strong>rate-limiting step</strong> — the most important regulatory point of glycolysis. PFK-1 is activated by AMP, fructose-2,6-bisphosphate and inhibited by ATP, citrate.</li>
  <li><strong>Step 4:</strong> Fructose-1,6-bisphosphate is cleaved by <em>aldolase</em> into two 3-carbon molecules: DHAP and glyceraldehyde-3-phosphate (G3P).</li>
</ul>

<p><strong>Energy Payoff Phase (Steps 6–10):</strong></p>
<p>Each of the two 3-carbon molecules generates 2 ATP (by substrate-level phosphorylation) and 1 NADH.</p>
<ul>
  <li><strong>Step 10:</strong> Phosphoenolpyruvate → Pyruvate (enzyme: <em>pyruvate kinase</em>). This is the third irreversible step and another key regulatory point.</li>
</ul>

<h4>Net Yield of Glycolysis</h4>
<p>Per molecule of glucose: <strong>2 ATP</strong> (net), <strong>2 NADH</strong>, and <strong>2 pyruvate</strong>.</p>

<h4>Fate of Pyruvate</h4>
<p>Pyruvate's fate depends on oxygen availability and the metabolic needs of the cell:</p>
<ul>
  <li><strong>Aerobic conditions:</strong> Pyruvate enters mitochondria and is converted to acetyl-CoA by the <em>pyruvate dehydrogenase complex (PDH)</em>, then enters the citric acid cycle.</li>
  <li><strong>Anaerobic conditions:</strong> Pyruvate is reduced to <em>lactate</em> by <em>lactate dehydrogenase (LDH)</em>, regenerating NAD⁺ so glycolysis can continue. This occurs in exercising muscle, red blood cells (which lack mitochondria), and in tumors (the Warburg effect).</li>
  <li><strong>Alcoholic fermentation</strong> (in yeast): Pyruvate → ethanol + CO₂.</li>
</ul>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Pyruvate Kinase Deficiency</h4>
  <p>Pyruvate kinase deficiency is the most common enzyme deficiency in glycolysis, causing <strong>chronic hemolytic anemia</strong>. Red blood cells depend entirely on glycolysis for ATP (they lack mitochondria), so impaired pyruvate kinase leads to ATP depletion, rigid cell membranes, and premature RBC destruction. The blood smear characteristically shows <strong>echinocytes (burr cells)</strong>.</p>
</div>`,
          },
          {
            id: "s3-2",
            number: "3.2",
            title: "The Citric Acid Cycle",
            content: `<p>The <strong>citric acid cycle</strong> (also called the Krebs cycle or TCA cycle) is a series of 8 enzymatic reactions in the <strong>mitochondrial matrix</strong> that oxidizes the acetyl group of acetyl-CoA to two molecules of CO₂, generating high-energy electron carriers (NADH and FADH₂) that feed into the electron transport chain.</p>

<h4>The Pyruvate Dehydrogenase Complex (PDH)</h4>
<p>Before entering the TCA cycle, pyruvate must be converted to acetyl-CoA. This irreversible reaction is catalyzed by the <strong>pyruvate dehydrogenase complex</strong>, a large multi-enzyme complex requiring <strong>five coenzymes</strong> — remember them with the mnemonic <em>"Tender Loving Care For Nancy"</em>:</p>
<ol>
  <li><strong>T</strong>hiamine pyrophosphate (TPP, from vitamin B1)</li>
  <li><strong>L</strong>ipoic acid</li>
  <li><strong>C</strong>oenzyme A (CoA, from vitamin B5/pantothenic acid)</li>
  <li><strong>F</strong>AD (from vitamin B2/riboflavin)</li>
  <li><strong>N</strong>AD⁺ (from vitamin B3/niacin)</li>
</ol>

<p>PDH is regulated by phosphorylation: it is <strong>inactivated by PDH kinase</strong> (stimulated by ATP, acetyl-CoA, NADH) and <strong>activated by PDH phosphatase</strong> (stimulated by Ca²⁺, insulin).</p>

<h4>Key Reactions of the TCA Cycle</h4>
<p>Three reactions in the cycle are irreversible and represent the key regulatory steps:</p>
<ol>
  <li><strong>Citrate synthase:</strong> Acetyl-CoA + Oxaloacetate → Citrate. Inhibited by citrate, ATP, NADH.</li>
  <li><strong>Isocitrate dehydrogenase:</strong> Isocitrate → α-Ketoglutarate + CO₂ + NADH. The <em>rate-limiting step</em>. Activated by ADP; inhibited by ATP, NADH.</li>
  <li><strong>α-Ketoglutarate dehydrogenase:</strong> α-Ketoglutarate → Succinyl-CoA + CO₂ + NADH. This enzyme complex is structurally similar to the PDH complex and requires the same five coenzymes.</li>
</ol>

<h4>Net Yield per Acetyl-CoA</h4>
<p>One turn of the TCA cycle produces: <strong>3 NADH</strong>, <strong>1 FADH₂</strong>, <strong>1 GTP</strong> (equivalent to 1 ATP), and <strong>2 CO₂</strong>.</p>
<p>Since each glucose produces 2 acetyl-CoA, the total TCA cycle yield per glucose is: 6 NADH, 2 FADH₂, 2 GTP.</p>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Pyruvate Dehydrogenase Deficiency</h4>
  <p>PDH deficiency is a mitochondrial disorder that presents with <strong>lactic acidosis</strong> (pyruvate cannot enter the TCA cycle, so it is shunted to lactate) and <strong>neurological deficits</strong> (the brain depends heavily on aerobic glucose metabolism). Treatment includes a <strong>ketogenic diet</strong> (high fat, low carbohydrate), which provides an alternative fuel source (ketone bodies) that can be converted to acetyl-CoA without requiring PDH.</p>
</div>`,
          },
          {
            id: "s3-3",
            number: "3.3",
            title: "Gluconeogenesis & Glycogen Metabolism",
            content: `<p><strong>Gluconeogenesis</strong> is the synthesis of glucose from non-carbohydrate precursors. It occurs primarily in the <strong>liver</strong> (and to a lesser extent the kidneys) during fasting, starvation, and prolonged exercise to maintain blood glucose levels.</p>

<h4>Substrates for Gluconeogenesis</h4>
<ul>
  <li><strong>Lactate</strong> — From anaerobic glycolysis in muscle and RBCs. Converted back to pyruvate by LDH in the liver (the Cori cycle).</li>
  <li><strong>Amino acids</strong> — Especially alanine (via the glucose-alanine cycle) and glutamine. Glucogenic amino acids can be converted to TCA cycle intermediates or pyruvate.</li>
  <li><strong>Glycerol</strong> — From triglyceride hydrolysis in adipose tissue. Enters gluconeogenesis as DHAP.</li>
  <li>Note: <strong>Fatty acids cannot be converted to glucose</strong> in humans (acetyl-CoA cannot be converted to pyruvate or OAA in net terms because the PDH reaction is irreversible and humans lack the glyoxylate cycle).</li>
</ul>

<h4>Bypass Reactions</h4>
<p>Gluconeogenesis is NOT simply the reverse of glycolysis. Three irreversible glycolytic reactions must be bypassed by different enzymes:</p>
<ol>
  <li><strong>Pyruvate → Oxaloacetate → Phosphoenolpyruvate:</strong> Catalyzed by <em>pyruvate carboxylase</em> (in mitochondria, requires biotin) and <em>PEPCK</em> (phosphoenolpyruvate carboxykinase, in cytoplasm). These two steps bypass pyruvate kinase.</li>
  <li><strong>Fructose-1,6-bisphosphate → Fructose-6-phosphate:</strong> Catalyzed by <em>fructose-1,6-bisphosphatase</em>. Bypasses PFK-1.</li>
  <li><strong>Glucose-6-phosphate → Glucose:</strong> Catalyzed by <em>glucose-6-phosphatase</em> (found only in liver and kidney — this is why only these organs can release free glucose into the blood). Bypasses hexokinase/glucokinase.</li>
</ol>

<h4>Glycogen Metabolism</h4>
<p>Glycogen is a branched polymer of glucose stored primarily in <strong>liver</strong> (maintains blood glucose) and <strong>skeletal muscle</strong> (provides fuel for contraction).</p>
<ul>
  <li><strong>Glycogenesis</strong> (synthesis): Glycogen synthase adds glucose residues in α-1,4 linkages. Branching enzyme creates α-1,6 branch points. Stimulated by <em>insulin</em>.</li>
  <li><strong>Glycogenolysis</strong> (breakdown): Glycogen phosphorylase cleaves α-1,4 bonds, releasing glucose-1-phosphate. Debranching enzyme handles α-1,6 branch points. Stimulated by <em>glucagon</em> (liver) and <em>epinephrine</em> (muscle).</li>
</ul>

<div class="clinical-pearl">
  <h4>Clinical Pearl: Glycogen Storage Diseases</h4>
  <p>Deficiencies in glycogen metabolism enzymes cause accumulation of abnormal glycogen:</p>
  <ul>
    <li><strong>Von Gierke disease (Type I)</strong> — Glucose-6-phosphatase deficiency. Severe fasting hypoglycemia, hepatomegaly, lactic acidosis, hyperuricemia. The liver cannot release free glucose.</li>
    <li><strong>Pompe disease (Type II)</strong> — Lysosomal α-1,4-glucosidase (acid maltase) deficiency. Glycogen accumulates in lysosomes. Cardiomegaly in the infantile form. The only GSD that is a lysosomal storage disease.</li>
    <li><strong>McArdle disease (Type V)</strong> — Muscle glycogen phosphorylase deficiency. Exercise intolerance, myoglobinuria, and cramps with exertion, but no increase in blood lactate during exercise (because muscle cannot break down glycogen).</li>
  </ul>
</div>`,
          },
        ],
      },
    ],
  },
];
