"use client";

import { useTranslations } from "next-intl";
import { BookOpen, GraduationCap, ArrowRight, Check } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import ChunkyButton from "@/components/shared/ChunkyButton";

export default function ForWhom() {
  const t = useTranslations("forWhom");

  const personas = [
    {
      key: "students" as const,
      icon: BookOpen,
      watermarkIcon: BookOpen,
      color: "teal",
      bgClass: "bg-pastel-mint",
      borderColor: "border-showcase-teal",
      shadowColor: "shadow-chunky-teal",
      href: "/en/for-students",
      accentClass: "text-showcase-teal",
      dotClass: "bg-showcase-teal",
      glowColor: "rgba(0, 217, 192, 0.25)",
    },
    {
      key: "professors" as const,
      icon: GraduationCap,
      watermarkIcon: GraduationCap,
      color: "purple",
      bgClass: "bg-pastel-lavender",
      borderColor: "border-showcase-purple",
      shadowColor: "shadow-chunky-purple",
      href: "/en/for-professors",
      accentClass: "text-showcase-purple",
      dotClass: "bg-showcase-purple",
      glowColor: "rgba(108, 92, 231, 0.25)",
    },
  ];

  return (
    <section className="relative z-10 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="blurIn">
          <SectionHeading
            title={t("title")}
            highlight="You"
            underlineColor="purple"
          />
        </AnimatedSection>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {personas.map((persona, i) => {
            const Icon = persona.icon;
            const WatermarkIcon = persona.watermarkIcon;
            const benefits = t.raw(`${persona.key}.benefits`) as string[];
            return (
              <AnimatedSection
                key={persona.key}
                delay={i * 0.15}
                animation={i === 0 ? "slideLeft" : "slideRight"}
                spring
                className="h-full"
              >
                <div
                  className={`
                    group relative overflow-hidden rounded-2xl border-3 ${persona.borderColor}
                    ${persona.shadowColor} glass p-8 h-full flex flex-col
                    transition-all duration-500 hover:-translate-y-2
                  `}
                  style={{
                    perspective: "800px",
                  }}
                >
                  {/* Hover glow effect */}
                  <div
                    className="absolute -inset-3 rounded-3xl blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-20"
                    style={{ backgroundColor: persona.glowColor }}
                    aria-hidden="true"
                  />

                  {/* Pastel tint behind glass */}
                  <div className={`absolute inset-0 ${persona.bgClass} -z-10`} />

                  {/* Large watermark icon */}
                  <WatermarkIcon
                    className={`absolute -right-6 -bottom-6 h-40 w-40 ${persona.accentClass} opacity-[0.10] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:opacity-[0.15]`}
                    strokeWidth={1}
                  />

                  {/* Color accent bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-2 ${
                      persona.color === "teal" ? "bg-showcase-teal" : "bg-showcase-purple"
                    }`}
                  />

                  <div className="relative z-10 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-showcase-navy/20 bg-white transition-transform duration-300 group-hover:scale-110">
                        <Icon className={`h-6 w-6 ${persona.accentClass}`} />
                      </div>
                      <h3 className="font-display text-2xl font-extrabold text-ink-dark">
                        {t(`${persona.key}.title`)}
                      </h3>
                    </div>

                    <p className="text-ink-muted mb-5">
                      {t(`${persona.key}.description`)}
                    </p>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {benefits.map((benefit: string, j: number) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-ink-dark">
                          <span className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${persona.dotClass} flex-shrink-0`}>
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <ChunkyButton
                      href={persona.href}
                      variant={persona.color === "teal" ? "teal" : "primary"}
                      size="md"
                    >
                      {t(`${persona.key}.cta`)}
                      <ArrowRight className="h-4 w-4" />
                    </ChunkyButton>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
