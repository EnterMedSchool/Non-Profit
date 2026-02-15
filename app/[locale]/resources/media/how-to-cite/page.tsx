import Link from "next/link";
import { ArrowRight, BookOpen, Copy, FileText, GraduationCap, Globe, Monitor } from "lucide-react";
import { mediaAssets } from "@/data/media-assets";
import { routing } from "@/i18n/routing";
import AnimatedSection from "@/components/shared/AnimatedSection";
import HowToCiteCopyBlock from "@/components/resources/HowToCiteCopyBlock";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string }>;
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  const title = "How to Cite Medical Illustrations — APA, MLA, Harvard Citation Guide";
  const description =
    "Learn how to properly cite EnterMedSchool medical illustrations in APA 7th, MLA, Harvard, and in-slide formats. Copy-ready citation examples for presentations, papers, and websites.";
  const url = `${BASE_URL}/${locale}/resources/media/how-to-cite`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media/how-to-cite`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media/how-to-cite`;

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "EnterMedSchool.org",
      images: [{ url: ogImagePath("resources", "media", "how-to-cite"), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" as const, title, description },
    keywords: [
      "cite medical illustrations",
      "medical image citation",
      "APA cite image",
      "MLA cite diagram",
      "Harvard citation image",
      "CC BY 4.0 citation",
      "how to cite free medical images",
    ],
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function HowToCitePage({ params }: Props) {
  const { locale } = await params;

  // Use first asset as example
  const example = mediaAssets[0];
  const exampleUrl = `${BASE_URL}/${locale}/resources/media/${example.slug}`;
  const currentYear = new Date().getFullYear();

  // JSON-LD: HowTo schema
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Cite EnterMedSchool Medical Illustrations",
    description:
      "Step-by-step guide to properly citing EnterMedSchool medical illustrations in academic papers, presentations, and websites.",
    step: [
      {
        "@type": "HowToStep",
        name: "Identify the illustration",
        text: "Find the name and URL of the illustration you want to cite from the EnterMedSchool media library.",
      },
      {
        "@type": "HowToStep",
        name: "Choose your citation format",
        text: "Select the appropriate citation format for your context: APA, MLA, Harvard, or in-slide format.",
      },
      {
        "@type": "HowToStep",
        name: "Copy the citation",
        text: "Copy the formatted citation from the examples below and paste it into your work.",
      },
      {
        "@type": "HowToStep",
        name: "Include the license notice",
        text: "Always mention the CC BY 4.0 license and link back to EnterMedSchool.org.",
      },
    ],
  };

  // Citation examples
  const citations = {
    apa: `EnterMedSchool.org. (${currentYear}). ${example.name} [Digital illustration]. EnterMedSchool. ${exampleUrl}. Licensed under CC BY 4.0.`,
    mla: `"${example.name}." EnterMedSchool.org, ${currentYear}, ${exampleUrl}. CC BY 4.0.`,
    harvard: `EnterMedSchool.org (${currentYear}) ${example.name} [Online image]. Available at: ${exampleUrl} (Accessed: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}). CC BY 4.0.`,
    slide: `Image: "${example.name}" by EnterMedSchool.org — CC BY 4.0`,
    html: `<a href="${exampleUrl}">${example.name}</a> by <a href="${BASE_URL}">EnterMedSchool.org</a> — <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`,
    lms: `${example.name} by EnterMedSchool.org (${exampleUrl}). Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).`,
  };

  const sections = [
    {
      id: "apa",
      icon: BookOpen,
      title: "APA 7th Edition",
      description:
        "Use this format for academic papers, journal articles, and research documents following APA style guidelines.",
      code: citations.apa,
      color: "purple" as const,
    },
    {
      id: "mla",
      icon: FileText,
      title: "MLA Format",
      description:
        "Use this format for humanities papers, English essays, and works following MLA style guidelines.",
      code: citations.mla,
      color: "teal" as const,
    },
    {
      id: "harvard",
      icon: GraduationCap,
      title: "Harvard Style",
      description:
        "Use this format for UK and Australian academic papers following the Harvard referencing system.",
      code: citations.harvard,
      color: "coral" as const,
    },
    {
      id: "slide",
      icon: Monitor,
      title: "In-Slide Citation (PowerPoint / Google Slides)",
      description:
        "Add this line at the bottom of your slide or in the slide notes. Keep it concise but include attribution.",
      code: citations.slide,
      color: "orange" as const,
    },
    {
      id: "html",
      icon: Globe,
      title: "Website / HTML",
      description:
        "Use this HTML snippet when embedding the illustration on a website or blog. The links satisfy the CC BY 4.0 attribution requirements.",
      code: citations.html,
      color: "blue" as const,
    },
    {
      id: "lms",
      icon: GraduationCap,
      title: "LMS (Moodle, Canvas, Blackboard)",
      description:
        "Paste this citation into your LMS course page, assignment description, or resource caption.",
      code: citations.lms,
      color: "green" as const,
    },
  ];

  const colorMap: Record<string, string> = {
    purple: "border-showcase-purple/20 bg-showcase-purple/5",
    teal: "border-showcase-teal/20 bg-showcase-teal/5",
    coral: "border-showcase-coral/20 bg-showcase-coral/5",
    orange: "border-showcase-orange/20 bg-showcase-orange/5",
    blue: "border-showcase-blue/20 bg-showcase-blue/5",
    green: "border-showcase-green/20 bg-showcase-green/5",
  };

  const iconColorMap: Record<string, string> = {
    purple: "from-showcase-purple to-showcase-blue",
    teal: "from-showcase-teal to-showcase-green",
    coral: "from-showcase-coral to-showcase-pink",
    orange: "from-showcase-orange to-showcase-yellow",
    blue: "from-showcase-blue to-showcase-purple",
    green: "from-showcase-green to-showcase-teal",
  };

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ── Hero ── */}
        <AnimatedSection animation="fadeUp" delay={0}>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-bold text-showcase-purple">
              <BookOpen className="h-3 w-3" />
              Citation Guide
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-dark sm:text-4xl">
              How to Cite{" "}
              <span className="bg-gradient-to-r from-showcase-purple via-showcase-blue to-showcase-teal bg-clip-text text-transparent">
                Medical Illustrations
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink-muted leading-relaxed">
              All EnterMedSchool illustrations are licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-showcase-purple hover:underline"
              >
                CC BY 4.0
              </a>
              . Here&apos;s how to properly cite them in different formats.
            </p>
          </div>
        </AnimatedSection>

        {/* ── Quick rules ── */}
        <AnimatedSection animation="fadeUp" delay={0.1}>
          <div className="mt-10 rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky-lg">
            <h2 className="font-display text-lg font-bold text-ink-dark">
              CC BY 4.0 Attribution Requirements
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-showcase-green/20 text-[10px] font-bold text-showcase-green">1</span>
                <span><strong>Name the creator:</strong> &ldquo;EnterMedSchool.org&rdquo;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-showcase-green/20 text-[10px] font-bold text-showcase-green">2</span>
                <span><strong>Link to the source:</strong> Include the URL of the illustration page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-showcase-green/20 text-[10px] font-bold text-showcase-green">3</span>
                <span><strong>Name the license:</strong> &ldquo;CC BY 4.0&rdquo; (link if possible)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-showcase-green/20 text-[10px] font-bold text-showcase-green">4</span>
                <span><strong>Note changes:</strong> If you modified the image, mention what you changed</span>
              </li>
            </ul>
          </div>
        </AnimatedSection>

        {/* ── Citation format sections ── */}
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <AnimatedSection key={section.id} animation="fadeUp" delay={0.15 + i * 0.05}>
              <div className={`mt-8 rounded-2xl border-2 ${colorMap[section.color]} p-6`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${iconColorMap[section.color]} shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-dark">
                      {section.title}
                    </h2>
                    <p className="text-xs text-ink-muted">{section.description}</p>
                  </div>
                </div>

                <HowToCiteCopyBlock code={section.code} label={section.title} />
              </div>
            </AnimatedSection>
          );
        })}

        {/* ── Example note ── */}
        <AnimatedSection animation="fadeUp" delay={0.5}>
          <p className="mt-8 text-center text-xs text-ink-light">
            Examples above use{" "}
            <Link
              href={`/${locale}/resources/media/${example.slug}`}
              className="font-semibold text-showcase-purple hover:underline"
            >
              {example.name}
            </Link>{" "}
            as a reference. Replace with the actual illustration name and URL you are citing.
          </p>
        </AnimatedSection>

        {/* ── Links ── */}
        <AnimatedSection animation="fadeUp" delay={0.55}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/resources/media`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple transition-all hover:gap-2.5"
            >
              Browse media assets
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/license`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-teal transition-all hover:gap-2.5"
            >
              Full license details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
