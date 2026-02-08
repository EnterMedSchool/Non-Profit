import MCQMaker from "@/components/tools/mcq-maker";

/**
 * Full-screen MCQ maker tool.
 * No layout chrome — the tool takes over the entire viewport (like /create and /flashcards).
 */
export default function MCQPage() {
  return <MCQMaker />;
}
