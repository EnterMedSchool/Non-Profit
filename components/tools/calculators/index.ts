import type { ComponentType } from "react";
import type { VisibleSections } from "@/lib/embedTheme";
import BMICalculator from "./BMICalculator";
import LaTeXEditor from "@/components/tools/latex-editor";

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
 * Registry mapping tool `id` (from data/tools.ts) to its component.
 *
 * Both the tool detail page and embed page use this registry
 * to dynamically render the correct tool.
 *
 * Note: The Illustration Maker has its own full-screen route at /create
 * and is not part of this registry.
 */
export const calculatorRegistry: Record<string, ComponentType<CalculatorEmbedProps>> = {
  "bmi-calc": BMICalculator,
  "latex-editor": LaTeXEditor as ComponentType<CalculatorEmbedProps>,
};
