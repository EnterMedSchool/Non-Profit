// ─── Types ──────────────────────────────────────────────────────────────────

export interface AnkiCard {
  front: string;
  back: string;
}

export interface LectureMaterial {
  id: string;
  type: "flashcards" | "summary" | "question-bank";
  title: string;
  downloadUrl: string;
  fileSize?: string;
  pageCount?: number;
  ankiCards?: AnkiCard[];
}

export interface RelatedContent {
  type: "visual" | "glossary" | "flashcard-deck" | "pdf-book";
  id: string;
  title: string;
  url: string;
}

export interface Lecture {
  id: string;
  slug: string;
  title: string;
  number?: number;
  thumbnailUrl: string;
  description?: string;
  materials: LectureMaterial[];
  relatedContent: RelatedContent[];
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  subject: string;
  professor: string;
  professorTitle?: string;
  year?: string;
  semester?: string;
  lectures: Lecture[];
}

export interface University {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  country: string;
  countryCode: string;
  city: string;
  coordinates: { lat: number; lng: number };
  logoUrl?: string;
  websiteUrl?: string;
  status: "active" | "coming-soon";
  contributors?: { name: string }[];
  courses: Course[];
}

// ─── Subject Colors ─────────────────────────────────────────────────────────

export const subjectColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Cardiology: {
    bg: "bg-showcase-coral/10",
    text: "text-showcase-coral",
    border: "border-showcase-coral",
  },
  Anatomy: {
    bg: "bg-showcase-purple/10",
    text: "text-showcase-purple",
    border: "border-showcase-purple",
  },
  Pharmacology: {
    bg: "bg-showcase-teal/10",
    text: "text-showcase-teal",
    border: "border-showcase-teal",
  },
  Biochemistry: {
    bg: "bg-showcase-orange/10",
    text: "text-showcase-orange",
    border: "border-showcase-orange",
  },
  Pathology: {
    bg: "bg-showcase-pink/10",
    text: "text-showcase-pink",
    border: "border-showcase-pink",
  },
  Physiology: {
    bg: "bg-showcase-blue/10",
    text: "text-showcase-blue",
    border: "border-showcase-blue",
  },
  Neurology: {
    bg: "bg-showcase-green/10",
    text: "text-showcase-green",
    border: "border-showcase-green",
  },
  Histology: {
    bg: "bg-showcase-yellow/10",
    text: "text-showcase-yellow",
    border: "border-showcase-yellow",
  },
};

export const defaultSubjectColor = {
  bg: "bg-showcase-navy/10",
  text: "text-showcase-navy",
  border: "border-showcase-navy",
};

export function getSubjectColor(subject: string) {
  return subjectColors[subject] ?? defaultSubjectColor;
}

// ─── Material Type Config ───────────────────────────────────────────────────

export const materialTypeConfig: Record<
  LectureMaterial["type"],
  { label: string; color: string; bgColor: string }
> = {
  flashcards: {
    label: "Flashcards",
    color: "text-showcase-purple",
    bgColor: "bg-showcase-purple/10",
  },
  summary: {
    label: "Summary",
    color: "text-showcase-teal",
    bgColor: "bg-showcase-teal/10",
  },
  "question-bank": {
    label: "Question Bank",
    color: "text-showcase-coral",
    bgColor: "bg-showcase-coral/10",
  },
};

// ─── Demo Data ──────────────────────────────────────────────────────────────

