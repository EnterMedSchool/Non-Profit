import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from EnterMedSchool showcase design system
        showcase: {
          purple: "#6C5CE7",
          teal: "#00D9C0",
          yellow: "#FFD93D",
          coral: "#7E22CE",
          pink: "#FF85A2",
          orange: "#FF9F43",
          blue: "#54A0FF",
          green: "#2ECC71",
          navy: "#1a1a2e",
        },
        // Background pastels — clean, medical-appropriate tones
        pastel: {
          cream: "#F5F7FF",
          lavender: "#F3F1FF",
          mint: "#EEFBF9",
          peach: "#FFF0F0",
          lemon: "#FAFDF5",
          sky: "#EDF4FF",
        },
        // Text colors
        ink: {
          dark: "#1a1a2e",
          muted: "#4a4a6a",
          light: "#8888aa",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      fontFamily: {
        display: [
          "var(--font-bricolage)",
          "var(--font-heebo)",
          "Bricolage Grotesque",
          "system-ui",
          "sans-serif",
        ],
        body: [
          "var(--font-dm-sans)",
          "var(--font-heebo)",
          "DM Sans",
          "system-ui",
          "sans-serif",
        ],
        handwritten: ["var(--font-caveat)", "Caveat", "cursive"],
      },
      borderWidth: {
        3: "3px",
      },
      boxShadow: {
        chunky: "4px 4px 0px #1a1a2e",
        "chunky-sm": "2px 2px 0px #1a1a2e",
        "chunky-lg": "6px 6px 0px #1a1a2e",
        "chunky-xl": "8px 8px 0px #1a1a2e",
        "chunky-purple": "4px 4px 0px #6C5CE7",
        "chunky-teal": "4px 4px 0px #00D9C0",
        "chunky-yellow": "4px 4px 0px #FFD93D",
        "chunky-coral": "4px 4px 0px #7E22CE",
        "chunky-pink": "4px 4px 0px #FF85A2",
        "chunky-green": "4px 4px 0px #2ECC71",
        "chunky-orange": "4px 4px 0px #FF9F43",
        "chunky-blue": "4px 4px 0px #54A0FF",
        "neo-brutal": "8px 8px 0px rgba(0,0,0,1)",
        "neo-brutal-sm": "4px 4px 0px rgba(0,0,0,1)",
        "neo-brutal-lg": "12px 12px 0px rgba(0,0,0,1)",
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        card: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      },
      dropShadow: {
        "3d": "4px 4px 0px rgba(0,0,0,1)",
        "3d-sm": "2px 2px 0px rgba(0,0,0,1)",
        "3d-lg": "6px 6px 0px rgba(0,0,0,1)",
      },
      borderRadius: {
        chunky: "1rem",
      },
      keyframes: {
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "float-playful": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-15px) rotate(2deg)" },
          "50%": { transform: "translateY(-5px) rotate(-1deg)" },
          "75%": { transform: "translateY(-20px) rotate(1deg)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.9)" },
        },
        "rainbow-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px 0 rgba(108, 92, 231, 0.3)" },
          "50%": { boxShadow: "0 0 40px 8px rgba(108, 92, 231, 0.5)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        morph: {
          "0%, 100%": { borderRadius: "40% 60% 70% 30% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "70% 30% 50% 50% / 30% 60% 40% 70%" },
          "50%": { borderRadius: "30% 60% 40% 70% / 50% 40% 60% 50%" },
          "75%": { borderRadius: "60% 40% 30% 70% / 40% 70% 30% 60%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-particle": {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-200px) translateX(20px)", opacity: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "map-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.4" },
          "50%": { transform: "scale(2)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "0.4" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "text-rotate": {
          "0%, 18%": { transform: "translateY(0)", opacity: "1" },
          "22%, 48%": { transform: "translateY(-100%)", opacity: "1" },
          "52%, 78%": { transform: "translateY(-200%)", opacity: "1" },
          "82%, 100%": { transform: "translateY(-300%)", opacity: "1" },
        },
        "border-rainbow": {
          "0%": { borderColor: "#6C5CE7" },
          "25%": { borderColor: "#00D9C0" },
          "50%": { borderColor: "#FF85A2" },
          "75%": { borderColor: "#FFD93D" },
          "100%": { borderColor: "#6C5CE7" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 15s ease infinite",
        "float-playful": "float-playful 8s ease-in-out infinite",
        "float-gentle": "float-gentle 6s ease-in-out infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        sparkle: "sparkle 2s ease-in-out infinite",
        "rainbow-move": "rainbow-move 3s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "draw-line": "draw-line 2s ease-out forwards",
        morph: "morph 12s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "float-particle": "float-particle 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        marquee: "marquee 30s linear infinite",
        "marquee-fast": "marquee 20s linear infinite",
        "border-rainbow": "border-rainbow 4s ease-in-out infinite",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.text-shadow-3d': {
          textShadow: '4px 4px 0px #000',
        },
        '.text-shadow-3d-sm': {
          textShadow: '2px 2px 0px #000',
        },
        '.text-shadow-3d-white': {
          textShadow: '4px 4px 0px #fff',
        },
      })
    })
  ],
};

export default config;
