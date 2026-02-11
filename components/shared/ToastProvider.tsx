"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useToast, type ToastType } from "@/hooks/useToast";
import ToastContainer from "@/components/shared/ToastContainer";

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => string;
  dismiss: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useGlobalToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useGlobalToast must be used within <ToastProvider>");
  }
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, show, dismiss, success, error, warning, info } = useToast();

  return (
    <ToastContext.Provider value={{ show, dismiss, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
