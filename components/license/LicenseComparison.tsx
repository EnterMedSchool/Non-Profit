"use client";

import { useTranslations } from "next-intl";
import { Check, X, Shield } from "lucide-react";
import { m } from "framer-motion";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";

const borderColors = [
  "border-showcase-teal/30",
  "border-showcase-green/30",
  "border-showcase-purple",
  "border-showcase-navy/20",
];

const iconBgs = [
  "bg-showcase-teal/10 text-showcase-teal",
  "bg-showcase-green/10 text-showcase-green",
  "bg-showcase-purple/10 text-showcase-purple",
  "bg-showcase-navy/10 text-showcase-navy",
];

const traitIcons = [
  [Check, Check, X],
  [Check, Check, Check],
  [Check, Check, Check],
  [X, X, X],
];

export default function LicenseComparison() {
  const t = useTranslations("license.comparison");
  const licenses = t.raw("licenses") as {
    name: string;
    traits: string[];
    active: boolean;
  }[];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {licenses.map((license, i) => (
        <AnimatedSection key={i} delay={0.05 + i * 0.08} animation="fadeUp">
          <m.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative rounded-2xl border-3 ${
              license.active
                ? "border-showcase-purple bg-gradient-to-br from-showcase-purple/5 via-white to-showcase-teal/5 shadow-chunky"
                : `${borderColors[i]} bg-white shadow-chunky-sm`
            } p-5 transition-shadow`}
          >
            {license.active && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <StickerBadge color="purple" size="sm">
                  <Shield className="h-3 w-3" />
                  {t("ours")}
                </StickerBadge>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBgs[i]}`}
              >
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-ink-dark">
                {license.name}
              </h3>
            </div>

            <ul className="mt-4 space-y-2.5">
              {license.traits.map((trait, j) => {
                const TraitIcon = traitIcons[i]?.[j] || Check;
                const isPositive = TraitIcon === Check;
                return (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-xs text-ink-muted"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ${
                        isPositive
                          ? "bg-showcase-green/10 text-showcase-green"
                          : "bg-red-100 text-red-400"
                      }`}
                    >
                      <TraitIcon className="h-3 w-3" />
                    </span>
                    {trait}
                  </li>
                );
              })}
            </ul>
          </m.div>
        </AnimatedSection>
      ))}
    </div>
  );
}
