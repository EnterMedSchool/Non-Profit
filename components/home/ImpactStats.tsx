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
    gradient: "from-showcase-purple to-showcase-blue",
    ringColor: "#6C5CE7",
    glowColor: "rgba(108, 92, 231, 0.4)",
    textGradient: "text-gradient-purple",
    percent: 85,
  },
  {
    key: "countries",
    value: 80,
    suffix: "+",
    icon: Globe,
    gradient: "from-showcase-teal to-showcase-green",
    ringColor: "#00D9C0",
    glowColor: "rgba(0, 217, 192, 0.4)",
    textGradient: "text-gradient-purple",
    percent: 75,
  },
  {
    key: "tools",
    value: 25,
    suffix: "+",
    icon: Wrench,
    gradient: "from-showcase-orange to-showcase-yellow",
    ringColor: "#FFD93D",
    glowColor: "rgba(255, 217, 61, 0.4)",
    textGradient: "text-gradient-warm",
    percent: 50,
  },
  {
    key: "educators",
    value: 200,
    suffix: "+",
    icon: GraduationCap,
    gradient: "from-showcase-green to-showcase-teal",
    ringColor: "#2ECC71",
    glowColor: "rgba(46, 204, 113, 0.4)",
    textGradient: "text-gradient-purple",
    percent: 65,
  },
];

/* CSS-animated sparkle particles — reduced from 20 → 8 */
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
          className="absolute rounded-full bg-white/30 animate-float-gentle"
          style={{
            left: p.left,
            bottom: "-5%",
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function CircularProgress({
  percent,
  color,
  isInView,
}: {
  percent: number;
  color: string;
  isInView: boolean;
}) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      className="absolute inset-0 w-full h-full -rotate-90"
      viewBox="0 0 80 80"
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-white/10"
      />
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={isInView ? offset : circumference}
        style={{ transition: "stroke-dashoffset 2.5s ease-out" }}
      />
    </svg>
  );
}

export default function ImpactStats() {
  const t = useTranslations("impact");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px 100px 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative z-10 py-12 sm:py-16" ref={ref}>
      {/* Full-bleed dark container */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 30%, #1a1a2e 60%, #0d2137 100%)",
        }}
      >
        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #6C5CE7, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{
            background: "radial-gradient(circle, #00D9C0, transparent 70%)",
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
                  <div className="relative">
                    {/* Colored glow behind card */}
                    <div
                      className="absolute -inset-3 rounded-3xl blur-xl opacity-40"
                      style={{ backgroundColor: stat.glowColor }}
                      aria-hidden="true"
                    />
                    <div className="relative rounded-2xl border-3 border-white/10 bg-white/[0.07] backdrop-blur-sm p-6 text-center transition-all duration-300 hover:-translate-y-3 hover:bg-white/[0.12] overflow-hidden">
                      {/* Circular progress ring */}
                      <div className="relative mx-auto mb-4 h-24 w-24 flex items-center justify-center">
                        <CircularProgress
                          percent={stat.percent}
                          color={stat.ringColor}
                          isInView={isInView}
                        />
                        <div
                          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${stat.gradient}`}
                        >
                          <StatIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      <StatNumber
                        value={stat.value}
                        suffix={stat.suffix}
                        isInView={isInView}
                        gradientClass={stat.textGradient}
                      />
                      <p className="mt-2 text-sm font-semibold text-white/60">
                        {t(stat.key)}
                      </p>
                    </div>
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
  gradientClass,
}: {
  value: number;
  suffix: string;
  isInView: boolean;
  gradientClass: string;
}) {
  const count = useCountUp(value, isInView);
  return (
    <span
      className={`font-display text-4xl font-extrabold tabular-nums sm:text-5xl ${gradientClass}`}
    >
      {count}
      {suffix}
    </span>
  );
}
