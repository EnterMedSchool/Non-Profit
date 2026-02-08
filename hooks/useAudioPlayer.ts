"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface UseAudioPlayerOptions {
  src?: string;
  volume?: number;
  onEnded?: () => void;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  seek: (time: number) => void;
  loadAudio: (src: string) => void;
}

/**
 * Simplified audio player hook for the embed viewer.
 * Ported from WebSite's useAudioPlayer.
 */
export function useAudioPlayer({
  src,
  volume = 1,
  onEnded,
}: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef(onEnded);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // Create audio element once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current || !src) return;
    audioRef.current.src = src;
    audioRef.current.load();
  }, [src]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  const play = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) pause();
    else await play();
  }, [isPlaying, play, pause]);

  const seek = useCallback(
    (time: number) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    },
    [duration]
  );

  const loadAudio = useCallback((newSrc: string) => {
    if (!audioRef.current) return;
    setIsLoading(true);
    audioRef.current.src = newSrc;
    audioRef.current.load();
  }, []);

  return {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    seek,
    loadAudio,
  };
}
