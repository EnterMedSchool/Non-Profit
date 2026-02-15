#!/usr/bin/env node
/**
 * Upload public assets to Vercel Blob storage.
 *
 * Migrates: public/og/, public/videos/, public/visuals/, public/assets/, public/logo.png
 *
 * Run:   node scripts/upload-to-blob.mjs
 * Env:   BLOB_READ_WRITE_TOKEN must be set (in .env.local or environment)
 */

import { put } from "@vercel/blob";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname, relative, extname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

// Load .env.local for the token
config({ path: join(ROOT, ".env.local") });

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error("  ERROR: BLOB_READ_WRITE_TOKEN not set. Add it to .env.local");
  process.exit(1);
}

// ── Content type mapping ──────────────────────────────────────────────
const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ts": "video/mp2t",       // HLS segments (MPEG-TS), NOT TypeScript
  ".m3u8": "application/vnd.apple.mpegurl",
  ".srt": "text/srt",
  ".json": "application/json",
  ".html": "text/html",
  ".txt": "text/plain",
  ".js": "application/javascript",
};

function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

// ── Recursive file walker ─────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  console.log("\n  Uploading assets to Vercel Blob...\n");

  // Collect all files to upload
  const targets = [
    join(PUBLIC, "og"),
    join(PUBLIC, "videos"),
    join(PUBLIC, "visuals"),
    join(PUBLIC, "assets"),
  ];
  const singleFiles = [join(PUBLIC, "logo.png")];

  let allFiles = [];
  for (const dir of targets) {
    if (existsSync(dir)) {
      const files = walkDir(dir);
      console.log(`  Found ${files.length} files in ${relative(ROOT, dir)}/`);
      allFiles.push(...files);
    } else {
      console.log(`  Skipping ${relative(ROOT, dir)}/ (not found)`);
    }
  }
  for (const f of singleFiles) {
    if (existsSync(f)) {
      allFiles.push(f);
      console.log(`  Found ${relative(ROOT, f)}`);
    }
  }

  console.log(`\n  Total files to upload: ${allFiles.length}\n`);
  if (allFiles.length === 0) {
    console.log("  Nothing to upload.");
    return;
  }

  let uploaded = 0;
  let totalBytes = 0;
  let blobBaseUrl = null;
  let errors = [];

  // Batch uploader — 50 concurrent uploads
  const BATCH_SIZE = 50;
  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (filePath) => {
        const pathname = relative(PUBLIC, filePath).replace(/\\/g, "/");
        const buffer = readFileSync(filePath);
        const contentType = getContentType(filePath);

        const result = await put(pathname, buffer, {
          access: "public",
          addRandomSuffix: false,
          contentType,
          token: TOKEN,
        });

        return { pathname, url: result.url, size: buffer.length };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        uploaded++;
        totalBytes += r.value.size;
        // Extract base URL from first successful upload
        if (!blobBaseUrl && r.value.url) {
          const url = new URL(r.value.url);
          blobBaseUrl = `${url.protocol}//${url.host}`;
        }
      } else {
        errors.push(r.reason?.message || String(r.reason));
      }
    }

    if (uploaded % 200 < BATCH_SIZE && uploaded >= 200) {
      const mb = (totalBytes / 1024 / 1024).toFixed(1);
      console.log(`    ... ${uploaded} uploaded (${mb} MB)`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const sizeMB = (totalBytes / 1024 / 1024).toFixed(1);
  console.log(`\n  Done! Uploaded ${uploaded} files (${sizeMB} MB) in ${elapsed}s`);

  if (errors.length > 0) {
    console.log(`  ${errors.length} errors:`);
    for (const e of errors.slice(0, 10)) console.log(`    - ${e}`);
    if (errors.length > 10) console.log(`    ... and ${errors.length - 10} more`);
  }

  if (blobBaseUrl) {
    console.log(`\n  *** BLOB BASE URL: ${blobBaseUrl} ***`);
    console.log(`  Set this in .env.local and Vercel project settings as:`);
    console.log(`    NEXT_PUBLIC_BLOB_URL=${blobBaseUrl}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
