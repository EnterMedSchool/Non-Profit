"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";
import AnimatedSection from "@/components/shared/AnimatedSection";

function Sparkles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${5 + Math.random() * 90}%`,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    size: 2 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/40"
          style={{
            left: p.left,
            bottom: "-5%",
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -250],
            opacity: [0, 0.8, 0.8, 0],
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

export default function CallToAction() {
  const t = useTranslations("cta");

  return (
    <section className="relative z-10 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="scaleIn" spring>
          <div
            className="relative rounded-3xl border-3 border-showcase-navy p-8 text-center text-white shadow-chunky-lg sm:p-12 md:p-16 overflow-hidden"
            style={{
              background: "linear-gradient(-45deg, #6C5CE7, #00D9C0, #7E22CE, #6C5CE7)",
              backgroundSize: "400% 400%",
              animation: "gradient-shift 8s ease infinite",
            }}
          >
            {/* Sparkle particles */}
            <Sparkles />

            {/* Handwritten annotation */}
            <div className="absolute -top-3 right-8 sm:right-16 rotate-6 pointer-events-none" aria-hidden="true">
              <span className="font-handwritten text-xl text-white/60 select-none">
                Start now!
              </span>
              <svg className="absolute -bottom-3 left-0 w-16 h-4 text-white/30" viewBox="0 0 60 15" fill="none">
                <path d="M2 12 C20 2, 40 14, 58 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl md:text-4xl lg:text-5xl">
                {t("title")}
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                {t("subtitle")}
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-showcase-yellow/30 blur-md animate-pulse-glow" style={{ animationDuration: "2s" }} />
                  <ChunkyButton href="/en/resources" variant="yellow" size="lg" className="relative">
                    {t("browseResources")}
                    <ArrowRight className="h-5 w-5" />
                  </ChunkyButton>
                </div>
                <ChunkyButton href="/en/for-professors" variant="ghost" size="lg" className="border-white/50 text-white hover:bg-white/10 shadow-none hover:shadow-none">
                  {t("forProfessors")}
                </ChunkyButton>
                <ChunkyButton href="https://github.com" external variant="ghost" size="lg" className="border-white/50 text-white hover:bg-white/10 shadow-none hover:shadow-none">
                  <Github className="h-5 w-5" />
                  {t("viewOnGitHub")}
                </ChunkyButton>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
