"use client";

import { Mail, PenTool, Download, Heart, MessageCircle } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyButton from "@/components/shared/ChunkyButton";
import { useTranslations } from "next-intl";

const steps = [
  {
    icon: Mail,
    color: "bg-showcase-coral/10 text-showcase-coral",
    borderColor: "border-showcase-coral",
  },
  {
    icon: PenTool,
    color: "bg-showcase-purple/10 text-showcase-purple",
    borderColor: "border-showcase-purple",
  },
  {
    icon: Download,
    color: "bg-showcase-teal/10 text-showcase-teal",
    borderColor: "border-showcase-teal",
  },
  {
    icon: Heart,
    color: "bg-showcase-pink/10 text-showcase-pink",
    borderColor: "border-showcase-pink",
  },
];

export default function HowItWorks() {
  const t = useTranslations("universities.howItWorks");

  return (
    <section className="mx-auto max-w-5xl">
      <AnimatedSection animation="fadeUp" delay={0.1}>
        <h2 className="mb-2 text-center font-display text-2xl font-bold text-ink-dark sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-ink-muted">
          {t("subtitle")}
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <AnimatedSection
              key={i}
              animation="popIn"
              delay={0.2 + i * 0.08}
              spring
            >
              <div
                className={`relative h-full rounded-2xl border-3 border-ink-dark/10 bg-white p-5 shadow-chunky-sm transition-all hover:-translate-y-1 hover:shadow-chunky`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {t("stepLabel", { number: i + 1 })}
                  </span>
                </div>
                <h3 className="mb-1 font-display text-base font-bold text-ink-dark">
                  {t(`steps.${i}.title`)}
                </h3>
                <p className="text-sm text-ink-muted">
                  {t(`steps.${i}.description`)}
                </p>
              </div>
            </AnimatedSection>
          );
        })}
      </div>

      <AnimatedSection animation="fadeUp" delay={0.55}>
        <div className="mt-8 rounded-2xl border-3 border-showcase-green/30 bg-showcase-green/5 p-6 text-center">
          <p className="mb-1 font-display text-lg font-bold text-showcase-green">
            {t("freeCallout.title")}
          </p>
          <p className="mx-auto mb-4 max-w-xl text-sm text-ink-muted">
            {t("freeCallout.description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ChunkyButton
              href="mailto:ari@entermedschool.com"
              variant="primary"
              size="sm"
              external
            >
              <Mail className="h-4 w-4" />
              {t("freeCallout.email")}
            </ChunkyButton>
            <ChunkyButton
              href="https://wa.me/393756123111"
              variant="green"
              size="sm"
              external
            >
              <MessageCircle className="h-4 w-4" />
              {t("freeCallout.whatsapp")}
            </ChunkyButton>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
