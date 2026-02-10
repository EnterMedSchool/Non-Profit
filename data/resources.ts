export interface Resource {
  id: string;
  title: string;
  description: string;
  category: "questions" | "videos" | "pdfs" | "visuals";
  badge: string;
  badgeColor: "green" | "teal" | "purple" | "orange";
  downloadUrl?: string;
  sourceUrl?: string;
  previewUrl?: string;
}

export const resources: Resource[] = [];
