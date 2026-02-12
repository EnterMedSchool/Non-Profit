"use client";

import { m } from "framer-motion";
import { Heart } from "lucide-react";

interface RapportMeterProps {
  rapport: number; // 0–100
}

export default function RapportMeter({ rapport }: RapportMeterProps) {
  const color =
    rapport >= 70
      ? "text-showcase-green"
      : rapport >= 30
        ? "text-showcase-yellow"
        : "text-showcase-coral";

  const barColor =
    rapport >= 70
      ? "bg-showcase-green"
      : rapport >= 30
        ? "bg-showcase-yellow"
        : "bg-showcase-coral";

  const label =
    rapport >= 70
      ? "Trusting"
      : rapport >= 30
        ? "Neutral"
        : "Distant";

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={`Patient Rapport: ${rapport} out of 100, ${label}`}
      title={`Patient Rapport: ${rapport}/100 — ${label}`}
    >
      <Heart className={`h-3.5 w-3.5 ${color}`} />
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-showcase-navy/10">
          <m.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${rapport}%` }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          />
        </div>
        <span className={`text-[10px] font-bold ${color}`}>{label}</span>
      </div>
    </div>
  );
}
