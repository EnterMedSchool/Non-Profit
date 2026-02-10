import type { ComponentType } from "react";
import type { VisibleSections } from "@/lib/embedTheme";

/**
 * Props that all calculator components accept for embed theming.
 */
export interface CalculatorEmbedProps {
  /** When true, hide secondary metrics and show only main result */
  compact?: boolean;
  /** Control which result sections are visible */
  visibleSections?: VisibleSections;
  /** When true, component reads CSS custom properties for theming */
  themed?: boolean;
}

/**
 * Lazy registry mapping tool `id` (from data/tools.ts) to a dynamic import loader.
 *
 * Both the tool detail page and embed page use this registry via CalculatorLoader
 * to dynamically render the correct tool. Components are loaded on demand
 * to avoid bundling all calculators in every page.
 *
 * Note: The Illustration Maker has its own full-screen route at /create
 * and is not part of this registry.
 */
export const calculatorRegistry: Record<
  string,
  () => Promise<{ default: ComponentType<CalculatorEmbedProps> }>
> = {
  "bmi-calc": () => import("./BMICalculator"),
  "latex-editor": () => import("@/components/tools/latex-editor"),
};
