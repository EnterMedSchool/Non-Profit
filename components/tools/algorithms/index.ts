import type { AlgorithmDefinition } from "@/lib/algorithmTypes";

export const algorithmRegistry: Record<
  string,
  () => Promise<{ default: AlgorithmDefinition }>
> = {
  "hypertension-mgmt": () => import("@/data/algorithms/hypertension"),
};
