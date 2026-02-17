import type { Metadata } from "next";
import { blobAsset } from "@/lib/blob-url";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Tag, BookOpen, Wrench } from "lucide-react";
import { blogPosts } from "@/data/blog-posts";
import { routing } from "@/i18n/routing";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ChunkyButton from "@/components/shared/ChunkyButton";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title = "Medical Education Articles — Study Guides & Resources";
  const description =
    "Free articles, study guides, and tips for medical students and educators. Learn anatomy, medical terminology, exam strategies, and more from EnterMedSchool.";

  return {
    title,
    description,
    keywords: [
      "medical education articles",
      "med school study tips",
      "anatomy study guide",
      "medical terminology guide",
      "free medical resources",
      "USMLE prep tips",
      "medical student advice",
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/articles`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/articles`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/articles`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/articles`,
      type: "website",
      siteName: "EnterMedSchool.org",
      images: [{ url: ogImagePath("articles"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ── Category gradient map ─────────────────────────────────────────── */
const CATEGORY_GRADIENTS: Record<string, string> = {
  "Study Guides": "from-showcase-teal/10 to-showcase-green/10",
  "Anatomy": "from-showcase-blue/10 to-showcase-purple/10",
  "Clinical Medicine": "from-showcase-coral/10 to-showcase-pink/10",
  "Medical Terminology": "from-showcase-purple/10 to-showcase-blue/10",
  "Pharmacology": "from-showcase-green/10 to-showcase-teal/10",
  "Pathology": "from-showcase-pink/10 to-showcase-coral/10",
};

/* ── Empty State ───────────────────────────────────────────────────── */

function EmptyState({ locale }: { locale: string }) {
  return (
    <AnimatedSection animation="fadeUp">
      <div className="relative mt-12 overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky">
        {/* Rainbow accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green" />

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center px-6 py-12 text-center sm:py-16">
          {/* Leo mascot */}
          <Image
            src={blobAsset("/logo.png")}
            alt="Leo mascot"
            width={80}
            height={80}
            className="rounded-2xl opacity-80"
          />

          <h2 className="mt-6 font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
            Articles coming soon
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-ink-muted">
            We&apos;re working on in-depth study guides, anatomy breakdowns, and exam
            strategies. In the meantime, explore our other free resources.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <ChunkyButton href={`/${locale}/resources/glossary`} variant="primary" size="md">
              <BookOpen className="h-4 w-4" />
              Browse Glossary
            </ChunkyButton>
            <ChunkyButton href={`/${locale}/tools`} variant="teal" size="md">
              <Wrench className="h-4 w-4" />
              Try Our Tools
            </ChunkyButton>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default async function ArticlesListingPage({ params }: Props) {
  const { locale } = await params;

  // Sort posts by date, newest first
  const sortedPosts = [...blogPosts].sort(
    (a, b) =>
      new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
  );

  const featuredPost = sortedPosts.find((p) => p.featured) || sortedPosts[0];
  const remainingPosts = sortedPosts.filter((p) => p.slug !== featuredPost?.slug);

  const listItems = sortedPosts.map((post, i) => ({
    name: post.title,
    url: `${BASE_URL}/${locale}/articles/${post.slug}`,
    position: i + 1,
  }));

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getCollectionPageJsonLd(
              "Medical Education Articles",
              "Free articles and study guides for medical students and educators.",
              `${BASE_URL}/${locale}/articles`,
              locale,
            ),
          ),
        }}
      />
      {sortedPosts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getItemListJsonLd(listItems)),
          }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <PageHero
          titlePre="Medical Education"
          titleHighlight="Articles"
          titlePost=""
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          meshColors={["bg-showcase-purple/30", "bg-showcase-blue/25", "bg-showcase-teal/20"]}
          annotation="Study smarter"
          annotationColor="text-showcase-purple"
          subtitle="Free articles, study guides, and practical tips for medical students and educators."
        />

        {/* Empty state */}
        {sortedPosts.length === 0 && <EmptyState locale={locale} />}

        {/* Featured article */}
        {featuredPost && (
          <AnimatedSection animation="fadeUp" className="mt-12">
            <Link
              href={`/${locale}/articles/${featuredPost.slug}`}
              className="group block overflow-hidden rounded-2xl border-3 border-showcase-navy shadow-chunky transition-all hover:-translate-y-1 hover:shadow-chunky-lg"
            >
              <div
                className={`relative bg-gradient-to-br ${
                  featuredPost.coverGradient ||
                  "from-showcase-purple via-showcase-blue to-showcase-teal"
                } p-6 sm:p-8`}
              >
                {/* Dot pattern */}
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      <Tag className="h-3 w-3" />
                      {featuredPost.category}
                    </span>
                    {featuredPost.featured && (
                      <span className="rounded-full bg-showcase-yellow/90 px-3 py-1 text-xs font-bold text-ink-dark">
                        Featured
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base text-white/75 line-clamp-2">
                    {featuredPost.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(featuredPost.datePublished).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featuredPost.readingTime} min read
                    </span>
                    <span className="ms-auto flex items-center gap-1 font-semibold text-white/80 group-hover:text-white transition-colors">
                      Read article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </AnimatedSection>
        )}

        {/* Article grid */}
        {remainingPosts.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {remainingPosts.map((post, i) => {
              const bgGradient = CATEGORY_GRADIENTS[post.category] || "from-pastel-lavender/30 to-white";

              return (
                <AnimatedSection key={post.slug} delay={i * 0.06} animation="fadeUp">
                  <Link
                    href={`/${locale}/articles/${post.slug}`}
                    className="group block h-full overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
                  >
                    {/* Gradient accent strip */}
                    <div className={`h-1 bg-gradient-to-r ${bgGradient}`} />

                    <div className="p-5">
                      {/* Category badge */}
                      <span className="inline-flex items-center gap-1 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-bold text-showcase-purple">
                        <Tag className="h-3 w-3" />
                        {post.category}
                      </span>

                      {/* Title */}
                      <h2 className="mt-3 font-display text-lg font-bold text-ink-dark group-hover:text-showcase-purple transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Description */}
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted line-clamp-2">
                        {post.description}
                      </p>

                      {/* Meta row */}
                      <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.datePublished).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readingTime} min
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-showcase-purple opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
