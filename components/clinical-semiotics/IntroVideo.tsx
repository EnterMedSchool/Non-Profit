"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Code, Link2, ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const LOGO_SRC = "/logo.png";
const INTRO_SEEN_KEY = "cs-intro-seen";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface IntroVideoProps {
  onEnterStudio: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function IntroVideo({ onEnterStudio }: IntroVideoProps) {
  const [entered, setEntered] = useState(false);

  /* ---- Auto-skip for returning visitors ---- */
  useEffect(() => {
    try {
      if (localStorage.getItem(INTRO_SEEN_KEY) === "1") {
        onEnterStudio();
      }
    } catch {
      // localStorage unavailable
    }
  }, [onEnterStudio]);

  /* ---- Enter handler ---- */
  const handleEnter = () => {
    if (entered) return;
    setEntered(true);
    try {
      localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setTimeout(onEnterStudio, 250);
  };

  return (
    <div className="cs-intro-wrapper cs-intro-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 flex items-center justify-center w-full min-h-screen px-4 py-12"
      >
        <div className="max-w-2xl w-full flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <Image
              src={LOGO_SRC}
              alt="EnterMedSchool logo"
              width={64}
              height={64}
              className="rounded-2xl"
              priority
            />
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="cs-badge-sticker cs-badge-purple">
              Clinical Semiotics for Educators
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cs-font-display text-3xl md:text-4xl font-extrabold leading-tight"
            style={{ color: "var(--cs-text-dark)" }}
          >
            Interactive Clinical Exams,{" "}
            <span className="cs-underline-hand">Ready to Embed</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="cs-font-body text-base md:text-lg leading-relaxed max-w-lg"
            style={{ color: "var(--cs-text-muted)" }}
          >
            Embed interactive video walkthroughs on your website, share links
            in slides, or add them to your LMS. Students get guided exams
            with real-time questions and clinical tips.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
              <Code className="w-3.5 h-3.5 text-purple-500" />
              One-click embed code
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
              <Link2 className="w-3.5 h-3.5 text-teal-500" />
              Direct link for slides
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-2"
          >
            <button
              onClick={handleEnter}
              disabled={entered}
              className={cn(
                "cs-btn cs-btn-golden cs-btn-xl cs-font-display flex items-center gap-2",
                entered && "opacity-60 pointer-events-none",
              )}
            >
              Browse Exams
              <ArrowRight className="w-4 h-4" />
            </button>
            <p
              className="text-[11px]"
              style={{ color: "var(--cs-text-muted)" }}
            >
              Free &middot; No sign-up required &middot; Attribution included
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
