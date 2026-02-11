export interface TimelineMilestone {
  /** i18n key under "timeline.milestones", e.g. "2019" → timeline.milestones.2019.title */
  i18nKey: string;
  year: string;
  title: string;
  description: string;
  color: "purple" | "teal" | "yellow" | "coral" | "green";
}

export const milestones: TimelineMilestone[] = [
  {
    i18nKey: "2019",
    year: "2019",
    title: "EnterMedSchool is Born",
    description:
      "Ari Horesh creates EnterMedSchool as a forum for IMAT exam students to help each other study and share resources.",
    color: "purple",
  },
  {
    i18nKey: "2020",
    year: "2020",
    title: "Free Content Begins",
    description:
      "Ari starts releasing free educational content, collaborating with OpenStax materials to provide quality open-source study resources.",
    color: "teal",
  },
  {
    i18nKey: "2021",
    year: "2021",
    title: "World's Leading IMAT Course",
    description:
      "Launch of paid IMAT courses, becoming the world's leading course for international students. Revenue funds the creation of free resources for everyone.",
    color: "yellow",
  },
  {
    i18nKey: "2025",
    year: "2025",
    title: "The New Generation",
    description:
      "Expanding to medical students, connecting with professors and doctors worldwide to verify and create content. Releasing everything for free.",
    color: "coral",
  },
  {
    i18nKey: "2026",
    year: "2026",
    title: "Open Source Goes Official",
    description:
      "Launch of EnterMedSchool.org, our Anki addon, Chrome extension, and a wave of open-source resources. The goal was always to fund this project — and we finally did it.",
    color: "green",
  },
];
