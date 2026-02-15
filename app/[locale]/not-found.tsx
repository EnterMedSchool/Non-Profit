"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, Search, BookOpen, Wrench, GraduationCap, FileText } from "lucide-react";
import { useLocale } from "next-intl";
import { m } from "framer-motion";
import ChunkyButton from "@/components/shared/ChunkyButton";
import AnimatedSection from "@/components/shared/AnimatedSection";

export default function NotFound() {
  const locale = useLocale();

  const quickLinks = [
    { href: `/${locale}/resources`, label: "Resources", icon: BookOpen },
    { href: `/${locale}/tools`, label: "Tools", icon: Wrench },
    { href: `/${locale}/resources/glossary`, label: "Glossary", icon: GraduationCap },
    { href: `/${locale}/articles`, label: "Articles", icon: FileText },
  ];

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("search:open"));
  };

  return (
    <main className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      {/* Gradient background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(108, 92, 231, 0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <AnimatedSection animation="popIn" spring>
        <div className="relative overflow-hidden rounded-3xl border-3 border-showcase-navy bg-white shadow-chunky-lg sm:p-0">
          {/* Rainbow accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green" />

          {/* Pattern dots overlay */}
          <div className="pattern-dots absolute inset-0 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 px-8 py-10 sm:px-16 sm:py-14">
            {/* Leo mascot with wobble animation */}
            <m.div
              initial={{ rotate: -8 }}
              animate={{ rotate: [-8, 8, -5, 5, 0] }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="mx-auto mb-6 w-fit"
            >
              <Image
                src={blobAsset("/logo.png")}
                alt="Leo mascot looking confused"
                width={80}
                height={80}
                className="rounded-2xl"
              />
            </m.div>

            <span className="font-handwritten text-8xl text-showcase-purple">404</span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
              Page Not Found
            </h1>
            <p className="mt-3 max-w-md mx-auto text-ink-muted">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
            </p>

            {/* Primary CTA */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <ChunkyButton href={`/${locale}`} variant="primary" size="lg">
                <Home className="h-5 w-5" />
                Go Home
              </ChunkyButton>
              <ChunkyButton variant="ghost" size="lg" onClick={openSearch}>
                <Search className="h-5 w-5" />
                Search Site
              </ChunkyButton>
            </div>

            {/* Quick links */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-ink-muted">Or try one of these:</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-navy/15 bg-white px-3.5 py-2 text-sm font-semibold text-ink-muted transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:text-showcase-purple hover:shadow-chunky-sm"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
