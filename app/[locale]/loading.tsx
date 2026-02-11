export default function Loading() {
  return (
    <main className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Hero skeleton */}
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-64 animate-pulse rounded-2xl bg-showcase-purple/10 sm:h-12 sm:w-80" />
          <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-xl bg-showcase-navy/5" />
          <div className="mt-2 h-5 w-72 max-w-full animate-pulse rounded-xl bg-showcase-navy/5" />
        </div>

        {/* Card skeleton grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border-3 border-showcase-navy/10 bg-white p-6 shadow-chunky-sm"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="h-10 w-10 animate-pulse rounded-xl bg-pastel-lavender" />
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded-lg bg-showcase-navy/8" />
              <div className="mt-3 space-y-2">
                <div className="h-3.5 w-full animate-pulse rounded-md bg-showcase-navy/5" />
                <div className="h-3.5 w-5/6 animate-pulse rounded-md bg-showcase-navy/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar skeleton */}
        <div className="mx-auto mt-6 h-4 w-48 animate-pulse rounded-full bg-showcase-navy/5" />
      </div>
    </main>
  );
}
