"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Toast, ToastType } from "@/hooks/useToast";

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastType, string> = {
  success: "border-green-400 bg-green-50 text-green-800",
  error: "border-red-400 bg-red-50 text-red-800",
  warning: "border-amber-400 bg-amber-50 text-amber-800",
  info: "border-blue-400 bg-blue-50 text-blue-800",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col-reverse gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`flex items-start gap-2.5 rounded-xl border-2 px-4 py-3 shadow-lg ${COLORS[toast.type]}`}
            >
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
