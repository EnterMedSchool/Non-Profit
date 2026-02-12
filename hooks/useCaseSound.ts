"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { AmbientMood } from "@/data/clinical-cases";
import { SOUND_ASSETS } from "@/data/clinical-cases";

// ─── Types ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "clinical-case-sound-prefs";
const CROSSFADE_MS = 1000;

interface SoundPrefs {
  muted: boolean;
  volume: number;
}

function readPrefs(): SoundPrefs {
  try {
    if (typeof window === "undefined") return { muted: true, volume: 0.4 };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { muted: true, volume: 0.4 };
    return JSON.parse(raw) as SoundPrefs;
  } catch {
    return { muted: true, volume: 0.4 };
  }
}

function writePrefs(prefs: SoundPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // silent
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

const SFX_POOL_SIZE = 4;

export function useCaseSound() {
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const sfxPoolRef = useRef<HTMLAudioElement[]>([]);
  const sfxIndexRef = useRef(0);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentMoodRef = useRef<AmbientMood | null>(null);

  const [prefs, setPrefs] = useState<SoundPrefs>({ muted: true, volume: 0.4 });
  const [currentMood, setCurrentMood] = useState<AmbientMood | null>(null);

  // Load prefs on mount
  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  // Create audio elements once (ambient + SFX pool)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ambient = new Audio();
    ambient.loop = true;
    ambient.volume = 0;
    ambientRef.current = ambient;

    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < SFX_POOL_SIZE; i++) {
      const sfx = new Audio();
      sfx.volume = prefs.volume;
      pool.push(sfx);
    }
    sfxPoolRef.current = pool;

    return () => {
      ambient.pause();
      ambient.src = "";
      for (const sfx of pool) {
        sfx.pause();
        sfx.src = "";
      }
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update SFX volume when prefs change
  useEffect(() => {
    for (const sfx of sfxPoolRef.current) {
      sfx.volume = prefs.muted ? 0 : prefs.volume;
    }
  }, [prefs]);

  // ── Ambient crossfade ──

  const setAmbientMood = useCallback(
    (mood: AmbientMood) => {
      if (mood === currentMoodRef.current) return;
      currentMoodRef.current = mood;
      setCurrentMood(mood);

      const ambient = ambientRef.current;
      if (!ambient || prefs.muted) {
        // If muted, just track the mood so we can start when unmuted
        if (ambient) {
          ambient.src = SOUND_ASSETS.ambient[mood];
          ambient.load();
        }
        return;
      }

      // Clear any ongoing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      const targetVolume = prefs.volume * 0.5; // ambient is quieter than SFX
      const steps = 20;
      const stepTime = CROSSFADE_MS / steps;
      const volumeStep = ambient.volume / steps;

      // Fade out current ambient
      let currentStep = 0;
      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        ambient.volume = Math.max(0, ambient.volume - volumeStep);

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

          // Switch to new track and fade in
          ambient.src = SOUND_ASSETS.ambient[mood];
          ambient.load();
          ambient.volume = 0;
          ambient.play().catch(() => {});

          let fadeInStep = 0;
          const fadeInVolumeStep = targetVolume / steps;
          fadeIntervalRef.current = setInterval(() => {
            fadeInStep++;
            ambient.volume = Math.min(
              targetVolume,
              ambient.volume + fadeInVolumeStep
            );
            if (fadeInStep >= steps) {
              if (fadeIntervalRef.current)
                clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }
          }, stepTime);
        }
      }, stepTime);
    },
    [prefs]
  );

  // ── Play one-shot SFX ──

  const playSfx = useCallback(
    (sfxPath: string) => {
      if (prefs.muted || sfxPoolRef.current.length === 0) return;

      // Rotate through the pool so rapid SFX don't clip each other
      const sfx = sfxPoolRef.current[sfxIndexRef.current % SFX_POOL_SIZE];
      sfxIndexRef.current++;
      sfx.src = sfxPath;
      sfx.currentTime = 0;
      sfx.volume = prefs.volume;
      sfx.play().catch(() => {});
    },
    [prefs]
  );

  // ── Convenience SFX methods ──

  const playClueReveal = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.clueReveal),
    [playSfx]
  );
  const playDecisionMade = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.decisionMade),
    [playSfx]
  );
  const playTimerTick = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.timerTick),
    [playSfx]
  );
  const playTimerWarning = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.timerWarning),
    [playSfx]
  );
  const playRapportUp = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.rapportUp),
    [playSfx]
  );
  const playRapportDown = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.rapportDown),
    [playSfx]
  );
  const playCharacterUnlock = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.characterUnlock),
    [playSfx]
  );
  const playActTransition = useCallback(
    () => playSfx(SOUND_ASSETS.sfx.actTransition),
    [playSfx]
  );

  // ── Toggle mute ──

  const toggleMute = useCallback(() => {
    setPrefs((prev) => {
      const next = { ...prev, muted: !prev.muted };
      writePrefs(next);

      const ambient = ambientRef.current;
      if (ambient) {
        if (next.muted) {
          ambient.pause();
        } else if (currentMoodRef.current) {
          ambient.volume = next.volume * 0.5;
          ambient.play().catch(() => {});
        }
      }

      return next;
    });
  }, []);

  // ── Set volume ──

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setPrefs((prev) => {
      const next = { ...prev, volume: clamped };
      writePrefs(next);
      if (ambientRef.current && !next.muted) {
        ambientRef.current.volume = clamped * 0.5;
      }
      return next;
    });
  }, []);

  // ── Cleanup ──

  const stopAll = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current.src = "";
    }
    for (const sfx of sfxPoolRef.current) {
      sfx.pause();
      sfx.src = "";
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    currentMoodRef.current = null;
    setCurrentMood(null);
  }, []);

  return {
    // State
    isMuted: prefs.muted,
    volume: prefs.volume,
    currentMood,

    // Controls
    setAmbientMood,
    playSfx,
    toggleMute,
    setVolume,
    stopAll,

    // Convenience
    playClueReveal,
    playDecisionMade,
    playTimerTick,
    playTimerWarning,
    playRapportUp,
    playRapportDown,
    playCharacterUnlock,
    playActTransition,
  };
}
