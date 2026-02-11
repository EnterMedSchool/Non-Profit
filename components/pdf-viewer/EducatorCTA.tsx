"use client";

import {
  GraduationCap,
  BookOpen,
  Download,
  Code,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { PDFBook } from "@/data/pdf-books";

interface EducatorCTAProps {
  book: PDFBook;
  locale?: string;
}

export default function EducatorCTA({ book, locale = "en" }: EducatorCTAProps) {
  const t = useTranslations("pdfViewer.educator");
  return (
    <section className="rounded-2xl border-3 border-showcase-purple/20 bg-gradient-to-br from-pastel-lavender/50 via-white to-pastel-cream/30 p-6 sm:p-8">
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-showcase-purple/10">
          <GraduationCap className="h-5 w-5 text-showcase-purple" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink-dark sm:text-xl">
            {t("title")}
          </h3>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FeatureItem
          icon={BookOpen}
          title={t("assignReading")}
          description={t("assignReadingDesc")}
        />
        <FeatureItem
          icon={Download}
          title={t("printDistribute")}
          description={t("printDistributeDesc")}
        />
        <FeatureItem
          icon={Code}
          title={t("embedLMS")}
          description={t("embedLMSDesc")}
        />
        <FeatureItem
          icon={Mail}
          title={t("requestMods")}
          description={t("requestModsDesc")}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={`mailto:ari@entermedschool.com?subject=Using ${encodeURIComponent(book.title)} in my course`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-5 py-2.5 text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
        >
          <Mail className="h-4 w-4" />
          {t("contactCta")}
        </a>
        <a
          href={`/${locale}/license`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-purple hover:underline"
        >
          {t("viewLicense")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-showcase-purple/60" />
      <div>
        <p className="text-sm font-bold text-ink-dark">{title}</p>
        <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
