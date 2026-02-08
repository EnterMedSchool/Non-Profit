"use client";

import { useTranslations } from "next-intl";
import { Shield, FileCheck, Heart } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

export default function MissionStatement() {
  const t = useTranslations("mission");

  const badges = [
    { key: "nonCommercial", icon: Shield, color: "bg-showcase-green/10 text-showcase-green border-showcase-green" },
    { key: "attribution", icon: FileCheck, color: "bg-showcase-teal/10 text-showcase-teal border-showcase-teal" },
    { key: "freeForever", icon: Heart, color: "bg-showcase-purple/10 text-showcase-purple border-showcase-purple" },
  ];

  return (
    <section className="relative z-10 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="scaleIn" spring>
          {/* Gradient border wrapper */}
          <div className="relative rounded-3xl p-[3px] bg-gradient-to-br from-showcase-purple via-showcase-teal to-showcase-green shadow-chunky-lg">
            <div className="rounded-[calc(1.5rem-3px)] bg-white p-8 sm:p-12 md:p-16 text-center relative overflow-hidden pattern-dots">
              {/* Decorative giant quote marks */}
              <span className="absolute top-4 left-6 font-display text-[120px] leading-none text-showcase-purple/[0.12] select-none pointer-events-none sm:text-[160px] sm:top-2 sm:left-10" aria-hidden="true">
                &ldquo;
              </span>
              <span className="absolute bottom-0 right-6 font-display text-[120px] leading-none text-showcase-purple/[0.12] select-none pointer-events-none sm:text-[160px] sm:right-10" aria-hidden="true">
                &rdquo;
              </span>

              {/* Quote */}
              <blockquote className="relative z-10">
                <p className="font-display text-2xl font-extrabold leading-snug text-ink-dark sm:text-3xl md:text-4xl">
                  &ldquo;{t("quote")}&rdquo;
                </p>
              </blockquote>

              <p className="relative z-10 mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-ink-muted">
                {t("description")}
              </p>

              {/* .org / .com relationship */}
              <div className="relative z-10 mt-6 mx-auto max-w-2xl rounded-2xl border-2 border-dashed border-showcase-teal/40 bg-showcase-teal/5 px-6 py-4">
                <p className="text-base leading-relaxed text-ink-muted">
                  {t("relationship")}
                </p>
              </div>

              {/* Trust badges */}
              <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.key}
                      className={`inline-flex items-center gap-2 rounded-full border-2 ${badge.color} px-4 py-2 text-sm font-bold transition-transform duration-300 hover:scale-105`}
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
