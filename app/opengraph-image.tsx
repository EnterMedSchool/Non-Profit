import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "EnterMedSchool.org — Open-Source Medical Education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Read the logo file and convert to base64 data URI
  const logoBuffer = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F0EEFF 0%, #EDF4FF 30%, #EEFBF9 60%, #F5F3FF 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(108, 92, 231, 0.15)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 350, height: 350, borderRadius: "50%", background: "rgba(0, 217, 192, 0.15)", display: "flex" }} />

        {/* Main card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 80px",
            borderRadius: 32,
            border: "6px solid #1a1a2e",
            background: "white",
            boxShadow: "8px 8px 0 #1a1a2e",
            maxWidth: 1000,
          }}
        >
          {/* Logo + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoBase64}
              alt=""
              width={64}
              height={64}
              style={{ borderRadius: 12 }}
            />
            <span style={{ fontSize: 36, fontWeight: 800, color: "#1a1a2e" }}>
              EnterMedSchool<span style={{ color: "#6C5CE7" }}>.org</span>
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#1a1a2e",
              textAlign: "center",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Open-Source Medical Education
          </h1>
          <h2
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#6C5CE7",
              textAlign: "center",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            for Everyone
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 22,
              color: "#4a4a6a",
              textAlign: "center",
              marginTop: 20,
              maxWidth: 700,
            }}
          >
            Free resources, tools, and guides for medical students and professors worldwide
          </p>

          {/* Badges */}
          <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
            {["100% Free", "Open Source", "Non-Commercial"].map((badge) => (
              <div
                key={badge}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "3px solid #1a1a2e",
                  background: badge === "100% Free" ? "#2ECC71" : badge === "Open Source" ? "#6C5CE7" : "#00D9C0",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  boxShadow: "2px 2px 0 #1a1a2e",
                  display: "flex",
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
