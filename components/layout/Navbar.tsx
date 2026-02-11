"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { m, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  PlayCircle,
  FileText,
  ImageIcon,
  BookOpen,
  Palette,
  Stethoscope,
  Wrench,
  Calculator,
} from "lucide-react";
import MobileMenu from "./MobileMenu";
import { LocaleSwitcherDesktop } from "@/components/shared/LocaleSwitcher";
import type { LucideIcon } from "lucide-react";

/* ---------- nav data ---------- */

interface NavChild {
  href: string;
  labelKey: string;
  descKey: string;
  icon: LucideIcon;
  color: string; // Tailwind color class for the icon circle
}

interface NavItemWithChildren {
  labelKey: string;
  href: string;
  children: NavChild[];
}

interface NavItemSimple {
  labelKey: string;
  href: string;
  children?: undefined;
}

type NavItem = NavItemWithChildren | NavItemSimple;

const navItems: NavItem[] = [
  {
    labelKey: "resources",
    href: "/resources",
    children: [
      {
        href: "/resources/pdfs",
        labelKey: "pdfs",
        descKey: "pdfsDesc",
        icon: FileText,
        color: "bg-showcase-blue/15 text-showcase-blue",
      },
      {
        href: "/resources/visuals",
        labelKey: "visuals",
        descKey: "visualsDesc",
        icon: ImageIcon,
        color: "bg-showcase-green/15 text-showcase-green",
      },
      {
        href: "/clinical-semiotics",
        labelKey: "clinicalSemiotics",
        descKey: "clinicalSemioticsDesc",
        icon: Stethoscope,
        color: "bg-showcase-coral/15 text-showcase-coral",
      },
      {
        href: "/resources/questions",
        labelKey: "questions",
        descKey: "questionsDesc",
        icon: HelpCircle,
        color: "bg-showcase-orange/15 text-showcase-orange",
      },
      {
        href: "/resources/videos",
        labelKey: "videos",
        descKey: "videosDesc",
        icon: PlayCircle,
        color: "bg-showcase-pink/15 text-showcase-pink",
      },
    ],
  },
  {
    labelKey: "tools",
    href: "/tools",
    children: [
      {
        href: "/tools",
        labelKey: "tools",
        descKey: "toolsDesc",
        icon: Wrench,
        color: "bg-showcase-teal/15 text-showcase-teal",
      },
      {
        href: "/calculators",
        labelKey: "calculators",
        descKey: "calculatorsDesc",
        icon: Calculator,
        color: "bg-showcase-purple/15 text-showcase-purple",
      },
    ],
  },
  {
    labelKey: "guides",
    href: "/for-professors",
    children: [
      {
        href: "/for-professors/guides",
        labelKey: "teachingGuides",
        descKey: "guidesDesc",
        icon: BookOpen,
        color: "bg-showcase-purple/15 text-showcase-purple",
      },
      {
        href: "/for-professors/templates",
        labelKey: "templates",
        descKey: "assetsDesc",
        icon: Palette,
        color: "bg-showcase-pink/15 text-showcase-pink",
      },
      {
        href: "/for-professors/assets",
        labelKey: "teachingAssets",
        descKey: "assetsDesc",
        icon: Palette,
        color: "bg-showcase-orange/15 text-showcase-orange",
      },
    ],
  },
  { labelKey: "about", href: "/about" },
];

/* ---------- scroll progress bar ---------- */

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <m.div
      className="absolute top-0 start-0 h-[3px] bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green"
      style={{ width: progressWidth }}
    />
  );
}

/* ---------- mega menu panel ---------- */

