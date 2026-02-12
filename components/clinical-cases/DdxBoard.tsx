"use client";

import { useState, useCallback } from "react";
import { m, AnimatePresence, Reorder } from "framer-motion";
import { Search, Plus, X, GripVertical } from "lucide-react";

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

  return (
    <div className="space-y-4">
      {/* Active DDx with drag-and-drop reorder */}
      <div>
        <p className="text-xs font-bold text-ink-muted mb-2">
          Your differential ({activeDdx.length})
        </p>
        {activeDdx.length === 0 ? (
          <p className="text-xs text-ink-light italic py-3 text-center">
            Add diseases from the bank below
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={activeDdx}
            onReorder={onUpdate}
            className="space-y-1.5"
          >
            {activeDdx.map((disease, i) => (
              <Reorder.Item
                key={disease}
                value={disease}
                className="flex items-center gap-1.5 rounded-xl border-2 border-showcase-navy/10 bg-white px-3 py-2 group shadow-sm cursor-grab active:cursor-grabbing active:shadow-md active:z-10"
              >
                <GripVertical className="h-3.5 w-3.5 text-ink-light/40 shrink-0" />
                <span className="text-xs font-medium text-ink-dark flex-1 truncate">
                  {i + 1}. {disease}
                </span>
                <button
                  onClick={() => removeFromDdx(disease)}
                  className="rounded-lg p-1.5 text-showcase-coral/50 hover:text-showcase-coral hover:bg-showcase-coral/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${disease}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-showcase-navy/10" />

      {/* Disease Bank */}
      <div>
        <p className="text-xs font-bold text-ink-muted mb-2">Disease bank</p>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diseases..."
            className="w-full rounded-xl border-2 border-showcase-navy/10 bg-white py-2 pl-8 pr-3 text-xs text-ink-dark placeholder:text-ink-light outline-none focus:border-showcase-purple/40 focus:ring-2 focus:ring-showcase-purple/10 transition-all"
          />
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {availableDiseases.map((disease) => (
              <m.button
                key={disease}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => addToDdx(disease)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-ink-muted transition-all hover:bg-pastel-lavender/30 hover:text-ink-dark active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5 text-showcase-purple/50 shrink-0" />
                <span className="truncate">{disease}</span>
              </m.button>
            ))}
          </AnimatePresence>
          {availableDiseases.length === 0 && (
            <p className="text-[10px] text-ink-light text-center py-2">
              {searchQuery ? "No matches" : "All diseases added"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
