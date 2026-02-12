import GlossarySectionCard from "@/components/glossary/GlossarySectionCard";
import type { TermImage } from "@/types/glossary";

interface ImagesSectionProps {
  images: TermImage[];
  termName: string;
}

export default function ImagesSection({
  images,
  termName,
}: ImagesSectionProps) {
  if (!images.length) return null;

  return (
    <GlossarySectionCard
      id="images"
      title="Images & Diagrams"
      icon="🖼️"
      accent="#00D9C0"
      seoHeading={`${termName} — Images & Diagrams`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <figure
            key={i}
            className="overflow-hidden rounded-xl border-2 border-ink-dark/10"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full object-contain bg-white"
              loading="lazy"
            />
            <figcaption className="border-t border-ink-dark/5 bg-ink-dark/[0.02] px-3 py-2">
              <p className="text-xs text-ink-muted">{img.alt}</p>
              {img.credit && (
                <a
                  href={img.credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-showcase-purple hover:underline"
                >
                  {img.credit.text}
                </a>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </GlossarySectionCard>
  );
}
