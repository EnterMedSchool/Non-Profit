"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent("consent:open"));
  };

  return (
    <footer className="relative z-10 bg-white/60 backdrop-blur-md border-t border-slate-200/60">
      {/* Gradient accent border */}
      <div className="h-[2px] bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Top: Brand + Mission | Links */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          {/* Left column: Brand identity & mission */}
          <div className="flex-1 max-w-lg">
            {/* Logo + name */}
            <Link
              href="/en"
              className="font-display text-2xl font-bold text-ink-dark group inline-flex items-center gap-3"
            >
              <Image
                src="/logo.png"
                alt="Leo mascot"
                width={36}
                height={36}
                className="rounded-lg transition-transform duration-300 group-hover:rotate-6"
              />
              <span>
                EnterMedSchool
                <span className="text-showcase-purple">.org</span>
              </span>
            </Link>

            {/* Mission description */}
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
              {t("description")}
            </p>

            {/* Value badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-green/25 bg-showcase-green/10 px-3 py-1.5 text-xs font-semibold text-showcase-green">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {t("badges.freeForever")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-purple/25 bg-showcase-purple/10 px-3 py-1.5 text-xs font-semibold text-showcase-purple">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                {t("badges.openSource")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-showcase-teal/25 bg-showcase-teal/10 px-3 py-1.5 text-xs font-semibold text-showcase-teal">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                {t("badges.nonCommercial")}
              </span>
            </div>

            {/* .com / .org relationship callout */}
            <div className="mt-6 rounded-xl border-2 border-showcase-teal/20 bg-white/80 p-4 backdrop-blur-sm shadow-sm">
              <p className="text-sm leading-relaxed text-ink-muted">
                <span className="font-semibold text-ink-dark">
                  {t("relationship.title")}
                </span>{" "}
                {t("relationship.description")}{" "}
                <a
                  href="https://entermedschool.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-showcase-purple hover:text-showcase-purple/80 underline decoration-showcase-purple/30 hover:decoration-showcase-purple transition-all"
                >
                  EnterMedSchool.com
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </p>
            </div>
          </div>

          {/* Right column: Navigation links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-12">
            {/* Resources */}
            <div>
              <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-showcase-purple/50">
                {nav("resources")}
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <FooterLink href="/en/tools">{nav("tools")}</FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/calculators">{nav("calculators")}</FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/resources/pdfs">
                    {t("links.pdfs")}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/resources/visuals">
                    {t("links.visuals")}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/clinical-semiotics">
                    {t("links.clinicalSemiotics")}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/resources/questions">
                    {t("links.questions")}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/resources/videos">
                    {t("links.videos")}
                  </FooterLink>
                </li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-showcase-purple/50">
                {t("links.explore")}
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <FooterLink href="/en/for-professors">
                    {nav("forProfessors")}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/for-students">
                    {nav("forStudents")}
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/events">{nav("events")}</FooterLink>
                </li>
              </ul>
            </div>

            {/* Legal & Info */}
            <div>
              <h4 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-showcase-purple/50">
                {t("links.legal")}
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <FooterLink href="/en/about">{nav("about")}</FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/license">{nav("license")}</FooterLink>
                </li>
                <li>
                  <FooterLink href="/en/privacy">{nav("privacy")}</FooterLink>
                </li>
                <li>
                  <button
                    onClick={openCookieSettings}
                    className="text-sm text-ink-muted transition-all hover:text-showcase-purple hover:translate-x-1"
                  >
                    {t("cookieSettings")}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-showcase-purple/10 pt-6 sm:flex-row">
          <p className="inline-flex items-center gap-2 text-sm text-ink-light">
            <Image
              src="/logo.png"
              alt=""
              width={18}
              height={18}
              className="rounded-sm opacity-60 transition-all duration-300 hover:opacity-100 hover:rotate-12"
              aria-hidden="true"
            />
            {t("copyright", { year: String(year) })}
          </p>

          <div className="flex items-center gap-5">
            {/* GitHub link */}
            <a
              href="https://github.com/Entermedschool"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-light transition-colors hover:text-ink-dark"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            <span className="h-4 w-px bg-showcase-purple/15" aria-hidden="true" />

            <p className="text-sm text-ink-light">
              {t("partOf")}{" "}
              <a
                href="https://entermedschool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-showcase-purple transition-colors hover:text-showcase-purple/80"
              >
                EnterMedSchool.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-ink-muted transition-all hover:text-showcase-purple hover:translate-x-1 inline-block"
    >
      {children}
    </Link>
  );
}
