"use client";

import { useState, useEffect, useCallback } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Link2, Check, Share2 } from "lucide-react";

/* ── Social platform SVGs (avoid pulling in heavy icon libs) ──────── */

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */

interface ShareBarProps {
  title: string;
  url: string;
}

export default function ShareBar({ title, url }: ShareBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  /* Show after scrolling past the hero (~400px) */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select a hidden input
    }
  }, [url]);

  const shareX = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    }
  };

  const buttons = [
    {
      label: copied ? "Copied!" : "Copy link",
      icon: copied ? <Check className="h-4.5 w-4.5" /> : <Link2 className="h-4.5 w-4.5" />,
      onClick: copyLink,
    },
    { label: "Share on X", icon: <XIcon className="h-4 w-4" />, onClick: shareX },
    {
      label: "Share on LinkedIn",
      icon: <LinkedInIcon className="h-4 w-4" />,
      onClick: shareLinkedIn,
    },
    ...(typeof navigator !== "undefined" && "share" in navigator
      ? [{ label: "Share", icon: <Share2 className="h-4.5 w-4.5" />, onClick: shareNative }]
      : []),
  ];

  if (!visible) return null;

  return (
    <>
      {/* ── Desktop: Floating vertical bar ──────────────────────────── */}
      <m.div
        initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 xl:flex"
      >
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-navy/15 bg-white text-ink-muted shadow-sm transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:text-showcase-purple hover:shadow-chunky-sm"
            aria-label={btn.label}
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
      </m.div>

      {/* ── Mobile: Fixed bottom bar ────────────────────────────────── */}
      <m.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 bottom-0 z-40 xl:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-center gap-3 border-t border-showcase-navy/10 bg-white/80 px-4 py-2.5 backdrop-blur-xl">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-showcase-navy/10 bg-white text-ink-muted transition-all hover:border-showcase-purple/30 hover:text-showcase-purple active:scale-95"
              aria-label={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </m.div>
    </>
  );
}
