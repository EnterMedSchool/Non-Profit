"use client";

import { useState, useEffect } from "react";
import { Shield, Pencil, ExternalLink, ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { loadAttribution, hasValidAttribution } from "@/lib/attribution";
import AttributionReminderModal from "./AttributionReminderModal";

interface AttributionBannerProps {
  /** Called after the user updates their attribution details */
  onUpdated?: () => void;
}

/**
 * A slim, non-intrusive banner that shows returning users what name
 * their downloads will be attributed to, with a quick-edit button.
 * Only renders when the user already has valid attribution stored.
 */
export default function AttributionBanner({ onUpdated }: AttributionBannerProps) {
  const [details, setDetails] = useState<{ name: string; position: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load attribution on mount
  useEffect(() => {
    if (hasValidAttribution()) {
      const saved = loadAttribution();
      if (saved && saved.name.trim()) {
        setDetails(saved);
      }
    }

    // Check sessionStorage for collapse state
    try {
      const wasCollapsed = sessionStorage.getItem("ems-attr-banner-collapsed");
      if (wasCollapsed === "true") setCollapsed(true);
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const handleCollapse = () => {
    setCollapsed(true);
    try {
      sessionStorage.setItem("ems-attr-banner-collapsed", "true");
    } catch {
      // ignore
    }
  };

  const handleExpand = () => {
    setCollapsed(false);
    try {
      sessionStorage.removeItem("ems-attr-banner-collapsed");
    } catch {
      // ignore
    }
  };

  const handleSaved = (name: string, position: string) => {
    setDetails({ name, position });
    onUpdated?.();
  };

  // Don't render if no stored details
  if (!details) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {collapsed ? (
          <m.button
            key="collapsed"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            onClick={handleExpand}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-showcase-teal/30 bg-showcase-teal/5 px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-showcase-teal/10"
          >
            <Shield className="h-3.5 w-3.5 text-showcase-teal" />
            <span>
              Attributed to <strong className="text-ink-dark">{details.name}</strong>
            </span>
            <ChevronDown className="h-3 w-3 text-ink-light" />
          </m.button>
        ) : (
          <m.div
            key="expanded"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-2 rounded-xl border-2 border-showcase-teal/25 bg-showcase-teal/5 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-showcase-teal" />
              <div className="min-w-0">
                <p className="text-xs leading-relaxed text-ink-muted">
                  Your downloads will be attributed to{" "}
                  <strong className="text-ink-dark">{details.name}</strong>
                  {details.position && (
                    <span className="text-ink-light"> ({details.position})</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border-2 border-showcase-teal/30 bg-white px-2.5 py-1 text-xs font-bold text-showcase-teal transition-all hover:bg-showcase-teal hover:text-white"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
              <a
                href="/en/license#generator"
                className="inline-flex items-center gap-1 text-xs font-semibold text-showcase-purple hover:underline"
              >
                Badge Generator
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                onClick={handleCollapse}
                className="ml-1 text-ink-light hover:text-ink-muted transition-colors"
                aria-label="Minimize"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M5 12h14" />
                </svg>
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <AttributionReminderModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSaved={handleSaved}
        initialName={details.name}
        initialPosition={details.position}
        editMode
      />
    </>
  );
}