export const universities: University[] = [
  {
    id: "unipv",
    slug: "university-of-pavia",
    name: "University of Pavia",
    shortName: "UniPV",
    country: "Italy",
    countryCode: "IT",
    city: "Pavia",
    coordinates: { lat: 45.1847, lng: 9.1582 },
    websiteUrl: "https://web.unipv.it",
    status: "active",
    contributors: [{ name: "Maria" }, { name: "Ahmed" }, { name: "Sofia" }],
    courses: [
      {
        id: "unipv-cardio-rossi",
        slug: "cardiology-rossi",
        name: "Cardiology",
        subject: "Cardiology",
        professor: "Prof. Marco Rossi",
        professorTitle: "Associate Professor of Cardiology",
        year: "2025-2026",
        semester: "Fall",
        lectures: [
          {
            id: "unipv-cardio-rossi-01",
            slug: "cardiac-cycle",
            title: "The Cardiac Cycle",
            number: 1,
            thumbnailUrl: "/images/universities/placeholder-slide.svg",
            description:
              "Overview of the cardiac cycle including systole, diastole, and pressure-volume relationships.",
            materials: [
              {
                id: "unipv-cardio-rossi-01-fc",
                type: "flashcards",
                title: "Cardiac Cycle Flashcards",
                downloadUrl: "#",
                fileSize: "1.2 MB",
                pageCount: 24,
                ankiCards: [
                  {
                    front: "What are the two main phases of the cardiac cycle?",
                    back: "Systole (contraction) and Diastole (relaxation).",
                  },
                  {
                    front:
                      "During which phase does ventricular filling occur?",
                    back: "Diastole — specifically during the passive filling phase and atrial contraction (atrial kick).",
                  },
                  {
                    front: "What is the isovolumetric contraction phase?",
                    back: "The brief period at the start of systole when ventricles contract but all valves are closed, so volume stays constant while pressure rises rapidly.",
                  },
                ],
              },
              {
                id: "unipv-cardio-rossi-01-sum",
                type: "summary",
                title: "Cardiac Cycle Summary",
                downloadUrl: "#",
                fileSize: "0.8 MB",
                pageCount: 6,
              },
            ],
            relatedContent: [
              {
                type: "glossary",
                id: "cardiac-cycle",
                title: "Cardiac Cycle",
                url: "/en/resources/glossary/cardiac-cycle",
              },
            ],
          },
          {
            id: "unipv-cardio-rossi-02",
            slug: "heart-failure",
            title: "Heart Failure",
            number: 2,
            thumbnailUrl: "/images/universities/placeholder-slide.svg",
            description:
              "Pathophysiology of heart failure, compensatory mechanisms, and the Frank-Starling curve.",
            materials: [
              {
                id: "unipv-cardio-rossi-02-fc",
                type: "flashcards",
                title: "Heart Failure Flashcards",
                downloadUrl: "#",
                fileSize: "1.5 MB",
                pageCount: 30,
                ankiCards: [
                  {
                    front:
                      "What is the difference between HFrEF and HFpEF?",
                    back: "HFrEF (reduced ejection fraction, <40%) — systolic dysfunction. HFpEF (preserved ejection fraction, ≥50%) — diastolic dysfunction with impaired relaxation.",
                  },
                  {
                    front: "What is the Frank-Starling mechanism?",
                    back: "The intrinsic ability of the heart to increase stroke volume in response to increased venous return (preload), up to a physiological limit.",
                  },
                ],
              },
              {
                id: "unipv-cardio-rossi-02-qb",
                type: "question-bank",
                title: "Heart Failure Questions",
                downloadUrl: "#",
                fileSize: "0.6 MB",
                pageCount: 12,
              },
            ],
            relatedContent: [],
          },
          {
            id: "unipv-cardio-rossi-03",
            slug: "ecg-basics",
            title: "ECG Basics",
            number: 3,
            thumbnailUrl: "/images/universities/placeholder-slide.svg",
            description:
              "Introduction to electrocardiography: leads, waves, intervals, and basic rhythm interpretation.",
            materials: [
              {
                id: "unipv-cardio-rossi-03-fc",
                type: "flashcards",
                title: "ECG Basics Flashcards",
                downloadUrl: "#",
                fileSize: "1.8 MB",
                pageCount: 36,
                ankiCards: [
                  {
                    front: "What does the P wave represent?",
                    back: "Atrial depolarization — the electrical impulse spreading through both atria.",
                  },
                  {
                    front: "What is a normal PR interval?",
                    back: "0.12–0.20 seconds (120–200 ms). A prolonged PR interval indicates first-degree AV block.",
                  },
                ],
              },
              {
                id: "unipv-cardio-rossi-03-sum",
                type: "summary",
                title: "ECG Basics Summary",
                downloadUrl: "#",
                fileSize: "1.1 MB",
                pageCount: 8,
              },
            ],
            relatedContent: [],
          },
        ],
      },
      {
        id: "unipv-anatomy-bianchi",
        slug: "anatomy-bianchi",
        name: "Human Anatomy",
        subject: "Anatomy",
        professor: "Prof. Elena Bianchi",
        professorTitle: "Full Professor of Human Anatomy",
        year: "2025-2026",
        semester: "Fall",
        lectures: [
          {
            id: "unipv-anatomy-bianchi-01",
            slug: "upper-limb",
            title: "Upper Limb — Bones and Joints",
            number: 1,
            thumbnailUrl: "/images/universities/placeholder-slide.svg",
            description:
              "Osteology and arthrology of the upper limb including shoulder, elbow, and wrist.",
            materials: [
              {
                id: "unipv-anatomy-bianchi-01-fc",
                type: "flashcards",
                title: "Upper Limb Flashcards",
                downloadUrl: "#",
                fileSize: "2.0 MB",
                pageCount: 42,
                ankiCards: [
                  {
                    front:
                      "Name the bones of the proximal row of carpal bones (lateral to medial).",
                    back: "Scaphoid, Lunate, Triquetrum, Pisiform. Mnemonic: Some Lovers Try Positions.",
                  },
                ],
              },
              {
                id: "unipv-anatomy-bianchi-01-sum",
                type: "summary",
                title: "Upper Limb Summary",
                downloadUrl: "#",
                fileSize: "1.4 MB",
                pageCount: 10,
              },
            ],
            relatedContent: [],
          },
        ],
      },
    ],
  },
  {
    id: "sapienza",
    slug: "sapienza-university",
    name: "Sapienza University of Rome",
    shortName: "Sapienza",
    country: "Italy",
    countryCode: "IT",
    city: "Rome",
    coordinates: { lat: 41.9013, lng: 12.5144 },
    websiteUrl: "https://www.uniroma1.it",
    status: "active",
    contributors: [{ name: "Luca" }, { name: "Giulia" }],
    courses: [
      {
        id: "sapienza-pharm-romano",
        slug: "pharmacology-romano",
        name: "Pharmacology",
        subject: "Pharmacology",
        professor: "Prof. Andrea Romano",
        professorTitle: "Associate Professor of Pharmacology",
        year: "2025-2026",
        semester: "Spring",
        lectures: [
          {
            id: "sapienza-pharm-romano-01",
            slug: "pharmacokinetics",
            title: "Pharmacokinetics — ADME",
            number: 1,
            thumbnailUrl: "/images/universities/placeholder-slide.svg",
            description:
              "Absorption, Distribution, Metabolism, and Excretion of drugs.",
            materials: [
              {
                id: "sapienza-pharm-romano-01-fc",
                type: "flashcards",
                title: "Pharmacokinetics Flashcards",
                downloadUrl: "#",
                fileSize: "1.3 MB",
                pageCount: 28,
                ankiCards: [
                  {
                    front: "What does ADME stand for?",
                    back: "Absorption, Distribution, Metabolism, Excretion — the four phases of pharmacokinetics.",
                  },
                  {
                    front: "What is bioavailability?",
                    back: "The fraction of an administered dose of drug that reaches systemic circulation unchanged. IV bioavailability = 100%.",
                  },
                ],
              },
              {
                id: "sapienza-pharm-romano-01-sum",
                type: "summary",
                title: "Pharmacokinetics Summary",
                downloadUrl: "#",
                fileSize: "0.9 MB",
                pageCount: 7,
              },
              {
                id: "sapienza-pharm-romano-01-qb",
                type: "question-bank",
                title: "Pharmacokinetics Questions",
                downloadUrl: "#",
                fileSize: "0.5 MB",
                pageCount: 10,
              },
            ],
            relatedContent: [
              {
                type: "visual",
                id: "vancomycin",
                title: "Vancomycin Visual Lesson",
                url: "/en/resources/visuals/vancomycin",
              },
            ],
          },
          {
            id: "sapienza-pharm-romano-02",
            slug: "pharmacodynamics",
            title: "Pharmacodynamics — Receptors and Dose-Response",
            number: 2,
            thumbnailUrl: "/images/universities/placeholder-slide.svg",
            description:
              "Drug-receptor interactions, agonists, antagonists, and dose-response curves.",
            materials: [
              {
                id: "sapienza-pharm-romano-02-fc",
                type: "flashcards",
                title: "Pharmacodynamics Flashcards",
                downloadUrl: "#",
                fileSize: "1.1 MB",
                pageCount: 22,
                ankiCards: [
                  {
                    front:
                      "What is the difference between efficacy and potency?",
                    back: "Efficacy = maximum effect a drug can produce. Potency = amount of drug needed to produce a given effect (related to EC50). A drug can be potent but have low efficacy.",
                  },
                ],
              },
            ],
            relatedContent: [],
          },
        ],
      },
    ],
  },
  {
    id: "huji",
    slug: "hebrew-university",
    name: "Hebrew University of Jerusalem",
    shortName: "HUJI",
    country: "Israel",
    countryCode: "IL",
    city: "Jerusalem",
    coordinates: { lat: 31.7945, lng: 35.2434 },
    websiteUrl: "https://new.huji.ac.il",
    status: "coming-soon",
    contributors: [],
    courses: [],
  },
  {
    id: "charite",
    slug: "charite-berlin",
    name: "Charité — Universitätsmedizin Berlin",
    shortName: "Charité",
    country: "Germany",
    countryCode: "DE",
    city: "Berlin",
    coordinates: { lat: 52.5256, lng: 13.3779 },
    websiteUrl: "https://www.charite.de",
    status: "coming-soon",
    contributors: [],
    courses: [],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getAllUniversities(): University[] {
  return universities;
}

export function getActiveUniversities(): University[] {
  return universities.filter((u) => u.status === "active");
}

export function getUniversityBySlug(slug: string): University | undefined {
  return universities.find((u) => u.slug === slug);
}

export function getCourseBySlug(
  university: University,
  courseSlug: string,
): Course | undefined {
  return university.courses.find((c) => c.slug === courseSlug);
}

export function getUniversitiesByCountry(): Record<string, University[]> {
  const map: Record<string, University[]> = {};
  for (const u of universities) {
    if (!map[u.countryCode]) map[u.countryCode] = [];
    map[u.countryCode].push(u);
  }
  return map;
}

export function getActiveCountryCodes(): Set<string> {
  return new Set(
    universities.filter((u) => u.status === "active").map((u) => u.countryCode),
  );
}

export function getTotalStats() {
  const active = getActiveUniversities();
  let courses = 0;
  let lectures = 0;
  let materials = 0;
  for (const u of active) {
    courses += u.courses.length;
    for (const c of u.courses) {
      lectures += c.lectures.length;
      for (const l of c.lectures) {
        materials += l.materials.length;
      }
    }
  }
  return {
    universities: active.length,
    courses,
    lectures,
    materials,
  };
}

export function getUniversityStats(university: University) {
  let lectures = 0;
  let materials = 0;
  for (const c of university.courses) {
    lectures += c.lectures.length;
    for (const l of c.lectures) {
      materials += l.materials.length;
    }
  }
  return {
    courses: university.courses.length,
    lectures,
    materials,
  };
}

export function getAllSubjects(university: University): string[] {
  return [...new Set(university.courses.map((c) => c.subject))];
}

export function getAllProfessors(university: University): string[] {
  return [...new Set(university.courses.map((c) => c.professor))];
}
