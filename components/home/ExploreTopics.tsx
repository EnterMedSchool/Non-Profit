import Link from "next/link";
import { glossaryCategories, glossaryStats } from "@/data/glossary-terms";
import SectionHeading from "@/components/shared/SectionHeading";

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
        <SectionHeading
          title={`Explore ${glossaryStats.totalTerms}+ Medical Terms`}
          highlight="Medical Terms"
          underlineColor="purple"
          subtitle="Browse our comprehensive medical glossary covering anatomy, pharmacology, pathology, cardiology, and more. Every definition is free, detailed, and designed for students and educators."
        />

        {/* Category grid — each link points to a glossary category page */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {topCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/resources/glossary/category/${category.id}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-showcase-navy/10 bg-white/70 px-4 py-5 text-center transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-md"
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-ink-muted">
                {category.count} terms
              </span>
            </Link>
          ))}
        </div>

        {/* CTA link to full glossary */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/resources/glossary`}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-showcase-purple bg-showcase-purple/5 px-6 py-3 font-display text-sm font-bold text-showcase-purple transition-all hover:bg-showcase-purple hover:text-white"
          >
            Browse All {glossaryStats.totalTerms} Medical Terms
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* SEO text block — crawlable paragraph with internal links */}
        <div className="mt-10 rounded-2xl border-2 border-showcase-navy/10 bg-white/60 p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-ink-dark">
            Free Medical Education Resources for Students &amp; Educators
          </h3>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            EnterMedSchool.org provides completely free, open-source medical education resources.
            Our{" "}
            <Link href={`/${locale}/resources/glossary`} className="font-semibold text-showcase-purple hover:underline">
              medical glossary
            </Link>{" "}
            includes {glossaryStats.totalTerms}+ terms with definitions, mnemonics, clinical cases, and study guides.
            Use our{" "}
            <Link href={`/${locale}/tools`} className="font-semibold text-showcase-teal hover:underline">
              free medical tools
            </Link>{" "}
            — including a flashcard maker, MCQ generator, illustration creator, and LaTeX editor — to build
            study materials. Explore{" "}
            <Link href={`/${locale}/resources/visuals`} className="font-semibold text-showcase-purple hover:underline">
              interactive visual lessons
            </Link>{" "}
            on topics like achalasia, IBD, anemia, and pharmacology. Download{" "}
            <Link href={`/${locale}/resources/pdfs`} className="font-semibold text-showcase-teal hover:underline">
              free medical textbooks
            </Link>{" "}
            and browse our{" "}
            <Link href={`/${locale}/resources/media`} className="font-semibold text-showcase-purple hover:underline">
              CC-licensed medical illustrations
            </Link>{" "}
            for your lectures, presentations, and study notes. Everything is free to use with attribution.
          </p>
        </div>
      </div>
    </section>
  );
}
