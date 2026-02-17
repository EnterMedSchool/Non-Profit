import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts, getBlogPostBySlug, getAllBlogSlugs, getPostAuthor } from "@/data/blog-posts";
import { getAuthorJsonLd } from "@/data/authors";
import { routing } from "@/i18n/routing";
import { getBlogArticleJsonLd } from "@/lib/metadata";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ArticleHero from "@/components/articles/ArticleHero";
import ArticleBody from "@/components/articles/ArticleBody";
import AuthorCard from "@/components/articles/AuthorCard";
import ArticlesCTA from "@/components/articles/ArticlesCTA";
import { ReadingProgressBar, TableOfContents, ShareBar } from "./ArticleClientComponents";
import { ogImagePath } from "@/lib/og-path";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

/* ── Static params ─────────────────────────────────────────────────── */
export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

/* ── Metadata ──────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  const url = `${BASE_URL}/${locale}/articles/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/articles/${post.slug}`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/articles/${post.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      siteName: "EnterMedSchool.org",
      publishedTime: `${post.datePublished}T00:00:00Z`,
      modifiedTime: `${post.dateModified}T00:00:00Z`,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
      images: [{ url: ogImagePath("articles", slug), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      site: "@entermedschool",
      creator: "@arihoresh",
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const author = getPostAuthor(post);
  const authorLd = author ? getAuthorJsonLd(author) : undefined;

  const wordCount = post.body.replace(/<[^>]+>/g, "").split(/\s+/).length;

  const articleJsonLd = getBlogArticleJsonLd(
    {
      title: post.title,
      description: post.description,
      slug: post.slug,
      author: post.author,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      tags: post.tags,
      category: post.category,
      wordCount,
      imageUrl: post.coverImage ? `${BASE_URL}${post.coverImage}` : undefined,
      authorJsonLd: authorLd,
    },
    locale,
  );

  const articleUrl = `${BASE_URL}/${locale}/articles/${post.slug}`;

  /* ── BreadcrumbList JSON-LD ──────────────────────────────────────── */
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${BASE_URL}/${locale}/articles` },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  };

  /* ── FAQPage JSON-LD ─────────────────────────────────────────────── */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long should I study for USMLE Step 1 as an IMG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most international medical students study for 6 months of focused preparation. A 3-month plan is doable if you study full-time with no other obligations (40–80 UWorld questions/day). A 9–12 month plan works if you need to balance med school or work. Tailor the timeline to your endurance and include regular review to avoid forgetting.",
        },
      },
      {
        "@type": "Question",
        name: "How much does USMLE Step 1 cost for international students?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For 2026, the total exam cost is about $1,225 USD ($1,020 exam fee + $205 international surcharge). Add the one-time ECFMG application fee (~$160), study materials ($300–$600), question banks ($400–$600), and travel/accommodation ($300–$1,000+). The total Step 1 phase typically costs $2,500–$5,500 depending on your choices.",
        },
      },
      {
        "@type": "Question",
        name: "What documents do I need on USMLE Step 1 exam day?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You must bring your scheduling permit (printed or on phone) and a valid, unexpired passport with a name that exactly matches the permit. It is also wise to bring a backup ID such as a driver's license. Additionally, pack snacks and water in a clear bag, any medications you may need, and dress in comfortable layers.",
        },
      },
      {
        "@type": "Question",
        name: "What are the best free resources for USMLE Step 1?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Top free resources include: Anking/Zanki Anki decks (comprehensive flashcards), Dirty Medicine on YouTube (micro/biochem mnemonics), Randy Neil / Medicosis Perfectionalis on YouTube (pharmacology), MedBullets (summaries and practice questions), the free NBME 120 at Prometric, and community resources on Reddit (r/step1, r/IMGreddit). For paid resources, First Aid + UWorld + Pathoma is the gold-standard combination.",
        },
      },
      {
        "@type": "Question",
        name: "Can I pass USMLE Step 1 in 3 months?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, but only if you are studying full-time with no other responsibilities. A 3-month plan requires 8–10 hours/day, 40–80 UWorld questions daily, and rapid coverage of all subjects. If you have school or work obligations, 3 months may not be enough — most students in that situation extend to 6 months or more.",
        },
      },
      {
        "@type": "Question",
        name: "How do I register for USMLE Step 1 as an international student?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All non-US graduates must first register with ECFMG (one-time fee ~$160). Your school must verify your coursework or diploma. Then apply for Step 1 via ECFMG/FSMB, pay the exam fee ($1,020 + $205 international surcharge), and schedule your test at a Prometric center. Start early — ECFMG verification can take months.",
        },
      },
      {
        "@type": "Question",
        name: "How does Step 1 affect residency matching for IMGs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Even though Step 1 is now Pass/Fail, programs still screen IMGs by Step 1 performance. A high pass-level score (240+) can bolster your application for competitive specialties. ECFMG certification (required for the Match) is granted after passing Step 1, Step 2 CK, and having your diploma verified. Complete Step 1 by summer before ERAS opens.",
        },
      },
      {
        "@type": "Question",
        name: "How can I prevent burnout while studying for Step 1?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Schedule weekly rest days, exercise 30–60 minutes daily, maintain 7–8 hours of sleep, and eat balanced meals. Join online study groups for support. Take 5–10 minute breaks every hour. Plan a reward after the exam. If anxiety becomes overwhelming, consider professional help — many schools offer counseling. Mental endurance is as crucial as academic knowledge.",
        },
      },
    ],
  };

  /* ── HowTo JSON-LD ───────────────────────────────────────────────── */
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Prepare for USMLE Step 1 as an International Medical Student",
    description:
      "A step-by-step guide for IMGs to plan, study for, and pass USMLE Step 1, covering registration, resources, study timelines, and test-day strategy.",
    totalTime: "P6M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Register with ECFMG and apply for the exam",
        text: "All non-US graduates must get ECFMG certified. Register early (one-time fee ~$160), have your school verify coursework, then apply for Step 1 through ECFMG/FSMB and pay exam fees ($1,020 + $205 international surcharge).",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose a study timeline (3, 6, or 9–12 months)",
        text: "Select a timeline based on your obligations. 3 months works for full-time study; 6 months is most common for those juggling school or work; 9–12 months offers flexibility but risks fatigue.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Gather core resources (First Aid, UWorld, Pathoma)",
        text: "Build your resource stack: First Aid as your core reference, UWorld as the gold-standard question bank, Pathoma for pathology, and optionally Sketchy for micro/pharm and Anki for spaced repetition.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Follow a structured study plan with active recall and spaced repetition",
        text: "Create a daily/weekly schedule assigning topics. Use active recall (self-quizzing, teaching) and spaced repetition (Anki). Cover 2–3 hours of videos/notes + question bank blocks + flashcard review daily.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Take practice exams (NBMEs) to track progress",
        text: "Use NBME self-assessments and the free Prometric 120 to benchmark progress. Take them under timed exam conditions. Aim for an upward score trend and use results to identify weak areas.",
      },
      {
        "@type": "HowToStep",
        position: 6,
        name: "Prepare logistics (scheduling, documents, travel)",
        text: "Schedule your Prometric test center, arrange travel/accommodation if needed, and prepare required documents: scheduling permit, passport (name must match exactly), backup ID, snacks, and medications.",
      },
      {
        "@type": "HowToStep",
        position: 7,
        name: "Execute test-day strategy",
        text: "Arrive 30+ minutes early. Use the 15-second rule for tough questions (flag and move on). Take all allotted breaks. Stay calm with deep breathing. Eat a healthy lunch to maintain focus across all blocks.",
      },
    ],
  };

  /* ── VideoObject JSON-LD ─────────────────────────────────────────── */
  const videoJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "How to Study for USMLE Step 1 as an IMG – Only 4 Resources",
      description:
        "Dr. Chris strips USMLE Step 1 resources to essentials: First Aid, UWorld, Pathoma, and one comprehensive video series. Emphasis on quality over quantity.",
      contentUrl: "https://www.youtube.com/watch?v=HR29kGQBW4M",
      thumbnailUrl: "https://i.ytimg.com/vi/HR29kGQBW4M/hqdefault.jpg",
      uploadDate: "2024-01-01",
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "USMLE Step 1 Tips for IMGs: Complete Plan",
      description:
        "Sarthi Education lays out a structured plan: pre-assessment with NBME baseline, 6-month study blocks, and frequent self-testing for international medical students.",
      contentUrl: "https://www.youtube.com/watch?v=Vb06TTkVKhU",
      thumbnailUrl: "https://i.ytimg.com/vi/Vb06TTkVKhU/hqdefault.jpg",
      uploadDate: "2024-01-01",
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "The 6 Things Successful IMGs Do Differently",
      description:
        "Dr. Alec Palmerton shares tips for IMGs: plan early, use high-yield sources, do many questions, stay healthy, and simulate test conditions.",
      contentUrl: "https://www.youtube.com/watch?v=lmDDHRtP9iU",
      thumbnailUrl: "https://i.ytimg.com/vi/lmDDHRtP9iU/hqdefault.jpg",
      uploadDate: "2024-01-01",
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "How to Prepare for Step 1 with a Full-Time Job",
      description:
        "Zerak describes balancing a full-time job with USMLE Step 1 study: strict study hours, UWorld 20–30 Q/day, and daily consistency over quotas.",
      contentUrl: "https://www.youtube.com/watch?v=O7RhNHEWUCo",
      thumbnailUrl: "https://i.ytimg.com/vi/O7RhNHEWUCo/hqdefault.jpg",
      uploadDate: "2024-01-01",
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "What to Study for Step 1 in 2026",
      description:
        "Dr. Malke Asaad outlines up-to-date resources for USMLE Step 1 in 2026: focus on FA+UWorld, practice exam strategy for P/F format, and incorporate NBME/AMBOSS Qs.",
      contentUrl: "https://www.youtube.com/watch?v=DFHxJE7fFPQ",
      thumbnailUrl: "https://i.ytimg.com/vi/DFHxJE7fFPQ/hqdefault.jpg",
      uploadDate: "2025-01-01",
    },
  ];

  // Related posts: same category or overlapping tags
  const relatedPosts = blogPosts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        (p.category === post.category || p.tags.some((t) => post.tags.includes(t))),
    )
    .slice(0, 4);

  return (
    <>
      {/* JSON-LD: Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* JSON-LD: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* JSON-LD: HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      {/* JSON-LD: VideoObjects */}
      {videoJsonLd.map((v, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(v) }}
        />
      ))}

      {/* Reading progress bar */}
      <ReadingProgressBar />

      {/* Share bar (appears on scroll) */}
      <ShareBar title={post.title} url={articleUrl} />

      <article className="relative z-10 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={`/${locale}/articles`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-purple transition-all hover:gap-2.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>

          {/* ── Hero ────────────────────────────────────────────────── */}
          <ArticleHero post={post} />

          {/* ── Content layout: TOC sidebar + Article body ──────────── */}
          <div className="mt-10 gap-10 lg:grid lg:grid-cols-[220px_1fr]">
            {/* Desktop TOC sidebar */}
            <aside className="hidden lg:block">
              <TableOfContents />
            </aside>

            <div>
              {/* Mobile TOC (inline) */}
              <div className="lg:hidden">
                <TableOfContents />
              </div>

              {/* Article body */}
              <AnimatedSection animation="fadeUp" delay={0.1}>
                <ArticleBody html={post.body} />
              </AnimatedSection>
            </div>
          </div>

          {/* ── Related tool links ──────────────────────────────────── */}
          {post.relatedTools && post.relatedTools.length > 0 && (
            <AnimatedSection animation="fadeUp" className="mt-10">
              <div className="rounded-2xl border-2 border-showcase-teal/20 bg-showcase-teal/5 p-6">
                <h2 className="font-display text-lg font-bold text-ink-dark">
                  Related Tools
                </h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  {post.relatedTools.map((toolId) => (
                    <Link
                      key={toolId}
                      href={`/${locale}/tools/${toolId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-teal/30 bg-white px-4 py-2 text-sm font-semibold text-showcase-teal transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {toolId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Link>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── Related glossary terms ──────────────────────────────── */}
          {post.relatedTerms && post.relatedTerms.length > 0 && (
            <AnimatedSection animation="fadeUp" className="mt-6">
              <div className="rounded-2xl border-2 border-showcase-purple/20 bg-showcase-purple/5 p-6">
                <h2 className="font-display text-lg font-bold text-ink-dark">
                  Explore Related Glossary Terms
                </h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  {post.relatedTerms.map((termId) => (
                    <Link
                      key={termId}
                      href={`/${locale}/resources/glossary/category/${termId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple/30 bg-white px-4 py-2 text-sm font-semibold text-showcase-purple transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {termId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Link>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── Author card ─────────────────────────────────────────── */}
          <div className="mt-12">
            <AuthorCard post={post} locale={locale} />
          </div>

          {/* ── Related articles — Bento grid ───────────────────────── */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl font-bold text-ink-dark sm:text-2xl">
                You might also like
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {relatedPosts.map((related, i) => {
                  const isHero = i === 0;
                  const heroGradient =
                    related.coverGradient || "from-showcase-purple via-showcase-blue to-showcase-teal";

                  return (
                    <AnimatedSection key={related.slug} delay={i * 0.08} animation="fadeUp">
                      <Link
                        href={`/${locale}/articles/${related.slug}`}
                        className={`group relative block overflow-hidden rounded-2xl border-3 border-showcase-navy transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg ${
                          isHero ? "sm:col-span-2 shadow-chunky" : "shadow-chunky-sm"
                        }`}
                      >
                        {isHero ? (
                          /* Hero card: gradient background */
                          <div className={`bg-gradient-to-br ${heroGradient} p-6 sm:p-8`}>
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                              {related.category}
                            </span>
                            <h3 className="mt-3 font-display text-xl font-extrabold text-white sm:text-2xl">
                              {related.title}
                            </h3>
                            <p className="mt-2 text-sm text-white/70 line-clamp-2">
                              {related.description}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                              Read article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        ) : (
                          /* Standard card */
                          <div className="bg-white p-5">
                            <span className="text-xs font-bold text-showcase-purple">
                              {related.category}
                            </span>
                            <h3 className="mt-2 font-display text-base font-bold text-ink-dark group-hover:text-showcase-purple transition-colors line-clamp-2 sm:text-lg">
                              {related.title}
                            </h3>
                            <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                              <span>{related.readingTime} min read</span>
                              <ArrowRight className="h-3.5 w-3.5 text-showcase-purple opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                            </div>
                          </div>
                        )}
                      </Link>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <div className="mt-12">
            <ArticlesCTA locale={locale} />
          </div>
        </div>
      </article>

      {/* Bottom spacer for mobile share bar */}
      <div className="h-16 xl:hidden" />
    </>
  );
}
