import { Home } from "lucide-react";
import ChunkyButton from "@/components/shared/ChunkyButton";

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-3xl border-3 border-showcase-navy bg-white p-10 shadow-chunky-lg sm:p-16">
        <span className="font-handwritten text-8xl text-showcase-purple">404</span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-dark sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mt-3 max-w-md text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <ChunkyButton href="/en" variant="primary" size="lg">
            <Home className="h-5 w-5" />
            Go Home
          </ChunkyButton>
        </div>
      </div>
    </main>
  );
}
