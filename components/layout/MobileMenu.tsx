"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, ExternalLink, Search, ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import type { NavItem, NavItemWithChildren } from "./Navbar";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

/* ---------- animation variants ---------- */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const linkVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.05,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
};

const childVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto" as const,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

/* ---------- component ---------- */

export default function MobileMenu({
  open,
  onClose,
  navItems,
}: MobileMenuProps) {
  const t = useTranslations("nav");
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Focus close button when menu opens, lock scroll
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      document.body.style.overflow = "hidden";
      setExpanded(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const openSearch = () => {
    onClose();
    // Small delay so the menu closes first
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("search:open"));
    }, 200);
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
          style={{
            backgroundColor: "#EDF2FF",
            backgroundImage: [
              "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(108, 92, 231, 0.10) 0%, transparent 70%)",
              "radial-gradient(ellipse 70% 50% at 85% 30%, rgba(0, 217, 192, 0.09) 0%, transparent 65%)",
              "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(84, 160, 255, 0.09) 0%, transparent 70%)",
              "linear-gradient(170deg, #EDF2FF 0%, #E5ECFF 25%, #E8FAF7 50%, #EBE6FF 75%, #EDF2FF 100%)",
            ].join(", "),
          }}
        >
          {/* Top bar */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="flex items-center justify-between px-5 py-4"
          >
            <Link
              href="/en"
              onClick={onClose}
              className="font-display text-lg font-bold text-ink-dark inline-flex items-center gap-2"
            >
              <Image
                src="/logo.png"
                alt="Leo mascot"
                width={32}
                height={32}
                className="rounded-md"
              />
              EnterMedSchool
              <span className="ml-1 bg-gradient-to-r from-showcase-purple to-showcase-teal bg-clip-text text-transparent text-sm font-extrabold">
                Open-Source
              </span>
            </Link>
            <m.button
              ref={closeRef}
              onClick={onClose}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-ink-muted transition-colors hover:bg-white hover:text-ink-dark"
              aria-label={t("closeMenu")}
            >
              <X className="h-5 w-5" />
            </m.button>
          </m.div>

          {/* Navigation links -- centered vertically */}
          <div className="flex flex-1 flex-col justify-center px-6 py-4">
            {/* Home link */}
            <m.div
              custom={0}
              variants={linkVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Link
                href="/en"
                onClick={onClose}
                className="block py-2 font-display text-3xl font-bold text-ink-dark transition-colors hover:text-showcase-purple sm:text-4xl"
              >
                {t("home")}
              </Link>
            </m.div>

            {/* Nav items */}
            {navItems.map((item, i) => {
              const hasChildren = !!item.children;
              const isExpanded = expanded === item.labelKey;

              return (
                <m.div
                  key={item.labelKey}
                  custom={i + 1}
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {hasChildren ? (
                    /* Expandable item */
                    <div>
                      <button
                        onClick={() => toggleExpand(item.labelKey)}
                        className="flex w-full items-center gap-2 py-2 font-display text-3xl font-bold text-ink-dark transition-colors hover:text-showcase-purple sm:text-4xl"
                      >
                        {t(item.labelKey)}
                        <ChevronDown
                          className={`h-6 w-6 text-ink-light transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Accordion children */}
                      <AnimatePresence>
                        {isExpanded && (
                          <m.div
                            variants={childVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="overflow-hidden"
                          >
                            <div className="ml-1 border-l-3 border-showcase-purple/20 pl-4 pb-2 pt-1">
                              {/* Sub-page links */}
                              {(item as NavItemWithChildren).children.map(
                                (child) => {
                                  const Icon = child.icon;
                                  return (
                                    <Link
                                      key={child.href}
                                      href={`/en${child.href}`}
                                      onClick={onClose}
                                      className="group flex items-center gap-3 rounded-xl py-2.5 px-2 transition-colors hover:bg-white/50"
                                    >
                                      <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${child.color}`}
                                      >
                                        <Icon className="h-4 w-4" />
                                      </span>
                                      <span className="font-display text-lg font-semibold text-ink-dark group-hover:text-showcase-purple transition-colors sm:text-xl">
                                        {t(child.labelKey)}
                                      </span>
                                    </Link>
                                  );
                                }
                              )}

                              {/* View all link */}
                              <Link
                                href={`/en${item.href}`}
                                onClick={onClose}
                                className="mt-1 inline-flex items-center gap-1 px-2 text-sm font-bold text-showcase-purple transition-colors hover:text-showcase-purple/70"
                              >
                                {t("viewAll")}{" "}
                                {t(item.labelKey).toLowerCase()}{" "}
                                <span aria-hidden="true">&rarr;</span>
                              </Link>
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Simple link */
                    <Link
                      href={`/en${item.href}`}
                      onClick={onClose}
                      className="block py-2 font-display text-3xl font-bold text-ink-dark transition-colors hover:text-showcase-purple sm:text-4xl"
                    >
                      {t(item.labelKey)}
                    </Link>
                  )}
                </m.div>
              );
            })}
          </div>

          {/* Bottom section */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="flex flex-col gap-3 px-6 pb-8 pt-2"
          >
            {/* Search pill */}
            <button
              onClick={openSearch}
              className="flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-sm px-5 py-3.5 text-left transition-all hover:bg-white hover:shadow-sm"
            >
              <Search className="h-5 w-5 text-ink-light" />
              <span className="text-base text-ink-muted">
                {t("searchSite")}
              </span>
              <span className="ml-auto rounded-lg bg-pastel-lavender px-2 py-0.5 text-[11px] font-semibold text-ink-light">
                Ctrl+K
              </span>
            </button>

            {/* Visit .com */}
            <a
              href="https://entermedschool.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-showcase-purple/25 bg-white/60 px-5 py-3.5 font-display font-bold text-showcase-purple transition-all hover:bg-white hover:border-showcase-purple hover:shadow-sm"
            >
              {t("visitCom")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
