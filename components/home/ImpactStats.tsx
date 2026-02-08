"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, motion } from "framer-motion";
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
  { key: "resources", value: 500, suffix: "+", color: "border-showcase-purple shadow-chunky-purple", gradientClass: "text-gradient-purple", icon: BookOpen, iconColor: "text-showcase-purple", ringColor: "#6C5CE7", glowColor: "rgba(108, 92, 231, 0.3)", percent: 85 },
  { key: "countries", value: 80, suffix: "+", color: "border-showcase-teal shadow-chunky-teal", gradientClass: "text-gradient-purple", icon: Globe, iconColor: "text-showcase-teal", ringColor: "#00D9C0", glowColor: "rgba(0, 217, 192, 0.3)", percent: 75 },
  { key: "tools", value: 25, suffix: "+", color: "border-showcase-yellow shadow-chunky-yellow", gradientClass: "text-gradient-warm", icon: Wrench, iconColor: "text-showcase-orange", ringColor: "#FFD93D", glowColor: "rgba(255, 217, 61, 0.3)", percent: 50 },
  { key: "professors", value: 200, suffix: "+", color: "border-showcase-green shadow-chunky-green", gradientClass: "text-gradient-purple", icon: GraduationCap, iconColor: "text-showcase-green", ringColor: "#2ECC71", glowColor: "rgba(46, 204, 113, 0.3)", percent: 65 },
];

function DarkSectionSparkles() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    left: `${5 + Math.random() * 90}%`,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    size: 2 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/30"
          style={{
            left: p.left,
            bottom: "-5%",
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -300],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function CircularProgress({ percent, color, isInView }: { percent: number; color: string; isInView: boolean }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="3" className="text-showcase-navy/5" />
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={isInView ? offset : circumference}
        style={{ transition: "stroke-dashoffset 2s ease-out" }}
      />
    </svg>
  );
}

export default function ImpactStats() {
  const t = useTranslations("impact");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px 100px 0px" });

  return (
    <section className="relative z-10 py-10 sm:py-14" ref={ref}>
      {/* Dark gradient container */}
      <div className="mx-4 sm:mx-6 lg:mx-auto lg:max-w-6xl rounded-3xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #1a1a2e 100%)",
        }}
      >
        {/* Subtle dot grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        {/* Sparkle particles */}
        <DarkSectionSparkles />

        <div className="relative z-10 py-10 sm:py-12 px-4 sm:px-8 lg:px-12">
          <AnimatedSection animation="blurIn">
            <SectionHeading
              title={t("title")}
              highlight="Impact"
              underlineColor="teal"
              dark
            />
          </AnimatedSection>

          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {stats.map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <AnimatedSection key={stat.key} delay={i * 0.1} animation="popIn" spring>
                  <div className="relative">
                    {/* Colored glow behind card */}
                    <div
                      className="absolute -inset-2 rounded-2xl blur-xl opacity-50"
                      style={{ backgroundColor: stat.glowColor }}
                      aria-hidden="true"
                    />
                    <div
                      className={`relative rounded-2xl border-3 ${stat.color} bg-white p-5 text-center transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
                    >
                      {/* Circular progress ring */}
                      <div className="relative mx-auto mb-3 h-20 w-20 flex items-center justify-center">
                        <CircularProgress percent={stat.percent} color={stat.ringColor} isInView={isInView} />
                        <StatIcon className={`h-6 w-6 ${stat.iconColor} relative z-10`} />
                      </div>

                      <StatNumber value={stat.value} suffix={stat.suffix} isInView={isInView} gradientClass={stat.gradientClass} />
                      <p className="mt-1 text-sm font-semibold text-ink-muted">
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
    <span className={`font-display text-3xl font-extrabold tabular-nums sm:text-4xl ${gradientClass}`}>
      {count}
      {suffix}
    </span>
  );
}
