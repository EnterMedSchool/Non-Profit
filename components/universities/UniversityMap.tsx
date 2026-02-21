"use client";

import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Minus, RotateCcw, X, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { University } from "@/data/universities";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DEFAULT_CENTER: [number, number] = [10, 30];
const DEFAULT_ZOOM = 1.3;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.5;
const DRAG_THRESHOLD = 5;

interface UniversityMapProps {
  universities: University[];
  onCountryClick?: (countryCode: string) => void;
  onUniversityClick?: (slug: string) => void;
}

interface SelectedCountry {
  code: string;
  name: string;
  universities: University[];
  isActive: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  name: string;
  universities: University[];
  isActive: boolean;
}

type GeoType = {
  rsmKey: string;
  properties: Record<string, string>;
};

function UniversityMapInner({
  universities,
  onCountryClick,
  onUniversityClick,
}: UniversityMapProps) {
  const t = useTranslations("universities");
  const locale = useLocale();

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [selectedCountry, setSelectedCountry] =
    useState<SelectedCountry | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [markerTooltip, setMarkerTooltip] = useState<{
    x: number;
    y: number;
    name: string;
  } | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setIsTouchDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const activeCountryCodes = useMemo(
    () =>
      new Set(
        universities
          .filter((u) => u.status === "active")
          .map((u) => u.countryCode),
      ),
    [universities],
  );

  const allCountryCodes = useMemo(
    () => new Set(universities.map((u) => u.countryCode)),
    [universities],
  );

  const unisByCountry = useMemo(() => {
    const map: Record<string, University[]> = {};
    for (const u of universities) {
      if (!map[u.countryCode]) map[u.countryCode] = [];
      map[u.countryCode].push(u);
    }
    return map;
  }, [universities]);

  const activeMarkers = useMemo(
    () => universities.filter((u) => u.status === "active"),
    [universities],
  );

  const countryCentroids: Record<string, [number, number]> = useMemo(() => {
    const centroids: Record<string, [number, number]> = {};
    for (const [code, unis] of Object.entries(unisByCountry)) {
      const avgLng =
        unis.reduce((s, u) => s + u.coordinates.lng, 0) / unis.length;
      const avgLat =
        unis.reduce((s, u) => s + u.coordinates.lat, 0) / unis.length;
      centroids[code] = [avgLng, avgLat];
    }
    return centroids;
  }, [unisByCountry]);

  const wasDrag = useCallback((evt: React.MouseEvent): boolean => {
    if (!dragStartRef.current) return false;
    const dx = evt.clientX - dragStartRef.current.x;
    const dy = evt.clientY - dragStartRef.current.y;
    return Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD;
  }, []);

  const handleMapMouseDown = useCallback((evt: React.MouseEvent) => {
    dragStartRef.current = { x: evt.clientX, y: evt.clientY };
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setCenter(DEFAULT_CENTER);
    setSelectedCountry(null);
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedCountry(null);
    setZoom(DEFAULT_ZOOM);
    setCenter(DEFAULT_CENTER);
  }, []);

  const handleMoveEnd = useCallback(
    (position: { coordinates: [number, number]; zoom: number }) => {
      setCenter(position.coordinates);
      setZoom(position.zoom);
    },
    [],
  );

  const handleCountrySelect = useCallback(
    (code: string, name: string) => {
      if (selectedCountry?.code === code) {
        handleDeselect();
        return;
      }

      const unis = unisByCountry[code] ?? [];
      const isActive = activeCountryCodes.has(code);

      setSelectedCountry({ code, name, universities: unis, isActive });

      if (countryCentroids[code]) {
        setCenter(countryCentroids[code]);
        setZoom(4);
      }

      onCountryClick?.(code);
    },
    [
      selectedCountry,
      unisByCountry,
      activeCountryCodes,
      countryCentroids,
      onCountryClick,
      handleDeselect,
    ],
  );

  const handleGeographyClick = useCallback(
    (geo: GeoType, evt: React.MouseEvent) => {
      if (wasDrag(evt)) return;
      const code = geo.properties.ISO_A2;
      const name = geo.properties.NAME ?? geo.properties.name ?? "";
      if (!code) return;
      handleCountrySelect(code, name);
    },
    [handleCountrySelect, wasDrag],
  );

  const handleBackgroundClick = useCallback(
    (evt: React.MouseEvent) => {
      if (wasDrag(evt)) return;
      const target = evt.target as SVGElement;
      if (target.tagName === "rect" || target.tagName === "svg") {
        handleDeselect();
      }
    },
    [wasDrag, handleDeselect],
  );

  const handleGeographyMouseEnter = useCallback(
    (geo: GeoType, evt: React.MouseEvent) => {
      if (isTouchDevice) return;
      const code = geo.properties.ISO_A2;
      const geoName = geo.properties.NAME ?? geo.properties.name ?? "";
      if (!code) return;

      setTooltip({
        x: evt.clientX,
        y: evt.clientY,
        name: geoName,
        universities: unisByCountry[code] ?? [],
        isActive: activeCountryCodes.has(code),
      });
    },
    [isTouchDevice, unisByCountry, activeCountryCodes],
  );

  const handleGeographyMouseMove = useCallback(
    (evt: React.MouseEvent) => {
      if (isTouchDevice || !tooltip) return;
      setTooltip((prev) =>
        prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null,
      );
    },
    [isTouchDevice, tooltip],
  );

  const handleGeographyMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleMarkerClick = useCallback(
    (uni: University, evt: React.MouseEvent) => {
      if (wasDrag(evt)) return;
      evt.stopPropagation();

      if (isTouchDevice) {
        setSelectedCountry({
          code: uni.countryCode,
          name: uni.country,
          universities: unisByCountry[uni.countryCode] ?? [uni],
          isActive: true,
        });
        setCenter([uni.coordinates.lng, uni.coordinates.lat]);
        setZoom(5);
      } else {
        onUniversityClick?.(uni.slug);
      }
    },
    [isTouchDevice, onUniversityClick, unisByCountry, wasDrag],
  );

  const handleMarkerMouseEnter = useCallback(
    (uni: University, evt: React.MouseEvent) => {
      if (isTouchDevice) return;
      setMarkerTooltip({
        x: evt.clientX,
        y: evt.clientY,
        name: uni.shortName ?? uni.name,
      });
      setTooltip(null);
    },
    [isTouchDevice],
  );

  const handleMarkerMouseLeave = useCallback(() => {
    setMarkerTooltip(null);
  }, []);

  const handleMarkerKeyDown = useCallback(
    (uni: University, evt: React.KeyboardEvent) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        if (isTouchDevice) {
          setSelectedCountry({
            code: uni.countryCode,
            name: uni.country,
            universities: unisByCountry[uni.countryCode] ?? [uni],
            isActive: true,
          });
          setCenter([uni.coordinates.lng, uni.coordinates.lat]);
          setZoom(5);
        } else {
          onUniversityClick?.(uni.slug);
        }
      }
    },
    [isTouchDevice, onUniversityClick, unisByCountry],
  );

  const getGeoFill = useCallback(
    (code: string | undefined) => {
      if (!code) return "#f0eff5";
      if (selectedCountry?.code === code) return "#4a3fc7";
      if (activeCountryCodes.has(code)) return "#6C5CE7";
      if (allCountryCodes.has(code)) return "#d8d4f2";
      return "#f0eff5";
    },
    [activeCountryCodes, allCountryCodes, selectedCountry],
  );

  const getGeoHoverFill = useCallback(
    (code: string | undefined) => {
      if (!code) return "#e6e4ef";
      if (selectedCountry?.code === code) return "#3e35b3";
      if (activeCountryCodes.has(code)) return "#5a4bd6";
      if (allCountryCodes.has(code)) return "#c8c3e4";
      return "#e6e4ef";
    },
    [activeCountryCodes, allCountryCodes, selectedCountry],
  );

  const getGeoStroke = useCallback(
    (code: string | undefined) => {
      if (selectedCountry?.code === code) return "#00D9C0";
      if (code && activeCountryCodes.has(code)) return "#fff";
      return "#fff";
    },
    [activeCountryCodes, selectedCountry],
  );

  const getGeoStrokeWidth = useCallback(
    (code: string | undefined) => {
      if (selectedCountry?.code === code) return 1.5;
      if (code && activeCountryCodes.has(code)) return 0.8;
      return 0.4;
    },
    [activeCountryCodes, selectedCountry],
  );

  const infoPanelContent = selectedCountry && (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-ink-dark">
          {selectedCountry.name}
        </h3>
        <button
          type="button"
          onClick={handleDeselect}
          aria-label={t("map.close")}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-dark/5 text-ink-muted transition-colors hover:bg-ink-dark/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {selectedCountry.isActive ? (
        <div className="space-y-2">
          {selectedCountry.universities.map((u) => (
            <Link
              key={u.id}
              href={`/${locale}/universities/${u.slug}`}
              className="flex items-center justify-between rounded-xl border-2 border-ink-dark/5 bg-pastel-lavender/30 p-3 transition-all hover:border-showcase-purple/20 hover:bg-pastel-lavender/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-dark">{u.name}</p>
                <p className="text-xs text-ink-muted">
                  {u.courses.length}{" "}
                  {u.courses.length === 1
                    ? t("map.course")
                    : t("map.courses")}{" "}
                  {t("map.readyForYou")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-showcase-purple" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-2 text-xs text-ink-muted">
            {t("map.notHereYet")}
          </p>
          <a
            href="mailto:ari@entermedschool.com?subject=Add%20my%20university"
            className="inline-flex items-center gap-1.5 rounded-xl bg-showcase-green/10 px-4 py-2 text-xs font-bold text-showcase-green transition-all hover:bg-showcase-green/20"
          >
            <Mail className="h-3.5 w-3.5" />
            {t("map.requestCTA")}
          </a>
          <span className="mt-2 block text-[10px] font-bold text-showcase-green">
            {t("map.itsFree")}
          </span>
        </div>
      )}
    </>
  );

  return (
    <div className="relative w-full">
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className="relative overflow-hidden rounded-2xl border-3 border-ink-dark/10 bg-pastel-lavender shadow-chunky-sm"
        onMouseDown={handleMapMouseDown}
      >
        {/* Map */}
        <div className="h-[280px] sm:h-[360px] lg:h-[480px]">
          <ComposableMap
            projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
            className="h-full w-full"
            style={{ cursor: "grab" }}
          >
            <ZoomableGroup
              center={center}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              onMoveEnd={handleMoveEnd}
            >
              {/* Background rect to catch ocean clicks */}
              <rect
                x={-1000}
                y={-1000}
                width={4000}
                height={4000}
                fill="transparent"
                onClick={handleBackgroundClick}
              />

              <Geographies geography={GEO_URL}>
                {({
                  geographies,
                }: {
                  geographies: GeoType[];
                }) =>
                  geographies.map((geo) => {
                    const code = geo.properties.ISO_A2 as string | undefined;
                    return (
                      <g key={geo.rsmKey} style={{ cursor: "pointer" }}>
                        <Geography
                          geography={geo}
                          fill={getGeoFill(code)}
                          stroke={getGeoStroke(code)}
                          strokeWidth={getGeoStrokeWidth(code)}
                          onMouseEnter={(evt: React.MouseEvent) =>
                            handleGeographyMouseEnter(geo, evt)
                          }
                          onMouseMove={handleGeographyMouseMove}
                          onMouseLeave={handleGeographyMouseLeave}
                          onClick={(evt: React.MouseEvent) =>
                            handleGeographyClick(geo, evt)
                          }
                          style={{
                            default: {
                              outline: "none",
                              transition: "fill 0.2s",
                            },
                            hover: {
                              fill: getGeoHoverFill(code),
                              outline: "none",
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      </g>
                    );
                  })
                }
              </Geographies>

              {activeMarkers.map((uni) => (
                <Marker
                  key={uni.id}
                  coordinates={[uni.coordinates.lng, uni.coordinates.lat]}
                  onClick={(evt: React.MouseEvent) =>
                    handleMarkerClick(uni, evt)
                  }
                >
                  <g
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(evt) =>
                      handleMarkerMouseEnter(uni, evt)
                    }
                    onMouseLeave={handleMarkerMouseLeave}
                  >
                    {/* Invisible larger hit-area for touch */}
                    <circle
                      r={20}
                      fill="transparent"
                      aria-label={uni.name}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(evt) => handleMarkerKeyDown(uni, evt)}
                    />
                    {/* Pulse ring */}
                    <circle
                      r={8}
                      fill="none"
                      stroke="#00D9C0"
                      strokeWidth={2}
                      opacity={0.4}
                      className="animate-[map-pulse_2s_ease-in-out_infinite]"
                    />
                    {/* Visible marker */}
                    <circle
                      r={6}
                      fill="#fff"
                      stroke="#6C5CE7"
                      strokeWidth={2.5}
                      className="drop-shadow-md"
                    />
                  </g>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label={t("map.zoomIn")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-3 border-ink-dark/20 bg-white text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-chunky-sm sm:h-11 sm:w-11"
          >
            <Plus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label={t("map.zoomOut")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-3 border-ink-dark/20 bg-white text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-chunky-sm sm:h-11 sm:w-11"
          >
            <Minus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label={t("map.resetView")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-3 border-ink-dark/20 bg-white text-ink-dark shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0.5 active:shadow-none sm:h-11 sm:w-11"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Info Panel -- Desktop: floating top-left card */}
        <AnimatePresence>
          {selectedCountry && !isTouchDevice && (
            <m.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="absolute left-3 top-3 z-20 w-72 rounded-2xl border-2 border-ink-dark/10 bg-white/95 p-4 shadow-chunky-sm backdrop-blur-md"
            >
              {infoPanelContent}
            </m.div>
          )}
        </AnimatePresence>

        {/* Info Panel -- Mobile: slide-up bottom sheet */}
        <AnimatePresence>
          {selectedCountry && isTouchDevice && (
            <m.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-20 max-h-[60%] overflow-y-auto rounded-t-2xl border-t-2 border-ink-dark/10 bg-white/95 p-4 shadow-lg backdrop-blur-md"
            >
              {infoPanelContent}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Tooltip (country hover) */}
      <AnimatePresence>
        {tooltip && !isTouchDevice && !selectedCountry && (
          <m.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed z-50 max-w-xs rounded-xl border-2 border-ink-dark/10 bg-white px-4 py-3 shadow-chunky-sm"
            style={{
              left: Math.min(
                tooltip.x + 14,
                (typeof window !== "undefined"
                  ? window.innerWidth
                  : 1200) - 260,
              ),
              top: Math.max(tooltip.y - 14, 10),
            }}
          >
            {tooltip.isActive ? (
              <>
                <p className="font-display text-sm font-bold text-ink-dark">
                  {tooltip.name}
                </p>
                {tooltip.universities.map((u) => (
                  <div key={u.id} className="mt-1.5">
                    <p className="text-xs font-semibold text-showcase-purple">
                      {u.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {u.courses.length}{" "}
                      {u.courses.length === 1
                        ? t("map.course")
                        : t("map.courses")}{" "}
                      {t("map.readyForYou")}
                    </p>
                  </div>
                ))}
                <p className="mt-2 text-[10px] font-semibold text-showcase-purple">
                  {t("map.viewMaterials")} &rarr;
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-sm font-bold text-ink-dark">
                  {tooltip.name}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {t("map.notHereYet")}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-showcase-green/10 px-2 py-0.5 text-[10px] font-bold text-showcase-green">
                  {t("map.itsFree")}
                </span>
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* Marker hover tooltip (university name on desktop) */}
      <AnimatePresence>
        {markerTooltip && !isTouchDevice && (
          <m.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1 }}
            className="pointer-events-none fixed z-50 rounded-lg border border-ink-dark/10 bg-white px-2.5 py-1.5 text-xs font-bold text-showcase-purple shadow-sm"
            style={{
              left: markerTooltip.x + 16,
              top: markerTooltip.y - 8,
            }}
          >
            {markerTooltip.name}
          </m.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-bold text-ink-muted sm:gap-x-5 sm:text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-showcase-purple" />
          {t("map.legendActive")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#d8d4f2]" />
          {t("map.legendComingSoon")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#f0eff5]" />
          {t("map.legendRequest")}
        </span>
      </div>

      {/* Mobile hint */}
      {isTouchDevice && (
        <p className="mt-1.5 text-center text-[10px] text-ink-muted sm:hidden">
          {t("map.tapToExplore")}
        </p>
      )}
    </div>
  );
}

export default memo(UniversityMapInner);
