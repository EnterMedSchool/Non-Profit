"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  ExternalLink,
  Stethoscope,
  Heart,
  Pill,
  Brain,
  Dna,
  BookOpen,
  Presentation,
  Globe,
  Users,
} from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";

/* ── Floating stickers: larger, bolder, more colorful ── */
const floatingStickers = [
  {
    Icon: Stethoscope,
    top: "6%",
    left: "4%",
    size: 56,
    delay: 0,
    duration: 8,
    color: "text-showcase-purple",
    opacity: "opacity-30",
    rotate: -12,
  },
  {
    Icon: Heart,
    top: "12%",
    right: "6%",
    size: 48,
    delay: 1.2,
    duration: 7,
    color: "text-showcase-pink",
    opacity: "opacity-35",
    rotate: 8,
  },
  {
    Icon: Brain,
    top: "55%",
    left: "3%",
    size: 60,
    delay: 0.8,
    duration: 9,
    color: "text-showcase-teal",
    opacity: "opacity-25",
    rotate: 15,
  },
  {
    Icon: Dna,
    top: "60%",
    right: "5%",
    size: 50,
    delay: 2.5,
    duration: 7.5,
    color: "text-showcase-green",
    opacity: "opacity-30",
    rotate: -20,
  },
  {
    Icon: BookOpen,
    top: "30%",
    left: "2%",
    size: 44,
    delay: 3,
    duration: 6.5,
    color: "text-showcase-orange",
    opacity: "opacity-25",
    rotate: 10,
  },
  {
    Icon: Presentation,
    top: "25%",
    right: "3%",
    size: 52,
    delay: 1.5,
    duration: 8,
    color: "text-showcase-blue",
    opacity: "opacity-25",
    rotate: -8,
  },
  {
    Icon: Pill,
    top: "75%",
    left: "8%",
    size: 40,
    delay: 2,
    duration: 7,
    color: "text-showcase-coral",
    opacity: "opacity-20",
    rotate: 25,
  },
  {
    Icon: Globe,
    top: "78%",
    right: "8%",
    size: 42,
    delay: 0.5,
    duration: 6,
    color: "text-showcase-purple",
    opacity: "opacity-20",
    rotate: -15,
  },
];

/* ── Rotating words for the hero title ── */
const rotatingWords = [
  { text: "for Your Classroom", color: "text-showcase-purple" },
  { text: "for Your Students", color: "text-showcase-teal" },
  { text: "for Educators", color: "text-showcase-pink" },
  { text: "for Everyone", color: "text-showcase-green" },
];

/* ── Social proof items ── */
const socialProofItems = [
  { icon: Globe, text: "80+ Countries", color: "text-showcase-teal" },
  { icon: Users, text: "200+ Professors", color: "text-showcase-purple" },
  { icon: BookOpen, text: "500+ Resources", color: "text-showcase-orange" },
];

export default function Hero() {
  const t = useTranslations("hero");
  const [wordIndex, setWordIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  /* Rotate words every 3 seconds */
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* Mouse-follow glow */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    },
    []
  );

  return (
    <section
      className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-12 pb-8 text-center sm:px-6 lg:px-8 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Mouse-follow radial glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-60"
        aria-hidden="true"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(108, 92, 231, 0.15), rgba(0, 217, 192, 0.08), transparent 60%)`,
        }}
      />

      {/* Floating stickers -- large, colorful, playful */}
      {floatingStickers.map((item, i) => {
        const IconComp = item.Icon;
        return (
          <motion.div
            key={i}
            className={`absolute ${item.color} ${item.opacity} pointer-events-none hidden md:block`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
            }}
            initial={{ opacity: 0, scale: 0.5, rotate: item.rotate }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -18, -6, -22, 0],
              rotate: [item.rotate, item.rotate + 5, item.rotate - 3, item.rotate + 2, item.rotate],
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.3 + i * 0.1 },
              scale: { duration: 0.8, delay: 0.3 + i * 0.1 },
              y: { duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: item.delay },
              rotate: { duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: item.delay },
            }}
          >
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-3 shadow-lg border border-white/40">
              <IconComp style={{ width: item.size, height: item.size }} strokeWidth={1.5} />
            </div>
          </motion.div>
        );
      })}

      {/* Badge with rainbow animated border */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="mb-5 inline-flex items-center gap-2.5 rounded-full border-2 animate-border-rainbow bg-white/80 backdrop-blur-sm px-5 py-2.5 font-handwritten text-xl font-bold text-showcase-green shadow-lg"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-showcase-green/15">
          <GraduationCap className="h-4 w-4 text-showcase-green" />
        </span>
        {t("badge")}
      </motion.div>

      {/* Identity pill */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-8 inline-flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-sm px-5 py-2 text-sm text-ink-muted shadow-sm border border-white/40"
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

      {/* Radial glow behind title -- more dramatic */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-[900px] h-[600px] rounded-full bg-gradient-radial from-showcase-purple/25 via-showcase-teal/15 to-transparent blur-3xl" />
      </div>

      {/* Title with rotating words */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-dark sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
      >
        <span className="text-gradient-rainbow">Open-Source</span>{" "}
        <span className="text-gradient-purple">Medical Education</span>
        <br />
        {/* Rotating word container */}
        <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ y: 40, opacity: 0, rotateX: -45 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -40, opacity: 0, rotateX: 45 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className={`inline-block ${rotatingWords[wordIndex].color}`}
            >
              {rotatingWords[wordIndex].text}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.h1>

      {/* Subtitle -- educator-first, concise */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl"
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
        <div className="relative group">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-showcase-purple/30 via-showcase-teal/30 to-showcase-pink/30 blur-lg animate-pulse-glow group-hover:blur-xl transition-all duration-300" />
          <ChunkyButton
            href="/en/resources"
            variant="primary"
            size="lg"
            className="relative"
          >
            {t("cta1")}
            <ArrowRight className="h-5 w-5" />
          </ChunkyButton>
        </div>
        <ChunkyButton href="/en/for-professors" variant="ghost" size="lg">
          {t("cta2")}
        </ChunkyButton>
      </motion.div>

      {/* Social proof strip */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8"
      >
        {socialProofItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.15, duration: 0.4, type: "spring" }}
              className="flex items-center gap-2 text-sm font-semibold text-ink-muted"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm border border-white/40 ${item.color}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.text}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Leo mascot -- playful floating decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          duration: 0.8,
          delay: 1.2,
          type: "spring",
          stiffness: 120,
          damping: 12,
        }}
        className="mt-8 hidden md:block"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 4, -3, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Glow ring behind mascot */}
          <div
            className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-showcase-purple/20 to-showcase-teal/20 blur-2xl animate-pulse-glow"
            aria-hidden="true"
          />
          <Image
            src="/logo.png"
            alt="Leo, the EnterMedSchool mascot"
            width={130}
            height={130}
            priority
            className="relative drop-shadow-xl"
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="mt-6 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-showcase-purple/40"
          >
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
