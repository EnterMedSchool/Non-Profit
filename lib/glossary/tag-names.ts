/* ─────────────────────────────────────────────────────────────────
 *  Tag Display Names — Pure utility (no Node.js / fs dependency).
 *  Safe to import from both server AND client components.
 * ────────────────────────────────────────────────────────────────── */

export const TAG_DISPLAY_NAMES: Record<string, string> = {
  anatomy: "Anatomy",
  histology: "Histology",
  physiology: "Physiology",
  biochemistry: "Biochemistry",
  biology: "Biology",
  genetics: "Genetics",
  cell_bio: "Cell Biology",
  pharmacology: "Pharmacology",
  toxicology: "Toxicology",
  micro_bacteria: "Microbiology — Bacteria",
  micro_virus: "Microbiology — Viruses",
  micro_fungi: "Microbiology — Fungi",
  micro_parasite: "Microbiology — Parasites",
  immunology: "Immunology",
  pathology: "Pathology",
  heme_onc: "Hematology & Oncology",
  neuro: "Neurology",
  cardio: "Cardiology",
  pulm: "Pulmonology",
  renal: "Nephrology",
  gi: "Gastroenterology",
  endo: "Endocrinology",
  endocrine: "Endocrinology",
  repro: "Reproductive Medicine",
  msk_derm: "Musculoskeletal & Dermatology",
  peds: "Pediatrics",
  obgyn: "Obstetrics & Gynecology",
  surgery: "Surgery",
  emerg: "Emergency Medicine",
  radiology: "Radiology",
  psych: "Psychiatry",
  behavior: "Behavioral Science",
  epi_stats: "Epidemiology & Biostatistics",
  ethics: "Medical Ethics",
  infectious_dz: "Infectious Disease",
  rheum: "Rheumatology",
  pulmonology: "Pulmonology",
  oncology: "Oncology",
  ophtho: "Ophthalmology",
  ENT: "ENT (Ear, Nose & Throat)",
};

export function getTagDisplayName(tagId: string): string {
  return (
    TAG_DISPLAY_NAMES[tagId] ||
    tagId
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
