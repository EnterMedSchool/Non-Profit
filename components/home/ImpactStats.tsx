"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, Globe, Wrench, GraduationCap } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";

function useCountUp(target: number, isInView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return count;
}

const stats = [
  {
    key: "resources",
    value: 500,
    suffix: "+",
    icon: BookOpen,
    fillClass: "bg-showcase-pink",
    textColor: "text-showcase-pink",
    percent: 85,
  },
  {
    key: "countries",
    value: 80,
    suffix: "+",
    icon: Globe,
    fillClass: "bg-showcase-teal",
    textColor: "text-showcase-teal",
    percent: 75,
  },
  {
    key: "tools",
    value: 25,
    suffix: "+",
    icon: Wrench,
    fillClass: "bg-showcase-yellow",
    textColor: "text-showcase-orange", // using orange text for yellow fill for better contrast
    percent: 50,
  },
  {
    key: "educators",
    value: 200,
    suffix: "+",
    icon: GraduationCap,
    fillClass: "bg-showcase-green",
    textColor: "text-showcase-green",
    percent: 65,
  },
];

/* CSS-animated sparkle particles */
const darkSparkles = Array.from({ length: 8 }, (_, i) => ({
  left: `${5 + i * 12}%`,
  delay: i * 0.6,
  duration: 4 + (i % 4),
  size: 2 + (i % 3) * 1.5,
}));

function DarkSectionSparkles() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {darkSparkles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-float-gentle border-2 border-showcase-navy"
          style={{
            left: p.left,
            bottom: "-5%",
            width: p.size * 4,
            height: p.size * 4,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function BeakerGauge({
  percent,
  fillClass,
  isInView,
}: {
  percent: number;
  fillClass: string;
  isInView: boolean;
}) {
  return (
    <div className="absolute inset-0 w-full h-full rounded-2xl border-3 border-showcase-navy bg-white overflow-hidden shadow-neo-brutal-sm">
      <div 
        className={`absolute bottom-0 left-0 right-0 w-full transition-all duration-[2000ms] ease-out ${fillClass} border-t-3 border-showcase-navy`}
        style={{ 
          height: isInView ? `${percent}%` : "0%"
        }}
      />
      {/* Glare effect */}
      <div className="absolute top-2 right-2 w-3 h-10 bg-white/50 rounded-full z-10 mix-blend-overlay" />
    </div>
  );
}

export default function ImpactStats() {
  const t = useTranslations("impact");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px 100px 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative z-10 py-12 sm:py-16" ref={ref}>
      {/* Full-bleed solid vibrant container */}
      <div
        className="relative overflow-hidden bg-showcase-purple border-y-8 border-showcase-navy"
      >
        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(#1a1a2e 3px, transparent 3px), linear-gradient(90deg, #1a1a2e 3px, transparent 3px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Sparkle particles — skip for reduced motion */}
        {!prefersReducedMotion && <DarkSectionSparkles />}

        <div className="relative z-10 py-14 sm:py-20 px-4 sm:px-8 lg:px-12 mx-auto max-w-6xl">
          <AnimatedSection animation="blurIn">
            <SectionHeading
              title={t("title")}
              highlight="Reach"
              underlineColor="teal"
              dark
            />
          </AnimatedSection>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            {stats.map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <AnimatedSection
                  key={stat.key}
                  delay={i * 0.12}
                  animation="popIn"
                  spring
                >
                  <div className="relative rounded-2xl border-4 border-showcase-navy bg-white shadow-neo-brutal p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-neo-brutal-lg group">
                    
                    {/* Beaker Gauge container */}
                    <div className="relative mx-auto mb-6 h-28 w-24 flex items-center justify-center group-hover:rotate-3 transition-transform duration-300">
                      <BeakerGauge
                        percent={stat.percent}
                        fillClass={stat.fillClass}
                        isInView={isInView}
                      />
                      <div
                        className="relative z-10 flex h-12 w-12 items-center justify-center"
                      >
                        <StatIcon className="h-8 w-8 text-showcase-navy" strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="bg-showcase-navy text-white rounded-lg border-2 border-showcase-navy py-2 px-3 shadow-[4px_4px_0px_#000] transform -rotate-1 group-hover:rotate-1 transition-transform duration-300">
                      <StatNumber
                        value={stat.value}
                        suffix={stat.suffix}
                        isInView={isInView}
                        textColor={stat.textColor}
                      />
                    </div>
                    
                    <p className="mt-4 text-sm font-bold text-ink-dark uppercase tracking-wide">
                      {t(stat.key)}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatNumber({
  value,
  suffix,
  isInView,
  textColor,
}: {
  value: number;
  suffix: string;
  isInView: boolean;
  textColor: string;
}) {
  const count = useCountUp(value, isInView);
  return (
    <span
      className={`font-display text-3xl font-black tabular-nums sm:text-4xl ${textColor} text-shadow-3d`}
      style={{ textShadow: '2px 2px 0px #000' }}
    >
      {count}
      {suffix}
    </span>
  );
}
