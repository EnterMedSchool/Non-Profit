import { ExternalLink } from "lucide-react";
import type { Source, Credit } from "@/types/glossary";

interface SourcesSectionProps {
  sources?: Source[];
  credits?: Credit[];
}

export default function SourcesSection({ sources, credits }: SourcesSectionProps) {
  if (!sources?.length && !credits?.length) return null;

  return (
    <section aria-labelledby="sources" className="scroll-mt-20">
      <div className="rounded-2xl border-3 border-ink-dark/10 bg-white shadow-chunky-sm overflow-hidden">
        <div className="h-1.5 bg-ink-dark/20" />
        <div className="px-5 py-4">
          <h2
            id="sources"
            className="font-display text-base font-bold text-ink-dark sm:text-lg"
          >
            📚 References & Sources
          </h2>

          {/* Sources */}
          {sources && sources.length > 0 && (
            <ol className="mt-3 space-y-2">
              {sources.map((source, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 rounded-full bg-ink-dark/10 px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-showcase-purple hover:underline leading-relaxed"
                  >
                    {source.title}
                    <ExternalLink className="ml-1 inline h-3 w-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ol>
          )}

          {/* Credits */}
          {credits && credits.length > 0 && (
            <div className="mt-4 border-t border-ink-dark/5 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Credits
              </h3>
              <div className="mt-2 flex flex-wrap gap-3">
                {credits.map((credit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {credit.avatar && (
                      <img
                        src={credit.avatar}
                        alt={credit.display}
                        className="h-6 w-6 rounded-full"
                        loading="lazy"
                      />
                    )}
                    <span className="text-sm text-ink-dark">
                      {credit.url ? (
                        <a
                          href={credit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-showcase-purple hover:underline"
                        >
                          {credit.display}
                        </a>
                      ) : (
                        credit.display
                      )}
                    </span>
                    {credit.role && (
                      <span className="text-xs text-ink-muted">
                        ({credit.role})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
