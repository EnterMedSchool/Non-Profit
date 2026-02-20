/**
 * generate-italian-pdfs.mjs
 *
 * Generates Italian lesson PDFs (full lesson, dialogue booklet, quiz booklet)
 * from the static JSON data in data/italian/.
 *
 * Output: generated-pdfs/out/italian/
 *
 * Usage:
 *   node scripts/generate-italian-pdfs.mjs            # all lessons
 *   node scripts/generate-italian-pdfs.mjs --sample    # first lesson only
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import {
  italianLessonTemplate,
  italianDialogueTemplate,
  italianQuizTemplate,
} from "./lib/latex-templates.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "data", "italian");
const TEX_DIR = join(ROOT, "generated-pdfs", "tex", "italian");
const OUT_DIR = join(ROOT, "generated-pdfs", "out", "italian");
const LOGO_DIR = join(ROOT, "scripts", "logo");
const BASE_URL = "https://entermedschool.org/en/resources/italian";

const sampleOnly = process.argv.includes("--sample");

function compile(texPath, outDir) {
  try {
    execSync(
      `xelatex -interaction=nonstopmode -output-directory="${outDir}" "${texPath}"`,
      { stdio: "pipe", timeout: 60_000 },
    );
    execSync(
      `xelatex -interaction=nonstopmode -output-directory="${outDir}" "${texPath}"`,
      { stdio: "pipe", timeout: 60_000 },
    );
    return true;
  } catch (err) {
    console.error(`  XeLaTeX failed for ${texPath}`);
    const logPath = texPath.replace(".tex", ".log");
    if (existsSync(logPath)) {
      const log = readFileSync(logPath, "utf8");
      const errors = log.split("\n").filter((l) => l.startsWith("!"));
      if (errors.length) console.error("  Errors:", errors.join("\n  "));
    }
    return false;
  }
}

async function main() {
  mkdirSync(TEX_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest = JSON.parse(readFileSync(join(DATA, "manifest.json"), "utf8"));
  const lessons = sampleOnly ? [manifest.lessons[0]] : manifest.lessons;

  console.log(`Generating Italian PDFs for ${lessons.length} lesson(s)...\n`);

  let totalGenerated = 0;

  for (const meta of lessons) {
    const lesson = JSON.parse(
      readFileSync(join(DATA, "lessons", `${meta.slug}.json`), "utf8"),
    );
    const lessonNumber = meta.position + 1;
    const url = `${BASE_URL}/${meta.slug}`;

    console.log(`Lesson ${lessonNumber}: ${meta.title} (${lesson.steps.length} steps)`);

    // 1. Full lesson PDF
    {
      const texContent = italianLessonTemplate({
        title: lesson.title,
        lessonNumber,
        description: lesson.summary,
        steps: lesson.steps,
        url,
        logoDir: LOGO_DIR,
      });
      const texPath = join(TEX_DIR, `${meta.slug}-full.tex`);
      writeFileSync(texPath, texContent);
      console.log(`  Writing full lesson...`);
      if (compile(texPath, OUT_DIR)) {
        totalGenerated++;
        console.log(`  -> ${meta.slug}-full.pdf`);
      }
    }

    // 2. Dialogue booklet
    {
      const dialogues = lesson.steps
        .filter((s) => s.stepType === "dialogue" && s.config?.lines)
        .map((s) => ({ title: s.title, lines: s.config.lines }));

      if (dialogues.length > 0) {
        const texContent = italianDialogueTemplate({
          title: lesson.title,
          lessonNumber,
          dialogues,
          url,
          logoDir: LOGO_DIR,
        });
        const texPath = join(TEX_DIR, `${meta.slug}-dialogues.tex`);
        writeFileSync(texPath, texContent);
        console.log(`  Writing dialogue booklet (${dialogues.length} dialogues)...`);
        if (compile(texPath, OUT_DIR)) {
          totalGenerated++;
          console.log(`  -> ${meta.slug}-dialogues.pdf`);
        }
      }
    }

    // 3. Quiz booklet
    {
      const quizSteps = lesson.steps.filter(
        (s) =>
          (s.stepType === "multi_choice" && s.config?.questions) ||
          (s.stepType === "read_respond" && s.config?.passage),
      );

      if (quizSteps.length > 0) {
        const texContent = italianQuizTemplate({
          title: lesson.title,
          lessonNumber,
          quizSteps,
          url,
          logoDir: LOGO_DIR,
        });
        const texPath = join(TEX_DIR, `${meta.slug}-quiz.tex`);
        writeFileSync(texPath, texContent);
        console.log(`  Writing quiz booklet (${quizSteps.length} quiz steps)...`);
        if (compile(texPath, OUT_DIR)) {
          totalGenerated++;
          console.log(`  -> ${meta.slug}-quiz.pdf`);
        }
      }
    }

    console.log();
  }

  console.log(`Done! Generated ${totalGenerated} PDFs in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
