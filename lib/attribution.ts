import { blobAsset } from "@/lib/blob-url";
const STORAGE_KEY = "ems-attribution";

export type BadgeShape = "horizontal" | "square" | "compact" | "vertical";
export type BadgeSize = "small" | "medium" | "large";
export type BadgeColorTheme = "purple" | "teal" | "green" | "coral" | "navy" | "custom";
export type BadgeBgStyle = "white" | "gradient" | "dark" | "transparent";

export interface BadgePreferences {
  badgeShape: BadgeShape;
  badgeSize: BadgeSize;
  badgeColorTheme: BadgeColorTheme;
  badgeBgStyle: BadgeBgStyle;
  customColor: string;
  showQR: boolean;
  showFinePrint: boolean;
  showPosition: boolean;
}

export interface AttributionDetails {
  name: string;
  position: string;
}

export const DEFAULT_BADGE_PREFS: BadgePreferences = {
  badgeShape: "horizontal",
  badgeSize: "medium",
  badgeColorTheme: "purple",
  badgeBgStyle: "white",
  customColor: "#6C5CE7",
  showQR: true,
  showFinePrint: true,
  showPosition: true,
};

/** Color map for each named theme */
export const THEME_COLORS: Record<string, string> = {
  purple: "#6C5CE7",
  teal: "#00B894",
  green: "#00A86B",
  coral: "#FF6B6B",
  navy: "#1a1a2e",
};

/** Returns the resolved accent hex for a given theme + custom color */
export function resolveAccentColor(theme: BadgeColorTheme, customColor: string): string {
  if (theme === "custom") return customColor || THEME_COLORS.purple;
  return THEME_COLORS[theme] || THEME_COLORS.purple;
}

/** Badge dimensions per shape/size */
export function getBadgeDimensions(shape: BadgeShape, size: BadgeSize): { w: number; h: number } {
  const dims: Record<BadgeShape, Record<BadgeSize, { w: number; h: number }>> = {
    horizontal: { small: { w: 700, h: 100 }, medium: { w: 1000, h: 150 }, large: { w: 1200, h: 200 } },
    square: { small: { w: 300, h: 300 }, medium: { w: 400, h: 400 }, large: { w: 500, h: 500 } },
    compact: { small: { w: 400, h: 50 }, medium: { w: 550, h: 60 }, large: { w: 700, h: 75 } },
    vertical: { small: { w: 250, h: 350 }, medium: { w: 320, h: 450 }, large: { w: 400, h: 550 } },
  };
  return dims[shape]?.[size] || dims.horizontal.medium;
}

/**
 * Save user attribution details to localStorage.
 */
export function saveAttribution(details: AttributionDetails): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch {
    // localStorage may be unavailable (SSR, private browsing quota, etc.)
  }
}

/**
 * Load previously saved attribution details from localStorage.
 */
export function loadAttribution(): AttributionDetails | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AttributionDetails>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      position: typeof parsed.position === "string" ? parsed.position : "",
    };
  } catch {
    return null;
  }
}

/**
 * Check if user has a valid (non-empty) attribution name in localStorage.
 */
export function hasValidAttribution(): boolean {
  const details = loadAttribution();
  return !!details && details.name.trim().length > 0;
}

/* ── Canvas drawing helpers ────────────────────────────────── */

function drawRoundedRect(ctx: CanvasRenderingContext2D, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
}

function applyBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: number,
  bgStyle: BadgeBgStyle,
  accent: string,
  isDark: boolean
) {
  drawRoundedRect(ctx, w, h, r);
  if (bgStyle === "transparent") {
    ctx.clearRect(0, 0, w, h);
  } else if (isDark) {
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
  } else if (bgStyle === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#FFFFFF");
    grad.addColorStop(1, accent + "15");
    ctx.fillStyle = grad;
    ctx.fill();
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  }
}

