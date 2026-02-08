/**
 * Lightweight class name joiner (replaces clsx/classnames).
 * Filters out falsy values and joins with a space.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
