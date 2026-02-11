"use client";

import { RefreshCw } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-3xl border-3 border-showcase-navy bg-white p-10 shadow-chunky-lg sm:p-16">
        <span className="font-handwritten text-8xl text-showcase-coral">
          Oops!
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
          Something Went Wrong
        </h1>
        <p className="mt-3 max-w-md text-ink-muted">
          An unexpected error occurred. Please try again — if the problem
          persists, contact us.
        </p>
        <div className="mt-8">
          <ChunkyButton variant="primary" size="lg" onClick={reset}>
            <RefreshCw className="h-5 w-5" />
            Try Again
          </ChunkyButton>
        </div>
      </div>
    </main>
  );
}
