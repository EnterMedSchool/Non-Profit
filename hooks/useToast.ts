"use client";

import { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let globalId = 0;

/**
 * Simple toast notification hook.
 * Returns a list of active toasts and methods to show/dismiss them.
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${++globalId}`;
      const toast: Toast = { id, message, type, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, duration?: number) => show(message, "success", duration),
    [show],
  );

  const error = useCallback(
    (message: string, duration?: number) => show(message, "error", duration ?? 6000),
    [show],
  );

  const warning = useCallback(
    (message: string, duration?: number) => show(message, "warning", duration),
    [show],
  );

  const info = useCallback(
    (message: string, duration?: number) => show(message, "info", duration),
    [show],
  );

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
  };
}
