export interface Tool {
  id: string;
  /** i18n key under the "tools" namespace, e.g. "bmi" → tools.bmi.title */
  i18nKey: string;
  category: "calculator" | "creator";
  sourceUrl?: string;
  icon: string;
  /** Suggested iframe height in px (default 520) */
  embedHeight?: number;
  /** SEO keywords for JSON-LD structured data */
  seoKeywords?: string[];
}

export const tools: Tool[] = [
  {
    id: "illustration-maker",
    i18nKey: "illustrationMaker",
    category: "creator",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit/tree/main/components/tools/illustration-maker",
    icon: "Paintbrush",
    embedHeight: 900,
    seoKeywords: [
      "scientific illustration maker",
      "biorender alternative",
      "free scientific figures",
      "biology diagram creator",
      "medical illustration tool",
      "open source biorender",
      "cell diagram maker",
      "scientific figure creator",
    ],
  },
  {
    id: "bmi-calc",
    i18nKey: "bmi",
    category: "calculator",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit/tree/main/components/tools/calculators",
    icon: "Calculator",
    embedHeight: 700,
    seoKeywords: [
      "BMI calculator",
      "BMI calculator free",
      "calculate BMI online",
      "body mass index",
      "BMI chart",
      "healthy BMI range",
      "BMI formula",
      "BMI for adults",
      "BMI categories WHO",
      "BMI Prime",
      "Ponderal Index",
      "WHO BMI classification",
      "obesity risk assessment",
      "BMI scale",
      "body mass index calculator",
      "is my BMI healthy",
    ],
  },
  {
    id: "flashcard-maker",
    i18nKey: "flashcardMaker",
    category: "creator",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit/tree/main/components/tools/flashcard-maker",
    icon: "CreditCard",
    seoKeywords: [
      "flashcard maker",
      "anki to pdf",
      "printable flashcards",
      "CSV flashcards",
      "physical flashcards",
      "flashcard printer",
      "study flashcards",
      "fold flashcards",
      "free flashcard tool",
    ],
  },
  {
    id: "latex-editor",
    i18nKey: "latexEditor",
    category: "creator",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit/tree/main/components/tools/latex-editor",
    icon: "FileText",
    embedHeight: 900,
    seoKeywords: [
      "latex editor online",
      "free latex editor",
      "overleaf alternative",
      "latex for medical students",
      "thesis editor",
      "scientific paper editor",
      "latex learning tool",
      "open source latex editor",
      "research paper formatter",
      "medical thesis writer",
    ],
  },
  {
    id: "mcq-maker",
    i18nKey: "mcqMaker",
    category: "creator",
    sourceUrl: "https://github.com/enterMedSchool/Non-Profit/tree/main/components/tools/mcq-maker",
    icon: "HelpCircle",
    embedHeight: 700,
    seoKeywords: [
      "MCQ maker",
      "multiple choice question generator",
      "quiz maker free",
      "exam generator",
      "MCQ creator",
      "import CSV questions",
      "exam PDF generator",
      "embeddable quiz",
      "open source quiz maker",
      "medical exam questions",
      "free exam maker",
      "question bank",
      "study guide generator",
      "answer key generator",
    ],
  },
];

/** Retrieve a tool by its slug id */
export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

/** All calculator tools */
export function getCalculatorTools(): Tool[] {
  return tools.filter((t) => t.category === "calculator");
}

/** All creator tools */
export function getCreatorTools(): Tool[] {
  return tools.filter((t) => t.category === "creator");
}
