"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { m, useScroll, useTransform } from "framer-motion";
import { MessageCircle, BookOpen, GraduationCap, Rocket, Globe } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { milestones } from "@/data/timeline";

const dotColors: Record<string, string> = {
  purple: "bg-showcase-purple",
  teal: "bg-showcase-teal",
  yellow: "bg-showcase-yellow",
  coral: "bg-showcase-coral",
  green: "bg-showcase-green",
};

const borderColors: Record<string, string> = {
  purple: "border-showcase-purple",
  teal: "border-showcase-teal",
  yellow: "border-showcase-yellow",
  coral: "border-showcase-coral",
  green: "border-showcase-green",
};

const shadowColors: Record<string, string> = {
  purple: "shadow-chunky-purple",
  teal: "shadow-chunky-teal",
  yellow: "shadow-chunky-yellow",
  coral: "shadow-chunky-coral",
  green: "shadow-chunky-green",
};

const pillBgColors: Record<string, string> = {
  purple: "bg-showcase-purple/10 text-showcase-purple",
  teal: "bg-showcase-teal/10 text-showcase-teal",
  yellow: "bg-showcase-yellow/20 text-showcase-orange",
  coral: "bg-showcase-coral/10 text-showcase-coral",
  green: "bg-showcase-green/10 text-showcase-green",
};

const milestoneIcons: Record<string, React.ElementType> = {
  "2019": MessageCircle,
  "2020": BookOpen,
  "2021": GraduationCap,
  "2025": Rocket,
  "2026": Globe,
};

export default function ProjectTimeline() {
  const t = useTranslations("timeline");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <section className="relative z-10 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="blurIn">
          <SectionHeading
            title={t("title")}
            highlight="Journey"
            underlineColor="yellow"
            subtitle={t("subtitle")}
          />
        </AnimatedSection>

        {/* Timeline */}
        <div className="relative mt-10" ref={containerRef}>
          {/* Static background line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-showcase-navy/10 sm:left-1/2 sm:-translate-x-0.5" />

          {/* Animated drawing line */}
          <m.div
            className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-showcase-purple via-showcase-teal to-showcase-green origin-top sm:left-1/2 sm:-translate-x-0.5"
            style={{ scaleY: lineScaleY }}
          />

          {milestones.map((milestone, i) => {
            const MilestoneIcon = milestoneIcons[milestone.year] || Globe;
            return (
              <AnimatedSection
                key={milestone.year}
                delay={i * 0.12}
                animation={i % 2 === 0 ? "slideLeft" : "slideRight"}
                spring
                className="relative mb-10 last:mb-0"
              >
                <div className={`flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                  {/* Content card */}
                  <div className={`flex-1 pl-14 sm:pl-0 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                    <div
                      className={`rounded-2xl border-3 ${borderColors[milestone.color]} bg-white p-5 ${shadowColors[milestone.color]} transition-all duration-300 hover:-translate-y-1`}
                    >
                      <div className={`flex items-center gap-2 ${i % 2 === 0 ? "sm:justify-end" : ""}`}>
                        <MilestoneIcon className={`h-4 w-4 ${milestone.color === "yellow" ? "text-showcase-orange" : `text-showcase-${milestone.color}`}`} />
                        <span
                          className={`inline-block rounded-full px-3 py-0.5 font-handwritten text-xl font-bold ${pillBgColors[milestone.color]}`}
                          style={{ transform: `rotate(${i % 2 === 0 ? "-1.5" : "1.5"}deg)` }}
                        >
                          {milestone.year}
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink-dark">
                        {milestone.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Dot with pulse ring */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="relative">
                      <div className={`h-4 w-4 rounded-full border-3 border-white ${dotColors[milestone.color]} z-10 relative`} />
                      <div className={`absolute inset-0 rounded-full ${dotColors[milestone.color]} animate-pulse-ring`} />
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden flex-1 sm:block" />
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
