#!/usr/bin/env node
/**
 * Upload Italian artwork + audio assets to Vercel Blob.
 *
 * Run:   node scripts/upload-italian-assets-to-blob.mjs
 * Env:   BLOB_READ_WRITE_TOKEN must be set (in .env.local)
 *
 * Uploads:
 *   public/italian-artwork/**  → italian-artwork/**  (webp images)
 *   public/audio/italian/**    → audio/italian/**     (mp3 + manifest)
 */

import { put } from "@vercel/blob";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname, relative, extname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

config({ path: join(ROOT, ".env.local") });

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error("ERROR: BLOB_READ_WRITE_TOKEN not set.");
  process.exit(1);
}

const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".json": "application/json",
};

function walkDir(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function uploadDir(localDir, blobPrefix, label) {
  const files = walkDir(localDir);
  console.log(`\n  ${label}: ${files.length} files`);

  let uploaded = 0;
  let totalBytes = 0;
  let errors = 0;

  const BATCH = 20;
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (filePath) => {
        const relPath = relative(localDir, filePath).replace(/\\/g, "/");
        const blobPath = `${blobPrefix}/${relPath}`;
        const buffer = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

        const result = await put(blobPath, buffer, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType,
          token: TOKEN,
        });

        return { blobPath, url: result.url, size: buffer.length };
      }),
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        uploaded++;
        totalBytes += r.value.size;
        console.log(`    ✓ ${r.value.blobPath}`);
      } else {
        errors++;
        console.log(`    ✗ ${r.reason?.message || "unknown error"}`);
      }
    }
  }

  const sizeMB = (totalBytes / 1024 / 1024).toFixed(2);
  console.log(`  ${label}: ${uploaded} uploaded (${sizeMB} MB), ${errors} errors`);
  return { uploaded, totalBytes, errors };
}

async function main() {
  const start = Date.now();
  console.log("\n  Uploading Italian assets to Vercel Blob...");

  const artworkDir = join(ROOT, "public", "italian-artwork");
  const audioDir = join(ROOT, "public", "audio", "italian");

  const r1 = await uploadDir(artworkDir, "italian-artwork", "Artwork");
  const r2 = await uploadDir(audioDir, "audio/italian", "Audio");

  const total = r1.uploaded + r2.uploaded;
  const totalMB = ((r1.totalBytes + r2.totalBytes) / 1024 / 1024).toFixed(2);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\n  Done! ${total} files (${totalMB} MB) in ${elapsed}s`);

  const blobBase =
    process.env.NEXT_PUBLIC_BLOB_URL || "https://f4zrqxltqjqrvhuu.public.blob.vercel-storage.com";
  console.log(`\n  Blob base: ${blobBase}`);
  console.log(`  Artwork:   ${blobBase}/italian-artwork/Dialog/DoctorTalkingLeft-512w.webp`);
  console.log(`  Audio:     ${blobBase}/audio/italian/7c9a44dc/2f6311df/4e610dc3.mp3`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
