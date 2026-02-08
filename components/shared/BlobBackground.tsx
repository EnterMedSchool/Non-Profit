"use client";

interface Blob {
  color: string;
  size: number;
  top: string;
  left?: string;
  right?: string;
  delay?: number;
  blur?: number;
  layer?: "back" | "mid" | "front";
}

interface BlobBackgroundProps {
  blobs?: Blob[];
  className?: string;
}

const defaultBlobs: Blob[] = [
  // Back layer -- large, slow, well-separated (cool medical tones: blue, teal, indigo)
  { color: "rgba(108, 92, 231, 0.22)", size: 600, top: "-10%", left: "-15%", delay: 0, blur: 80, layer: "back" },
  { color: "rgba(84, 160, 255, 0.18)", size: 550, top: "15%", right: "-12%", delay: 2, blur: 80, layer: "back" },
  { color: "rgba(0, 217, 192, 0.18)", size: 500, top: "50%", left: "-10%", delay: 4, blur: 80, layer: "back" },
  { color: "rgba(99, 102, 241, 0.16)", size: 480, top: "75%", right: "-5%", delay: 1, blur: 80, layer: "back" },

  // Mid layer -- medium, scattered to edges (softer teal, blue, lavender)
  { color: "rgba(0, 217, 192, 0.16)", size: 350, top: "5%", left: "20%", delay: 1.5, blur: 65, layer: "mid" },
  { color: "rgba(139, 92, 246, 0.14)", size: 330, top: "30%", right: "15%", delay: 3, blur: 65, layer: "mid" },
  { color: "rgba(84, 160, 255, 0.16)", size: 370, top: "55%", left: "10%", delay: 2.5, blur: 65, layer: "mid" },
  { color: "rgba(0, 217, 192, 0.14)", size: 300, top: "80%", right: "5%", delay: 0.5, blur: 65, layer: "mid" },

  // Front layer -- smaller accents (gentle highlights)
  { color: "rgba(108, 92, 231, 0.12)", size: 200, top: "8%", right: "25%", delay: 3.5, blur: 45, layer: "front" },
  { color: "rgba(0, 217, 192, 0.10)", size: 180, top: "40%", left: "30%", delay: 4.5, blur: 45, layer: "front" },
  { color: "rgba(84, 160, 255, 0.10)", size: 160, top: "65%", right: "20%", delay: 1.5, blur: 45, layer: "front" },
];

const layerSpeed: Record<string, string> = {
  back: "animate-float-gentle",
  mid: "animate-float-playful",
  front: "animate-float-playful",
};

const organicShapes = [
  "40% 60% 70% 30% / 60% 30% 70% 40%",
  "70% 30% 50% 50% / 30% 60% 40% 70%",
  "30% 60% 40% 70% / 50% 40% 60% 50%",
  "60% 40% 30% 70% / 40% 70% 30% 60%",
  "50% 50% 60% 40% / 70% 30% 50% 50%",
];

export default function BlobBackground({
  blobs = defaultBlobs,
  className = "",
}: BlobBackgroundProps) {
  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Animated gradient base */}
      <div className="absolute inset-0 gradient-animated" />

      {/* Floating blobs with organic shapes and layered depth */}
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={`absolute ${layerSpeed[blob.layer || "mid"]}`}
          style={{
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 65%)`,
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            right: blob.right,
            animationDelay: `${blob.delay || 0}s`,
            animationDuration: blob.layer === "back" ? "12s" : blob.layer === "front" ? "6s" : "8s",
            filter: `blur(${blob.blur || 60}px)`,
            borderRadius: organicShapes[i % organicShapes.length],
          }}
        />
      ))}
    </div>
  );
}
