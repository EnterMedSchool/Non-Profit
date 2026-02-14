import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { blogPosts } from "@/data/blog-posts";
import { routing } from "@/i18n/routing";
import { getCollectionPageJsonLd, getItemListJsonLd } from "@/lib/metadata";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title = "Medical Education Blog — Study Guides & Resources";
  const description =
    "Free articles, study guides, and tips for medical students and educators. Learn anatomy, medical terminology, exam strategies, and more from EnterMedSchool.";

  return {
    title,
    description,
    keywords: [
      "medical education blog",
      "med school study tips",
      "anatomy study guide",
      "medical terminology guide",
      "free medical resources",
      "USMLE prep tips",
      "medical student advice",
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}/blog`]),
        ),
        "x-default": `${BASE_URL}/${routing.defaultLocale}/blog`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/blog`,
      type: "website",
      siteName: "EnterMedSchool.org",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogListingPage({ params }: Props) {
  const { locale } = await params;

  // Sort posts by date, newest first
  const sortedPosts = [...blogPosts].sort(
    (a, b) =>
      new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
  );

  const listItems = sortedPosts.map((post, i) => ({
    name: post.title,
    url: `${BASE_URL}/${locale}/blog/${post.slug}`,
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
              "Medical Education Blog",
              "Free articles and study guides for medical students and educators.",
              `${BASE_URL}/${locale}/blog`,
              locale,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getItemListJsonLd(listItems)),
        }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <PageHero
          titlePre="Medical Education"
          titleHighlight="Blog"
          titlePost=""
          gradient="from-showcase-purple via-showcase-blue to-showcase-teal"
          annotation="Study smarter"
          annotationColor="text-showcase-purple"
          subtitle="Free articles, study guides, and practical tips for medical students and educators."
        />

        {/* Article list */}
        <div className="mt-12 space-y-6">
          {sortedPosts.map((post, i) => (
            <AnimatedSection key={post.slug} delay={i * 0.06} animation="fadeUp">
              <article className="group rounded-2xl border-3 border-showcase-navy bg-white p-6 shadow-chunky transition-all hover:-translate-y-0.5 hover:shadow-chunky-lg">
                <Link href={`/${locale}/blog/${post.slug}`} className="block">
                  {/* Category badge */}
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-showcase-purple/20 bg-showcase-purple/5 px-3 py-1 text-xs font-bold text-showcase-purple">
                    <Tag className="h-3 w-3" />
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className="mt-3 font-display text-xl font-bold text-ink-dark group-hover:text-showcase-purple transition-colors sm:text-2xl">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">
                    {post.description}
                  </p>

                  {/* Meta row */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
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
                    <span className="ms-auto flex items-center gap-1 font-semibold text-showcase-purple opacity-0 group-hover:opacity-100 transition-opacity">
                      Read article <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
}
