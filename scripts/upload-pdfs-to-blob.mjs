#!/usr/bin/env node
/**
 * Upload generated PDFs to Vercel Blob storage.
 *
 * Run:   node scripts/upload-pdfs-to-blob.mjs
 * Env:   BLOB_READ_WRITE_TOKEN must be set (in .env.local or environment)
 *
 * Also generates a manifest JSON mapping deck slugs → blob URLs.
 */

import { put } from "@vercel/blob";
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from "fs";
import { join, dirname, relative, basename } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "generated-pdfs", "out");

// Load .env.local for the token
config({ path: join(ROOT, ".env.local") });

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error("  ERROR: BLOB_READ_WRITE_TOKEN not set. Add it to .env.local");
  process.exit(1);
}

// ── Recursive file walker ─────────────────────────────────────────────
function walkDir(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.isFile() && full.endsWith(".pdf")) {
      files.push(full);
    }
  }
  return files;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  console.log("\n  Uploading PDFs to Vercel Blob...\n");

  const allFiles = walkDir(OUT_DIR);
  console.log(`  Found ${allFiles.length} PDF files\n`);

  if (allFiles.length === 0) {
    console.log("  Nothing to upload. Run 'npm run generate:pdfs' first.");
    return;
  }

  let uploaded = 0;
  let totalBytes = 0;
  let errors = [];
  const manifest = {};

  const BATCH_SIZE = 20;
  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (filePath) => {
        // Build blob path: pdfs/questions/category/deck-exam.pdf
        const relPath = relative(OUT_DIR, filePath).replace(/\\/g, "/");
        const blobPath = `pdfs/${relPath}`;
        const buffer = readFileSync(filePath);

        const result = await put(blobPath, buffer, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/pdf",
          token: TOKEN,
        });

        return { blobPath, url: result.url, size: buffer.length, relPath };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        uploaded++;
        totalBytes += r.value.size;
        // Build manifest entry: strip pdfs/ prefix and .pdf suffix for key
        const key = r.value.relPath.replace(/\.pdf$/, "");
        manifest[key] = r.value.url;
        console.log(`    ✓ ${r.value.blobPath}`);
      } else {
        errors.push(r.reason?.message || String(r.reason));
        console.log(`    ✗ ${r.reason?.message || "unknown error"}`);
      }
    }
  }

  // Write manifest
  const manifestPath = join(ROOT, "data", "pdf-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n  Manifest written to data/pdf-manifest.json (${Object.keys(manifest).length} entries)`);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const sizeMB = (totalBytes / 1024 / 1024).toFixed(1);
  console.log(`\n  Done! Uploaded ${uploaded} PDFs (${sizeMB} MB) in ${elapsed}s`);

  if (errors.length > 0) {
    console.log(`  ${errors.length} errors:`);
    for (const e of errors.slice(0, 10)) console.log(`    - ${e}`);
    if (errors.length > 10) console.log(`    ... and ${errors.length - 10} more`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
