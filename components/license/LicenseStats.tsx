"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, Globe, GraduationCap, Heart } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

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
    percent: 75,
  },
  {
    key: "educators",
    value: 200,
    suffix: "+",
    icon: GraduationCap,
    gradient: "from-showcase-green to-showcase-teal",
    ringColor: "#2ECC71",
    glowColor: "rgba(46, 204, 113, 0.4)",
    percent: 65,
  },
  {
    key: "free",
    value: 100,
    suffix: "%",
    icon: Heart,
    gradient: "from-showcase-coral to-showcase-pink",
    ringColor: "#FF6B6B",
    glowColor: "rgba(255, 107, 107, 0.4)",
    percent: 100,
  },
];

const sparkles = Array.from({ length: 8 }, (_, i) => ({
  left: `${5 + i * 12}%`,
  delay: i * 0.6,
  duration: 4 + (i % 4),
  size: 2 + (i % 3) * 1.5,
}));

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
      className="absolute inset-0 h-full w-full -rotate-90"
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

function StatNumber({
  value,
  suffix,
  isInView,
}: {
  value: number;
  suffix: string;
  isInView: boolean;
}) {
  const count = useCountUp(value, isInView);
  return (
    <span className="font-display text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
      {count}
      {suffix}
    </span>
  );
}

export default function LicenseStats() {
  const t = useTranslations("license.stats");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px 100px 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative z-10 py-12 sm:py-16" ref={ref}>
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 30%, #1a1a2e 60%, #0d2137 100%)",
        }}
      >
        {/* Grid pattern */}
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
          className="absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #6C5CE7, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full blur-3xl opacity-15"
          style={{
            background: "radial-gradient(circle, #00D9C0, transparent 70%)",
          }}
        />

        {/* Sparkle particles */}
        {!prefersReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            {sparkles.map((p, i) => (
              <div
                key={i}
                className="absolute animate-float-gentle rounded-full bg-white/30"
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
        )}

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-14 sm:px-8 sm:py-20 lg:px-12">
          <AnimatedSection animation="blurIn">
            <div className="text-center">
              <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                {t("title")}{" "}
                <span className="bg-gradient-to-r from-showcase-teal to-showcase-green bg-clip-text text-transparent">
                  {t("highlight")}
                </span>
              </h2>
            </div>
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
                    <div
                      className="absolute -inset-3 rounded-3xl opacity-40 blur-xl"
                      style={{ backgroundColor: stat.glowColor }}
                      aria-hidden="true"
                    />
                    <div className="relative overflow-hidden rounded-2xl border-3 border-white/10 bg-white/[0.07] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-3 hover:bg-white/[0.12]">
                      <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
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
