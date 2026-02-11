"use client";

import { useTranslations } from "next-intl";
import { m } from "framer-motion";
import { BookOpen, Wrench, FileText, ArrowRight, Check } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import ChunkyButton from "@/components/shared/ChunkyButton";

export default function ForWhom() {
  const t = useTranslations("forWhom");

  const pillars = [
    {
      key: "resources" as const,
      icon: BookOpen,
      watermarkIcon: BookOpen,
      color: "purple",
      gradient: "from-showcase-purple via-showcase-blue to-showcase-coral",
      borderColor: "border-showcase-purple",
      shadowColor: "shadow-chunky-purple",
      href: "/en/resources",
      accentClass: "text-showcase-purple",
      dotClass: "bg-showcase-purple",
      glowColor: "rgba(108, 92, 231, 0.3)",
      hoverGradient:
        "linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(84, 160, 255, 0.05) 100%)",
    },
    {
      key: "tools" as const,
      icon: Wrench,
      watermarkIcon: Wrench,
      color: "teal",
      gradient: "from-showcase-teal via-showcase-green to-showcase-blue",
      borderColor: "border-showcase-teal",
      shadowColor: "shadow-chunky-teal",
      href: "/en/tools",
      accentClass: "text-showcase-teal",
      dotClass: "bg-showcase-teal",
      glowColor: "rgba(0, 217, 192, 0.3)",
      hoverGradient:
        "linear-gradient(135deg, rgba(0, 217, 192, 0.08) 0%, rgba(46, 204, 113, 0.05) 100%)",
    },
    {
      key: "guides" as const,
      icon: FileText,
      watermarkIcon: FileText,
      color: "orange",
      gradient: "from-showcase-orange via-showcase-yellow to-showcase-pink",
      borderColor: "border-showcase-orange",
      shadowColor: "shadow-chunky",
      href: "/en/for-professors",
      accentClass: "text-showcase-orange",
      dotClass: "bg-showcase-orange",
      glowColor: "rgba(255, 159, 67, 0.3)",
      hoverGradient:
        "linear-gradient(135deg, rgba(255, 159, 67, 0.08) 0%, rgba(255, 217, 61, 0.05) 100%)",
    },
  ];

  return (
    <section className="relative z-10 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="blurIn">
          <SectionHeading
            title={t("title")}
            highlight="Do"
            underlineColor="purple"
          />
        </AnimatedSection>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            const WatermarkIcon = pillar.watermarkIcon;
            const benefits = t.raw(`${pillar.key}.benefits`) as string[];
            return (
              <AnimatedSection
                key={pillar.key}
                delay={i * 0.15}
                animation={i === 0 ? "slideLeft" : i === 1 ? "popIn" : "slideRight"}
                spring
                className="h-full"
              >
                <m.div
                  className="tilt-3d h-full"
                  whileHover={{
                    rotateX: -1,
                    rotateY: i === 0 ? 2 : i === 2 ? -2 : 0,
                    scale: 1.01,
                    transition: { duration: 0.3 },
                  }}
                >
                  <div
                    className={`
                      group relative overflow-hidden rounded-2xl border-3 ${pillar.borderColor}
                      ${pillar.shadowColor} bg-white p-8 h-full flex flex-col
                      transition-all duration-500 hover:-translate-y-2 hover:shadow-chunky-xl
                    `}
                  >
                    {/* Hover glow effect */}
                    <div
                      className="absolute -inset-4 rounded-3xl blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-20"
                      style={{ backgroundColor: pillar.glowColor }}
                      aria-hidden="true"
                    />

                    {/* Gradient tint on hover */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-10"
                      style={{ background: pillar.hoverGradient }}
                    />

                    {/* Large watermark icon */}
                    <WatermarkIcon
                      className={`absolute -right-8 -bottom-8 h-48 w-48 ${pillar.accentClass} opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-[0.15]`}
                      strokeWidth={0.8}
                    />

                    {/* Color accent bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${pillar.gradient} transition-all duration-300 group-hover:h-3`}
                    />

                    <div className="relative z-10 flex flex-col flex-1">
                      <div className="flex items-center gap-4 mb-5">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 border-showcase-navy/20 bg-gradient-to-br ${pillar.gradient} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="font-display text-2xl font-extrabold text-ink-dark">
                          {t(`${pillar.key}.title`)}
                        </h3>
                      </div>

                      <p className="text-ink-muted mb-6 text-base leading-relaxed">
                        {t(`${pillar.key}.description`)}
                      </p>

                      <ul className="space-y-3 mb-8 flex-1">
                        {benefits.map((benefit: string, j: number) => (
                          <m.li
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + j * 0.1, duration: 0.4 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-3 text-sm text-ink-dark"
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${pillar.dotClass} flex-shrink-0 shadow-sm`}
                            >
                              <Check
                                className="h-3 w-3 text-white"
                                strokeWidth={3}
                              />
                            </span>
                            <span className="leading-relaxed">{benefit}</span>
                          </m.li>
                        ))}
                      </ul>

                      <ChunkyButton
                        href={pillar.href}
                        variant={
                          pillar.color === "teal"
                            ? "teal"
                            : pillar.color === "orange"
                              ? "coral"
                              : "primary"
                        }
                        size="md"
                      >
                        {t(`${pillar.key}.cta`)}
                        <ArrowRight className="h-4 w-4" />
                      </ChunkyButton>
                    </div>
                  </div>
                </m.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
