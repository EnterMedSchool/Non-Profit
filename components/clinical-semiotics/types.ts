export type CaseVideoAsset =
  | {
      kind: "placeholder";
      label?: string;
      description?: string;
    }
  | {
      kind: "remote";
      src: string;
      thumbnail?: string;
    }
  | {
      kind: "static";
      src: string;
      thumbnail?: string;
    };

export type CaseChoice = {
  id: string;
  label: string;
  next: string;
  description?: string;
  rationale?: string;
};

export type CaseNode = {
  id: string;
  title?: string;
  description?: string;
  asset: CaseVideoAsset;
  prompt?: string;
  choices: CaseChoice[];
  autoAdvance?: {
    next: string;
    afterMs: number;
  };
};

export type CaseManifest = {
  id: string;
  title: string;
  chiefComplaint: string;
  summary: string;
  languageLevel: "A2" | "B1" | "B2" | "C1";
  skills: string[];
  estimatedDurationMinutes: number;
  startNodeId: string;
  nodes: Record<string, CaseNode>;
};

export type PatientCard = {
  id: string;
  name: string;
  age: number;
  setting: string;
  manifest: CaseManifest;
};
