"use client";

import { useTranslations } from "next-intl";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight, Github, Share2, Sparkles } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";
import AnimatedSection from "@/components/shared/AnimatedSection";

/* ── Floating emoji reactions — reduced from 8 → 4 ── */
const floatingReactions = [
  { emoji: "🧠", top: "8%", left: "5%", delay: 0, size: 28 },
  { emoji: "🩺", top: "15%", right: "8%", delay: 1, size: 24 },
  { emoji: "📚", top: "70%", left: "6%", delay: 2, size: 26 },
  { emoji: "💡", top: "65%", right: "5%", delay: 0.5, size: 22 },
];

/* ── CSS-animated sparkle particles — reduced from 24 → 10 ── */
const sparkleParticles = Array.from({ length: 10 }, (_, i) => ({
  left: `${5 + (i * 9.5)}%`,
  delay: i * 0.5,
  duration: 3 + (i % 4),
  size: 2 + (i % 3) * 2,
}));

function SparkleParticles() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {sparkleParticles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/50 animate-float-gentle"
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

function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: "EnterMedSchool.org",
      text: "Free, open-source medical education resources for educators — download, embed, and share!",
      url: window.location.origin,
    });
  } else {
    navigator.clipboard.writeText(window.location.origin);
  }
}

export default function CallToAction() {
  const t = useTranslations("cta");
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative z-10 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="scaleIn" spring>
          <div
            className="relative rounded-3xl border-3 border-showcase-navy p-8 text-center text-white shadow-chunky-xl sm:p-12 md:p-16 overflow-hidden"
            style={{
              background:
                "linear-gradient(-45deg, #6C5CE7, #00D9C0, #FF85A2, #54A0FF, #7E22CE, #6C5CE7)",
              backgroundSize: "600% 600%",
              animation: prefersReducedMotion
                ? "none"
                : "gradient-shift 6s ease infinite",
            }}
          >
            {/* Sparkle particles — CSS animated */}
            {!prefersReducedMotion && <SparkleParticles />}

            {/* Floating emoji reactions — CSS animated */}
            {!prefersReducedMotion &&
              floatingReactions.map((item, i) => (
                <div
                  key={i}
                  className="absolute pointer-events-none hidden sm:block select-none animate-float-playful"
                  style={{
                    top: item.top,
                    left: item.left,
                    right: (item as Record<string, unknown>).right as string | undefined,
                    fontSize: item.size,
                    animationDelay: `${item.delay}s`,
                    animationDuration: `${6 + i * 0.5}s`,
                  }}
                >
                  {item.emoji}
                </div>
              ))}

            {/* Handwritten annotation with draw animation */}
            <m.div
              className="absolute -top-3 right-8 sm:right-16 rotate-6 pointer-events-none"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
              viewport={{ once: true }}
            >
              <span className="font-handwritten text-2xl text-white/70 select-none flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Start now!
              </span>
              <svg
                className="absolute -bottom-3 left-0 w-20 h-5 text-white/30"
                viewBox="0 0 60 15"
                fill="none"
              >
                <m.path
                  d="M2 12 C20 2, 40 14, 58 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </svg>
            </m.div>

            <div className="relative z-10">
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-sm">
                {t("title")}
              </h2>
              <p className="mt-5 text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <div className="relative">
                  <div
                    className="absolute -inset-1.5 rounded-2xl bg-showcase-yellow/30 blur-lg animate-pulse-glow"
                    style={{ animationDuration: "2s" }}
                  />
                  <ChunkyButton
                    href="/en/resources"
                    variant="yellow"
                    size="lg"
                    className="relative"
                  >
                    {t("browseResources")}
                    <ArrowRight className="h-5 w-5" />
                  </ChunkyButton>
                </div>
                <ChunkyButton
                  href="/en/license#generator"
                  variant="ghost"
                  size="lg"
                  className="border-white/50 text-white hover:bg-white/10 shadow-none hover:shadow-none"
                >
                  {t("getAttributionBadge")}
                </ChunkyButton>
                <ChunkyButton
                  href="https://github.com"
                  external
                  variant="ghost"
                  size="lg"
                  className="border-white/50 text-white hover:bg-white/10 shadow-none hover:shadow-none"
                >
                  <Github className="h-5 w-5" />
                  {t("viewOnGitHub")}
                </ChunkyButton>
              </div>

              {/* Share CTA */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/25 hover:scale-105"
                >
                  <Share2 className="h-4 w-4" />
                  {t("share")}
                </button>
              </m.div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
