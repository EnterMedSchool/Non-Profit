"use client";

import { useState, useMemo, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { University } from "@/data/universities";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface UniversityMapProps {
  universities: University[];
  onCountryClick?: (countryCode: string) => void;
  onUniversityClick?: (slug: string) => void;
}

interface TooltipData {
  x: number;
  y: number;
  name: string;
  universities: University[];
  isActive: boolean;
}

function UniversityMapInner({
  universities,
  onCountryClick,
  onUniversityClick,
}: UniversityMapProps) {
  const t = useTranslations("universities");
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

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

  const handleGeographyMouseEnter = (
    geo: { properties: { ISO_A2?: string; name?: string } },
    evt: React.MouseEvent,
  ) => {
    const code = geo.properties.ISO_A2;
    const geoName = geo.properties.name ?? "";
    if (!code) return;

    const unis = unisByCountry[code];
    const isActive = activeCountryCodes.has(code);

    setTooltip({
      x: evt.clientX,
      y: evt.clientY,
      name: geoName,
      universities: unis ?? [],
      isActive,
    });
  };

  const handleGeographyMouseLeave = () => setTooltip(null);

  const handleGeographyClick = (geo: {
    properties: { ISO_A2?: string };
  }) => {
    const code = geo.properties.ISO_A2;
    if (!code) return;

    if (activeCountryCodes.has(code)) {
      const unis = unisByCountry[code];
      if (unis?.length === 1) {
        onUniversityClick?.(unis[0].slug);
      } else {
        onCountryClick?.(code);
      }
    } else {
      onCountryClick?.(code);
    }
  };

  const getGeoFill = (code: string | undefined) => {
    if (!code) return "#e2e2ea";
    if (activeCountryCodes.has(code)) return "#6C5CE7";
    if (allCountryCodes.has(code)) return "#b8b5d4";
    return "#e2e2ea";
  };

  const getGeoHoverFill = (code: string | undefined) => {
    if (!code) return "#d0d0da";
    if (activeCountryCodes.has(code)) return "#5a4bd6";
    return "#d0d0da";
  };

  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl border-3 border-ink-dark/10 bg-pastel-cream shadow-chunky-sm">
        <ComposableMap
          projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
          className="h-auto w-full"
          style={{ maxHeight: 520 }}
        >
          <ZoomableGroup center={[10, 30]} zoom={1.3}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: Array<{ rsmKey: string; properties: Record<string, string> }> }) =>
                geographies.map((geo: { rsmKey: string; properties: Record<string, string> }) => {
                  const code = geo.properties.ISO_A2 as string | undefined;
                  const isActive = code ? activeCountryCodes.has(code) : false;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getGeoFill(code)}
                      stroke="#fff"
                      strokeWidth={0.5}
                      onMouseEnter={(evt: React.MouseEvent) =>
                        handleGeographyMouseEnter(
                          geo as { properties: { ISO_A2?: string; name?: string } },
                          evt,
                        )
                      }
                      onMouseLeave={handleGeographyMouseLeave}
                      onClick={() =>
                        handleGeographyClick(
                          geo as { properties: { ISO_A2?: string } },
                        )
                      }
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: getGeoHoverFill(code),
                          outline: "none",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {activeMarkers.map((uni) => (
              <Marker
                key={uni.id}
                coordinates={[uni.coordinates.lng, uni.coordinates.lat]}
                onClick={() => onUniversityClick?.(uni.slug)}
              >
                <circle
                  r={5}
                  fill="#FFD93D"
                  stroke="#1a1a2e"
                  strokeWidth={2}
                  className="drop-shadow-sm"
                  aria-label={uni.name}
                  role="button"
                  tabIndex={0}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <AnimatePresence>
        {tooltip && (
          <m.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-50 max-w-xs rounded-xl border-2 border-ink-dark/10 bg-white px-4 py-3 shadow-chunky-sm"
            style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
          >
            {tooltip.isActive ? (
              <>
                <p className="font-display text-sm font-bold text-ink-dark">
                  {tooltip.name}
                </p>
                {tooltip.universities.map((u) => (
                  <div key={u.id} className="mt-1">
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

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-showcase-purple" />
          {t("map.legendActive")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#b8b5d4]" />
          {t("map.legendComingSoon")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#e2e2ea]" />
          {t("map.legendRequest")}
        </span>
      </div>
    </div>
  );
}

export default memo(UniversityMapInner);
