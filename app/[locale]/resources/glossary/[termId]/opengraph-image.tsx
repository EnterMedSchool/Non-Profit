import { ImageResponse } from "next/og";
import { getTermById, glossaryTags } from "@/data/glossary-terms";
import { getTagDisplayName } from "@/lib/glossary/tag-names";

export const runtime = "nodejs";
export const alt = "Glossary Term";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ termId: string }>;
}) {
  const { termId } = await params;
  const term = getTermById(termId);
  if (!term) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a2e",
            color: "#fff",
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          Medical Glossary — EnterMedSchool
        </div>
      ),
      size,
    );
  }

  const tag = glossaryTags[term.primary_tag];
  const accent = tag?.accent || "#6C5CE7";
  const icon = tag?.icon || "📚";
  const categoryName = getTagDisplayName(term.primary_tag);
  const alias = term.abbr?.[0] || term.aliases?.[0];
  const cleanDef = term.definition
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/<u>(.*?)<\/u>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#fefefe",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 8,
            width: "100%",
            background: `linear-gradient(90deg, ${accent}, #6C5CE7, #00D9C0, #FFD93D, #FF85A2, ${accent})`,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "48px 56px",
            justifyContent: "space-between",
          }}
        >
          {/* Category badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                backgroundColor: `${accent}20`,
                color: accent,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              <span>{icon}</span>
              <span>{categoryName}</span>
            </div>
            <div
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                backgroundColor: "#6C5CE720",
                color: "#6C5CE7",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Medical Glossary
            </div>
          </div>

          {/* Term name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24 }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#1a1a2e",
                lineHeight: 1.1,
              }}
            >
              {term.names[0]}
              {alias && (
                <span style={{ fontSize: 36, color: "#8888aa", marginLeft: 16 }}>
                  ({alias})
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: 22,
                color: "#4a4a6a",
                lineHeight: 1.5,
                marginTop: 12,
              }}
            >
              {cleanDef}…
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#1a1a2e",
                }}
              >
                EnterMedSchool.org
              </div>
            </div>
            <div style={{ fontSize: 16, color: "#8888aa" }}>
              Free Medical Education Resources
            </div>
          </div>
        </div>

        {/* Left accent stripe */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 8,
            bottom: 0,
            width: 6,
            backgroundColor: accent,
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
