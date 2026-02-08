"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BookOpen, Clock, FileText, Users } from "lucide-react";
import StickerBadge from "@/components/shared/StickerBadge";
import type { PDFBook } from "@/data/pdf-books";

interface BookCardProps {
  book: PDFBook;
  progress?: number;
}

function BookCard({ book, progress }: BookCardProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  return (
    <Link
      href={`/${locale}/resources/pdfs/${book.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky transition-all hover:-translate-y-1 hover:shadow-chunky-lg"
    >
      {/* Cover image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-showcase-purple/10 to-showcase-teal/10">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Free badge */}
        <div className="absolute left-3 top-3">
          <StickerBadge color="green" size="sm">
            Free
          </StickerBadge>
        </div>

        {/* Progress overlay */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-3 pt-8">
            <div className="flex items-center justify-between text-xs text-white/90">
              <span className="font-semibold">{progress}% read</span>
              <span>{Math.round((progress / 100) * book.chapters.length)}/{book.chapters.length} chapters</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-showcase-green"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-showcase-purple/10 px-2 py-0.5 text-[10px] font-bold text-showcase-purple">
            {book.subject}
          </span>
          <span className="text-[10px] text-ink-light">
            v{book.version}
          </span>
        </div>

        <h3 className="mt-2 font-display text-lg font-bold leading-tight text-ink-dark group-hover:text-showcase-purple">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="mt-0.5 text-xs text-ink-muted">{book.subtitle}</p>
        )}

        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-2">
          {book.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-ink-light">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {book.chapters.length} chapters
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {book.totalPages} pages
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {book.estimatedReadTime} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {book.authors.map((a) => a.name).join(", ")}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(BookCard);
