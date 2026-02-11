"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon,
  HelpCircle,
  Wrench,
  Calculator,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Shield,
} from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";

/* ── Section card data ────────────────────────────────────────────── */

const sectionPaths = [
  {
    path: "/tools",
    titleKey: "hub.tools",
    descKey: "hub.toolsDesc",
    icon: Wrench,
    color: "from-showcase-teal to-showcase-green",
    iconBg: "bg-showcase-teal",
    accent: "text-showcase-teal",
    border: "border-showcase-teal/30",
    hoverShadow: "hover:shadow-[0_6px_24px_rgba(0,217,192,0.15)]",
  },
  {
    path: "/calculators",
    titleKey: "hub.calculators",
    descKey: "hub.calculatorsDesc",
    icon: Calculator,
    color: "from-showcase-purple to-showcase-blue",
    iconBg: "bg-showcase-purple",
    accent: "text-showcase-purple",
    border: "border-showcase-purple/30",
    hoverShadow: "hover:shadow-[0_6px_24px_rgba(108,92,231,0.15)]",
  },
  {
    path: "/resources/pdfs",
    titleKey: "hub.pdfs",
    descKey: "hub.pdfsDesc",
    icon: FileText,
    color: "from-showcase-blue to-showcase-teal",
    iconBg: "bg-showcase-blue",
    accent: "text-showcase-blue",
    border: "border-showcase-blue/30",
    hoverShadow: "hover:shadow-[0_6px_24px_rgba(84,160,255,0.15)]",
  },
  {
    path: "/resources/visuals",
    titleKey: "hub.visuals",
    descKey: "hub.visualsDesc",
    icon: ImageIcon,
    color: "from-showcase-green to-showcase-teal",
    iconBg: "bg-showcase-green",
    accent: "text-showcase-green",
    border: "border-showcase-green/30",
    hoverShadow: "hover:shadow-[0_6px_24px_rgba(16,185,129,0.15)]",
  },
  {
    path: "/clinical-semiotics",
    titleKey: "hub.clinicalSemiotics",
    descKey: "hub.clinicalSemioticsDesc",
    icon: Stethoscope,
    color: "from-showcase-coral to-showcase-orange",
    iconBg: "bg-showcase-coral",
    accent: "text-showcase-coral",
    border: "border-showcase-coral/30",
    hoverShadow: "hover:shadow-[0_6px_24px_rgba(255,111,97,0.15)]",
  },
  {
    path: "/resources/questions",
    titleKey: "hub.questions",
    descKey: "hub.questionsDesc",
    icon: HelpCircle,
    color: "from-showcase-orange to-showcase-yellow",
    iconBg: "bg-showcase-orange",
    accent: "text-showcase-orange",
    border: "border-showcase-orange/30",
    hoverShadow: "hover:shadow-[0_6px_24px_rgba(255,159,67,0.15)]",
  },
  {
    path: "/resources/videos",
    titleKey: "hub.videos",
    descKey: "hub.videosDesc",
    icon: Video,
    color: "from-showcase-pink to-showcase-purple",
    iconBg: "bg-showcase-pink",
    accent: "text-showcase-pink",
    border: "border-showcase-pink/30",
    hoverShadow: "hover:shadow-[0_6px_24px_rgba(236,72,153,0.15)]",
  },
];

export default function ResourcesPage() {
  const t = useTranslations("resources");
  const locale = useLocale();

  const sections = sectionPaths.map((s) => ({
    ...s,
    href: `/${locale}${s.path}`,
  }));

  return (
    <main className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titlePre="Free"
          titleHighlight="Resources"
          titlePost="for Everyone"
          gradient="from-showcase-green via-showcase-teal to-showcase-purple"
          annotation="everything you need!"
          annotationColor="text-showcase-green"
          subtitle="Tools, calculators, study materials, visual lessons, clinical training, and more — all free and open-source."
          floatingIcons={<>
            <BookOpen className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <FileText className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-yellow/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Wrench className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-teal/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Sparkles className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        {/* ── Attribution Reminder ── */}
        <div className="mt-8 rounded-xl border-2 border-showcase-teal/20 bg-showcase-teal/5 px-5 py-3 text-sm text-ink-muted flex items-center gap-2">
          <Shield className="h-4 w-4 text-showcase-teal flex-shrink-0" />
          <span>All resources are free for non-commercial educational use. <Link href={`/${locale}/license`} className="font-semibold text-showcase-purple hover:underline">Attribution required</Link>.</span>
        </div>

        {/* ── Section Cards ── */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <AnimatedSection key={section.href} delay={i * 0.06} animation="popIn" spring>
                <Link
                  href={section.href}
                  className={`group relative flex h-full flex-col rounded-2xl border-3 ${section.border} bg-white p-6 shadow-chunky transition-all hover:-translate-y-1 ${section.hoverShadow}`}
                >
                  {/* Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 font-display text-lg font-bold text-ink-dark">
                    {t(section.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    {t(section.descKey)}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${section.accent} transition-all group-hover:gap-2.5`}>
                      {t("hub.explore")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </main>
  );
}
