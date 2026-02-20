"use client";

import { Mail, MessageCircle, Heart } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyButton from "@/components/shared/ChunkyButton";
import { useTranslations, useLocale } from "next-intl";

interface JoinUsCTAProps {
  variant?: "full" | "inline" | "compact";
  universityName?: string;
}

export default function JoinUsCTA({
  variant = "full",
  universityName,
}: JoinUsCTAProps) {
  const t = useTranslations("universities.joinCta");
  const locale = useLocale();

  if (variant === "compact") {
    return (
      <AnimatedSection animation="fadeUp" delay={0.2}>
        <div className="rounded-2xl border-2 border-dashed border-showcase-purple/20 bg-showcase-purple/5 p-5 text-center">
          <p className="mb-1 font-display text-sm font-bold text-ink-dark">
            {universityName
              ? t("missingCourseTitle", { university: universityName })
              : t("dontSeeTitle")}
          </p>
          <p className="mb-3 text-xs text-ink-muted">{t("compactDesc")}</p>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <ChunkyButton
              href="mailto:ari@entermedschool.com"
              variant="primary"
              size="sm"
              external
            >
              <Mail className="h-3.5 w-3.5" />
              {t("emailBtn")}
            </ChunkyButton>
            <ChunkyButton
              href="https://wa.me/393756123111"
              variant="green"
              size="sm"
              external
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {t("whatsappBtn")}
            </ChunkyButton>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (variant === "inline") {
    return (
      <AnimatedSection animation="fadeUp" delay={0.2}>
        <div className="rounded-2xl border-3 border-ink-dark/10 bg-white p-6 shadow-chunky-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-showcase-coral/10 text-showcase-coral">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink-dark">
                {universityName
                  ? t("missingCourseTitle", { university: universityName })
                  : t("dontSeeTitle")}
              </h3>
              <p className="mb-3 mt-1 text-sm text-ink-muted">
                {t("inlineDesc")}
              </p>
              <div className="flex flex-wrap gap-2">
                <ChunkyButton
                  href="mailto:ari@entermedschool.com"
                  variant="primary"
                  size="sm"
                  external
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t("emailBtn")}
                </ChunkyButton>
                <ChunkyButton
                  href="https://wa.me/393756123111"
                  variant="green"
                  size="sm"
                  external
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t("whatsappBtn")}
                </ChunkyButton>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection animation="fadeUp" delay={0.3}>
      <div className="relative overflow-hidden rounded-2xl border-3 border-ink-dark/10 bg-white p-8 shadow-chunky sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #6C5CE7 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-showcase-coral/10 text-showcase-coral">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-ink-dark sm:text-3xl">
            {t("fullTitle")}
          </h2>
          <p className="mb-4 text-ink-muted">{t("fullDesc")}</p>

          <ul className="mb-6 inline-flex flex-col gap-1.5 text-left text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-showcase-purple" />
              {t("benefits.flashcards")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-showcase-teal" />
              {t("benefits.summaries")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-showcase-coral" />
              {t("benefits.questionBanks")}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-showcase-green" />
              {t("benefits.anki")}
            </li>
          </ul>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ChunkyButton
              href="mailto:ari@entermedschool.com"
              variant="primary"
              external
            >
              <Mail className="h-4 w-4" />
              {t("emailBtn")}
            </ChunkyButton>
            <ChunkyButton
              href="https://wa.me/393756123111"
              variant="green"
              external
            >
              <MessageCircle className="h-4 w-4" />
              {t("whatsappBtn")}
            </ChunkyButton>
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            {t("orVisit")}{" "}
            <a
              href={`/${locale}/volunteer`}
              className="font-semibold text-showcase-purple hover:underline"
            >
              {t("volunteerPage")}
            </a>
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}
