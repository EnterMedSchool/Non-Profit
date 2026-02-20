"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function AudioPlayer({
  src,
  label = "Play audio",
  size = "sm",
  className = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = useCallback(() => {
    if (hasError) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("error", () => {
      setHasError(true);
      setIsPlaying(false);
    });
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setHasError(true);
    });
  }, [src, isPlaying, hasError]);

  if (hasError) return null;

  const sizeClasses =
    size === "sm"
      ? "h-7 w-7 rounded-lg"
      : "h-9 w-9 rounded-xl";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className={`inline-flex items-center justify-center border-2 font-bold transition-all
        ${isPlaying
          ? "border-showcase-purple bg-showcase-purple text-white shadow-[2px_2px_0_theme(colors.showcase-purple/50)]"
          : "border-showcase-purple/30 bg-white text-showcase-purple hover:bg-showcase-purple/5 shadow-[2px_2px_0_theme(colors.showcase-purple/20)]"
        }
        ${sizeClasses} ${className}`}
    >
      {isPlaying ? (
        <VolumeX className={iconSize} />
      ) : (
        <Volume2 className={iconSize} />
      )}
    </button>
  );
}
