type BadgeColor =
  | "coral"
  | "yellow"
  | "purple"
  | "teal"
  | "pink"
  | "green"
  | "navy"
  | "orange";

const colorClasses: Record<BadgeColor, string> = {
  coral: "bg-showcase-coral text-white",
  yellow: "bg-showcase-yellow text-ink-dark",
  purple: "bg-showcase-purple text-white",
  teal: "bg-showcase-teal text-ink-dark",
  pink: "bg-showcase-pink text-white",
  green: "bg-showcase-green text-white",
  navy: "bg-showcase-navy text-white",
  orange: "bg-showcase-orange text-ink-dark",
};

interface StickerBadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: "sm" | "md";
  className?: string;
}

export default function StickerBadge({
  children,
  color = "purple",
  size = "md",
  className = "",
}: StickerBadgeProps) {
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] shadow-[1px_1px_0_#1a1a2e]"
      : "px-3 py-1 text-xs shadow-[2px_2px_0_#1a1a2e]";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-display font-bold uppercase tracking-wider
        border-2 border-showcase-navy rounded-md
        whitespace-nowrap
        ${colorClasses[color]}
        ${sizeClasses}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
