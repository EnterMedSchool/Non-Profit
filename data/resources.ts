export interface Resource {
  id: string;
  /** i18n key under the "data.resources" namespace, e.g. "anatomyUpperLimb" → data.resources.anatomyUpperLimb.title */
  i18nKey: string;
  language: string;
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
