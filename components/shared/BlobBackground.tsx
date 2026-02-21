import { CSSProperties } from "react";
import { Plus } from "lucide-react";

interface Shape {
  type: "circle" | "square" | "cross" | "pill";
  color: string;
  size: number;
  top: string;
  left?: string;
  right?: string;
  delay?: number;
  duration?: number;
  rotate?: number;
}

const defaultShapes: Shape[] = [
  { type: "circle", color: "bg-showcase-purple", size: 120, top: "10%", left: "5%", delay: 0, duration: 15, rotate: 0 },
  { type: "square", color: "bg-showcase-teal", size: 80, top: "60%", right: "10%", delay: 2, duration: 18, rotate: 15 },
  { type: "pill", color: "bg-showcase-pink", size: 120, top: "20%", right: "15%", delay: 1, duration: 20, rotate: -25 },
  { type: "cross", color: "text-showcase-yellow", size: 100, top: "70%", left: "15%", delay: 3, duration: 16, rotate: 45 },
  { type: "circle", color: "bg-showcase-blue", size: 60, top: "40%", left: "40%", delay: 4, duration: 14, rotate: 0 },
  { type: "square", color: "bg-showcase-orange", size: 70, top: "85%", right: "40%", delay: 0.5, duration: 19, rotate: 10 },
  { type: "pill", color: "bg-showcase-green", size: 90, top: "30%", left: "25%", delay: 2.5, duration: 17, rotate: 60 },
];

interface BlobBackgroundProps {
  className?: string;
}

export default function BlobBackground({
  className = "",
}: BlobBackgroundProps) {
  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAFDF5] ${className}`}
      aria-hidden="true"
    >
      {/* Grid pattern for the "playground/notebook" feel */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a1a2e 2px, transparent 2px),
            linear-gradient(to bottom, #1a1a2e 2px, transparent 2px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating sharp colorful shapes */}
      {defaultShapes.map((shape, i) => {
        return (
          <div
            key={i}
            className="absolute animate-float-playful"
            style={{
              top: shape.top,
              left: shape.left,
              right: shape.right,
              animationDelay: `${shape.delay || 0}s`,
              animationDuration: `${shape.duration || 10}s`,
            }}
          >
            <div 
              style={{ transform: `rotate(${shape.rotate || 0}deg)` }}
            >
              {shape.type === 'cross' ? (
                <Plus 
                  className={`drop-shadow-3d ${shape.color}`} 
                  size={shape.size} 
                  strokeWidth={4} 
                />
              ) : (
                <div 
                  className={`shadow-neo-brutal border-3 border-showcase-navy ${
                    shape.type === 'circle' ? 'rounded-full' : 
                    shape.type === 'pill' ? 'rounded-full' : 
                    'rounded-xl'
                  } ${shape.color}`}
                  style={{
                    width: shape.size,
                    height: shape.type === 'pill' ? shape.size / 2 : shape.size,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}