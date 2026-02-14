"use client";

import { useTranslations } from "next-intl";
import { Shield, FileCheck, Heart, Stethoscope, BookOpen, Brain } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

export default function MissionStatement() {
  const t = useTranslations("mission");

  const badges = [
    { key: "nonCommercial", icon: Shield, color: "bg-showcase-green/10 text-showcase-green border-showcase-green", glow: "hover:shadow-[0_0_16px_rgba(46,204,113,0.25)]" },
    { key: "attribution", icon: FileCheck, color: "bg-showcase-teal/10 text-showcase-teal border-showcase-teal", glow: "hover:shadow-[0_0_16px_rgba(0,217,192,0.25)]" },
    { key: "freeForever", icon: Heart, color: "bg-showcase-purple/10 text-showcase-purple border-showcase-purple", glow: "hover:shadow-[0_0_16px_rgba(108,92,231,0.25)]" },
  ];

  return (
    <section className="relative z-10 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="scaleIn" spring>
          {/* Gradient border wrapper */}
          <div className="relative rounded-3xl p-[3px] bg-gradient-to-br from-showcase-purple via-showcase-teal to-showcase-green shadow-chunky-lg">
            <div className="rounded-[calc(1.5rem-3px)] bg-white p-8 sm:p-12 md:p-16 text-center relative overflow-hidden pattern-dots">

              {/* Floating decorative icons — hidden on mobile */}
              <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
                <Stethoscope className="absolute left-[6%] top-[18%] h-10 w-10 text-showcase-purple/[0.08] animate-float-gentle" style={{ transform: "rotate(-15deg)" }} />
                <BookOpen className="absolute right-[8%] top-[12%] h-9 w-9 text-showcase-teal/[0.08] animate-float-playful" style={{ animationDelay: "1.2s", transform: "rotate(10deg)" }} />
                <Brain className="absolute left-[10%] bottom-[15%] h-8 w-8 text-showcase-pink/[0.08] animate-float-gentle" style={{ animationDelay: "0.6s", transform: "rotate(12deg)" }} />
                <Heart className="absolute right-[10%] bottom-[18%] h-7 w-7 text-showcase-green/[0.06] animate-float-playful" style={{ animationDelay: "2s", transform: "rotate(-8deg)" }} />
              </div>

              {/* Decorative giant quote marks — enhanced opacity */}
              <span className="absolute top-4 start-6 font-display text-[120px] leading-none bg-gradient-to-br from-showcase-purple/[0.18] to-showcase-teal/[0.12] bg-clip-text text-transparent select-none pointer-events-none sm:text-[160px] sm:top-2 sm:start-10" aria-hidden="true">
                &ldquo;
              </span>
              <span className="absolute bottom-0 end-6 font-display text-[120px] leading-none bg-gradient-to-br from-showcase-teal/[0.12] to-showcase-purple/[0.18] bg-clip-text text-transparent select-none pointer-events-none sm:text-[160px] sm:end-10" aria-hidden="true">
                &rdquo;
              </span>

              {/* Section heading for document outline */}
              <h2 className="sr-only">{t("sectionTitle")}</h2>

              {/* Quote */}
              <blockquote className="relative z-10">
                <p className="font-display text-2xl font-extrabold leading-snug text-ink-dark sm:text-3xl md:text-4xl">
                  &ldquo;{t("quote")}&rdquo;
                </p>
              </blockquote>

              <p className="relative z-10 mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-ink-muted">
                {t("description")}
              </p>

              {/* .org / .com relationship — chunky card style */}
              <div className="relative z-10 mt-6 mx-auto max-w-2xl rounded-2xl border-3 border-showcase-teal/30 bg-showcase-teal/5 px-6 py-4 shadow-chunky-sm">
                <p className="text-base leading-relaxed text-ink-muted">
                  {t("relationship")}
                </p>
              </div>

              {/* Trust badges — enhanced with glow on hover */}
              <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.key}
                      className={`inline-flex items-center gap-2 rounded-full border-2 ${badge.color} px-4 py-2 text-sm font-bold transition-all duration-300 hover:scale-105 ${badge.glow}`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(`badges.${badge.key}`)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
