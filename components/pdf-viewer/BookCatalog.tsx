"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, BookOpen, X } from "lucide-react";
import BookCard from "./BookCard";
import { pdfBooks } from "@/data/pdf-books";
import AnimatedSection from "@/components/shared/AnimatedSection";

export default function BookCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set(pdfBooks.map((b) => b.subject));
    return Array.from(set).sort();
  }, []);

  // Filter books
  const filteredBooks = useMemo(() => {
    return pdfBooks.filter((book) => {
      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesSubject =
        !selectedSubject || book.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, selectedSubject]);

  return (
    <div>
      {/* Search & Filter bar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks..."
            className="w-full rounded-xl border-3 border-showcase-navy/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-ink-light focus:border-showcase-purple"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-ink-light hover:text-ink-muted" />
            </button>
          )}
        </div>

        {/* Subject pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${
              !selectedSubject
                ? "border-showcase-purple bg-showcase-purple text-white"
                : "border-showcase-navy/15 text-ink-muted hover:border-showcase-purple/30 hover:text-showcase-purple"
            }`}
          >
            All
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() =>
                setSelectedSubject(
                  selectedSubject === subject ? null : subject,
                )
              }
              className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${
                selectedSubject === subject
                  ? "border-showcase-purple bg-showcase-purple text-white"
                  : "border-showcase-navy/15 text-ink-muted hover:border-showcase-purple/30 hover:text-showcase-purple"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Book grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book, i) => (
            <AnimatedSection key={book.id} delay={i * 0.08} animation="rotateIn">
              <BookCard book={book} />
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <AnimatedSection animation="scaleIn">
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pastel-lavender">
              <BookOpen className="h-10 w-10 text-showcase-purple/40 animate-float-gentle" />
            </div>
            <p className="mt-5 font-handwritten text-2xl text-ink-muted">
              No textbooks found...
            </p>
            <p className="mt-2 text-sm text-ink-light">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject(null);
              }}
              className="mt-4 rounded-xl border-3 border-showcase-navy bg-showcase-purple px-4 py-2 text-sm font-bold text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky"
            >
              Clear Filters
            </button>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
