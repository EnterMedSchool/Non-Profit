"use client";

import dynamic from "next/dynamic";
import { calculatorRegistry } from "./index";
import type { CalculatorEmbedProps } from "./index";

const loadingSpinner = (
  <div className="flex min-h-[200px] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-500" />
  </div>
);

/** Pre-built dynamic calculator components derived from registry. */
const calculatorDynamicComponents = Object.fromEntries(
  Object.keys(calculatorRegistry).map((id) => [
    id,
    dynamic(calculatorRegistry[id], {
      ssr: false,
      loading: () => loadingSpinner,
    }) as React.ComponentType<CalculatorEmbedProps>,
  ])
) as Record<string, React.ComponentType<CalculatorEmbedProps>>;

export interface CalculatorLoaderProps extends Partial<CalculatorEmbedProps> {
  id: string;
}

/**
 * Client component that lazily loads and renders a calculator by id.
 * Use this in pages to avoid bundling all calculators.
 */
export default function CalculatorLoader({
  id,
  compact,
  visibleSections,
  themed,
}: CalculatorLoaderProps) {
  const CalculatorComponent = calculatorDynamicComponents[id];
  if (!CalculatorComponent) return null;

  return (
    <CalculatorComponent
      compact={compact}
      visibleSections={visibleSections}
      themed={themed}
    />
  );
}
