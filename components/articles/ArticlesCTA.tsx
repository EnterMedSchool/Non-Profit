import { BookOpen, Wrench } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";
import AnimatedSection from "@/components/shared/AnimatedSection";

interface ArticlesCTAProps {
  locale: string;
}

export default function ArticlesCTA({ locale }: ArticlesCTAProps) {
  return (
    <AnimatedSection animation="fadeUp">
      <div className="relative overflow-hidden rounded-2xl border-3 border-showcase-navy shadow-chunky">
        {/* Gradient background */}
        <div className="relative bg-gradient-to-br from-showcase-purple via-showcase-blue to-showcase-teal px-6 py-10 sm:px-10 sm:py-14">
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Explore 450+ free medical terms, tools & visual lessons
            </h2>
            <p className="mt-3 text-base text-white/80">
              Everything you need to study medicine, completely free and open-source.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ChunkyButton
                href={`/${locale}/resources/glossary`}
                variant="yellow"
                size="lg"
              >
                <BookOpen className="h-5 w-5" />
                Browse Glossary
              </ChunkyButton>
              <ChunkyButton
                href={`/${locale}/tools`}
                variant="ghost"
                size="lg"
                className="!border-white/30 !text-white hover:!bg-white/10"
              >
                <Wrench className="h-5 w-5" />
                Try Our Tools
              </ChunkyButton>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
