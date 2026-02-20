"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  MapPin,
  BookOpen,
  FileText,
  Layers,
  Share2,
  Check,
  MessageCircle,
} from "lucide-react";

import AnimatedSection from "@/components/shared/AnimatedSection";
import StickerBadge from "@/components/shared/StickerBadge";
import ContributorsBanner from "@/components/universities/ContributorsBanner";
import CourseFilters from "@/components/universities/CourseFilters";
import CourseSection from "@/components/universities/CourseSection";
import JoinUsCTA from "@/components/universities/JoinUsCTA";
import {
  getUniversityBySlug,
  getUniversityStats,
  getAllSubjects,
  getAllProfessors,
} from "@/data/universities";

export default function UniversityDetailPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");
  const locale = useLocale();
  const t = useTranslations("universities.detail");
  const university = useMemo(
    () => getUniversityBySlug(params.slug),
    [params.slug],
  );

  const [activeSubject, setActiveSubject] = useState("");
  const [activeProfessor, setActiveProfessor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = pageUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [pageUrl]);

  if (!university) {
    notFound();
  }

  const stats = getUniversityStats(university);
  const subjects = getAllSubjects(university);
  const professors = getAllProfessors(university);

  const filteredCourses = useMemo(() => {
    let courses = university.courses;

    if (activeSubject) {
      courses = courses.filter((c) => c.subject === activeSubject);
    }
    if (activeProfessor) {
      courses = courses.filter((c) => c.professor === activeProfessor);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.professor.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.lectures.some(
            (l) =>
              l.title.toLowerCase().includes(q) ||
              l.description?.toLowerCase().includes(q),
          ),
      );
    }

    return courses;
  }, [university.courses, activeSubject, activeProfessor, debouncedSearch]);

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out free study materials for ${university.name} lectures: ${pageUrl}`,
  )}`;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <AnimatedSection animation="fadeIn">
        <Link
          href={`/${locale}/universities`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-showcase-purple hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("breadcrumb")}
        </Link>
      </AnimatedSection>

      {/* University Header */}
      <AnimatedSection animation="blurIn">
        <div className="rounded-3xl border border-white/80 bg-white/60 p-6 shadow-soft backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold text-ink-dark sm:text-3xl lg:text-4xl">
                  {university.name}
                </h1>
                <StickerBadge color="green" size="sm">
                  {t("freeForAll")}
                </StickerBadge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-ink-muted">
                <MapPin className="h-4 w-4" />
                {university.city}, {university.country}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-showcase-purple/10 px-2 py-2 text-center sm:flex-row sm:gap-2 sm:px-3 sm:text-left">
                <BookOpen className="h-4 w-4 text-showcase-purple" />
                <div>
                  <p className="text-base font-bold text-showcase-purple sm:text-lg">
                    {stats.courses}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted sm:text-[10px]">
                    {t("courses")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-showcase-teal/10 px-2 py-2 text-center sm:flex-row sm:gap-2 sm:px-3 sm:text-left">
                <Layers className="h-4 w-4 text-showcase-teal" />
                <div>
                  <p className="text-base font-bold text-showcase-teal sm:text-lg">
                    {stats.lectures}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted sm:text-[10px]">
                    {t("lectures")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-showcase-coral/10 px-2 py-2 text-center sm:flex-row sm:gap-2 sm:px-3 sm:text-left">
                <FileText className="h-4 w-4 text-showcase-coral" />
                <div>
                  <p className="text-base font-bold text-showcase-coral sm:text-lg">
                    {stats.materials}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted sm:text-[10px]">
                    {t("materials")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Contributors Banner */}
      {university.contributors && university.contributors.length > 0 && (
        <ContributorsBanner
          contributors={university.contributors}
          universityName={university.name}
        />
      )}

      {/* Course Filters */}
      {university.courses.length > 0 && (
        <AnimatedSection animation="slideLeft" delay={0.2}>
          <CourseFilters
            subjects={subjects}
            professors={professors}
            activeSubject={activeSubject}
            activeProfessor={activeProfessor}
            searchQuery={searchQuery}
            onSubjectChange={setActiveSubject}
            onProfessorChange={setActiveProfessor}
            onSearchChange={setSearchQuery}
          />
        </AnimatedSection>
      )}

      {/* Course Sections */}
      {filteredCourses.length > 0 ? (
        <div className="space-y-4">
          {filteredCourses.map((course, i) => (
            <CourseSection
              key={course.id}
              course={course}
              universitySlug={university.slug}
              index={i}
              defaultOpen={
                filteredCourses.length === 1 ||
                course.slug === courseParam
              }
            />
          ))}
        </div>
      ) : university.courses.length === 0 ? (
        <AnimatedSection animation="scaleIn">
          <div className="flex flex-col items-center py-16 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-ink-muted/40" />
            <p className="mb-2 font-display text-lg font-bold text-ink-dark">
              {t("noCoursesYet")}
            </p>
            <p className="mb-4 max-w-md text-sm text-ink-muted">
              {t("noCoursesDesc")}
            </p>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection animation="scaleIn">
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-sm text-ink-muted">
              No courses match your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveSubject("");
                setActiveProfessor("");
                setSearchQuery("");
              }}
              className="mt-2 text-sm font-semibold text-showcase-purple hover:underline"
            >
              Clear filters
            </button>
          </div>
        </AnimatedSection>
      )}

      {/* Missing a course? */}
      <JoinUsCTA variant="compact" universityName={university.name} />

      {/* Spread the Word */}
      <AnimatedSection animation="fadeUp" delay={0.2}>
        <div className="rounded-2xl border-3 border-ink-dark/10 bg-white p-6 shadow-chunky-sm sm:p-8">
          <h2 className="mb-2 text-center font-display text-xl font-bold text-ink-dark">
            {t("spreadTitle")}
          </h2>
          <p className="mx-auto mb-5 max-w-lg text-center text-sm text-ink-muted">
            {t("spreadDesc", { university: university.name })}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all ${
                copied
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-showcase-purple/20 bg-showcase-purple/5 text-showcase-purple hover:bg-showcase-purple/10"
              }`}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {copied ? t("linkCopied") : t("copyLink")}
            </button>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700 transition-all hover:bg-green-100"
            >
              <MessageCircle className="h-4 w-4" />
              {t("shareWhatsapp")}
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-ink-muted">
            {t("spreadProfessor")}{" "}
            <a
              href="mailto:ari@entermedschool.com"
              className="font-semibold text-showcase-purple hover:underline"
            >
              ari@entermedschool.com
            </a>
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}
