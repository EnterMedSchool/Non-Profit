"use client";

import { useTranslations } from "next-intl";
import {
  HelpCircle,
  Video,
  FileText,
  Eye,
  Wrench,
  Presentation,
  Layers,
  Chrome,
} from "lucide-react";
import ChunkyCard from "@/components/shared/ChunkyCard";
import StickerBadge from "@/components/shared/StickerBadge";
import SectionHeading from "@/components/shared/SectionHeading";
import AnimatedSection from "@/components/shared/AnimatedSection";

const accentBarColors: Record<string, string> = {
  purple: "bg-showcase-purple",
  teal: "bg-showcase-teal",
  yellow: "bg-showcase-yellow",
  coral: "bg-showcase-coral",
  green: "bg-showcase-green",
  orange: "bg-showcase-orange",
  blue: "bg-showcase-blue",
  pink: "bg-showcase-pink",
};

const offerings = [
  { key: "questions", icon: HelpCircle, badge: "Free", badgeColor: "green" as const, href: "/en/resources/questions", accent: "purple" as const, iconBg: "bg-pastel-lavender", iconText: "text-showcase-purple", pattern: "dots" as const, bgTint: "bg-pastel-lavender/30" },
  { key: "videos", icon: Video, badge: "Free", badgeColor: "green" as const, href: "/en/resources/videos", accent: "teal" as const, iconBg: "bg-pastel-mint", iconText: "text-showcase-teal", pattern: "none" as const, bgTint: "bg-pastel-mint/30" },
  { key: "pdfs", icon: FileText, badge: "Download", badgeColor: "teal" as const, href: "/en/resources/pdfs", accent: "yellow" as const, iconBg: "bg-pastel-lemon", iconText: "text-showcase-orange", pattern: "lines" as const, bgTint: "bg-pastel-lemon/30" },
  { key: "visuals", icon: Eye, badge: "Open Source", badgeColor: "purple" as const, href: "/en/resources/visuals", accent: "coral" as const, iconBg: "bg-pastel-peach", iconText: "text-showcase-coral", pattern: "none" as const, bgTint: "bg-pastel-peach/30" },
  { key: "tools", icon: Wrench, badge: "Free", badgeColor: "green" as const, href: "/en/tools", accent: "green" as const, iconBg: "bg-pastel-mint", iconText: "text-showcase-green", pattern: "dots" as const, bgTint: "bg-pastel-mint/30" },
  { key: "templates", icon: Presentation, badge: "Download", badgeColor: "teal" as const, href: "/en/for-professors/templates", accent: "orange" as const, iconBg: "bg-pastel-lemon", iconText: "text-showcase-orange", pattern: "none" as const, bgTint: "bg-pastel-lemon/30" },
  { key: "ankiAddon", icon: Layers, badge: "Free", badgeColor: "green" as const, href: "https://entermedschool.com", external: true, accent: "blue" as const, iconBg: "bg-pastel-sky", iconText: "text-showcase-blue", pattern: "lines" as const, bgTint: "bg-pastel-sky/30" },
  { key: "chromeExtension", icon: Chrome, badge: "Free", badgeColor: "green" as const, href: "https://entermedschool.com", external: true, accent: "pink" as const, iconBg: "bg-pastel-peach", iconText: "text-showcase-pink", pattern: "none" as const, bgTint: "bg-pastel-peach/30" },
] as const;

export default function WhatWeOffer() {
  const t = useTranslations("whatWeOffer");

  return (
    <section className="relative z-10 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="blurIn">
          <SectionHeading
            title={t("title")}
            highlight="Everything"
            underlineColor="teal"
            subtitle={t("subtitle")}
          />
        </AnimatedSection>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offerings.map((item, i) => {
            const Icon = item.icon;
            const isExternal = "external" in item && item.external;
            // First two cards span 2 columns on large screens
            const isHeroCard = i < 2;

            return (
              <AnimatedSection
                key={item.key}
                delay={i * 0.06}
                animation={i % 2 === 0 ? "fadeUp" : "popIn"}
                spring
                className={isHeroCard ? "lg:col-span-2" : ""}
              >
                <ChunkyCard
                  href={item.href}
                  external={isExternal}
                  className={`h-full overflow-hidden ${isHeroCard ? "" : ""}`}
                  pattern={item.pattern}
                  hoverFillColor={item.accent}
                >
                  {/* Colored accent strip at top */}
                  <div className={`h-1.5 ${accentBarColors[item.accent]} transition-all duration-300 group-hover:h-2`} />
                  {/* Tinted background layer */}
                  <div className={`absolute inset-0 ${item.bgTint} -z-10 transition-opacity duration-300 group-hover:opacity-0`} />
                  <div className={`p-5 ${isHeroCard ? "sm:p-6" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-showcase-navy/20 ${item.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon className={`h-5 w-5 ${item.iconText} transition-colors duration-300 group-hover:text-white`} />
                      </div>
                      <StickerBadge color={item.badgeColor} size="sm">
                        {item.badge}
                      </StickerBadge>
                    </div>
                    <h3 className="font-display text-base font-bold text-ink-dark transition-colors duration-300 group-hover:text-white">
                      {t(`${item.key}.title`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted transition-colors duration-300 group-hover:text-white/80">
                      {t(`${item.key}.description`)}
                    </p>
                  </div>
                </ChunkyCard>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
