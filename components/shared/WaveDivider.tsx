type WaveVariant = "gentle" | "double" | "scallop";

interface WaveDividerProps {
  variant?: WaveVariant;
  topColor?: string;
  bottomColor?: string;
  flip?: boolean;
  className?: string;
}

const wavePaths: Record<WaveVariant, { d1: string; d2?: string }> = {
  gentle: {
    d1: "M0,64 C320,96 640,32 960,64 C1280,96 1440,48 1440,48 L1440,128 L0,128 Z",
  },
  double: {
    d1: "M0,48 C240,96 480,16 720,64 C960,112 1200,32 1440,64 L1440,128 L0,128 Z",
    d2: "M0,80 C360,48 720,112 1080,64 C1260,48 1440,80 1440,80 L1440,128 L0,128 Z",
  },
  scallop: {
    d1: "M0,96 C80,48 160,48 240,96 C320,144 400,144 480,96 C560,48 640,48 720,96 C800,144 880,144 960,96 C1040,48 1120,48 1200,96 C1280,144 1360,144 1440,96 L1440,128 L0,128 Z",
  },
};

export default function WaveDivider({
  variant = "gentle",
  topColor = "transparent",
  bottomColor = "transparent",
  flip = false,
  className = "",
}: WaveDividerProps) {
  const wave = wavePaths[variant];

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none ${className}`}
      style={{
        height: "40px",
        marginTop: flip ? 0 : "-1px",
        marginBottom: flip ? "-1px" : 0,
        transform: flip ? "rotate(180deg)" : undefined,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 128"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Background fill for section above */}
        <rect width="1440" height="128" fill={topColor} />

        {/* Secondary wave for double variant */}
        {wave.d2 && (
          <path d={wave.d2} fill={bottomColor} opacity={0.5} />
        )}

        {/* Primary wave */}
        <path d={wave.d1} fill={bottomColor} />
      </svg>
    </div>
  );
}
