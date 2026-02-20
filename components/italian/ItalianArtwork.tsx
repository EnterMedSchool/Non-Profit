"use client";

import { blobAsset } from "@/lib/blob-url";

export interface ArtworkSource {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

function art(subpath: string): ArtworkSource {
  return {
    src: blobAsset(`/italian-artwork/${subpath}-512w.webp`),
    srcSet: `${blobAsset(`/italian-artwork/${subpath}-256w.webp`)} 256w, ${blobAsset(`/italian-artwork/${subpath}-512w.webp`)} 512w`,
    width: 512,
    height: 512,
  };
}

const DIALOGUE_ASSETS = {
  doctor: {
    right: art("Dialog/DoctorTalkingRight"),
    left: art("Dialog/DoctorTalkingLeft"),
  },
  patient: {
    left: art("Dialog/SickPatientLookingLeft"),
  },
  student: {
    left: art("Core/LeoLearningItalian"),
    right: art("Core/LeoLearningItalian"),
  },
  other: {
    left: art("Core/LeoWavingHi"),
    right: art("Core/LeoWavingHi"),
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
