"use client";

import { m } from "framer-motion";
import { Coins } from "lucide-react";

interface CpBudgetProps {
  spent: number;
  budget: number;
}

export default function CpBudget({ spent, budget }: CpBudgetProps) {
  const ratio = budget > 0 ? spent / budget : 0;
  const isOver = spent > budget;

  const color =
    ratio >= 0.8 || isOver
      ? "text-red-400"
      : ratio >= 0.6
        ? "text-showcase-yellow"
        : "text-showcase-green";

  const barColor =
    ratio >= 0.8 || isOver
      ? "bg-red-400"
      : ratio >= 0.6
        ? "bg-showcase-yellow"
        : "bg-showcase-green";

  return (
    <div className="flex items-center gap-2" title={`Clinical Points: ${spent}/${budget} spent`}>
      <Coins className={`h-3.5 w-3.5 ${color}`} />
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
          <m.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          />
        </div>
        <span className={`text-[11px] font-bold tabular-nums ${color}`}>
          {spent}/{budget}
        </span>
      </div>
    </div>
  );
}
