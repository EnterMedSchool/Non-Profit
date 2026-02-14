"use client";

import Image from "next/image";
import { RefreshCw, ExternalLink } from "lucide-react";
import { m } from "framer-motion";
import ChunkyButton from "@/components/shared/ChunkyButton";
import AnimatedSection from "@/components/shared/AnimatedSection";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      {/* Gradient background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255, 133, 162, 0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <AnimatedSection animation="popIn" spring>
        <div className="relative overflow-hidden rounded-3xl border-3 border-showcase-navy bg-white shadow-chunky-lg">
          {/* Rainbow accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-showcase-coral via-showcase-orange to-showcase-yellow" />

          {/* Pattern dots overlay */}
          <div className="pattern-dots absolute inset-0 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 px-8 py-10 sm:px-16 sm:py-14">
            {/* Leo mascot with shake animation */}
            <m.div
              initial={{ x: 0 }}
              animate={{ x: [-4, 4, -3, 3, -1, 1, 0] }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="mx-auto mb-6 w-fit"
            >
              <Image
                src="/logo.png"
                alt="Leo mascot"
                width={80}
                height={80}
                className="rounded-2xl"
              />
            </m.div>

            <span className="font-handwritten text-7xl text-showcase-coral sm:text-8xl">
              Oops!
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
              Something Went Wrong
            </h1>
            <p className="mt-3 max-w-md mx-auto text-ink-muted">
              An unexpected error occurred. Please try again — if the problem
              persists, let us know.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <ChunkyButton variant="primary" size="lg" onClick={reset}>
                <RefreshCw className="h-5 w-5" />
                Try Again
              </ChunkyButton>
              <ChunkyButton
                href="https://github.com/enterMedSchool/Non-Profit/issues"
                variant="ghost"
                size="lg"
                external
              >
                <ExternalLink className="h-4 w-4" />
                Report Issue
              </ChunkyButton>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
