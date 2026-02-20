"use client";

import { Users, Mail } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { useTranslations } from "next-intl";

interface ContributorsBannerProps {
  contributors: { name: string }[];
  universityName: string;
}

export default function ContributorsBanner({
  contributors,
  universityName,
}: ContributorsBannerProps) {
  const t = useTranslations("universities.contributors");

  if (contributors.length === 0) return null;

  const displayNames = contributors.slice(0, 3).map((c) => c.name);
  const remaining = contributors.length - displayNames.length;

  let namesText = displayNames.join(", ");
  if (remaining > 0) {
    namesText += ` ${t("andMore", { count: remaining })}`;
  }

  return (
    <AnimatedSection animation="fadeUp" delay={0.15}>
      <div className="rounded-2xl border-2 border-showcase-purple/10 bg-showcase-purple/5 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-showcase-purple/10 text-showcase-purple">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-dark sm:text-base">
              {t("title")}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">
              {t("thanks", { names: namesText })}
            </p>
            <a
              href="mailto:ari@entermedschool.com"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-showcase-purple/10 px-3 py-2 text-xs font-semibold text-showcase-purple transition-all hover:bg-showcase-purple/20 sm:mt-1.5 sm:min-h-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent sm:hover:underline"
            >
              <Mail className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              {t("wantToContribute")}
            </a>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
