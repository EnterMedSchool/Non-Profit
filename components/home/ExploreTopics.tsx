import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { glossaryCategories, glossaryStats } from "@/data/glossary-terms";
import SectionHeading from "@/components/shared/SectionHeading";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyButton from "@/components/shared/ChunkyButton";

/* ── Category color map for gradient tints ─────────────────────────── */

const CATEGORY_TINTS: Record<string, string> = {
  anatomy: "from-showcase-blue/8 to-showcase-purple/5",
  cardiology: "from-showcase-coral/8 to-showcase-pink/5",
  pharmacology: "from-showcase-green/8 to-showcase-teal/5",
  pathology: "from-showcase-pink/8 to-showcase-coral/5",
  neurology: "from-showcase-purple/8 to-showcase-blue/5",
  hematology: "from-showcase-coral/8 to-showcase-orange/5",
  gastroenterology: "from-showcase-teal/8 to-showcase-green/5",
  endocrinology: "from-showcase-yellow/8 to-showcase-orange/5",
  immunology: "from-showcase-blue/8 to-showcase-teal/5",
  nephrology: "from-showcase-purple/8 to-showcase-pink/5",
  pulmonology: "from-showcase-teal/8 to-showcase-blue/5",
  oncology: "from-showcase-orange/8 to-showcase-coral/5",
};

const DEFAULT_TINT = "from-pastel-lavender/30 to-white";

/**
 * SEO-critical homepage section: adds crawlable text + internal links
 * to glossary categories and key resource pages. This gives Google
 * a textual summary of what the site offers and distributes link
 * equity to deep content pages.
 */
export default function ExploreTopics({ locale }: { locale: string }) {
  // Top 12 categories by term count for the grid
  const topCategories = [...glossaryCategories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <section className="relative z-10 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="blurIn">
          <SectionHeading
            title={`Explore ${glossaryStats.totalTerms}+ Medical Terms`}
            highlight="Medical Terms"
            underlineColor="purple"
            subtitle="Browse our comprehensive medical glossary covering anatomy, pharmacology, pathology, cardiology, and more. Every definition is free, detailed, and designed for students and educators."
          />
        </AnimatedSection>

        {/* Category grid — each link points to a glossary category page */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {topCategories.map((category, i) => {
            const tint = CATEGORY_TINTS[category.id] || DEFAULT_TINT;
            return (
              <AnimatedSection key={category.id} delay={i * 0.04} animation="fadeUp">
                <Link
                  href={`/${locale}/resources/glossary/category/${category.id}`}
                  className={`group flex h-full flex-col items-center gap-2.5 rounded-2xl border-3 border-showcase-navy bg-gradient-to-br ${tint} px-4 py-5 text-center shadow-chunky-sm transition-all hover:-translate-y-1 hover:shadow-chunky`}
                >
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                    {category.icon}
                  </span>
                  <span className="font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
                    {category.name}
                  </span>
                  <span className="rounded-full bg-showcase-navy/5 px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                    {category.count} terms
                  </span>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        {/* CTA button */}
        <AnimatedSection animation="fadeUp" delay={0.5}>
          <div className="mt-8 text-center">
            <ChunkyButton
              href={`/${locale}/resources/glossary`}
              variant="primary"
              size="lg"
            >
              <BookOpen className="h-5 w-5" />
              Browse All {glossaryStats.totalTerms} Medical Terms
              <ArrowRight className="h-4 w-4" />
            </ChunkyButton>
          </div>
        </AnimatedSection>

        {/* SEO text block — crawlable paragraph with internal links */}
        <AnimatedSection animation="fadeUp" delay={0.6}>
          <div className="mt-10 relative overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky">
            {/* Gradient accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green" />

            {/* Pattern overlay */}
            <div className="pattern-dots absolute inset-0 pointer-events-none" aria-hidden="true" />

            <div className="relative z-10 p-6 sm:p-8">
              <h3 className="font-display text-lg font-bold text-ink-dark">
                Free Medical Education Resources for Students &amp; Educators
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">
                EnterMedSchool.org provides completely free, open-source medical education resources.
                Our{" "}
                <Link href={`/${locale}/resources/glossary`} className="font-semibold text-showcase-purple underline-offset-2 decoration-showcase-purple/30 hover:decoration-showcase-purple underline">
                  medical glossary
                </Link>{" "}
                includes {glossaryStats.totalTerms}+ terms with definitions, mnemonics, clinical cases, and study guides.
                Use our{" "}
                <Link href={`/${locale}/tools`} className="font-semibold text-showcase-teal underline-offset-2 decoration-showcase-teal/30 hover:decoration-showcase-teal underline">
                  free medical tools
                </Link>{" "}
                — including a flashcard maker, MCQ generator, illustration creator, and LaTeX editor — to build
                study materials. Explore{" "}
                <Link href={`/${locale}/resources/visuals`} className="font-semibold text-showcase-purple underline-offset-2 decoration-showcase-purple/30 hover:decoration-showcase-purple underline">
                  interactive visual lessons
                </Link>{" "}
                on topics like achalasia, IBD, anemia, and pharmacology. Download{" "}
                <Link href={`/${locale}/resources/pdfs`} className="font-semibold text-showcase-teal underline-offset-2 decoration-showcase-teal/30 hover:decoration-showcase-teal underline">
                  free medical textbooks
                </Link>{" "}
                and browse our{" "}
                <Link href={`/${locale}/resources/media`} className="font-semibold text-showcase-purple underline-offset-2 decoration-showcase-purple/30 hover:decoration-showcase-purple underline">
                  CC-licensed medical illustrations
                </Link>{" "}
                for your lectures, presentations, and study notes. Everything is free to use with attribution.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
