"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Circle,
  Shapes,
  Atom,
  HeartPulse,
  FlaskConical,
  ArrowRight,
  Star as StarIcon,
  Bug,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Bookmark,
  LayoutTemplate,
} from "lucide-react";
import { assetCategories, illustrationAssets, searchAssets, getAssetsByCategory } from "@/data/illustration-assets";
import type { IllustrationAsset } from "@/data/illustration-assets";
import { useIllustration } from "./IllustrationContext";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Circle,
  Shapes,
  Atom,
  HeartPulse,
  FlaskConical,
  ArrowRight,
  Star: StarIcon,
  Bug,
};

const COLOR_MAP: Record<string, string> = {
  teal:   "bg-showcase-teal/10 text-showcase-teal border-showcase-teal/30 hover:bg-showcase-teal/20",
  purple: "bg-showcase-purple/10 text-showcase-purple border-showcase-purple/30 hover:bg-showcase-purple/20",
  coral:  "bg-showcase-coral/10 text-showcase-coral border-showcase-coral/30 hover:bg-showcase-coral/20",
  pink:   "bg-showcase-pink/10 text-showcase-pink border-showcase-pink/30 hover:bg-showcase-pink/20",
  blue:   "bg-showcase-blue/10 text-showcase-blue border-showcase-blue/30 hover:bg-showcase-blue/20",
  navy:   "bg-showcase-navy/10 text-showcase-navy border-showcase-navy/30 hover:bg-showcase-navy/20",
  yellow: "bg-showcase-yellow/10 text-showcase-yellow border-showcase-yellow/30 hover:bg-showcase-yellow/20",
  green:  "bg-showcase-green/10 text-showcase-green border-showcase-green/30 hover:bg-showcase-green/20",
};

const ACTIVE_COLOR_MAP: Record<string, string> = {
  teal:   "bg-showcase-teal text-white border-showcase-teal",
  purple: "bg-showcase-purple text-white border-showcase-purple",
  coral:  "bg-showcase-coral text-white border-showcase-coral",
  pink:   "bg-showcase-pink text-white border-showcase-pink",
  blue:   "bg-showcase-blue text-white border-showcase-blue",
  navy:   "bg-showcase-navy text-white border-showcase-navy",
  yellow: "bg-showcase-yellow text-ink-dark border-showcase-yellow",
  green:  "bg-showcase-green text-white border-showcase-green",
};

const STORAGE_RECENT_KEY = "ems-illustration-recent";
const STORAGE_FAVORITES_KEY = "ems-illustration-favorites";
const MAX_RECENT = 12;

function getRecentIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
  } catch { /* noop */ }
}

function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(ids));
  } catch { /* noop */ }
}

