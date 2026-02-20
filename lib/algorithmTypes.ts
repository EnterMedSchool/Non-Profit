export interface EducationalContent {
  why: string;
  detail: string;
  keyPoints?: string[];
  references?: string[];
}

export interface AlgorithmNode {
  id: string;
  type: "start" | "question" | "decision" | "action" | "outcome" | "info";
  label: string;
  educationalContent: EducationalContent;
  position?: { x: number; y: number };
}

export interface AlgorithmEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  educationalNote?: string;
}

export interface AlgorithmFAQ {
  question: string;
  answer: string;
}

export interface AlgorithmDefinition {
  id: string;
  i18nKey: string;
  version: string;
  guideline: string;
  nodes: AlgorithmNode[];
  edges: AlgorithmEdge[];
  startNodeId: string;
  faq?: AlgorithmFAQ[];
}

export interface PathEntry {
  nodeId: string;
  edgeId: string | null;
  edgeLabel: string | null;
}
