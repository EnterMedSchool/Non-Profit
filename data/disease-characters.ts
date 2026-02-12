// ─── Disease Characters — "Pokédex" collectible disease characters ───────────
// Each character is a layered visual where every accessory/item encodes a medical fact.
// Reuses FactCategory from visuals.ts for consistency.

import type { FactCategory } from "./visuals";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CharacterRarity = "common" | "uncommon" | "rare" | "legendary";

export interface CharacterItem {
  id: string;
  name: string;
  imagePath: string;
  medicalFact: string;
  factCategory: FactCategory;
  /** Short tooltip shown during character reveal animation */
  revealText: string;
}

export interface DiseaseCharacter {
  id: string;
  /** Links to ClinicalCase.id */
  caseId: string;
  name: string;
  subtitle: string;
  category: string;
  rarity: CharacterRarity;
  baseImagePath: string;
  thumbnailPath: string;
  silhouettePath: string;
  items: CharacterItem[];
  flavorText: string;
  /** Links to existing visual lesson IDs from visuals.ts */
  relatedVisualIds: string[];
  tags: string[];
}

// ─── Rarity Config ──────────────────────────────────────────────────────────

export const rarityConfig: Record<
  CharacterRarity,
  { label: string; color: string; bgColor: string; borderColor: string; glow: string }
> = {
  common: {
    label: "Common",
    color: "text-ink-muted",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    glow: "",
  },
  uncommon: {
    label: "Uncommon",
    color: "text-showcase-green",
    bgColor: "bg-showcase-green/10",
    borderColor: "border-showcase-green",
    glow: "shadow-[0_0_12px_rgba(46,204,113,0.3)]",
  },
  rare: {
    label: "Rare",
    color: "text-showcase-purple",
    bgColor: "bg-showcase-purple/10",
    borderColor: "border-showcase-purple",
    glow: "shadow-[0_0_16px_rgba(108,92,231,0.4)]",
  },
  legendary: {
    label: "Legendary",
    color: "text-showcase-yellow",
    bgColor: "bg-showcase-yellow/10",
    borderColor: "border-showcase-yellow",
    glow: "shadow-[0_0_20px_rgba(255,217,61,0.5)]",
  },
};

// ─── Category Colors (extends visuals categoryColors pattern) ───────────────

export const characterCategoryColors: Record<
  string,
  { bg: string; text: string; border: string; gradient: string }
> = {
  Hematology: {
    bg: "bg-showcase-coral/10",
    text: "text-showcase-coral",
    border: "border-showcase-coral",
    gradient: "from-showcase-coral to-showcase-pink",
  },
  GI: {
    bg: "bg-showcase-green/10",
    text: "text-showcase-green",
    border: "border-showcase-green",
    gradient: "from-showcase-green to-showcase-teal",
  },
  Cardiology: {
    bg: "bg-showcase-purple/10",
    text: "text-showcase-purple",
    border: "border-showcase-purple",
    gradient: "from-showcase-purple to-showcase-blue",
  },
  Pulmonology: {
    bg: "bg-showcase-blue/10",
    text: "text-showcase-blue",
    border: "border-showcase-blue",
    gradient: "from-showcase-blue to-showcase-teal",
  },
  Endocrinology: {
    bg: "bg-showcase-orange/10",
    text: "text-showcase-orange",
    border: "border-showcase-orange",
    gradient: "from-showcase-orange to-showcase-yellow",
  },
  Neurology: {
    bg: "bg-showcase-pink/10",
    text: "text-showcase-pink",
    border: "border-showcase-pink",
    gradient: "from-showcase-pink to-showcase-purple",
  },
};

// ─── Character Data ─────────────────────────────────────────────────────────

export const diseaseCharacters: DiseaseCharacter[] = [
  {
    id: "thalasseus",
    caseId: "beta-thalassemia",
    name: "Thalasseus",
    subtitle: "The Iron Guardian",
    category: "Hematology",
    rarity: "rare",
    baseImagePath: "/clinical-cases/characters/thalasseus/base.png",
    thumbnailPath: "/clinical-cases/characters/thalasseus/thumbnail.png",
    silhouettePath: "/clinical-cases/characters/thalasseus/silhouette.png",
    flavorText:
      "Born of the Mediterranean sea, Thalasseus carries the weight of iron overload on ancient bones. His target shield deflects all but the keenest diagnostic eye.",
    relatedVisualIds: ["anemia-overview"],
    tags: [
      "beta thalassemia",
      "microcytic anemia",
      "hemoglobin electrophoresis",
      "Mediterranean",
      "iron overload",
      "target cells",
    ],
    items: [
      {
        id: "target-shield",
        name: "Target Shield",
        imagePath: "/clinical-cases/characters/thalasseus/item-target-shield.png",
        medicalFact: "Target cells (codocytes) are characteristic on peripheral blood smear",
        factCategory: "diagnostic",
        revealText: "Target cells on smear!",
      },
      {
        id: "iron-chains",
        name: "Iron Chains",
        imagePath: "/clinical-cases/characters/thalasseus/item-iron-chains.png",
        medicalFact:
          "Iron overload occurs from increased intestinal absorption and repeated transfusions",
        factCategory: "pathology",
        revealText: "Iron overload — the silent burden",
      },
      {
        id: "skull-helm",
        name: "Crew-Cut Helm",
        imagePath: "/clinical-cases/characters/thalasseus/item-skull-helm.png",
        medicalFact:
          'Extramedullary hematopoiesis causes "crew-cut" appearance on skull X-ray and frontal bossing',
        factCategory: "diagnostic",
        revealText: "Crew-cut skull on X-ray!",
      },
      {
        id: "mediterranean-cloak",
        name: "Mediterranean Cloak",
        imagePath: "/clinical-cases/characters/thalasseus/item-mediterranean-cloak.png",
        medicalFact:
          "Beta thalassemia is most prevalent in Mediterranean, Middle Eastern, and Southeast Asian populations",
        factCategory: "pathology",
        revealText: "Mediterranean heritage — a key clue",
      },
      {
        id: "electrophoresis-scroll",
        name: "Electrophoresis Scroll",
        imagePath: "/clinical-cases/characters/thalasseus/item-electrophoresis-scroll.png",
        medicalFact:
          "Hemoglobin electrophoresis shows elevated HbA2 (>3.5%) and possibly elevated HbF",
        factCategory: "diagnostic",
        revealText: "HbA2 elevated — diagnosis confirmed!",
      },
      {
        id: "spleen-pendant",
        name: "Spleen Pendant",
        imagePath: "/clinical-cases/characters/thalasseus/item-spleen-pendant.png",
        medicalFact:
          "Splenomegaly develops from extramedullary hematopoiesis and increased red cell destruction",
        factCategory: "symptom",
        revealText: "The swollen spleen speaks volumes",
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getCharacterById(id: string): DiseaseCharacter | undefined {
  return diseaseCharacters.find((c) => c.id === id);
}

export function getCharacterByCaseId(caseId: string): DiseaseCharacter | undefined {
  return diseaseCharacters.find((c) => c.caseId === caseId);
}

export function getCharactersByCategory(category: string): DiseaseCharacter[] {
  return diseaseCharacters.filter((c) => c.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(diseaseCharacters.map((c) => c.category))];
}
