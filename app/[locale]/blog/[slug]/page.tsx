import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react";
import { blogPosts, getBlogPostBySlug, getAllBlogSlugs } from "@/data/blog-posts";
import { routing } from "@/i18n/routing";
import { getBlogArticleJsonLd } from "@/lib/metadata";
import AnimatedSection from "@/components/shared/AnimatedSection";

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

  const url = `${BASE_URL}/${locale}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/blog/${post.slug}`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/blog/${post.slug}`,
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
export default async function BlogArticlePage({ params }: Props) {
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

  // Get related posts (same category or overlapping tags)
  const relatedPosts = blogPosts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        (p.category === post.category || p.tags.some((t) => post.tags.includes(t))),
    )
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="relative z-10 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={`/${locale}/blog`}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-purple hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <AnimatedSection animation="fadeUp">
            <header>
              {/* Category */}
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-bold text-showcase-purple">
                <Tag className="h-3 w-3" />
                {post.category}
              </span>

              {/* Title */}
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink-dark sm:text-4xl">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.datePublished).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime} min read
                </span>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-showcase-navy/10 bg-white/80 px-2.5 py-1 text-xs font-medium text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>
          </AnimatedSection>

          {/* Article body */}
          <AnimatedSection animation="fadeUp" delay={0.1}>
            <div
              className="prose prose-lg mt-10 max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-ink-dark prose-p:text-ink-muted prose-p:leading-relaxed prose-a:text-showcase-purple prose-a:font-semibold hover:prose-a:underline prose-li:text-ink-muted prose-strong:text-ink-dark"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </AnimatedSection>

          {/* Related tool links */}
          {post.relatedTools && post.relatedTools.length > 0 && (
            <div className="mt-10 rounded-2xl border-2 border-showcase-teal/20 bg-showcase-teal/5 p-6">
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
          )}

          {/* Related glossary terms */}
          {post.relatedTerms && post.relatedTerms.length > 0 && (
            <div className="mt-6 rounded-2xl border-2 border-showcase-purple/20 bg-showcase-purple/5 p-6">
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
          )}

          {/* Related articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-ink-dark">
                You might also like
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/${locale}/blog/${related.slug}`}
                    className="group rounded-xl border-2 border-showcase-navy/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-md"
                  >
                    <span className="text-xs font-bold text-showcase-purple">
                      {related.category}
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-ink-dark group-hover:text-showcase-purple transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <span className="mt-2 block text-xs text-ink-muted">
                      {related.readingTime} min read
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
