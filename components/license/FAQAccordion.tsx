"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`rounded-xl border-3 transition-all duration-200 ${
              isOpen
                ? "border-showcase-purple/30 bg-white shadow-chunky-sm"
                : "border-showcase-navy/10 bg-white hover:border-showcase-navy/20"
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start"
            >
              <span className="font-display text-sm font-bold text-ink-dark sm:text-base">
                {item.question}
              </span>
              <m.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown
                  className={`h-5 w-5 transition-colors ${
                    isOpen ? "text-showcase-purple" : "text-ink-light"
                  }`}
                />
              </m.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t-2 border-showcase-navy/5 px-5 pb-4 pt-3">
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {item.answer}
                    </p>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
