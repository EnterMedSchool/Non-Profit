/**
 * Embed theme system.
 *
 * Settings are serialized as base64-encoded JSON in the `theme` URL query
 * parameter so the embed iframe URL carries its own styling config.
 */

// ── Types ────────────────────────────────────────────────────────────

export interface EmbedTheme {
  /** Background color */
  bg: string;
  /** Accent color (buttons, active toggles, links) */
  ac: string;
  /** Primary text color */
  tx: string;
  /** Muted / secondary text color */
  mt: string;
  /** Font family key (see FONT_OPTIONS) */
  ff: string;
  /** Base font size in px */
  fs: number;
  /** Border radius in px */
  br: number;
  /** Border style */
  bs: "chunky" | "thin" | "none";
  /** Card shadow on/off */
  sh: boolean;
  /** Dark mode */
  dk: boolean;
  /** Compact mode (calculator + result only) */
  cp: boolean;
  /** Show BMI Prime section */
  sp: boolean;
  /** Show Ponderal Index section */
  si: boolean;
  /** Show waist guidance section */
  sw: boolean;
  /** Show age context section */
  sa: boolean;
  /** Show disclaimer */
  sd: boolean;
  /** Attribution bar style */
  ab: "full" | "compact";
}

export interface VisibleSections {
  bmiPrime: boolean;
  ponderalIndex: boolean;
  waistGuidance: boolean;
  ageContext: boolean;
  disclaimer: boolean;
}

// ── Font options ─────────────────────────────────────────────────────

export interface FontOption {
  label: string;
  value: string;
  /** CSS font-family stack */
  family: string;
  /** Google Fonts URL (null for system) */
  googleUrl: string | null;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    label: "System Default",
    value: "system",
    family: "system-ui, -apple-system, sans-serif",
    googleUrl: null,
  },
  {
    label: "DM Sans",
    value: "dm-sans",
    family: "'DM Sans', sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
  },
  {
    label: "Inter",
    value: "inter",
    family: "'Inter', sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    label: "Roboto",
    value: "roboto",
    family: "'Roboto', sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  },
  {
    label: "Open Sans",
    value: "open-sans",
    family: "'Open Sans', sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
  },
  {
    label: "Lato",
    value: "lato",
    family: "'Lato', sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap",
  },
];

export function getFontOption(value: string): FontOption {
  return FONT_OPTIONS.find((f) => f.value === value) ?? FONT_OPTIONS[0];
}

// ── Defaults ─────────────────────────────────────────────────────────

export const DEFAULT_THEME: EmbedTheme = {
  bg: "#ffffff",
  ac: "#6C5CE7",
  tx: "#1a1a2e",
  mt: "#6a6a8a",
  ff: "dm-sans",
  fs: 14,
  br: 12,
  bs: "chunky",
  sh: true,
  dk: false,
  cp: false,
  sp: true,
  si: true,
  sw: true,
  sa: true,
  sd: true,
  ab: "full",
};

// ── Encode / decode ──────────────────────────────────────────────────

/** Only encode keys that differ from defaults to keep the string short */
export function encodeTheme(theme: Partial<EmbedTheme>): string {
  const diff: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(theme)) {
    if (val !== (DEFAULT_THEME as unknown as Record<string, unknown>)[key]) {
      diff[key] = val;
    }
  }
  if (Object.keys(diff).length === 0) return "";
  try {
    return btoa(JSON.stringify(diff));
  } catch {
    return "";
  }
}

/** Decode theme param, falling back to defaults for any missing/invalid keys */
export function decodeTheme(param: string | null | undefined): EmbedTheme {
  if (!param) return { ...DEFAULT_THEME };
  try {
    const parsed = JSON.parse(atob(param)) as Partial<EmbedTheme>;
    return { ...DEFAULT_THEME, ...parsed };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

/** Check if the theme is exactly the defaults (no customization) */
export function isDefaultTheme(theme: EmbedTheme): boolean {
  return encodeTheme(theme) === "";
}

// ── CSS custom properties ────────────────────────────────────────────

export function themeToCSS(theme: EmbedTheme): React.CSSProperties {
  const font = getFontOption(theme.ff);
  return {
    "--embed-bg": theme.bg,
    "--embed-accent": theme.ac,
    "--embed-text": theme.tx,
    "--embed-muted": theme.mt,
    "--embed-radius": `${theme.br}px`,
    "--embed-font-size": `${theme.fs}px`,
    "--embed-font-family": font.family,
    "--embed-border-width": theme.bs === "chunky" ? "3px" : theme.bs === "thin" ? "1px" : "0px",
    "--embed-shadow": theme.sh ? "4px 4px 0px 0px rgba(26,26,46,0.15)" : "none",
    backgroundColor: theme.bg,
    color: theme.tx,
    fontFamily: font.family,
    fontSize: `${theme.fs}px`,
    borderRadius: `${theme.br}px`,
  } as React.CSSProperties;
}

/** Extract section visibility flags from theme */
export function getVisibleSections(theme: EmbedTheme): VisibleSections {
  return {
    bmiPrime: theme.sp,
    ponderalIndex: theme.si,
    waistGuidance: theme.sw,
    ageContext: theme.sa,
    disclaimer: theme.sd,
  };
}
