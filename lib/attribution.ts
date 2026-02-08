const STORAGE_KEY = "ems-attribution";

export interface AttributionDetails {
  name: string;
  position: string;
}

/**
 * Save user attribution details to localStorage.
 * Called on input change (debounced) so the user never has to re-enter info.
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
 * Returns null if nothing is stored or parsing fails.
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

/**
 * Generate a badge PNG blob using an offscreen canvas.
 * Reuses the rendering logic from BadgeGenerator.
 */
export async function generateBadgePngBlob(
  details: AttributionDetails
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const W = 1000;
  const H = 150;
  canvas.width = W;
  canvas.height = H;

  // Load logo
  const logoImg = await new Promise<HTMLImageElement>((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = "/logo.png";
  });

  ctx.clearRect(0, 0, W, H);

  // Rounded-rect
  const r = 16;
  const drawRoundedRect = () => {
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(W - r, 0);
    ctx.quadraticCurveTo(W, 0, W, r);
    ctx.lineTo(W, H - r);
    ctx.quadraticCurveTo(W, H, W - r, H);
    ctx.lineTo(r, H);
    ctx.quadraticCurveTo(0, H, 0, H - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
  };

  drawRoundedRect();
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  ctx.save();
  drawRoundedRect();
  ctx.clip();

  // Left purple accent bar
  ctx.fillStyle = "#6C5CE7";
  ctx.fillRect(0, 0, 8, H);

  // Subtle divider
  ctx.strokeStyle = "#e8e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(148, 20);
  ctx.lineTo(148, H - 20);
  ctx.stroke();

  // Logo
  const textStartX = 168;
  const logoSize = 30;
  const logoY = 22;
  if (logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, textStartX, logoY, logoSize, logoSize);
  }

  // "EnterMedSchool" + ".org"
  const brandX = textStartX + logoSize + 10;
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("EnterMedSchool", brandX, logoY + logoSize / 2);
  ctx.fillStyle = "#6C5CE7";
  const orgX = brandX + ctx.measureText("EnterMedSchool").width;
  ctx.fillText(".org", orgX, logoY + logoSize / 2);

  // User name
  const displayName = details.name.trim() || "Prof. Your Name";
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  const nameY = details.position.trim() ? 78 : 88;
  ctx.fillText(displayName, textStartX, nameY);

  // Position
  if (details.position.trim()) {
    ctx.fillStyle = "#6a6a8a";
    ctx.font = "500 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(details.position, textStartX, 104);
  }

  // Fine print
  ctx.fillStyle = "#9999b0";
  ctx.font = "400 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("Free for non-commercial educational use", textStartX, 132);

  // Right-side branding
  ctx.fillStyle = "#6C5CE7";
  ctx.font = "600 12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("entermedschool.org", W - 24, H / 2);

  ctx.restore();

  // Border
  drawRoundedRect();
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 3;
  ctx.stroke();

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

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