export default function AssetPanel() {
  const [activeCategory, setActiveCategory] = useState("cells");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { addImageToCanvas } = useIllustration();

  // Load from localStorage on mount
  useEffect(() => {
    setRecentIds(getRecentIds());
    setFavoriteIds(getFavoriteIds());
  }, []);

  const getAssets = (): IllustrationAsset[] => {
    if (searchQuery) return searchAssets(searchQuery);
    if (activeCategory === "__recent") {
      return recentIds
        .map((id) => illustrationAssets.find((a) => a.id === id))
        .filter(Boolean) as IllustrationAsset[];
    }
    if (activeCategory === "__favorites") {
      return favoriteIds
        .map((id) => illustrationAssets.find((a) => a.id === id))
        .filter(Boolean) as IllustrationAsset[];
    }
    return getAssetsByCategory(activeCategory);
  };

  const assets = getAssets();

  const trackRecent = useCallback((assetId: string) => {
    setRecentIds((prev) => {
      const next = [assetId, ...prev.filter((id) => id !== assetId)].slice(0, MAX_RECENT);
      saveRecentIds(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((assetId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId];
      saveFavoriteIds(next);
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, asset: IllustrationAsset) => {
    e.dataTransfer.setData("application/illustration-asset", asset.path);
    e.dataTransfer.effectAllowed = "copy";
    const img = e.target as HTMLElement;
    if (img) {
      e.dataTransfer.setDragImage(img, 50, 50);
    }
  }, []);

  const handleAssetClick = useCallback((asset: IllustrationAsset) => {
    addImageToCanvas(asset.path);
    trackRecent(asset.id);
  }, [addImageToCanvas, trackRecent]);

  const handleAssetDragEnd = useCallback((_e: React.DragEvent, asset: IllustrationAsset) => {
    trackRecent(asset.id);
  }, [trackRecent]);

  if (collapsed) {
    return (
      <div className="flex w-10 flex-col items-center border-r-3 border-showcase-navy/10 bg-white py-2">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-pastel-lavender hover:text-showcase-purple"
          title="Expand asset panel"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Extra virtual categories
  const extraCategories = [
    ...(recentIds.length > 0 ? [{ id: "__recent", name: "Recent", icon: "Clock", color: "navy" }] : []),
    ...(favoriteIds.length > 0 ? [{ id: "__favorites", name: "Favorites", icon: "Heart", color: "coral" }] : []),
  ];

  const allCategories = [...extraCategories, ...assetCategories];

  const EXTRA_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Clock,
    Heart,
  };

  return (
    <div className="flex w-64 flex-col border-r-3 border-showcase-navy/10 bg-white lg:w-72">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-showcase-navy/5 px-3 py-2">
        <h3 className="font-display text-sm font-bold text-ink-dark">Assets</h3>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1 text-ink-muted transition-colors hover:bg-pastel-lavender hover:text-showcase-purple"
          title="Collapse panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-light" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-2 border-showcase-navy/10 bg-pastel-cream/30 py-1.5 pl-8 pr-8 text-xs text-ink-dark placeholder:text-ink-light focus:border-showcase-purple/40 focus:outline-none focus:ring-1 focus:ring-showcase-purple/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-dark"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {allCategories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || EXTRA_ICON_MAP[cat.icon];
            const isActive = activeCategory === cat.id;
            const colorClass = isActive
              ? (ACTIVE_COLOR_MAP[cat.color] || "bg-showcase-navy text-white border-showcase-navy")
              : (COLOR_MAP[cat.color] || "bg-showcase-navy/10 text-showcase-navy border-showcase-navy/30 hover:bg-showcase-navy/20");

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-[10px] font-bold transition-all ${colorClass}`}
                title={cat.name}
              >
                {Icon && <Icon className="h-3 w-3" />}
                <span className="hidden lg:inline">{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Assets grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {searchQuery && (
          <p className="mb-2 text-[10px] font-bold text-ink-muted">
            {assets.length} result{assets.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => {
            const isFav = favoriteIds.includes(asset.id);
            return (
              <div
                key={asset.id}
                className="group relative cursor-grab rounded-xl border-2 border-showcase-navy/8 bg-white p-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-showcase-purple/30 hover:shadow-md active:cursor-grabbing active:scale-95"
                title={`Drag or click "${asset.name}" to add to canvas`}
              >
                {/* Favorite toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(asset.id);
                  }}
                  className={`absolute right-2 top-2 z-10 rounded-full p-0.5 transition-all ${
                    isFav
                      ? "text-showcase-coral opacity-100"
                      : "text-ink-light opacity-0 hover:text-showcase-coral group-hover:opacity-60"
                  }`}
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-showcase-coral" : ""}`} />
                </button>

                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, asset)}
                  onDragEnd={(e) => handleAssetDragEnd(e, asset)}
                  onClick={() => handleAssetClick(asset)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square overflow-hidden rounded-lg bg-pastel-cream/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.path}
                      alt={asset.name}
                      className="h-full w-full object-contain p-1 transition-transform group-hover:scale-110"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  {/* Label */}
                  <p className="mt-1 truncate text-center text-[10px] font-semibold text-ink-muted">
                    {asset.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {assets.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs text-ink-light">
              {activeCategory === "__recent"
                ? "No recently used assets"
                : activeCategory === "__favorites"
                  ? "No favorite assets yet"
                  : "No assets found"}
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t-2 border-showcase-navy/5 px-3 py-2">
        <p className="text-[10px] text-ink-light text-center">
          Drag onto canvas or click to add
        </p>
      </div>
    </div>
  );
}
