type UnderlineColor = "purple" | "teal" | "yellow" | "coral" | "green" | "orange";

const underlineClass: Record<UnderlineColor, string> = {
  purple: "hand-underline-purple",
  teal: "hand-underline-teal",
  yellow: "hand-underline-yellow",
  coral: "hand-underline",
  green: "hand-underline-teal",
  orange: "hand-underline-yellow",
};

interface SectionHeadingProps {
  /** The full heading text */
  title: string;
  /** Word(s) to underline with hand-drawn effect */
  highlight?: string;
  /** Color of the hand-drawn underline */
  underlineColor?: UnderlineColor;
  /** Optional subtitle below the heading */
  subtitle?: string;
  /** Center alignment */
  centered?: boolean;
  /** Dark mode (white text for dark backgrounds) */
  dark?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  highlight,
  underlineColor = "coral",
  subtitle,
  centered = true,
  dark = false,
  className = "",
}: SectionHeadingProps) {
  const renderTitle = () => {
    if (!highlight) {
      return <>{title}</>;
    }

    const parts = title.split(highlight);
    if (parts.length === 1) return <>{title}</>;

    return (
      <>
        {parts[0]}
        <span className={`hand-underline ${underlineClass[underlineColor]}`}>
          {highlight}
        </span>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      <h2 className={`font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl ${dark ? "text-white" : "text-ink-dark"}`}>
        {renderTitle()}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg max-w-2xl mx-auto ${dark ? "text-white/70" : "text-ink-muted"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
