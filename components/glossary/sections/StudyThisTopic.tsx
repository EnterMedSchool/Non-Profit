import Link from "next/link";
import { BookOpen, HelpCircle, Eye, GraduationCap } from "lucide-react";
import type { CrossContentLinks } from "@/lib/glossary/cross-content";

interface Props {
  links: CrossContentLinks;
  locale: string;
}

export default function StudyThisTopic({ links, locale }: Props) {
  const { visuals, questionDecks, flashcardDecks } = links;
  const hasContent =
    visuals.length > 0 || questionDecks.length > 0 || flashcardDecks.length > 0;

  if (!hasContent) return null;

  return (
    <section id="study-this-topic" className="mt-8">
      <div className="rounded-2xl border-2 border-showcase-purple/15 bg-gradient-to-br from-showcase-purple/5 via-white to-showcase-pink/5 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-showcase-purple" />
          <h2 className="font-display text-lg font-extrabold text-ink-dark">
            Study This Topic
          </h2>
        </div>

        <div className="space-y-4">
          {/* Visual Lessons */}
          {visuals.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="h-3.5 w-3.5 text-showcase-teal" />
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Visual Lessons
                </span>
              </div>
              <div className="space-y-2">
                {visuals.map((v) => (
                  <Link
                    key={v.id}
                    href={`/${locale}/resources/visuals/${v.id}`}
                    className="group flex items-center gap-3 rounded-lg border border-ink-dark/8 bg-white px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-showcase-teal/30"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-showcase-teal/10 text-showcase-teal">
                      <Eye className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-ink-dark group-hover:text-showcase-teal transition-colors truncate block">
                        {v.title}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {v.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Practice Questions */}
          {questionDecks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <HelpCircle className="h-3.5 w-3.5 text-showcase-orange" />
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Practice Questions
                </span>
              </div>
              <div className="space-y-2">
                {questionDecks.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/${locale}/resources/questions/${d.categorySlug}/${d.slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-ink-dark/8 bg-white px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-showcase-orange/30"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-showcase-orange/10 text-showcase-orange">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-ink-dark group-hover:text-showcase-orange transition-colors truncate block">
                        {d.title}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {d.count} questions
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Flashcard Decks */}
          {flashcardDecks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-showcase-pink" />
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                  Flashcard Decks
                </span>
              </div>
              <div className="space-y-2">
                {flashcardDecks.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/${locale}/resources/flashcards/${d.categorySlug}/${d.slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-ink-dark/8 bg-white px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-showcase-pink/30"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-showcase-pink/10 text-showcase-pink">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-ink-dark group-hover:text-showcase-pink transition-colors truncate block">
                        {d.title}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {d.count} cards
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
