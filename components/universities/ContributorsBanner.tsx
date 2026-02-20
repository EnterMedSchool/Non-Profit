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
      <div className="rounded-2xl border-2 border-showcase-purple/10 bg-showcase-purple/5 p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-showcase-purple/10 text-showcase-purple">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-dark">
              {t("title")}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {t("thanks", { names: namesText })}
            </p>
            <a
              href="mailto:ari@entermedschool.com"
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-showcase-purple hover:underline"
            >
              <Mail className="h-3 w-3" />
              {t("wantToContribute")}
            </a>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
