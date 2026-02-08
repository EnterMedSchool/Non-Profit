/** Core flashcard data parsed from CSV/TSV */
export interface FlashcardCard {
  id: string;
  front: string;
  back: string;
  mediaUrl?: string;
  themeOverride?: Partial<FlashcardTheme>;
}

/** Visual theme applied to cards */
export interface FlashcardTheme {
  backgroundId: string | null;
  fontFamily: string;
  frontFontSize: number;
  backFontSize: number;
  textColor: string;
  borderStyle: "none" | "solid" | "dashed" | "dotted";
  borderColor: string;
  borderWidth: number;
  decorations: DecorationPlacement[];
}

/** A decoration placed on the card */
export interface DecorationPlacement {
  assetId: string;
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  scale: number;
}

/** PDF export settings */
export interface ExportSettings {
  paperSize: "a4" | "letter";
  layoutMode: "fold" | "duplex";
  cardsPerPage: 2 | 4 | 6 | 8;
  showCutLines: boolean;
  showFoldLines: boolean;
  showCardNumbers: boolean;
  pageTitle: string;
  filename: string;
}

/** Column mapping from imported file */
export interface ColumnMapping {
  front: string;
  back: string;
  media?: string;
}

/** Default theme */
export const DEFAULT_THEME: FlashcardTheme = {
  backgroundId: null,
  fontFamily: "DM Sans",
  frontFontSize: 18,
  backFontSize: 14,
  textColor: "#1a1a2e",
  borderStyle: "solid",
  borderColor: "#1a1a2e",
  borderWidth: 2,
  decorations: [],
};

/** Default export settings */
export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  paperSize: "a4",
  layoutMode: "fold",
  cardsPerPage: 4,
  showCutLines: true,
  showFoldLines: true,
  showCardNumbers: false,
  pageTitle: "",
  filename: "flashcards",
};
