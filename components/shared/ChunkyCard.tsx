"use client";

import Link from "next/link";

type ColorVariant =
  | "white"
  | "purple"
  | "teal"
  | "yellow"
  | "coral"
  | "pink"
  | "orange"
  | "green"
  | "blue";

const bgClasses: Record<ColorVariant, string> = {
  white: "bg-white text-ink-dark",
  purple: "bg-showcase-purple text-white",
  teal: "bg-showcase-teal text-ink-dark",
  yellow: "bg-showcase-yellow text-ink-dark",
  coral: "bg-showcase-coral text-white",
  pink: "bg-showcase-pink text-white",
  orange: "bg-showcase-orange text-ink-dark",
  green: "bg-showcase-green text-white",
  blue: "bg-showcase-blue text-white",
};

const hoverFillClasses: Record<ColorVariant, string> = {
  white: "hover:bg-showcase-purple hover:text-white",
  purple: "hover:bg-showcase-purple/90",
  teal: "hover:bg-showcase-teal/90",
  yellow: "hover:bg-showcase-yellow/90",
  coral: "hover:bg-showcase-coral/90",
  pink: "hover:bg-showcase-pink/90",
  orange: "hover:bg-showcase-orange/90",
  green: "hover:bg-showcase-green/90",
  blue: "hover:bg-showcase-blue/90",
};

interface ChunkyCardProps {
  children: React.ReactNode;
  color?: ColorVariant;
  hoverFillColor?: ColorVariant;
  href?: string;
  external?: boolean;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  pattern?: "dots" | "lines" | "grid" | "none";
}

export default function ChunkyCard({
  children,
  color = "white",
  hoverFillColor,
  href,
  external,
  className = "",
  onClick,
  hoverEffect = true,
  pattern = "none",
}: ChunkyCardProps) {
  const patternClass = pattern !== "none" ? `pattern-${pattern}` : "";
  const fillClass = hoverFillColor ? hoverFillClasses[hoverFillColor] : "";

  const baseClasses = `
    rounded-2xl border-3 border-showcase-navy shadow-chunky-lg
    transition-all duration-300
    ${hoverEffect ? "hover:-translate-y-1.5 hover:shadow-chunky-xl active:translate-y-0.5 active:shadow-chunky-sm" : ""}
    ${bgClasses[color]}
    ${fillClass}
    ${patternClass}
    ${className}
  `.trim();

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`block ${baseClasses} group`}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={`block ${baseClasses} group`}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClasses} group`}>
        {children}
      </button>
    );
  }

  return <div className={`${baseClasses} group`}>{children}</div>;
}
