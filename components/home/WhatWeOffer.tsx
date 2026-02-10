"use client";

import { useTranslations } from "next-intl";
import { m } from "framer-motion";
import {
  HelpCircle,
  Video,
  FileText,
  Eye,
  Wrench,
  Presentation,
  Layers,
  Chrome,
  ArrowUpRight,
} from "lucide-react";
import StickerBadge from "@/components/shared/StickerBadge";
import SectionHeading from "@/components/shared/SectionHeading";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Link from "next/link";

/* ── Card configuration with bento grid sizing ── */
const offerings = [
  {
    key: "questions",
    icon: HelpCircle,
    badge: "Free",
    badgeColor: "green" as const,
    href: "/en/resources/questions",
    gradient: "from-showcase-purple via-showcase-blue to-showcase-teal",
    iconBg: "bg-white/20",
    size: "hero" as const,
    pattern: "dots",
  },
  {
    key: "videos",
    icon: Video,
    badge: "Free",
    badgeColor: "green" as const,
    href: "/en/resources/videos",
    gradient: "from-showcase-teal via-showcase-green to-showcase-blue",
    iconBg: "bg-white/20",
    size: "hero" as const,
    pattern: "none",
  },
  {
    key: "pdfs",
    icon: FileText,
    badge: "Download",
    badgeColor: "teal" as const,
    href: "/en/resources/pdfs",
    gradient: "from-showcase-orange via-showcase-yellow to-showcase-orange",
    iconBg: "bg-white/20",
    size: "medium" as const,
    pattern: "lines",
  },
  {
    key: "visuals",
    icon: Eye,
    badge: "Open Source",
    badgeColor: "purple" as const,
    href: "/en/resources/visuals",
    gradient: "from-showcase-coral via-showcase-pink to-showcase-purple",
    iconBg: "bg-white/20",
    size: "medium" as const,
    pattern: "none",
  },
  {
    key: "tools",
    icon: Wrench,
    badge: "Free",
    badgeColor: "green" as const,
    href: "/en/tools",
    gradient: "from-showcase-green via-showcase-teal to-showcase-blue",
    iconBg: "bg-white/20",
    size: "medium" as const,
    pattern: "dots",
  },
  {
    key: "templates",
    icon: Presentation,
    badge: "Download",
    badgeColor: "teal" as const,
    href: "/en/for-professors/templates",
    gradient: "from-showcase-blue via-showcase-purple to-showcase-pink",
    iconBg: "bg-white/20",
    size: "small" as const,
    pattern: "none",
  },
  {
    key: "ankiAddon",
    icon: Layers,
    badge: "Free",
    badgeColor: "green" as const,
    href: "https://entermedschool.com",
    external: true,
    gradient: "from-showcase-teal via-showcase-green to-showcase-yellow",
    iconBg: "bg-white/20",
    size: "small" as const,
    pattern: "lines",
  },
  {
    key: "chromeExtension",
    icon: Chrome,
    badge: "Free",
    badgeColor: "green" as const,
    href: "https://entermedschool.com",
    external: true,
    gradient: "from-showcase-pink via-showcase-coral to-showcase-orange",
    iconBg: "bg-white/20",
    size: "small" as const,
    pattern: "none",
  },
] as const;

/* ── Bento card with 3D tilt on hover ── */
function BentoCard({
  item,
  index,
  t,
}: {
  item: (typeof offerings)[number];
  index: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const Icon = item.icon;
  const isExternal = "external" in item && item.external;
  const isHero = item.size === "hero";
  const isSmall = item.size === "small";

  const CardWrapper = isExternal ? "a" : Link;
  const linkProps = isExternal
    ? { href: item.href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { href: item.href };

  return (
    <AnimatedSection
      delay={index * 0.06}
      animation={index % 2 === 0 ? "fadeUp" : "popIn"}
      spring
      className={
        isHero
          ? "sm:col-span-2 lg:col-span-2"
          : isSmall
            ? ""
            : ""
      }
    >
      <m.div
        className="tilt-3d h-full"
        whileHover={{
          rotateX: -2,
          rotateY: 3,
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
      >
        <CardWrapper
          {...linkProps}
          className={`
            group relative block h-full overflow-hidden rounded-2xl border-3 border-showcase-navy
            shadow-chunky-lg transition-all duration-300
            hover:-translate-y-1 hover:shadow-chunky-xl
            bg-gradient-to-br ${item.gradient}
            ${isHero ? "min-h-[220px] sm:min-h-[260px]" : isSmall ? "min-h-[160px]" : "min-h-[180px]"}
          `}
        >
          {/* Pattern overlay */}
          {item.pattern !== "none" && (
            <div
              className={`absolute inset-0 opacity-[0.08] ${
                item.pattern === "dots" ? "pattern-dots" : "pattern-lines"
              }`}
            />
          )}

          {/* Glassmorphism overlay on hover */}
          <div className="absolute inset-0 bg-white/0 backdrop-blur-0 transition-all duration-500 group-hover:bg-white/10 group-hover:backdrop-blur-[2px]" />

          {/* Large watermark icon */}
          <Icon
            className={`absolute -right-4 -bottom-4 ${
              isHero ? "h-32 w-32 sm:h-40 sm:w-40" : "h-24 w-24"
            } text-white/[0.12] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:text-white/[0.18]`}
            strokeWidth={1}
          />

          {/* Content */}
          <div className={`relative z-10 flex h-full flex-col ${isHero ? "p-6 sm:p-8" : "p-5"}`}>
            <div className="flex items-start justify-between mb-auto">
              <div
                className={`flex ${isHero ? "h-14 w-14" : "h-11 w-11"} items-center justify-center rounded-xl ${item.iconBg} backdrop-blur-sm border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/30`}
              >
                <Icon
                  className={`${isHero ? "h-7 w-7" : "h-5 w-5"} text-white`}
                />
              </div>
              <StickerBadge color={item.badgeColor} size="sm">
                {item.badge}
              </StickerBadge>
            </div>

            <div className="mt-auto">
              <h3
                className={`font-display ${
                  isHero ? "text-xl sm:text-2xl" : "text-base"
                } font-bold text-white drop-shadow-sm`}
              >
                {t(`${item.key}.title`)}
              </h3>
              <p
                className={`mt-1.5 ${
                  isHero ? "text-sm sm:text-base" : "text-sm"
                } leading-relaxed text-white/80`}
              >
                {t(`${item.key}.description`)}
              </p>
            </div>

            {/* Arrow indicator */}
            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight className="h-5 w-5 text-white/60" />
            </div>
          </div>
        </CardWrapper>
      </m.div>
    </AnimatedSection>
  );
}

export default function WhatWeOffer() {
  const t = useTranslations("whatWeOffer");

  return (
    <section className="relative z-10 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="blurIn">
          <SectionHeading
            title={t("title")}
            highlight="Everything"
            underlineColor="teal"
            subtitle={t("subtitle")}
          />
        </AnimatedSection>

        {/* Bento grid layout */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Hero cards: span 2 columns */}
          {offerings.slice(0, 2).map((item, i) => (
            <BentoCard key={item.key} item={item} index={i} t={t} />
          ))}

          {/* Medium cards */}
          {offerings.slice(2, 5).map((item, i) => (
            <BentoCard key={item.key} item={item} index={i + 2} t={t} />
          ))}

          {/* Small cards: fill remaining space */}
          {offerings.slice(5).map((item, i) => (
            <BentoCard key={item.key} item={item} index={i + 5} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
