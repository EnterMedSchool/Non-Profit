"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface GlossaryKeyboardNavProps {
  prevHref?: string | null;
  nextHref?: string | null;
  glossaryHref: string;
}

/**
 * Invisible component that adds keyboard shortcuts:
 * - ArrowLeft: Navigate to previous term
 * - ArrowRight: Navigate to next term
 * - Escape: Back to glossary hub
 */
export default function GlossaryKeyboardNav({
  prevHref,
  nextHref,
  glossaryHref,
}: GlossaryKeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      } else if (e.key === "ArrowRight" && nextHref) {
        e.preventDefault();
        router.push(nextHref);
      } else if (e.key === "Escape") {
        e.preventDefault();
        router.push(glossaryHref);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevHref, nextHref, glossaryHref, router]);

  return null; // Invisible component
}
