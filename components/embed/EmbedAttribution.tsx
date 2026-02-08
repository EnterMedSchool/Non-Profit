"use client";

interface EmbedAttributionProps {
  lessonTitle: string;
  lessonUrl: string;
  theme: "light" | "dark";
  accentColor: string;
}

/**
 * Persistent attribution footer rendered inside the embed iframe.
 * Contains dofollow links that cannot be removed by the host page.
 */
export default function EmbedAttribution({
  lessonTitle,
  lessonUrl,
  theme,
  accentColor,
}: EmbedAttributionProps) {
  const isDark = theme === "dark";
  const textColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(26,26,46,0.6)";
  const linkColor = `#${accentColor}`;
  const borderColor = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(26,26,46,0.08)";

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-[11px]"
      style={{
        borderTop: `1px solid ${borderColor}`,
        color: textColor,
      }}
    >
      <span>
        Created by{" "}
        <a
          href="https://entermedschool.com"
          rel="dofollow noopener noreferrer"
          target="_blank"
          style={{ color: linkColor, fontWeight: 600, textDecoration: "none" }}
        >
          Ari Horesh
        </a>
      </span>
      <span style={{ opacity: 0.4 }}>|</span>
      <a
        href="https://entermedschool.org"
        rel="dofollow noopener noreferrer"
        target="_blank"
        style={{ color: linkColor, fontWeight: 600, textDecoration: "none" }}
      >
        EnterMedSchool.org
      </a>
      <span style={{ opacity: 0.4 }}>|</span>
      <a
        href={lessonUrl}
        rel="dofollow noopener noreferrer"
        target="_blank"
        style={{ color: linkColor, fontWeight: 500, textDecoration: "none" }}
      >
        Original Lesson
      </a>
    </div>
  );
}
