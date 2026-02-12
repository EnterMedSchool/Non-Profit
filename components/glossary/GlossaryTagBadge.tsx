import Link from "next/link";
import { cn } from "@/lib/cn";

interface GlossaryTagBadgeProps {
  tagId: string;
  name: string;
  icon: string;
  accent: string;
  locale: string;
  count?: number;
  size?: "sm" | "md";
  linked?: boolean;
}

export default function GlossaryTagBadge({
  tagId,
  name,
  icon,
  accent,
  locale,
  count,
  size = "md",
  linked = true,
}: GlossaryTagBadgeProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 font-semibold transition-all",
        size === "sm"
          ? "px-2.5 py-0.5 text-xs"
          : "px-3 py-1 text-sm",
        linked && "hover:scale-105 hover:shadow-md cursor-pointer",
      )}
      style={{
        borderColor: accent,
        backgroundColor: `${accent}15`,
        color: accent,
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{name}</span>
      {count !== undefined && (
        <span
          className="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {count}
        </span>
      )}
    </span>
  );

  if (!linked) return content;

  return (
    <Link href={`/${locale}/resources/glossary/category/${tagId}`}>
      {content}
    </Link>
  );
}
