"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, ExternalLink, Pencil } from "lucide-react";
import { saveAttribution } from "@/lib/attribution";

interface AttributionReminderModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (name: string, position: string) => void;
  /** Pre-fill name when editing existing attribution */
  initialName?: string;
  /** Pre-fill position when editing existing attribution */
  initialPosition?: string;
  /** When true, show "Update" language instead of "Save" */
  editMode?: boolean;
}

export default function AttributionReminderModal({
  open,
  onClose,
  onSaved,
  initialName = "",
  initialPosition = "",
  editMode = false,
}: AttributionReminderModalProps) {
  const [name, setName] = useState(initialName);
  const [position, setPosition] = useState(initialPosition);
  const [error, setError] = useState(false);

  // Sync with initial values when modal opens
  useEffect(() => {
    if (open) {
      setName(initialName);
      setPosition(initialPosition);
      setError(false);
    }
  }, [open, initialName, initialPosition]);

  const handleSave = () => {
    if (!name.trim()) {
      setError(true);
      return;
    }
    saveAttribution({ name: name.trim(), position: position.trim() });
    onSaved(name.trim(), position.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-showcase-navy/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-[15vh] z-[101] w-[90vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border-3 border-showcase-navy bg-white shadow-chunky-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-showcase-navy/10 px-6 py-4">
              <div className="flex items-center gap-2">
                {editMode ? (
                  <Pencil className="h-5 w-5 text-showcase-purple" />
                ) : (
                  <Shield className="h-5 w-5 text-showcase-teal" />
                )}
                <h3 className="font-display text-lg font-bold text-ink-dark">
                  {editMode ? "Update Your Attribution" : "Attribution Required"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-ink-muted leading-relaxed">
                {editMode
                  ? "Update your name and institution. This will apply to all future downloads."
                  : "Before downloading, please tell us who you are so we can generate your attribution badge. This badge will be included in your download ZIP."}
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-ink-dark mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(false);
                    }}
                    placeholder="Prof. Jane Smith"
                    className={`w-full rounded-xl border-3 ${
                      error
                        ? "border-red-300 focus:border-red-400"
                        : "border-showcase-navy/20 focus:border-showcase-purple"
                    } bg-white px-4 py-2.5 text-sm outline-none transition-colors`}
                  />
                  {error && (
                    <p className="mt-1 text-xs text-red-400">
                      Name is required for attribution.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-dark mb-1.5">
                    Position / Institution
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Medical School, University"
                    className="w-full rounded-xl border-3 border-showcase-navy/20 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-showcase-purple"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border-2 border-dashed border-showcase-teal/30 bg-showcase-teal/5 p-3">
                <p className="text-xs text-ink-muted leading-relaxed">
                  You <strong>must</strong> contact{" "}
                  <a
                    href="mailto:ari@entermedschool.com"
                    className="font-semibold text-showcase-teal hover:underline"
                  >
                    ari@entermedschool.com
                  </a>{" "}
                  for approval to use these materials for educational purposes.
                  Without approval, the license is not valid.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-showcase-navy bg-showcase-green px-5 py-2.5 text-sm font-bold text-white shadow-chunky-sm transition-all hover:shadow-chunky hover:-translate-y-0.5"
                >
                  {editMode ? "Update & Continue" : "Save & Continue Download"}
                </button>
                <a
                  href="/en/license"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-showcase-purple hover:underline"
                >
                  Full Badge Generator
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
