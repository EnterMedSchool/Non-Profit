"use client";

import { m } from "framer-motion";
import { Coins } from "lucide-react";

interface CpBudgetProps {
  spent: number;
  budget: number;
}

export default function CpBudget({ spent, budget }: CpBudgetProps) {
  const remaining = budget - spent;
  const pct = budget > 0 ? (spent / budget) * 100 : 0;

  const barColor =
    pct <= 50
      ? "bg-showcase-green"
      : pct <= 80
        ? "bg-showcase-yellow"
        : "bg-showcase-coral";

  const textColor =
    pct <= 50
      ? "text-showcase-green"
      : pct <= 80
        ? "text-showcase-yellow"
        : "text-showcase-coral";

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={`Clinical Points: ${spent} of ${budget} spent, ${remaining} remaining`}
    >
      <Coins className={`h-3.5 w-3.5 ${textColor}`} />
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-showcase-navy/10">
          <m.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          />
        </div>
        <span className={`text-[10px] font-bold ${textColor} tabular-nums`}>
          {spent}/{budget}
        </span>
      </div>
    </div>
  );
}
