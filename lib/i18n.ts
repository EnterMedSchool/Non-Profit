/** RTL locale helpers — centralised so every consumer stays in sync. */

export const rtlLocales = ["he", "ar", "fa"] as const;

/**
 * Returns `true` when the given locale uses a right-to-left script.
 * Extend `rtlLocales` above when adding more RTL languages.
 */
export function isRTLLocale(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

/**
 * Flip an x-axis value for RTL layouts.
 * Useful for Framer Motion `x` animations that should slide in opposite
 * directions depending on writing direction.
 *
 * @example
 *   initial={{ x: rtlX(300, isRTL) }}   // 300 in LTR, -300 in RTL
 */
export function rtlX(value: number, isRTL: boolean): number {
  return isRTL ? -value : value;
}
