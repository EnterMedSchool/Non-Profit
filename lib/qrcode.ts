import QRCode from "qrcode";

export interface QRCodeOptions {
  /** The URL to encode in the QR code */
  url: string;
  /** Width/height in pixels (QR codes are square). Default: 120 */
  size?: number;
  /** Foreground color (dark modules). Default: "#1a1a2e" (showcase-navy) */
  foreground?: string;
  /** Background color (light modules). Default: "#FFFFFF" */
  background?: string;
  /** Error correction level. Default: "M" */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** Quiet zone margin in modules. Default: 1 */
  margin?: number;
}

/**
 * Generate a QR code as a data URL (base64 PNG).
 *
 * Shared utility -- used by the attribution badge and future tool pages.
 * Each caller provides its own target URL (e.g. "https://entermedschool.org/tools/anatomy").
 */
export async function generateQRCodeDataURL(
  options: QRCodeOptions,
): Promise<string> {
  const {
    url,
    size = 120,
    foreground = "#1a1a2e",
    background = "#FFFFFF",
    errorCorrectionLevel = "M",
    margin = 1,
  } = options;

  return QRCode.toDataURL(url, {
    width: size,
    margin,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel,
  });
}

/**
 * Generate a QR code and return it as an HTMLImageElement ready to draw on a canvas.
 *
 * Resolves once the image has fully loaded.
 */
export async function generateQRCodeImage(
  options: QRCodeOptions,
): Promise<HTMLImageElement> {
  const dataURL = await generateQRCodeDataURL(options);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = dataURL;
  });
}
