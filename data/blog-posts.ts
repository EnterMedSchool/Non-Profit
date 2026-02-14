/* ── Blog Post Types & Data ──────────────────────────────────────────
 * Data-driven blog system. Add new posts here and they automatically
 * appear in the listing, sitemap, and RSS feed.
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Full article body in HTML (supports inline tags) */
  body: string;
  author: string;
  datePublished: string; // ISO date
  dateModified: string; // ISO date
  tags: string[];
  /** Category for OG article:section */
  category: string;
  /** Optional cover image path (relative to public/) */
  coverImage?: string;
  /** Reading time in minutes */
  readingTime: number;
  /** Related glossary term IDs for cross-linking */
  relatedTerms?: string[];
  /** Related tool IDs for cross-linking */
  relatedTools?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-study-anatomy-effectively",
    title: "How to Study Anatomy Effectively: A Complete Guide for Med Students",
    description:
      "Learn proven strategies for studying anatomy in medical school. From active recall to visual mnemonics, discover techniques that help you master human anatomy faster.",
    body: `<p>Anatomy is one of the most challenging yet foundational subjects in medical school. Whether you're a first-year student facing the cadaver lab for the first time or reviewing for board exams, having an effective study strategy can make the difference between struggling and excelling.</p>

<h2>Why Anatomy Feels Overwhelming</h2>
<p>The human body contains over 600 muscles, 206 bones, and countless nerves, vessels, and organs. The sheer volume of terminology — much of it in Latin — makes anatomy one of the highest-memorization subjects in medical education. But memorization alone isn't enough. You need to understand spatial relationships, clinical correlations, and functional anatomy.</p>

<h2>1. Use Visual Learning Tools</h2>
<p>Anatomy is inherently visual. Relying solely on textbooks limits your understanding. Instead, combine multiple visual resources:</p>
<ul>
<li><strong>3D anatomy apps</strong> let you rotate and dissect virtual structures</li>
<li><strong>Labeled diagrams</strong> like our free medical illustrations help you practice identification</li>
<li><strong>Color-coded drawings</strong> — coloring anatomy yourself activates motor memory</li>
</ul>

<h2>2. Active Recall with Flashcards</h2>
<p>Passive re-reading is the least effective study method. Active recall — testing yourself before you feel "ready" — is proven to double long-term retention. Create flashcards with our free flashcard maker tool, focusing on:</p>
<ul>
<li>Structure identification (image on front, name + function on back)</li>
<li>Clinical correlations (e.g., "What nerve is at risk during thyroid surgery?")</li>
<li>Blood supply and innervation patterns</li>
</ul>

<h2>3. Spaced Repetition</h2>
<p>Review flashcards on an expanding schedule: 1 day, 3 days, 7 days, 14 days, 30 days. This leverages the spacing effect — one of the most robust findings in cognitive science. Tools like Anki automate this process.</p>

<h2>4. Learn the Language</h2>
<p>Many anatomy terms follow predictable Latin/Greek patterns. Learning root words accelerates vocabulary acquisition. For example: "cardi-" (heart), "hepat-" (liver), "-itis" (inflammation), "-ectomy" (surgical removal). Browse our medical glossary to build your terminology foundation.</p>

<h2>5. Clinical Correlation</h2>
<p>Connect every structure to a clinical scenario. When you learn the brachial plexus, think about erb palsy and klumpke palsy. When you study coronary arteries, think about which territory each supplies and what happens when they're occluded. This makes the anatomy stick because it becomes meaningful.</p>

<h2>6. Group Study and Teaching</h2>
<p>The Feynman technique — explaining a concept in simple terms — is powerful for anatomy. Study with peers, quiz each other on prosected specimens, and take turns teaching difficult regions. If you can explain the inguinal canal to a classmate, you truly understand it.</p>

<h2>Summary</h2>
<p>The key to anatomy success is multimodal learning: combine visuals, active recall, spaced repetition, and clinical correlation. Don't just read — draw, test yourself, teach others, and connect every structure to real medicine.</p>`,
    author: "Ari Horesh",
    datePublished: "2025-06-15",
    dateModified: "2025-06-15",
    tags: [
      "anatomy",
      "study tips",
      "medical school",
      "active recall",
      "flashcards",
      "spaced repetition",
    ],
    category: "Study Guides",
    readingTime: 8,
    relatedTerms: ["anatomy"],
    relatedTools: ["flashcard-maker", "illustration-maker"],
  },
  {
    slug: "best-free-medical-education-resources-2026",
    title: "Best Free Medical Education Resources in 2026",
    description:
      "A curated list of the best free medical education resources available in 2026. From open-source tools to free textbooks, flashcard makers, and question banks.",
    body: `<p>Medical education shouldn't require a second mortgage. While platforms like Amboss and Osmosis offer excellent content, they come with hefty subscription fees. Fortunately, 2026 has more free, high-quality resources than ever before. Here's our curated guide.</p>

<h2>Open-Source Medical Tools</h2>
<p>The open-source movement has reached medical education. EnterMedSchool.org provides a suite of free tools including:</p>
<ul>
<li><strong>Flashcard Maker</strong> — Create, customize, and export medical flashcards</li>
<li><strong>MCQ Generator</strong> — Build multiple-choice question banks for exam prep</li>
<li><strong>Illustration Maker</strong> — Design scientific figures and medical diagrams (a free alternative to BioRender)</li>
<li><strong>LaTeX Editor</strong> — Write medical documents, papers, and notes with formula support</li>
</ul>

<h2>Free Medical Textbooks</h2>
<p>Open Educational Resources (OER) textbooks have improved dramatically in quality. Look for:</p>
<ul>
<li>OpenStax Anatomy & Physiology — peer-reviewed, free download</li>
<li>EnterMedSchool's open-source textbooks covering biochemistry and clinical topics</li>
<li>Pathoma (free chapters available for pathology)</li>
</ul>

<h2>Medical Glossaries & Terminology</h2>
<p>Building a strong medical vocabulary is essential from day one. Our medical glossary contains 450+ terms with definitions, mnemonics, clinical cases, and study aids — all free and searchable.</p>

<h2>Video Resources</h2>
<p>YouTube remains a goldmine for medical education. Channels worth following include Ninja Nerd, Osmosis (free tier), and Armando Hasudungan for illustrated pathology. For anatomy, Acland's Video Atlas is available through many university libraries.</p>

<h2>Question Banks</h2>
<p>Practice questions are essential for exam preparation. Free options include UWorld's free trial, Amboss's limited free access, and open-source question banks like those available on EnterMedSchool.</p>

<h2>Interactive Visual Lessons</h2>
<p>Visual learning is particularly effective for understanding pathology, pharmacology, and anatomy. EnterMedSchool's visual lessons provide layered, narrated walkthroughs of conditions like achalasia, IBD comparisons, vancomycin pharmacology, and anemia.</p>

<h2>The Bottom Line</h2>
<p>You don't need expensive subscriptions to get a world-class medical education. Combine free tools, open-source resources, and active learning strategies to build an effective study system that costs nothing.</p>`,
    author: "Ari Horesh",
    datePublished: "2026-01-10",
    dateModified: "2026-02-01",
    tags: [
      "free resources",
      "medical education",
      "study tools",
      "open source",
      "textbooks",
      "2026",
    ],
    category: "Resources",
    readingTime: 7,
    relatedTools: ["flashcard-maker", "mcq-maker", "illustration-maker", "latex-editor"],
  },
  {
    slug: "medical-terminology-for-beginners",
    title: "Medical Terminology for Beginners: Essential Roots, Prefixes & Suffixes",
    description:
      "Master medical terminology with this beginner's guide to Latin and Greek roots, prefixes, and suffixes used in medicine. Includes examples and memory tricks.",
    body: `<p>Medical terminology can feel like learning a foreign language — because it essentially is. Most medical terms derive from Latin and Greek roots, and understanding these building blocks lets you decode unfamiliar terms on sight. This guide covers the essential roots, prefixes, and suffixes every medical student needs.</p>

<h2>Why Medical Terminology Matters</h2>
<p>Clear communication is the foundation of safe patient care. When a surgeon requests a "cholecystectomy," every member of the team must understand that means surgical removal of the gallbladder. Medical terminology provides this precision.</p>

<h2>Common Prefixes</h2>
<ul>
<li><strong>hyper-</strong> = excessive (hypertension = high blood pressure)</li>
<li><strong>hypo-</strong> = under/below (hypoglycemia = low blood sugar)</li>
<li><strong>tachy-</strong> = fast (tachycardia = fast heart rate)</li>
<li><strong>brady-</strong> = slow (bradycardia = slow heart rate)</li>
<li><strong>peri-</strong> = around (pericardium = membrane around the heart)</li>
<li><strong>endo-</strong> = within (endocardium = inner heart lining)</li>
<li><strong>epi-</strong> = upon/above (epidermis = outer skin layer)</li>
</ul>

<h2>Common Roots</h2>
<ul>
<li><strong>cardi/o</strong> = heart (cardiology, electrocardiogram)</li>
<li><strong>hepat/o</strong> = liver (hepatitis, hepatomegaly)</li>
<li><strong>nephr/o</strong> = kidney (nephritis, nephrology)</li>
<li><strong>neur/o</strong> = nerve (neurology, neuropathy)</li>
<li><strong>oste/o</strong> = bone (osteoporosis, osteocyte)</li>
<li><strong>derm/o</strong> = skin (dermatitis, dermatology)</li>
<li><strong>gastr/o</strong> = stomach (gastritis, gastroenterology)</li>
<li><strong>pulmon/o</strong> = lung (pulmonology, pulmonary)</li>
</ul>

<h2>Common Suffixes</h2>
<ul>
<li><strong>-itis</strong> = inflammation (arthritis, bronchitis)</li>
<li><strong>-ectomy</strong> = surgical removal (appendectomy, tonsillectomy)</li>
<li><strong>-osis</strong> = condition/disease (stenosis, fibrosis)</li>
<li><strong>-emia</strong> = blood condition (anemia, septicemia)</li>
<li><strong>-algia</strong> = pain (myalgia, neuralgia)</li>
<li><strong>-pathy</strong> = disease (neuropathy, cardiomyopathy)</li>
<li><strong>-scopy</strong> = visual examination (endoscopy, colonoscopy)</li>
</ul>

<h2>How to Learn Effectively</h2>
<p>Don't memorize term lists in isolation. Instead:</p>
<ol>
<li>Break each new term into its components (prefix + root + suffix)</li>
<li>Use our medical glossary to see terms in clinical context</li>
<li>Create flashcards with the term on one side and its breakdown + meaning on the other</li>
<li>Practice with clinical scenarios: "A patient has hepatomegaly — what does this mean?"</li>
</ol>

<h2>Next Steps</h2>
<p>Start with the most common 50 roots, prefixes, and suffixes. Once you know these building blocks, you can decode thousands of medical terms. Explore our medical glossary for detailed definitions of every term mentioned above.</p>`,
    author: "Ari Horesh",
    datePublished: "2025-09-01",
    dateModified: "2025-12-15",
    tags: [
      "medical terminology",
      "beginners guide",
      "Latin roots",
      "prefixes suffixes",
      "medical vocabulary",
      "pre-med",
    ],
    category: "Study Guides",
    readingTime: 9,
    relatedTerms: ["cardio", "anatomy", "pathology", "pharmacology"],
    relatedTools: ["flashcard-maker"],
  },
];

/* ── Helper Functions ───────────────────────────────────────────────── */

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter((p) => p.tags.includes(tag));
}

export function getRecentBlogPosts(limit = 5): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .slice(0, limit);
}
