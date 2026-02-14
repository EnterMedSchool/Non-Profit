import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts, getBlogPostBySlug, getAllBlogSlugs } from "@/data/blog-posts";
import { routing } from "@/i18n/routing";
import { getBlogArticleJsonLd } from "@/lib/metadata";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ArticleHero from "@/components/articles/ArticleHero";
import ArticleBody from "@/components/articles/ArticleBody";
import AuthorCard from "@/components/articles/AuthorCard";
import ArticlesCTA from "@/components/articles/ArticlesCTA";

/* ── Client components: dynamically imported for code-splitting ──── */
const ReadingProgressBar = dynamic(
  () => import("@/components/pdf-viewer/ReadingProgressBar"),
  { ssr: false },
);
const TableOfContents = dynamic(
  () => import("@/components/articles/TableOfContents"),
  { ssr: false },
);
const ShareBar = dynamic(
  () => import("@/components/articles/ShareBar"),
  { ssr: false },
);

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
      ...(post.coverImage && {
        images: [{ url: `${BASE_URL}${post.coverImage}`, width: 1200, height: 630 }],
      }),
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

  const articleJsonLd = getBlogArticleJsonLd(
    {
      title: post.title,
      description: post.description,
      slug: post.slug,
      author: post.author,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      tags: post.tags,
      imageUrl: post.coverImage ? `${BASE_URL}${post.coverImage}` : undefined,
    },
    locale,
  );

  const articleUrl = `${BASE_URL}/${locale}/articles/${post.slug}`;

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
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

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
