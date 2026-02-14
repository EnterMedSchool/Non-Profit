import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/data/blog-posts";
import AnimatedSection from "@/components/shared/AnimatedSection";

interface AuthorCardProps {
  post: BlogPost;
  locale: string;
}

export default function AuthorCard({ post, locale }: AuthorCardProps) {
  return (
    <AnimatedSection animation="fadeUp">
      <div className="relative overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky">
        {/* Rainbow accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green" />

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
          {/* Avatar */}
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="h-16 w-16 shrink-0 rounded-full border-3 border-showcase-navy object-cover shadow-chunky-sm sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-3 border-showcase-navy bg-gradient-to-br from-showcase-purple to-showcase-teal text-2xl font-bold text-white shadow-chunky-sm sm:h-20 sm:w-20 sm:text-3xl">
              {post.author.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="min-w-0 text-center sm:text-left">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-showcase-purple/60">
              Written by
            </p>
            <p className="mt-1 font-display text-xl font-extrabold text-ink-dark">
              {post.author}
            </p>
            {post.authorBio && (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {post.authorBio}
              </p>
            )}
            <Link
              href={`/${locale}/articles`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-showcase-purple transition-all hover:gap-2"
            >
              View all articles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
