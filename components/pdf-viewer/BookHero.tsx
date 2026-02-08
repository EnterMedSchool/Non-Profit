"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clock,
  FileText,
  Users,
  Download,
  ArrowRight,
  Calendar,
} from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import type { PDFBook } from "@/data/pdf-books";

interface BookHeroProps {
  book: PDFBook;
}

export default function BookHero({ book }: BookHeroProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  return (
    <AnimatedSection animation="blurIn">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        {/* Cover image */}
        <div className="mx-auto w-full max-w-xs shrink-0 lg:mx-0 lg:w-64">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-3 border-showcase-navy shadow-chunky-lg">
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StickerBadge color="green" size="sm">
              Free & Open Source
            </StickerBadge>
            <span className="text-xs font-semibold text-ink-light">
              v{book.version}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-dark sm:text-4xl lg:text-5xl">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="mt-2 text-lg text-ink-muted">{book.subtitle}</p>
          )}

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            {book.longDescription}
          </p>

          {/* Metadata */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-ink-light" />
              {book.authors.map((a) => a.name).join(", ")}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-ink-light" />
              {book.chapters.length} chapters
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-ink-light" />
              {book.totalPages} pages
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-ink-light" />
              ~{book.estimatedReadTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-ink-light" />
              Updated {new Date(book.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/resources/pdfs/${book.slug}/${book.chapters[0]?.slug}`}
              className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-6 py-3 text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              Start Reading
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={book.pdfUrl}
              download
              className="inline-flex items-center gap-2 rounded-xl border-3 border-showcase-navy/20 bg-white px-6 py-3 text-sm font-bold text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:border-showcase-teal/30 hover:shadow-chunky"
            >
              <Download className="h-4 w-4 text-showcase-teal" />
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
