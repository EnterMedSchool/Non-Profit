import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Code, Image as ImageIcon, Copy, ExternalLink } from "lucide-react";
import { mediaAssets, getMediaAssetBySlug } from "@/data/media-assets";
import { getSoftwareSourceCodeJsonLd, getFAQPageJsonLd } from "@/lib/metadata";
import { routing } from "@/i18n/routing";
import AnimatedSection from "@/components/shared/AnimatedSection";
import MediaEmbedCodeSnippets from "@/components/resources/MediaEmbedCodeSnippets";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

/* ── Static generation ──────────────────────────────────────────── */

export async function generateStaticParams() {
  return mediaAssets.map((a) => ({ slug: a.slug }));
}

/* ── SEO metadata ───────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const asset = getMediaAssetBySlug(slug);
  if (!asset) return {};

  const pageUrl = `${BASE_URL}/${locale}/resources/media/${slug}/embed-code`;
  const title = `Embed ${asset.name} — Free HTML Code for Websites & LMS`;
  const description = `Get free embed code for the ${asset.name} illustration. Copy and paste HTML to embed this medical diagram on your website, blog, or LMS with proper attribution.`;

  const keywords = [
    `embed ${asset.name.toLowerCase()}`,
    `${asset.name.toLowerCase()} HTML code`,
    `free embeddable ${asset.category} diagram`,
    "medical illustration embed code",
    "embed medical diagram",
    ...asset.seoKeywords.slice(0, 3),
  ];

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}/resources/media/${slug}/embed-code`;
  }
  languages["x-default"] = `${BASE_URL}/en/resources/media/${slug}/embed-code`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl, languages },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      siteName: "EnterMedSchool.org",
      images: [
        {
          url: asset.imagePath,
          width: asset.width,
          height: asset.height,
          alt: `${asset.name} embed code`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    keywords,
  };
}

/* ── Page ────────────────────────────────────────────────────────── */

export default async function MediaEmbedCodePage({ params }: Props) {
  const { locale, slug } = await params;
  const asset = getMediaAssetBySlug(slug);
  if (!asset) notFound();

  const pageUrl = `${BASE_URL}/${locale}/resources/media/${slug}/embed-code`;
  const assetPageUrl = `${BASE_URL}/${locale}/resources/media/${slug}`;
  const imageUrl = asset.imagePath;

  // JSON-LD
  const sourceCodeJsonLd = getSoftwareSourceCodeJsonLd({
    codePageUrl: pageUrl,
    title: asset.name,
    description: `Embeddable HTML code for the ${asset.name} medical illustration.`,
    locale,
    sourceUrl: `https://github.com/enterMedSchool/Non-Profit`,
    keywords: asset.seoKeywords,
  });

  const faqItems = [
    {
      question: `How do I embed the ${asset.name} on my website?`,
      answer: `Copy the HTML embed code from this page and paste it into your website, blog, or LMS. The code includes proper attribution as required by the CC BY 4.0 license.`,
    },
    {
      question: `Is the ${asset.name} free to embed?`,
      answer: `Yes! All EnterMedSchool media assets are free to use, embed, and share under the CC BY 4.0 license. Just keep the attribution link intact.`,
    },
    {
      question: `Can I modify the embed code?`,
      answer: `Yes, you can adjust the width, height, and styling to fit your layout. The only requirement is to keep the attribution link to EnterMedSchool.org.`,
    },
    {
      question: `Does embedding count as commercial use?`,
      answer: `The CC BY 4.0 license permits both commercial and non-commercial use. You are free to use the embed code on any website, including commercial educational platforms.`,
    },
  ];
  const faqJsonLd = getFAQPageJsonLd(faqItems, locale);

  // Embed code snippets
  const imgEmbedCode = `<figure style="max-width:${asset.width}px;margin:1em auto;">
  <img
    src="${imageUrl}"
    alt="${asset.name} — Free medical illustration by EnterMedSchool.org"
    width="${asset.width}"
    height="${asset.height}"
    loading="lazy"
    style="width:100%;height:auto;"
  />
  <figcaption style="font-size:0.85em;text-align:center;color:#666;margin-top:0.5em;">
    <a href="${assetPageUrl}" target="_blank" rel="noopener">
      ${asset.name}
    </a> by <a href="${BASE_URL}" target="_blank" rel="noopener">EnterMedSchool.org</a>
    — <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>
  </figcaption>
</figure>`;

  const markdownCode = `![${asset.name}](${imageUrl})

*[${asset.name}](${assetPageUrl}) by [EnterMedSchool.org](${BASE_URL}) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)*`;

  // Other embeddable assets
  const otherAssets = mediaAssets.filter((a) => a.id !== asset.id);

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(sourceCodeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ── Back link ── */}
        <AnimatedSection animation="slideLeft">
          <Link
            href={`/${locale}/resources/media/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-showcase-purple hover:underline mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {asset.name}
          </Link>
        </AnimatedSection>

        {/* ── Title ── */}
        <AnimatedSection animation="fadeUp" delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-showcase-purple to-showcase-blue shadow-md">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
                Embed {asset.name}
              </h1>
              <p className="text-sm text-ink-muted">
                Copy the code below to embed this illustration on your website or LMS
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Preview ── */}
        <AnimatedSection animation="scaleIn" delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-2xl border-3 border-showcase-navy bg-pastel-cream shadow-chunky-lg">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={asset.imagePath}
                alt={`${asset.name} — Preview`}
                fill
                className="object-contain p-8"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
            <div className="border-t-2 border-showcase-navy/10 bg-white/80 px-4 py-2 text-center text-xs text-ink-muted">
              <ImageIcon className="mr-1 inline h-3 w-3" />
              {asset.name} — {asset.format.toUpperCase()} ({asset.width} &times; {asset.height}px)
            </div>
          </div>
        </AnimatedSection>

        {/* ── Embed code snippets (client component for copy) ── */}
        <AnimatedSection animation="fadeUp" delay={0.15}>
          <MediaEmbedCodeSnippets
            imgEmbedCode={imgEmbedCode}
            markdownCode={markdownCode}
            assetName={asset.name}
          />
        </AnimatedSection>

        {/* ── FAQ ── */}
        <AnimatedSection animation="fadeUp" delay={0.25}>
          <div className="mt-12 rounded-2xl border-2 border-ink-light/10 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-ink-dark">
              Frequently Asked Questions
            </h2>
            <dl className="mt-4 space-y-4">
              {faqItems.map((item, i) => (
                <div key={i}>
                  <dt className="text-sm font-bold text-ink-dark">{item.question}</dt>
                  <dd className="mt-1 text-sm text-ink-muted leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </AnimatedSection>

        {/* ── Other embeddable assets ── */}
        {otherAssets.length > 0 && (
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <div className="mt-12 border-t-2 border-ink-light/10 pt-8">
              <h2 className="font-display text-lg font-bold text-ink-dark">
                More Embeddable Illustrations
              </h2>
              <div className="mt-4 space-y-2">
                {otherAssets.map((a) => (
                  <Link
                    key={a.id}
                    href={`/${locale}/resources/media/${a.slug}/embed-code`}
                    className="flex items-center justify-between rounded-xl border-2 border-transparent px-3 py-2 text-sm transition-all hover:border-showcase-purple/15 hover:bg-pastel-lavender/30"
                  >
                    <span className="font-semibold text-ink-dark">{a.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-ink-light" />
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
