import {
  BookOpen,
  Video,
  Presentation,
  Heart,
  Globe,
  Wrench,
  FileText,
  Download,
  Eye,
  Layers,
} from "lucide-react";

const marqueeItems = [
  { text: "Slide Templates", icon: Presentation, color: "bg-showcase-purple" },
  { text: "Question Banks", icon: BookOpen, color: "bg-showcase-teal" },
  { text: "Video Assets", icon: Video, color: "bg-showcase-pink" },
  { text: "Free Forever", icon: Heart, color: "bg-showcase-green" },
  { text: "Open Source", icon: Globe, color: "bg-showcase-blue" },
  { text: "Visual Assets", icon: Eye, color: "bg-showcase-orange" },
  { text: "Teaching Guides", icon: FileText, color: "bg-showcase-coral" },
  { text: "Interactive Tools", icon: Wrench, color: "bg-showcase-yellow" },
  { text: "Embed Anywhere", icon: Download, color: "bg-showcase-teal" },
  { text: "Share with Students", icon: Globe, color: "bg-showcase-purple" },
  { text: "Attribution Required", icon: Layers, color: "bg-showcase-green" },
];

function MarqueeContent() {
  return (
    <>
      {marqueeItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-3 whitespace-nowrap px-6"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full ${item.color}/20`}
            >
              <Icon className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-display text-base font-bold tracking-wide">
              {item.text}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        );
      })}
    </>
  );
}

export default function Marquee() {
  return (
    <section className="relative z-10 -mt-4 mb-2" aria-hidden="true">
      {/* Top strip -- scrolls left */}
      <div
        className="relative overflow-hidden py-4"
        style={{
          background:
            "linear-gradient(135deg, #6C5CE7 0%, #00D9C0 35%, #54A0FF 70%, #6C5CE7 100%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 8s ease infinite",
          transform: "rotate(-1.5deg) scale(1.03)",
        }}
      >
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }} />

        <div className="marquee-strip animate-marquee text-white">
          <MarqueeContent />
          {/* Duplicate for seamless loop */}
          <MarqueeContent />
        </div>
      </div>

      {/* Bottom strip -- scrolls right (opposite direction) */}
      <div
        className="relative overflow-hidden py-3.5 -mt-1"
        style={{
          background:
            "linear-gradient(135deg, #FF85A2 0%, #FFD93D 35%, #FF9F43 70%, #FF85A2 100%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 10s ease infinite",
          transform: "rotate(1deg) scale(1.03)",
        }}
      >
        <div
          className="marquee-strip text-white"
          style={{
            animation: "marquee 25s linear infinite reverse",
          }}
        >
          <MarqueeContent />
          <MarqueeContent />
        </div>
      </div>
    </section>
  );
}
