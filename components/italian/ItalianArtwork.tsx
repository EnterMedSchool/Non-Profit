"use client";

import artworkManifest from "@/data/italian/artwork-manifest.json";

type ManifestAsset =
  (typeof artworkManifest)["assets"][keyof (typeof artworkManifest)["assets"]];

export interface ArtworkSource {
  src: string;
  srcSet: string | null;
  width: number | null;
  height: number | null;
  key: string;
}

const BLOB_BASE =
  "https://iklepxpgapgkjvxv.public.blob.vercel-storage.com/LearningIllustrations";

const assets = artworkManifest.assets as Record<string, ManifestAsset>;

function normalizeKey(key: string): string {
  const trimmed = key.trim().replace(/^[./]+/, "");
  return trimmed.startsWith("Italian/") ? trimmed : `Italian/${trimmed}`;
}

export function resolveArtwork(
  key: string,
  prefer: "256w" | "512w" = "512w",
): ArtworkSource {
  const nk = normalizeKey(key);
  const entry = assets[nk];

  if (!entry) {
    return {
      src: `${BLOB_BASE}/${nk}`,
      srcSet: null,
      width: null,
      height: null,
      key: nk,
    };
  }

  const variant = entry.variants?.[prefer];
  const src = variant
    ? `${BLOB_BASE}/${variant.path}`
    : `${BLOB_BASE}/${entry.original.path}`;

  const parts: string[] = [];
  for (const vn of ["256w", "512w"] as const) {
    const v = entry.variants?.[vn];
    if (v) {
      parts.push(`${BLOB_BASE}/${v.path} ${v.width ?? parseInt(vn)}w`);
    }
  }

  return {
    src,
    srcSet: parts.length > 0 ? parts.join(", ") : null,
    width: variant?.width ?? entry.original.width ?? null,
    height: variant?.height ?? entry.original.height ?? null,
    key: nk,
  };
}

const DIALOGUE_ASSETS = {
  doctor: {
    right: resolveArtwork("Dialog/DoctorTalkingRight.png"),
    left: resolveArtwork("Dialog/DoctorTalkingLeft.png"),
  },
  patient: {
    left: resolveArtwork("Dialog/SickPatientLookingLeft.png"),
  },
  student: {
    left: resolveArtwork("Core/LeoLearningItalian.png"),
    right: resolveArtwork("Core/LeoLearningItalian.png"),
  },
  other: {
    left: resolveArtwork("Core/LeoWavingHi.png"),
    right: resolveArtwork("Core/LeoWavingHi.png"),
  },
};

export type SpeakerRole = "doctor" | "patient" | "student" | "other";

export interface SpeakerVisual {
  role: SpeakerRole;
  orientation: "left" | "right";
  avatar: ArtworkSource;
  avatarAlt: string;
}

export function resolveSpeakerVisual(
  rawSpeaker: string | null | undefined,
  index: number,
): SpeakerVisual {
  const speaker = typeof rawSpeaker === "string" ? rawSpeaker.trim() : "";
  const norm = speaker.toLowerCase();

  if (norm.includes("paziente") || norm.includes("patient")) {
    return {
      role: "patient",
      orientation: "right",
      avatar: DIALOGUE_ASSETS.patient.left,
      avatarAlt: speaker || "Paziente",
    };
  }

  if (
    norm === "tu" ||
    norm === "me" ||
    norm.includes("studente") ||
    norm.includes("studentessa") ||
    norm.includes("student")
  ) {
    return {
      role: "student",
      orientation: "left",
      avatar: DIALOGUE_ASSETS.student.left,
      avatarAlt: speaker || "Studente",
    };
  }

  if (
    norm.includes("primario") ||
    norm.includes("dott") ||
    norm.includes("medico") ||
    norm.includes("infermier") ||
    norm.includes("strumentista") ||
    norm.includes("capo sala")
  ) {
    return {
      role: "doctor",
      orientation: "left",
      avatar: DIALOGUE_ASSETS.doctor.left,
      avatarAlt: speaker || "Dottore",
    };
  }

  const fallback = index % 2 === 0 ? "left" : "right";
  return {
    role: "other",
    orientation: fallback,
    avatar:
      fallback === "left"
        ? DIALOGUE_ASSETS.other.left
        : DIALOGUE_ASSETS.student.right,
    avatarAlt: speaker || "Interlocutore",
  };
}
