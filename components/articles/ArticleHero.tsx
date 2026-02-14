import { Calendar, Clock, User, Tag, Stethoscope, BookOpen, Brain, Heart, Dna, Beaker } from "lucide-react";
import type { BlogPost } from "@/data/blog-posts";
import AnimatedSection from "@/components/shared/AnimatedSection";

/* ── Category-based icon & color pickers ───────────────────────────── */

const CATEGORY_ICONS: Record<string, typeof Stethoscope> = {
  "Study Guides": BookOpen,
  "Anatomy": Brain,
  "Clinical Medicine": Stethoscope,
  "Medical Terminology": Beaker,
  "Pharmacology": Dna,
  "Pathology": Heart,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Study Guides": "border-showcase-teal/30 bg-showcase-teal/10 text-showcase-teal",
  "Anatomy": "border-showcase-blue/30 bg-showcase-blue/10 text-showcase-blue",
  "Clinical Medicine": "border-showcase-coral/30 bg-showcase-coral/10 text-showcase-coral",
  "Medical Terminology": "border-showcase-purple/30 bg-showcase-purple/10 text-showcase-purple",
  "Pharmacology": "border-showcase-green/30 bg-showcase-green/10 text-showcase-green",
  "Pathology": "border-showcase-pink/30 bg-showcase-pink/10 text-showcase-pink",
};

const DEFAULT_BADGE = "border-showcase-purple/30 bg-showcase-purple/10 text-showcase-purple";

/* ── Floating decorative icons (hidden on mobile) ─────────────────── */

function FloatingDecorations({ category }: { category: string }) {
  const Icon1 = CATEGORY_ICONS[category] || BookOpen;
  const Icon2 = category === "Study Guides" ? Brain : Stethoscope;

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
      <div className="animate-float-gentle absolute left-[5%] top-[15%] opacity-[0.12]">
        <Icon1 className="h-14 w-14 text-showcase-purple" style={{ transform: "rotate(-12deg)" }} />
      </div>
      <div className="animate-float-playful absolute right-[6%] top-[20%] opacity-[0.10]">
        <Icon2 className="h-12 w-12 text-showcase-teal" style={{ transform: "rotate(8deg)" }} />
      </div>
      <div className="animate-float-gentle absolute bottom-[10%] left-[8%] opacity-[0.08]">
        <Dna className="h-10 w-10 text-showcase-pink" style={{ transform: "rotate(15deg)" }} />
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */

interface ArticleHeroProps {
  post: BlogPost;
}

export default function ArticleHero({ post }: ArticleHeroProps) {
  const gradient = post.coverGradient || "from-showcase-purple via-showcase-blue to-showcase-teal";
  const badgeColor = CATEGORY_COLORS[post.category] || DEFAULT_BADGE;

  return (
    <AnimatedSection animation="blurIn">
      <div className="relative overflow-hidden rounded-3xl border-3 border-showcase-navy shadow-chunky">
        {/* Gradient band + pattern overlay */}
        <div className={`relative bg-gradient-to-br ${gradient} px-6 py-10 sm:px-10 sm:py-14`}>
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />

          {/* Floating decorations */}
          <FloatingDecorations category={post.category} />

          <div className="relative z-10 mx-auto max-w-3xl">
            {/* Category badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border-2 ${badgeColor} bg-white/90 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm`}
            >
              <Tag className="h-3 w-3" />
              {post.category}
            </span>

            {/* Title */}
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {post.description}
            </p>

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                {post.authorAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="h-6 w-6 rounded-full border-2 border-white/30 object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-[10px] font-bold text-white">
                    {post.author.charAt(0)}
                  </span>
                )}
                <span className="font-semibold text-white/90">{post.author}</span>
              </span>

              <span className="hidden h-3 w-px bg-white/30 sm:block" aria-hidden="true" />

              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.datePublished).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>

              <span className="hidden h-3 w-px bg-white/30 sm:block" aria-hidden="true" />

              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} min read
              </span>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
