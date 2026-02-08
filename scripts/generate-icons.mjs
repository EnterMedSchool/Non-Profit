/**
 * Generate all favicon/icon variants from the master logo PNG.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");
const src = resolve(publicDir, "logo.png");

async function generate() {
  console.log("Generating icon variants from logo.png...\n");

  // 1. favicon-16x16.png
  await sharp(src).resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(resolve(publicDir, "favicon-16x16.png"));
  console.log("  ✓ favicon-16x16.png");

  // 2. favicon-32x32.png
  await sharp(src).resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(resolve(publicDir, "favicon-32x32.png"));
  console.log("  ✓ favicon-32x32.png");

  // 3. icon.png (192x192)
  await sharp(src).resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(resolve(publicDir, "icon.png"));
  console.log("  ✓ icon.png (192x192)");

  // 4. apple-touch-icon.png (180x180 with white background for iOS)
  const appleIcon = await sharp(src).resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  }).composite([{ input: appleIcon, gravity: "center" }]).png().toFile(resolve(publicDir, "apple-touch-icon.png"));
  console.log("  ✓ apple-touch-icon.png (180x180, white bg)");

  // 5. android-chrome-192x192.png (maskable — 10% padding, white bg)
  const android192Inner = await sharp(src).resize(154, 154, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 255, g: 249, b: 230, alpha: 1 } }, // cream bg
  }).composite([{ input: android192Inner, gravity: "center" }]).png().toFile(resolve(publicDir, "android-chrome-192x192.png"));
  console.log("  ✓ android-chrome-192x192.png (192x192, maskable)");

  // 6. android-chrome-512x512.png (maskable — 10% padding, cream bg)
  const android512Inner = await sharp(src).resize(410, 410, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 255, g: 249, b: 230, alpha: 1 } }, // cream bg
  }).composite([{ input: android512Inner, gravity: "center" }]).png().toFile(resolve(publicDir, "android-chrome-512x512.png"));
  console.log("  ✓ android-chrome-512x512.png (512x512, maskable)");

  // 7. favicon.ico (multi-size: 16 + 32)
  const ico32 = await sharp(src).resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const icoBuffer = await pngToIco(ico32);
  writeFileSync(resolve(publicDir, "favicon.ico"), icoBuffer);
  console.log("  ✓ favicon.ico");

  console.log("\nAll icons generated successfully!");
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