function MegaMenuPanel({
  item,
  onClose,
}: {
  item: NavItemWithChildren;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const cols = item.children.length >= 4 ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <m.div
      initial={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute left-1/2 top-full z-50 w-[90vw] max-w-lg -translate-x-1/2 pt-3"
      onMouseLeave={onClose}
    >
      <div className="overflow-hidden rounded-2xl border border-showcase-purple/10 bg-white/95 backdrop-blur-xl shadow-xl">
        {/* Gradient accent line */}
        <div className="h-[2px] bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green" />

        {/* Items grid */}
        <div className={`grid gap-1 p-2.5 ${cols}`}>
          {item.children.map((child) => {
            const Icon = child.icon;
            return (
              <Link
                key={child.href}
                href={`/${locale}${child.href}`}
                onClick={onClose}
                className="group flex items-start gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-pastel-lavender/60"
              >
                <span
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${child.color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="block font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors">
                    {t(child.labelKey)}
                  </span>
                  <span className="block text-xs leading-snug text-ink-muted mt-0.5">
                    {t(child.descKey)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all footer */}
        <div className="border-t border-showcase-purple/10 bg-pastel-lavender/20 px-4 py-2.5">
          <Link
            href={`/${locale}${item.href}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-showcase-purple transition-colors hover:text-showcase-purple/70"
          >
            {t("viewAll")} {t(item.labelKey).toLowerCase()}
            <span className="rtl:-scale-x-100" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </m.div>
  );
}

/* ---------- navbar ---------- */

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return; // throttle to 1 update per frame
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        rafId = 0;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMega(null);
  }, [pathname]);

  // Close mega menu on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMega(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("search:open"));
  };

  const handleMegaEnter = useCallback((key: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenMega(key);
  }, []);

  const handleMegaLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setOpenMega(null), 150);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-showcase-purple/10 shadow-sm"
            : "bg-white/40 backdrop-blur-md"
        }`}
      >
        {/* Scroll progress bar */}
        <ScrollProgressBar />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 font-display text-lg font-bold text-ink-dark group"
          >
            <Image
              src="/logo.png"
              alt="Leo mascot"
              width={36}
              height={36}
              sizes="36px"
              className="rounded-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
              priority
            />
            <span className="hidden sm:inline-flex items-baseline gap-1.5">
              <span>EnterMedSchool</span>
              <span className="bg-gradient-to-r from-showcase-purple to-showcase-teal bg-clip-text text-transparent text-sm font-extrabold tracking-tight">
                Open-Source
              </span>
            </span>
            <span className="inline-flex items-center gap-1 sm:hidden">
              <span>EMS</span>
              <span className="rounded-md bg-gradient-to-r from-showcase-purple to-showcase-teal px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
                OS
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div
            className="hidden items-center gap-0.5 rounded-full border border-showcase-purple/8 bg-white/50 px-1.5 py-1 shadow-sm backdrop-blur-sm lg:flex"
            onMouseLeave={() => setHoveredNav(null)}
          >
            {navItems.map((item) => {
              const isActive = pathname.includes(item.href);
              const hasMega = !!item.children;
              const isMegaOpen = openMega === item.labelKey;
              const isHighlighted = hoveredNav
                ? hoveredNav === item.labelKey
                : isActive;

              return (
                <div
                  key={item.labelKey}
                  className="relative"
                  onMouseEnter={() => {
                    setHoveredNav(item.labelKey);
                    if (hasMega) handleMegaEnter(item.labelKey);
                  }}
                  onMouseLeave={hasMega ? handleMegaLeave : undefined}
                >
                  <Link
                    href={`/${locale}${item.href}`}
                    className={`relative z-10 flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "text-showcase-purple"
                        : "text-ink-muted hover:text-ink-dark"
                    }`}
                    onClick={() => setOpenMega(null)}
                    {...(hasMega ? { "aria-expanded": isMegaOpen, "aria-haspopup": "true" as const } : {})}
                  >
                    {t(item.labelKey)}
                    {hasMega && (
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isMegaOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                    {/* Highlight pill — CSS transition instead of layoutId for perf */}
                    <div
                      className={`absolute inset-0 rounded-full bg-pastel-lavender/70 transition-opacity duration-200 ${
                        isHighlighted ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  </Link>

                  {/* Mega menu */}
                  <AnimatePresence>
                    {hasMega && isMegaOpen && (
                      <MegaMenuPanel
                        item={item as NavItemWithChildren}
                        onClose={() => setOpenMega(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            {/* Search button */}
            <button
              onClick={openSearch}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-pastel-lavender hover:text-ink-dark hover:scale-105"
              aria-label={t("search")}
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Language switcher */}
            <LocaleSwitcherDesktop />

            {/* Separator */}
            <div className="hidden h-5 w-px bg-showcase-purple/15 md:block" />

            {/* Visit .com badge */}
            <a
              href="https://entermedschool.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-showcase-purple/20 bg-white/60 px-3.5 py-1.5 text-xs font-bold text-showcase-purple backdrop-blur-sm transition-all hover:border-showcase-purple/40 hover:bg-pastel-lavender hover:shadow-sm hover:scale-105 md:inline-flex"
            >
              {t("visitCom")}
              <ExternalLink className="h-3 w-3" />
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-pastel-lavender hover:text-ink-dark lg:hidden"
              aria-label={t("menu")}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
      />

      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-16" />
    </>
  );
}

// Re-export for MobileMenu
export { navItems };
export type { NavItem, NavItemWithChildren, NavChild };
