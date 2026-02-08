"use client";

import Link from "next/link";

type ButtonVariant = "primary" | "teal" | "yellow" | "coral" | "ghost" | "green";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-showcase-purple text-white shadow-chunky hover:shadow-chunky-lg",
  teal: "bg-showcase-teal text-ink-dark shadow-chunky hover:shadow-chunky-lg",
  yellow: "bg-showcase-yellow text-ink-dark shadow-chunky hover:shadow-chunky-lg",
  coral: "bg-showcase-coral text-white shadow-chunky hover:shadow-chunky-lg",
  green: "bg-showcase-green text-white shadow-chunky hover:shadow-chunky-lg",
  ghost: "bg-transparent text-ink-dark shadow-chunky-sm hover:bg-pastel-lavender hover:shadow-chunky",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-2xl",
};

interface ChunkyButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function ChunkyButton({
  children,
  variant = "primary",
  size = "md",
  href,
  external,
  onClick,
  disabled,
  className = "",
  type = "button",
}: ChunkyButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    border-3 border-showcase-navy
    font-display font-bold
    transition-all duration-150
    hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-chunky-sm
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
}
