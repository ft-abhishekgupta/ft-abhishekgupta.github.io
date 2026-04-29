import DefaultLayout from "@/layouts/default";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Chip } from "@nextui-org/react";
import { useTheme } from "next-themes";
import rawData from "../scripts/data/travel.json";

// react-globe.gl is WebGL/Three.js based — must be client-only.
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface Place {
  name: string;
  lat: number;
  lng: number;
  notes?: string;
}

interface City {
  name: string;
  country: string;
  emoji?: string;
  lat: number;
  lng: number;
  notes?: string;
  places: Place[];
}

interface PointDatum {
  kind: "city" | "place";
  cityIndex: number;
  placeIndex?: number;
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
  altitude: number;
}

const cities: City[] = rawData as City[];

const CITY_COLOR = "#22d3ee"; // cyan
const PLACE_COLOR = "#f59e0b"; // amber
const ARC_COLOR = "rgba(34, 211, 238, 0.55)";

export default function Travel() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const [size, setSize] = useState({ width: 800, height: 600 });
  const [activeCityIndex, setActiveCityIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState<PointDatum | null>(null);

  // Track container size — make the globe fully responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(380, Math.floor(rect.height)),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Build the points array (cities + their places)
  const points: PointDatum[] = useMemo(() => {
    const out: PointDatum[] = [];
    cities.forEach((city, ci) => {
      out.push({
        kind: "city",
        cityIndex: ci,
        name: city.name,
        lat: city.lat,
        lng: city.lng,
        size: 0.55,
        color: CITY_COLOR,
        altitude: 0.02,
      });
      city.places.forEach((place, pi) => {
        out.push({
          kind: "place",
          cityIndex: ci,
          placeIndex: pi,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          size: 0.28,
          color: PLACE_COLOR,
          altitude: 0.015,
        });
      });
    });
    return out;
  }, []);

  // Arcs connecting visited cities in input order — gives a "trip" feel
  const arcs = useMemo(() => {
    const out: {
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
    }[] = [];
    for (let i = 0; i < cities.length - 1; i++) {
      const a = cities[i];
      const b = cities[i + 1];
      out.push({
        startLat: a.lat,
        startLng: a.lng,
        endLat: b.lat,
        endLng: b.lng,
      });
    }
    return out;
  }, []);

  // Labels for cities only (places get tooltips on hover instead)
  const cityLabels = useMemo(
    () =>
      cities.map((c, i) => ({
        cityIndex: i,
        text: `${c.emoji ? c.emoji + " " : ""}${c.name}`,
        lat: c.lat,
        lng: c.lng,
      })),
    [],
  );

  // Initial camera setup + auto-rotate
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    // Start centered on the user's home country roughly
    g.pointOfView({ lat: 22, lng: 90, altitude: 2.4 }, 0);
    const controls = g.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableDamping = true;
      controls.minDistance = 180;
      controls.maxDistance = 600;
    }
  }, [size.width, size.height]);

  const focusCity = useCallback((index: number) => {
    setActiveCityIndex(index);
    const city = cities[index];
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView({ lat: city.lat, lng: city.lng, altitude: 1.2 }, 1200);
    const controls = g.controls?.();
    if (controls) controls.autoRotate = false;
  }, []);

  const focusPlace = useCallback((cityIndex: number, placeIndex: number) => {
    setActiveCityIndex(cityIndex);
    const place = cities[cityIndex].places[placeIndex];
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView({ lat: place.lat, lng: place.lng, altitude: 0.45 }, 1200);
    const controls = g.controls?.();
    if (controls) controls.autoRotate = false;
  }, []);

  const resetView = useCallback(() => {
    setActiveCityIndex(null);
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView({ lat: 22, lng: 90, altitude: 2.4 }, 1000);
    const controls = g.controls?.();
    if (controls) controls.autoRotate = true;
  }, []);

  const activeCity = activeCityIndex !== null ? cities[activeCityIndex] : null;

  // Earth textures hosted by the upstream demo (CDN). Choose by theme.
  const earthTexture = isDark
    ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
    : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
  const bumpTexture = "//unpkg.com/three-globe/example/img/earth-topology.png";

  const totalPlaces = useMemo(
    () => cities.reduce((acc, c) => acc + c.places.length, 0),
    [],
  );

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-center flex-row gap-2 mb-3 sm:mb-4">
          <Chip color="primary" size="lg" variant="bordered">
            {cities.length} cities · {totalPlaces} places
          </Chip>
          <h1 className="text-2xl sm:text-3xl font-bold text-center my-3 sm:my-6 p-2 sm:p-4">
            🌏 Travel
          </h1>
        </div>

        <p className="text-center text-sm text-default-500 mb-4 px-2">
          Drag to rotate · scroll / pinch to zoom · tap a marker for details
        </p>

        {/* Globe + side panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Globe canvas */}
          <div
            ref={containerRef}
            className="relative w-full rounded-2xl overflow-hidden bg-black/80 border border-default-200"
            style={{ height: "min(75vh, 720px)" }}
          >
            <Globe
              ref={globeRef}
              width={size.width}
              height={size.height}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl={earthTexture}
              bumpImageUrl={bumpTexture}
              showAtmosphere
              atmosphereColor={isDark ? "#22d3ee" : "#60a5fa"}
              atmosphereAltitude={0.18}
              // Points
              pointsData={points}
              pointLat={(d: object) => (d as PointDatum).lat}
              pointLng={(d: object) => (d as PointDatum).lng}
              pointAltitude={(d: object) => (d as PointDatum).altitude}
              pointRadius={(d: object) => (d as PointDatum).size}
              pointColor={(d: object) => (d as PointDatum).color}
              pointLabel={(d: object) => {
                const p = d as PointDatum;
                const city = cities[p.cityIndex];
                if (p.kind === "city") {
                  return `<div style="background: rgba(0,0,0,0.85); color: white; padding: 6px 10px; border-radius: 6px; font-size: 13px;">
                    <strong>${city.emoji ?? ""} ${city.name}</strong><br/>
                    <span style="opacity:0.7">${city.country}</span><br/>
                    <span style="opacity:0.7">${city.places.length} place${city.places.length === 1 ? "" : "s"}</span>
                  </div>`;
                }
                return `<div style="background: rgba(0,0,0,0.85); color: white; padding: 6px 10px; border-radius: 6px; font-size: 13px;">
                  <strong>${p.name}</strong><br/>
                  <span style="opacity:0.7">${city.name}</span>
                </div>`;
              }}
              onPointClick={(d: object) => {
                const p = d as PointDatum;
                if (p.kind === "city") focusCity(p.cityIndex);
                else if (typeof p.placeIndex === "number")
                  focusPlace(p.cityIndex, p.placeIndex);
              }}
              onPointHover={(d: object | null) =>
                setHovered(d ? (d as PointDatum) : null)
              }
              // City labels
              labelsData={cityLabels}
              labelLat={(d: object) => (d as { lat: number }).lat}
              labelLng={(d: object) => (d as { lng: number }).lng}
              labelText={(d: object) => (d as { text: string }).text}
              labelSize={1.1}
              labelDotRadius={0.3}
              labelColor={() => "rgba(255,255,255,0.85)"}
              labelResolution={2}
              labelAltitude={0.025}
              onLabelClick={(d: object) =>
                focusCity((d as { cityIndex: number }).cityIndex)
              }
              // Arcs between cities (trip path)
              arcsData={arcs}
              arcColor={() => ARC_COLOR}
              arcAltitudeAutoScale={0.4}
              arcStroke={0.4}
              arcDashLength={0.4}
              arcDashGap={0.2}
              arcDashAnimateTime={3500}
            />

            {/* Floating reset / cursor info */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <button
                onClick={resetView}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur hover:bg-black/80 transition-colors"
                aria-label="Reset view"
              >
                ⟳ Reset
              </button>
            </div>
            {hovered && (
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur">
                {hovered.kind === "city" ? "🏙️" : "📍"} {hovered.name}
              </div>
            )}
          </div>

          {/* Side panel */}
          <aside className="rounded-2xl border border-default-200 bg-content1 p-4 max-h-[75vh] overflow-y-auto">
            {!activeCity && (
              <>
                <h2 className="text-lg font-semibold mb-3">Cities visited</h2>
                <ul className="flex flex-col gap-2">
                  {cities.map((c, i) => (
                    <li key={c.name}>
                      <button
                        onClick={() => focusCity(i)}
                        className="w-full text-left px-3 py-2 rounded-lg border border-default-200 hover:border-primary/50 hover:bg-default-100 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {c.emoji ? `${c.emoji} ` : ""}
                            {c.name}
                          </span>
                          <span className="text-xs text-default-400">
                            {c.country}
                          </span>
                        </div>
                        {c.places.length > 0 && (
                          <p className="text-xs text-default-500 mt-1">
                            {c.places.length} place
                            {c.places.length === 1 ? "" : "s"}
                          </p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-default-200 text-xs text-default-500">
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: CITY_COLOR }}
                    />
                    City
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: PLACE_COLOR }}
                    />
                    Place visited
                  </span>
                </div>
              </>
            )}

            {activeCity && (
              <>
                <button
                  onClick={resetView}
                  className="text-xs text-default-500 hover:text-primary mb-2"
                >
                  ← All cities
                </button>
                <h2 className="text-2xl font-bold mb-1">
                  {activeCity.emoji ? `${activeCity.emoji} ` : ""}
                  {activeCity.name}
                </h2>
                <p className="text-xs text-default-400 mb-3">
                  {activeCity.country}
                </p>
                {activeCity.notes && (
                  <p className="text-sm text-default-600 mb-4">
                    {activeCity.notes}
                  </p>
                )}

                {activeCity.places.length === 0 ? (
                  <p className="text-sm text-default-400 italic">
                    No specific places logged yet.
                  </p>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-2">
                      Places visited
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {activeCity.places.map((p, pi) => (
                        <li key={p.name}>
                          <button
                            onClick={() =>
                              focusPlace(activeCityIndex as number, pi)
                            }
                            className="w-full text-left px-3 py-2 rounded-lg border border-default-200 hover:border-amber-500/50 hover:bg-default-100 transition-colors"
                          >
                            <div className="font-medium">📍 {p.name}</div>
                            {p.notes && (
                              <p className="text-xs text-default-500 mt-1">
                                {p.notes}
                              </p>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </aside>
        </div>

        <p className="text-center text-xs text-default-400 mt-6 mb-4">
          Globe imagery: NASA Blue Marble · powered by three.js
        </p>
      </div>
    </DefaultLayout>
  );
}
