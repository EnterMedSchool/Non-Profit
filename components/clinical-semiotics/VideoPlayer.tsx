"use client";

import { useEffect, useRef } from "react";

import type { CaseVideoAsset } from "./types";

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

type VideoPlayerProps = {
  asset: CaseVideoAsset;
  onEnded?: () => void;
  onPlay?: () => void;
  className?: string;
  videoClassName?: string;
};

const containerClassName =
  "relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-black";
const mediaClassName = "absolute inset-0 h-full w-full object-cover";

export function VideoPlayer({
  asset,
  onEnded,
  onPlay,
  className,
  videoClassName,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (asset.kind === "placeholder") return;
    try {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    } catch {
      // noop
    }
  }, [asset]);

  const resolvedContainerClass = cn(containerClassName, className);
  const resolvedMediaClass = cn(mediaClassName, videoClassName);

  if (asset.kind === "placeholder") {
    return (
      <div className={resolvedContainerClass}>
        <div className="absolute inset-0 bg-gradient-to-br from-pastel-lavender via-pastel-cream to-pastel-sky opacity-90" />
        <div className="relative z-10 flex max-w-lg flex-col items-center gap-3 px-6 text-center text-ink-dark">
          <span className="text-lg font-semibold sm:text-2xl font-display">
            {asset.label ?? "Video coming soon"}
          </span>
          {asset.description && (
            <span className="text-sm text-ink-muted sm:text-base">
              {asset.description}
            </span>
          )}
        </div>
      </div>
    );
  }

  const src = asset.src;

  return (
    <div className={resolvedContainerClass}>
      <video
        key={src}
        ref={videoRef}
        className={resolvedMediaClass}
        controls
        playsInline
        onEnded={onEnded}
        onPlay={onPlay}
        poster={asset.thumbnail}
      >
        <source src={src} />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
}
