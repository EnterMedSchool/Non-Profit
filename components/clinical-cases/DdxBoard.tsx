"use client";

import { useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Search, Plus, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

interface DdxBoardProps {
  ddxPool: string[];
  activeDdx: string[];
  onUpdate: (newDdx: string[]) => void;
}

export default function DdxBoard({ ddxPool, activeDdx, onUpdate }: DdxBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const availableDiseases = ddxPool.filter(
    (d) =>
      !activeDdx.includes(d) &&
      d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToDdx = useCallback(
    (disease: string) => {
      onUpdate([...activeDdx, disease]);
    },
    [activeDdx, onUpdate]
  );

  const removeFromDdx = useCallback(
    (disease: string) => {
      onUpdate(activeDdx.filter((d) => d !== disease));
    },
    [activeDdx, onUpdate]
  );

  const moveDdx = useCallback(
    (index: number, direction: "up" | "down") => {
      const newDdx = [...activeDdx];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newDdx.length) return;
      [newDdx[index], newDdx[targetIndex]] = [
        newDdx[targetIndex],
        newDdx[index],
      ];
      onUpdate(newDdx);
    },
    [activeDdx, onUpdate]
  );

  return (
    <div className="space-y-4">
      {/* Active DDx */}
      <div>
        <p className="text-xs text-white/40 mb-2">
          Your differential ({activeDdx.length})
        </p>
        {activeDdx.length === 0 ? (
          <p className="text-xs text-white/20 italic py-3 text-center">
            Drag diseases here from below
          </p>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {activeDdx.map((disease, i) => (
                <m.div
                  key={disease}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 group"
                >
                  <GripVertical className="h-3 w-3 text-white/20 shrink-0" />
                  <span className="text-[11px] font-medium text-white/80 flex-1 truncate">
                    {i + 1}. {disease}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveDdx(i, "up")}
                      disabled={i === 0}
                      className="rounded p-0.5 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveDdx(i, "down")}
                      disabled={i === activeDdx.length - 1}
                      className="rounded p-0.5 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeFromDdx(disease)}
                      className="rounded p-0.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Disease Bank */}
      <div>
        <p className="text-xs text-white/40 mb-2">Disease bank</p>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diseases..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-showcase-purple/40"
          />
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {availableDiseases.map((disease) => (
            <button
              key={disease}
              onClick={() => addToDdx(disease)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] text-white/50 transition-all hover:bg-showcase-purple/10 hover:text-white/80"
            >
              <Plus className="h-3 w-3 text-showcase-purple/50 shrink-0" />
              <span className="truncate">{disease}</span>
            </button>
          ))}
          {availableDiseases.length === 0 && (
            <p className="text-[10px] text-white/20 text-center py-2">
              {searchQuery ? "No matches" : "All diseases added"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
