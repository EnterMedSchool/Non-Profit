"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { m } from "framer-motion";
import { BookOpen, Wrench, FileText, ArrowRight, Check } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import ChunkyButton from "@/components/shared/ChunkyButton";

function FlipCard({ pillar, index, t }: { pillar: any; index: number; t: any }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = pillar.icon;
  const WatermarkIcon = pillar.watermarkIcon;
  const benefits = t.raw(`${pillar.key}.benefits`) as string[];

  return (
    <AnimatedSection
      key={pillar.key}
      delay={index * 0.15}
      animation={index === 0 ? "slideLeft" : index === 1 ? "popIn" : "slideRight"}
      spring
      className="h-full [perspective:1000px]"
    >
      <m.div
        className="relative w-full h-[450px] cursor-pointer group"
        onHoverStart={() => setIsFlipped(true)}
        onHoverEnd={() => setIsFlipped(false)}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <m.div
          className="w-full h-full relative [transform-style:preserve-3d]"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* FRONT */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border-3 border-showcase-navy shadow-neo-brutal bg-white p-8 flex flex-col justify-center items-center text-center transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-neo-brutal-lg">
            <WatermarkIcon
              className={`absolute -right-8 -bottom-8 h-48 w-48 ${pillar.accentClass} opacity-[0.05] pointer-events-none`}
              strokeWidth={1}
            />
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-showcase-navy ${pillar.solidBg} mb-6 shadow-neo-brutal`}
            >
              <Icon className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-display text-3xl font-extrabold text-ink-dark mb-4 text-shadow-3d-sm">
              {t(`${pillar.key}.title`)}
            </h3>
            <p className="text-ink-muted text-base leading-relaxed mb-auto font-medium">
              {t(`${pillar.key}.description`)}
            </p>
            <p className="mt-6 text-sm font-bold text-ink-light tracking-widest uppercase flex items-center gap-2 transition-transform duration-300 group-hover:scale-110 group-hover:text-ink-dark">
              Flip to see more <ArrowRight className="h-4 w-4" />
            </p>
          </div>

          {/* BACK */}
          <div
            className={`absolute inset-0 [backface-visibility:hidden] rounded-2xl border-3 border-showcase-navy shadow-neo-brutal p-8 flex flex-col ${pillar.solidBg} transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-neo-brutal-lg`}
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <h4 className="font-display text-2xl font-extrabold text-white mb-6 drop-shadow-md">
                What you get
              </h4>
              <ul className="space-y-4 mb-8">
                {benefits.map((benefit: string, j: number) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-white font-bold drop-shadow-sm"
                  >
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/30 border-2 border-white flex-shrink-0">
                      <Check className="h-3 w-3 text-white" strokeWidth={4} />
                    </span>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <ChunkyButton
              href={pillar.href}
              variant="ghost"
              size="md"
              className="w-full bg-white text-ink-dark hover:bg-pastel-cream relative z-10 border-3 border-showcase-navy shadow-neo-brutal"
            >
              {t(`${pillar.key}.cta`)}
              <ArrowRight className="h-4 w-4" />
            </ChunkyButton>
          </div>
        </m.div>
      </m.div>
    </AnimatedSection>
  );
}

export default function ForWhom() {
  const t = useTranslations("forWhom");
  const locale = useLocale();

  const pillars = [
    {
      key: "resources" as const,
      icon: BookOpen,
      watermarkIcon: BookOpen,
      color: "purple",
      solidBg: "bg-showcase-purple",
      href: `/${locale}/resources`,
      accentClass: "text-showcase-purple",
    },
    {
      key: "tools" as const,
      icon: Wrench,
      watermarkIcon: Wrench,
      color: "teal",
      solidBg: "bg-showcase-teal",
      href: `/${locale}/tools`,
      accentClass: "text-showcase-teal",
    },
    {
      key: "guides" as const,
      icon: FileText,
      watermarkIcon: FileText,
      color: "orange",
      solidBg: "bg-showcase-orange",
      href: `/${locale}/for-professors`,
      accentClass: "text-showcase-orange",
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
          {pillars.map((pillar, i) => (
            <FlipCard key={pillar.key} pillar={pillar} index={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
