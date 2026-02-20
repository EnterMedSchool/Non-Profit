/**
 * pull-italian-lessons.mjs
 *
 * One-time extraction script: pulls Italian lesson data from the Neon DB
 * and writes structured JSON files into data/italian/.
 *
 * Usage:
 *   NEON_URL='postgresql://...' node scripts/pull-italian-lessons.mjs
 */

import pg from "pg";
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "data", "italian");
const LESSONS_DIR = join(OUT, "lessons");

const MODULE_ID = 118;

const connString =
  process.env.NEON_URL ||
  process.argv[2] ||
  "postgresql://neondb_owner:npg_YgJuKaCj6ny3@ep-bold-mode-a2sorydk-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  mkdirSync(LESSONS_DIR, { recursive: true });

  const client = new pg.Client({ connectionString: connString });
  await client.connect();

  console.log("Connected to Neon DB");

  // 1. Fetch module
  const { rows: [mod] } = await client.query(
    "SELECT id, slug, name, program_slug, position FROM medical_italian_modules WHERE id = $1",
    [MODULE_ID],
  );
  if (!mod) throw new Error(`Module ${MODULE_ID} not found`);
  console.log(`Module: ${mod.name} (${mod.slug})`);

  // 2. Fetch lessons (only those with steps)
  const { rows: lessons } = await client.query(
    `SELECT l.id, l.slug, l.title, l.summary, l.objectives, l.difficulty,
            l.estimated_minutes, l.position, l.metadata
     FROM medical_italian_lessons l
     WHERE l.module_id = $1
     ORDER BY l.position`,
    [MODULE_ID],
  );
  console.log(`Found ${lessons.length} lessons`);

  // 3. Fetch all steps for these lessons
  const lessonIds = lessons.map((l) => l.id);
  const { rows: allSteps } = await client.query(
    `SELECT id, lesson_id, step_type, slug, title, prompt, helper,
            mascot_pose, estimated_minutes, config, metadata, position
     FROM medical_italian_lesson_steps
     WHERE lesson_id = ANY($1)
     ORDER BY lesson_id, position`,
    [lessonIds],
  );
  console.log(`Found ${allSteps.length} steps total`);

  // 4. Fetch all terms
  const { rows: allTerms } = await client.query(
    `SELECT id, lemma, english, part_of_speech, register, gender,
            plurality, audio_url, notes, tags, metadata
     FROM medical_italian_terms
     ORDER BY id`,
  );
  console.log(`Found ${allTerms.length} terms`);

  // 5. Fetch step-term links
  const { rows: stepTermLinks } = await client.query(
    "SELECT step_id, term_id FROM medical_italian_step_terms",
  );

  // Group steps by lesson
  const stepsByLesson = new Map();
  for (const step of allSteps) {
    const arr = stepsByLesson.get(step.lesson_id) || [];
    arr.push(step);
    stepsByLesson.set(step.lesson_id, arr);
  }

  // Group term links by step
  const termsByStep = new Map();
  for (const link of stepTermLinks) {
    const arr = termsByStep.get(link.step_id) || [];
    arr.push(link.term_id);
    termsByStep.set(link.step_id, arr);
  }

  // Build lesson JSON files
  const lessonIndex = [];

  for (const lesson of lessons) {
    const steps = stepsByLesson.get(lesson.id) || [];
    if (steps.length === 0) {
      console.log(`  Skipping "${lesson.title}" (no steps)`);
      continue;
    }

    const lessonData = {
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary || null,
      objectives: lesson.objectives || null,
      difficulty: lesson.difficulty || null,
      estimatedMinutes: lesson.estimated_minutes || null,
      position: lesson.position,
      steps: steps.map((s) => ({
        slug: s.slug,
        stepType: s.step_type,
        title: s.title || null,
        helper: s.helper || null,
        prompt: s.prompt || null,
        mascotPose: s.mascot_pose || null,
        position: s.position,
        config: s.config,
        termIds: termsByStep.get(s.id) || [],
      })),
    };

    const outPath = join(LESSONS_DIR, `${lesson.slug}.json`);
    writeFileSync(outPath, JSON.stringify(lessonData, null, 2));
    console.log(`  Wrote ${lesson.slug}.json (${steps.length} steps)`);

    lessonIndex.push({
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary || null,
      stepCount: steps.length,
      position: lesson.position,
      stepTypes: [...new Set(steps.map((s) => s.step_type))],
    });
  }

  // Write manifest
  const manifest = {
    extractedAt: new Date().toISOString(),
    moduleId: mod.id,
    moduleSlug: mod.slug,
    moduleName: mod.name,
    programSlug: mod.program_slug,
    lessons: lessonIndex,
    audioBaseUrl: "https://entermedschool.com/audio/italian",
    artworkBlobBase: "https://iklepxpgapgkjvxv.public.blob.vercel-storage.com/LearningIllustrations",
  };
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("Wrote manifest.json");

  // Write terms
  const termsData = allTerms.map((t) => ({
    id: t.id,
    lemma: t.lemma,
    english: t.english,
    partOfSpeech: t.part_of_speech || null,
    register: t.register || null,
    gender: t.gender || null,
    plurality: t.plurality || null,
    audioUrl: t.audio_url || null,
    notes: t.notes || null,
    tags: t.tags || [],
    metadata: t.metadata || null,
  }));
  writeFileSync(join(OUT, "terms.json"), JSON.stringify(termsData, null, 2));
  console.log(`Wrote terms.json (${termsData.length} terms)`);

  // Copy artwork manifest from WebSite repo if available
  const websiteArtworkPath = join(
    ROOT,
    "..",
    "WebSite",
    "content",
    "media",
    "italian-artwork.json",
  );
  const artworkOutPath = join(OUT, "artwork-manifest.json");

  if (existsSync(websiteArtworkPath)) {
    copyFileSync(websiteArtworkPath, artworkOutPath);
    console.log("Copied artwork-manifest.json from WebSite repo");
  } else {
    console.warn(
      "WARNING: WebSite artwork manifest not found at",
      websiteArtworkPath,
    );
    console.warn("You may need to copy it manually.");
  }

  await client.end();
  console.log("\nDone! Files written to data/italian/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
