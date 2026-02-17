"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  GitCompare,
  Footprints,
  CircleDot,
  FileText,
  HelpCircle,
} from "lucide-react";

const sections = [
  { id: "section-allowed", key: "allowed", icon: Check, color: "bg-showcase-green", text: "text-white" },
  { id: "section-comparison", key: "comparison", icon: GitCompare, color: "bg-showcase-teal", text: "text-ink-dark" },
  { id: "section-quickstart", key: "quickStart", icon: Footprints, color: "bg-showcase-orange", text: "text-ink-dark" },
  { id: "generator", key: "generator", icon: CircleDot, color: "bg-showcase-purple", text: "text-white" },
  { id: "section-full-license", key: "fullLicense", icon: FileText, color: "bg-showcase-navy", text: "text-white" },
  { id: "section-faq", key: "faq", icon: HelpCircle, color: "bg-showcase-coral", text: "text-white" },
];

export default function SectionNav() {
  const t = useTranslations("license.sectionNav");

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {sections.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`inline-flex items-center gap-2 rounded-xl ${s.color} ${s.text} border-2 border-showcase-navy/20 px-4 py-2 text-sm font-display font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0`}
          >
            <Icon className="h-4 w-4" />
            {t(s.key)}
          </button>
        );
      })}
    </div>
  );
}
