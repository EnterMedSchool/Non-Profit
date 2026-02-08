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

export const resources: Resource[] = [
  // Questions
  { id: "q1", title: "Cardiology Clinical Cases", description: "50 clinical cases covering heart failure, arrhythmias, valvular diseases, and acute coronary syndromes.", category: "questions", badge: "Free", badgeColor: "green" },
  { id: "q2", title: "Pharmacology MCQs", description: "200 multiple-choice questions on drug mechanisms, interactions, and clinical applications.", category: "questions", badge: "Free", badgeColor: "green" },
  { id: "q3", title: "Anatomy Identification Quiz", description: "Interactive anatomy identification exercises with detailed explanations.", category: "questions", badge: "Free", badgeColor: "green" },
  { id: "q4", title: "Pathology Case Studies", description: "30 pathology cases with histological images and diagnostic reasoning.", category: "questions", badge: "Free", badgeColor: "green" },

  // Videos
  { id: "v1", title: "Understanding ECG Basics", description: "Step-by-step guide to reading and interpreting ECGs for beginners.", category: "videos", badge: "Free", badgeColor: "green" },
  { id: "v2", title: "Neuroanatomy Essentials", description: "Visual walkthrough of key neuroanatomical structures and pathways.", category: "videos", badge: "Free", badgeColor: "green" },
  { id: "v3", title: "Pharmacology: Drug Classes", description: "Overview of major drug classes, mechanisms, and clinical uses.", category: "videos", badge: "Free", badgeColor: "green" },

  // PDFs
  { id: "p1", title: "Biochemistry Summary Sheet", description: "Concise 10-page summary of key biochemistry pathways and enzymes.", category: "pdfs", badge: "Download", badgeColor: "teal" },
  { id: "p2", title: "Physiology Quick Reference", description: "Essential physiology concepts in a printable reference format.", category: "pdfs", badge: "Download", badgeColor: "teal" },
  { id: "p3", title: "Microbiology Study Guide", description: "Comprehensive guide covering bacteria, viruses, fungi, and parasites.", category: "pdfs", badge: "Download", badgeColor: "teal" },

  // Visuals
  { id: "vis1", title: "Heart Anatomy Diagram", description: "Detailed labeled diagram of cardiac anatomy including chambers, valves, and vessels.", category: "visuals", badge: "Open Source", badgeColor: "purple" },
  { id: "vis2", title: "Cranial Nerves Poster", description: "Visual summary of all 12 cranial nerves with functions and clinical correlations.", category: "visuals", badge: "Open Source", badgeColor: "purple" },
  { id: "vis3", title: "Blood Cell Morphology", description: "High-quality illustrations of normal and abnormal blood cell types.", category: "visuals", badge: "Open Source", badgeColor: "purple" },
];