function getTextColors(isDark: boolean, accent: string) {
  return {
    primary: isDark ? "#FFFFFF" : "#1a1a2e",
    secondary: isDark ? "#c0c0d0" : "#6a6a8a",
    muted: isDark ? "#8888a8" : "#9999b0",
    accent,
    border: isDark ? "#3a3a5e" : "#1a1a2e",
    divider: isDark ? "#3a3a5e" : "#e8e8f0",
  };
}

async function loadLogo(): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = blobAsset("/logo.png");
  });
}

/* ── Shape-specific drawing ────────────────────────────────── */

function drawHorizontalBadge(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  details: AttributionDetails,
  prefs: BadgePreferences,
  accent: string,
  isDark: boolean,
  logoImg: HTMLImageElement,
  qrImg: HTMLImageElement | null
) {
  const colors = getTextColors(isDark, accent);
  const r = Math.round(H * 0.11);
  const scale = H / 150; // scale relative to medium=150

  applyBackground(ctx, W, H, r, prefs.badgeBgStyle, accent, isDark);
  ctx.save();
  drawRoundedRect(ctx, W, H, r);
  ctx.clip();

  // Left accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, Math.round(8 * scale), H);

  // QR code
  let contentStartX = Math.round(28 * scale);
  if (prefs.showQR && qrImg) {
    const qrSize = Math.round(100 * scale);
    const qrX = contentStartX;
    const qrY = Math.round((H - qrSize) / 2);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    contentStartX = qrX + qrSize + Math.round(20 * scale);

    // Divider
    ctx.strokeStyle = colors.divider;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(contentStartX - Math.round(10 * scale), Math.round(20 * scale));
    ctx.lineTo(contentStartX - Math.round(10 * scale), H - Math.round(20 * scale));
    ctx.stroke();
  } else {
    contentStartX = Math.round(24 * scale);
  }

  // Logo + brand
  const logoSize = Math.round(30 * scale);
  const logoY = Math.round(22 * scale);
  if (logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, contentStartX, logoY, logoSize, logoSize);
  }
  const brandX = contentStartX + logoSize + Math.round(10 * scale);
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(18 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("EnterMedSchool", brandX, logoY + logoSize / 2);
  ctx.fillStyle = accent;
  const orgX = brandX + ctx.measureText("EnterMedSchool").width;
  ctx.fillText(".org", orgX, logoY + logoSize / 2);

  // User name
  const displayName = details.name.trim() || "Prof. Your Name";
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(22 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = "middle";
  const showPos = prefs.showPosition && details.position.trim();
  const nameY = showPos ? Math.round(78 * scale) : Math.round(88 * scale);
  ctx.fillText(displayName, contentStartX, nameY);

  // Position
  if (showPos) {
    ctx.fillStyle = colors.secondary;
    ctx.font = `500 ${Math.round(14 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(details.position, contentStartX, Math.round(104 * scale));
  }

  // Fine print
  if (prefs.showFinePrint) {
    ctx.fillStyle = colors.muted;
    ctx.font = `400 ${Math.round(11 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText("Free for non-commercial educational use", contentStartX, Math.round(132 * scale));
  }

  // Right-side branding
  ctx.fillStyle = accent;
  ctx.font = `600 ${Math.round(12 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("entermedschool.org", W - Math.round(24 * scale), H / 2);

  ctx.restore();

  // Border
  if (prefs.badgeBgStyle !== "transparent") {
    drawRoundedRect(ctx, W, H, r);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = Math.round(3 * scale);
    ctx.stroke();
  }
}

function drawSquareBadge(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  details: AttributionDetails,
  prefs: BadgePreferences,
  accent: string,
  isDark: boolean,
  logoImg: HTMLImageElement,
  qrImg: HTMLImageElement | null
) {
  const colors = getTextColors(isDark, accent);
  const r = Math.round(W * 0.05);
  const scale = W / 400;
  const pad = Math.round(28 * scale);

  applyBackground(ctx, W, H, r, prefs.badgeBgStyle, accent, isDark);
  ctx.save();
  drawRoundedRect(ctx, W, H, r);
  ctx.clip();

  // Top accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, Math.round(6 * scale));

  let y = Math.round(30 * scale);

  // Logo + brand centered
  const logoSize = Math.round(36 * scale);
  if (logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, (W - logoSize) / 2, y, logoSize, logoSize);
  }
  y += logoSize + Math.round(10 * scale);

  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(18 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const brandText = "EnterMedSchool";
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, W / 2 - ctx.measureText(".org").width / 2, y);
  ctx.fillStyle = accent;
  ctx.fillText(".org", W / 2 + brandW / 2 - ctx.measureText(".org").width / 2, y);

  y += Math.round(24 * scale);

  // Divider
  ctx.strokeStyle = colors.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();
  y += Math.round(20 * scale);

  // QR code
  if (prefs.showQR && qrImg) {
    const qrSize = Math.round(80 * scale);
    ctx.drawImage(qrImg, (W - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + Math.round(16 * scale);
  }

  // Name
  const displayName = details.name.trim() || "Prof. Your Name";
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(22 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayName, W / 2, y);
  y += Math.round(22 * scale);

  // Position
  if (prefs.showPosition && details.position.trim()) {
    ctx.fillStyle = colors.secondary;
    ctx.font = `500 ${Math.round(13 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(details.position, W / 2, y);
    y += Math.round(18 * scale);
  }

  // Fine print
  if (prefs.showFinePrint) {
    ctx.fillStyle = colors.muted;
    ctx.font = `400 ${Math.round(10 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText("Free for non-commercial educational use", W / 2, H - Math.round(20 * scale));
  }

  ctx.restore();

  if (prefs.badgeBgStyle !== "transparent") {
    drawRoundedRect(ctx, W, H, r);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = Math.round(3 * scale);
    ctx.stroke();
  }
}

function drawCompactPill(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  details: AttributionDetails,
  prefs: BadgePreferences,
  accent: string,
  isDark: boolean,
  logoImg: HTMLImageElement
) {
  const colors = getTextColors(isDark, accent);
  const r = H / 2;
  const scale = H / 60;

  applyBackground(ctx, W, H, r, prefs.badgeBgStyle, accent, isDark);
  ctx.save();
  drawRoundedRect(ctx, W, H, r);
  ctx.clip();

  // Left accent circle
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(H / 2, H / 2, H / 2, 0, Math.PI * 2);
  ctx.fill();

  // Logo in circle
  const logoSize = Math.round(22 * scale);
  if (logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, (H - logoSize) / 2, (H - logoSize) / 2, logoSize, logoSize);
  }

  // Name + brand
  const displayName = details.name.trim() || "Your Name";
  const textX = H + Math.round(12 * scale);
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(16 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(displayName, textX, H / 2);

  // Right brand
  ctx.fillStyle = accent;
  ctx.font = `600 ${Math.round(11 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("entermedschool.org", W - Math.round(16 * scale), H / 2);

  ctx.restore();

  if (prefs.badgeBgStyle !== "transparent") {
    drawRoundedRect(ctx, W, H, r);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = Math.round(2 * scale);
    ctx.stroke();
  }
}

function drawVerticalBadge(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  details: AttributionDetails,
  prefs: BadgePreferences,
  accent: string,
  isDark: boolean,
  logoImg: HTMLImageElement,
  qrImg: HTMLImageElement | null
) {
  const colors = getTextColors(isDark, accent);
  const r = Math.round(W * 0.06);
  const scale = W / 320;

  applyBackground(ctx, W, H, r, prefs.badgeBgStyle, accent, isDark);
  ctx.save();
  drawRoundedRect(ctx, W, H, r);
  ctx.clip();

  // Top accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, Math.round(8 * scale));

  let y = Math.round(32 * scale);

  // Logo + brand centered
  const logoSize = Math.round(44 * scale);
  if (logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, (W - logoSize) / 2, y, logoSize, logoSize);
  }
  y += logoSize + Math.round(12 * scale);

  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(20 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("EnterMedSchool", W / 2, y);
  y += Math.round(6 * scale);
  ctx.fillStyle = accent;
  ctx.font = `bold ${Math.round(14 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(".org", W / 2, y + Math.round(14 * scale));
  y += Math.round(32 * scale);

  // Divider
  const pad = Math.round(30 * scale);
  ctx.strokeStyle = colors.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(W - pad, y);
  ctx.stroke();
  y += Math.round(24 * scale);

  // Name
  const displayName = details.name.trim() || "Prof. Your Name";
  ctx.fillStyle = colors.primary;
  ctx.font = `bold ${Math.round(24 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayName, W / 2, y);
  y += Math.round(24 * scale);

  // Position
  if (prefs.showPosition && details.position.trim()) {
    ctx.fillStyle = colors.secondary;
    ctx.font = `500 ${Math.round(14 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(details.position, W / 2, y);
    y += Math.round(22 * scale);
  }

  // QR code
  if (prefs.showQR && qrImg) {
    y += Math.round(8 * scale);
    const qrSize = Math.round(90 * scale);
    ctx.drawImage(qrImg, (W - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + Math.round(12 * scale);
  }

  // Fine print
  if (prefs.showFinePrint) {
    ctx.fillStyle = colors.muted;
    ctx.font = `400 ${Math.round(10 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Free for non-commercial", W / 2, H - Math.round(30 * scale));
    ctx.fillText("educational use", W / 2, H - Math.round(18 * scale));
  }

  ctx.restore();

  if (prefs.badgeBgStyle !== "transparent") {
    drawRoundedRect(ctx, W, H, r);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = Math.round(3 * scale);
    ctx.stroke();
  }
}

/* ── Public badge blob generator ────────────────────────────── */

/**
 * Generate a badge PNG blob using an offscreen canvas.
 * Accepts optional preferences; defaults to horizontal/purple/medium.
 */
export async function generateBadgePngBlob(
  details: AttributionDetails,
  prefs?: Partial<BadgePreferences>
): Promise<Blob> {
  const p: BadgePreferences = { ...DEFAULT_BADGE_PREFS, ...prefs };
  const accent = resolveAccentColor(p.badgeColorTheme, p.customColor);
  const isDark = p.badgeBgStyle === "dark";
  const { w: W, h: H } = getBadgeDimensions(p.badgeShape, p.badgeSize);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);

  const logoImg = await loadLogo();

  // Load QR for shapes that use it
  let qrImg: HTMLImageElement | null = null;
  if (p.showQR && p.badgeShape !== "compact") {
    try {
      const { generateQRCodeImage } = await import("@/lib/qrcode");
      qrImg = await generateQRCodeImage({
        url: "https://entermedschool.org",
        size: 256,
        foreground: isDark ? "#FFFFFF" : "#1a1a2e",
        background: isDark ? "#1a1a2e" : "#FFFFFF",
        margin: 1,
      });
    } catch {
      // QR generation failed, proceed without
    }
  }

  switch (p.badgeShape) {
    case "square":
      drawSquareBadge(ctx, W, H, details, p, accent, isDark, logoImg, qrImg);
      break;
    case "compact":
      drawCompactPill(ctx, W, H, details, p, accent, isDark, logoImg);
      break;
    case "vertical":
      drawVerticalBadge(ctx, W, H, details, p, accent, isDark, logoImg, qrImg);
      break;
    default:
      drawHorizontalBadge(ctx, W, H, details, p, accent, isDark, logoImg, qrImg);
      break;
  }

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

/**
 * Render a badge onto an existing canvas element (for live preview).
 */
export async function renderBadgeToCanvas(
  canvas: HTMLCanvasElement,
  details: AttributionDetails,
  prefs: BadgePreferences,
  logoImg: HTMLImageElement,
  qrImg: HTMLImageElement | null
): Promise<void> {
  const accent = resolveAccentColor(prefs.badgeColorTheme, prefs.customColor);
  const isDark = prefs.badgeBgStyle === "dark";
  const { w: W, h: H } = getBadgeDimensions(prefs.badgeShape, prefs.badgeSize);

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  switch (prefs.badgeShape) {
    case "square":
      drawSquareBadge(ctx, W, H, details, prefs, accent, isDark, logoImg, qrImg);
      break;
    case "compact":
      drawCompactPill(ctx, W, H, details, prefs, accent, isDark, logoImg);
      break;
    case "vertical":
      drawVerticalBadge(ctx, W, H, details, prefs, accent, isDark, logoImg, qrImg);
      break;
    default:
      drawHorizontalBadge(ctx, W, H, details, prefs, accent, isDark, logoImg, qrImg);
      break;
  }
}

/* ── Embed / text generators (unchanged) ─────────────────── */

/** Escape HTML entities for embed code generation */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate HTML embed code string for the attribution badge.
 */
export function generateAttributionEmbedHtml(
  details: AttributionDetails
): string {
  const displayName = details.name.trim() || "Your Name";
  const parts = [
    `<div style="display:inline-block;padding:6px 14px;border:1px solid #e2e2e2;border-radius:8px;font-family:system-ui,sans-serif;font-size:13px;color:#4a4a6a;background:#fafafa;line-height:1.6;">`,
    `  Resource by <strong>${escapeHtml(displayName)}</strong>`,
    details.position.trim()
      ? ` &middot; ${escapeHtml(details.position.trim())}`
      : "",
    ` &middot; <a href="https://entermedschool.com" rel="dofollow" style="color:#6C5CE7;text-decoration:none;font-weight:600;">EnterMedSchool</a>`,
    ` &middot; <a href="https://entermedschool.org" rel="dofollow" style="color:#6C5CE7;text-decoration:none;font-weight:600;">entermedschool.org</a>`,
    `</div>`,
  ];
  return parts.join("");
}

/**
 * Generate a Markdown attribution string.
 */
export function generateAttributionMarkdown(
  details: AttributionDetails
): string {
  const displayName = details.name.trim() || "Your Name";
  const pos = details.position.trim();
  const parts = [
    `Resource by **${displayName}**`,
    pos ? ` · ${pos}` : "",
    ` · [EnterMedSchool](https://entermedschool.com) · [entermedschool.org](https://entermedschool.org)`,
  ];
  return parts.join("");
}

/**
 * Generate a plain-text attribution string.
 */
export function generateAttributionPlainText(
  details: AttributionDetails
): string {
  const displayName = details.name.trim() || "Your Name";
  const pos = details.position.trim();
  const parts = [
    `Materials provided by EnterMedSchool.org | Used by ${displayName}`,
    pos ? ` | ${pos}` : "",
    ` | https://entermedschool.org`,
  ];
  return parts.join("");
}

/**
 * Generate the HOW-TO-ATTRIBUTE.txt content for inclusion in ZIP downloads.
 */
export function generateHowToAttributeText(
  lessonTitle: string,
  details: AttributionDetails
): string {
  return `============================================
ATTRIBUTION REQUIRED - EnterMedSchool.org
============================================

Lesson: ${lessonTitle}
Created by: Ari Horesh
Licensed to: ${details.name.trim() || "Your Name"}${details.position.trim() ? ` - ${details.position.trim()}` : ""}

You MUST add the included attribution badge (attribution-badge.png)
to every slide, page, or website where you use these assets.

For online use: paste the embed code from embed-code.html on your
website alongside the assets.

IMPORTANT: You must contact ari@entermedschool.com for approval
to use these materials for educational purposes. Without approval,
the license is not valid.

Links (must be included as dofollow):
- https://entermedschool.com
- https://entermedschool.org
- Original lesson: https://entermedschool.org/en/resources/visuals

License: Free for non-commercial educational use with attribution.
============================================
`;
}
