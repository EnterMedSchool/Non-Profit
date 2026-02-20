"use client";

import type { DialogueStepConfig, ItalianLessonStep } from "@/lib/italian-data";
import {
  resolveSpeakerVisual,
  type SpeakerRole,
} from "@/components/italian/ItalianArtwork";
import { AudioPlayer } from "@/components/italian/AudioPlayer";
import { blobAsset } from "@/lib/blob-url";
import { StepWrapper } from "./StepWrapper";

import audioManifest from "@/data/italian/audio-manifest.json";

const ROLE_STYLES: Record<
  SpeakerRole,
  { bg: string; border: string; labelBg: string }
> = {
  doctor: {
    bg: "bg-blue-50",
    border: "border-showcase-blue",
    labelBg: "bg-showcase-blue",
  },
  patient: {
    bg: "bg-teal-50",
    border: "border-showcase-teal",
    labelBg: "bg-showcase-teal",
  },
  student: {
    bg: "bg-green-50",
    border: "border-showcase-green",
    labelBg: "bg-showcase-green",
  },
  other: {
    bg: "bg-purple-50",
    border: "border-showcase-purple",
    labelBg: "bg-showcase-purple",
  },
};

type ManifestEntry = { path: string; text: string; role?: string };
const audioFiles = (audioManifest as { files: Record<string, ManifestEntry> })
  .files;

function findAudioPath(
  lessonSlug: string,
  stepSlug: string,
  lineIndex: number,
): string | null {
  const key = `${lessonSlug}/${stepSlug}/${stepSlug}-line-${lineIndex}`;
  const entry = audioFiles[key];
  if (!entry?.path) return null;
  return blobAsset(entry.path);
}

interface DialogueStepViewProps {
  step: ItalianLessonStep;
  config: DialogueStepConfig;
  lessonSlug: string;
}

export function DialogueStepView({
  step,
  config,
  lessonSlug,
}: DialogueStepViewProps) {
  return (
    <StepWrapper
      stepType={step.stepType}
      title={step.title ?? "Dialogue"}
      subtitle={step.helper}
    >
      <div className="flex flex-col gap-4 py-2">
        {config.lines.map((line, index) => {
          const visual = resolveSpeakerVisual(line.speaker, index);
          const isRight = visual.orientation === "right";
          const styles = ROLE_STYLES[visual.role];
          const audioPath = findAudioPath(lessonSlug, step.slug, index);

          const speakerLabel =
            line.speaker?.trim() ||
            (visual.role === "patient"
              ? "Paziente"
              : visual.role === "doctor"
                ? "Dottore"
                : visual.role === "student"
                  ? "Tu"
                  : "Partner");

          return (
            <div
              key={`${speakerLabel}-${index}`}
              className={`flex items-end gap-3 ${isRight ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className="shrink-0">
                <div
                  className="overflow-hidden rounded-xl border-3 border-ink-dark/10 bg-white shadow-chunky"
                  style={{ width: 56, height: 56 }}
                >
                  <img
                    src={visual.avatar.src}
                    srcSet={visual.avatar.srcSet ?? undefined}
                    alt={visual.avatarAlt}
                    loading="lazy"
                    decoding="async"
                    width={56}
                    height={56}
                    className="h-14 w-14 object-contain"
                  />
                </div>
              </div>

              {/* Speech bubble */}
              <div
                className={`relative min-w-0 max-w-[calc(100%-5rem)] rounded-xl border-3 ${styles.border} ${styles.bg} px-4 py-3 shadow-chunky`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${styles.labelBg}`}
                  >
                    {speakerLabel}
                  </span>
                  {audioPath && (
                    <AudioPlayer
                      src={audioPath}
                      label={`Play ${speakerLabel}'s line`}
                      size="sm"
                    />
                  )}
                </div>

                <div className="text-sm font-medium leading-relaxed text-ink-dark">
                  {line.italian}
                </div>

                {line.english && (
                  <div
                    className={`mt-2 border-t-2 border-dashed ${styles.border}/30 pt-2 text-xs italic text-ink-muted`}
                  >
                    {line.english}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </StepWrapper>
  );
}
