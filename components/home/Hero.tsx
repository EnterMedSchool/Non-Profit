"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, ExternalLink, Stethoscope, Heart, Pill, Brain, Dna, BookOpen } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";

const floatingIcons = [
  { Icon: Stethoscope, top: "8%", left: "5%", size: 40, delay: 0, duration: 7, color: "text-showcase-purple/25" },
  { Icon: Heart, top: "15%", right: "8%", size: 36, delay: 1.2, duration: 6, color: "text-showcase-pink/30" },
  { Icon: Pill, top: "65%", left: "7%", size: 34, delay: 2.5, duration: 8, color: "text-showcase-teal/25" },
  { Icon: Brain, top: "70%", right: "6%", size: 44, delay: 0.8, duration: 7.5, color: "text-showcase-purple/25" },
  { Icon: Dna, top: "35%", left: "3%", size: 32, delay: 3, duration: 6.5, color: "text-showcase-green/25" },
  { Icon: BookOpen, top: "40%", right: "4%", size: 36, delay: 1.5, duration: 7, color: "text-showcase-teal/25" },
];

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative z-10 flex min-h-[75vh] flex-col items-center justify-center px-4 pt-8 pb-8 text-center sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating medical icons */}
      {floatingIcons.map((item, i) => {
        const IconComp = item.Icon;
        return (
          <motion.div
            key={i}
            className={`absolute ${item.color} pointer-events-none hidden md:block`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
            }}
            animate={{
              y: [0, -15, -5, -20, 0],
              rotate: [0, 3, -2, 1, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            <IconComp style={{ width: item.size, height: item.size }} strokeWidth={1.5} />
          </motion.div>
        );
      })}

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-showcase-green bg-showcase-green/10 px-4 py-2 font-handwritten text-lg font-semibold text-showcase-green"
      >
        <GraduationCap className="h-5 w-5" />
        {t("badge")}
      </motion.div>

      {/* Identity pill */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-8 inline-flex items-center gap-1.5 rounded-full bg-pastel-lavender/60 px-4 py-1.5 text-sm text-ink-muted"
      >
        {t("identityPill")}{" "}
        <a
          href="https://entermedschool.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-showcase-purple underline decoration-showcase-purple/30 hover:decoration-showcase-purple transition-colors"
        >
          {t("identityLink")}
          <ExternalLink className="h-3 w-3" />
        </a>
      </motion.p>

      {/* Radial glow behind title */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[600px] h-[400px] rounded-full bg-gradient-radial from-showcase-purple/20 via-showcase-teal/10 to-transparent blur-3xl" />
      </div>

      {/* Title with animated gradient text */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-dark sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
      >
        Open-Source{" "}
        <span className="text-gradient-purple">Medical Education</span>
        <br />
        <span className="text-showcase-purple">for Everyone</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl"
      >
        {t("subtitle")}
      </motion.p>

      {/* CTAs with glow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-showcase-purple/20 blur-lg animate-pulse-glow" />
          <ChunkyButton href="/en/resources" variant="primary" size="lg" className="relative">
            {t("cta1")}
            <ArrowRight className="h-5 w-5" />
          </ChunkyButton>
        </div>
        <ChunkyButton href="/en/for-professors" variant="ghost" size="lg">
          {t("cta2")}
        </ChunkyButton>
      </motion.div>

      {/* Leo mascot -- playful floating decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.9, type: "spring", stiffness: 120, damping: 12 }}
        className="mt-10 hidden md:block"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 3, -2, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Glow ring behind mascot */}
          <div className="absolute inset-0 -m-4 rounded-full bg-showcase-purple/15 blur-xl animate-pulse-glow" aria-hidden="true" />
          <Image
            src="/logo.png"
            alt="Leo, the EnterMedSchool mascot"
            width={120}
            height={120}
            priority
            className="relative drop-shadow-lg"
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator -- animated bouncing arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-8 flex flex-col items-center gap-1 md:mt-6"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-showcase-purple/40">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-showcase-purple/20">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
