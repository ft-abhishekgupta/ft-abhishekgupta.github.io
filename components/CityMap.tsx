import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

interface City {
  name: string;
  country: string;
  country_code?: string;
  lat: number;
  lng: number;
  image?: string;
  wiki_extract?: string;
}

interface Props {
  cities: City[];
  activeCity: string | null;
  onSelect: (name: string) => void;
}

// ISO 3166-1 alpha-2 -> numeric (matches the `id` field in world-atlas)
const ISO_A2_TO_NUM: Record<string, string> = {
  IN: "356", VN: "704", US: "840", GB: "826", FR: "250", DE: "276",
  JP: "392", CN: "156", TH: "764", SG: "702", AE: "784", NL: "528",
  IT: "380", ES: "724", ID: "360", AU: "036", NP: "524", LK: "144",
  BT: "064", BD: "050", MY: "458", PH: "608", KR: "410", CA: "124",
  MX: "484", BR: "076", AR: "032", RU: "643", TR: "792", EG: "818",
  ZA: "710", NZ: "554", CH: "756", SE: "752", NO: "578", DK: "208",
  PT: "620", GR: "300", IE: "372", AT: "040", BE: "056", PL: "616",
  CZ: "203", HU: "348", RO: "642", FI: "246", IS: "352", IL: "376",
  SA: "682", QA: "634", OM: "512", KH: "116", LA: "418", MM: "104",
  TW: "158", HK: "344", PE: "604", CL: "152", CO: "170", KE: "404",
  TZ: "834", MA: "504", TN: "788", JO: "400", LB: "422",
};

const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function FlyToActive({
  cities,
  active,
}: {
  cities: City[];
  active: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (cities.length === 0) return;
    if (active) {
      const c = cities.find((x) => x.name === active);
      if (c) map.flyTo([c.lat, c.lng], Math.max(map.getZoom(), 6), { duration: 0.8 });
      return;
    }
    if (cities.length === 1) {
      map.setView([cities[0].lat, cities[0].lng], 4);
    } else {
      const bounds = L.latLngBounds(cities.map((c) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
    }
  }, [active, cities, map]);
  return null;
}

export default function CityMap({ cities, activeCity, onSelect }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [geo, setGeo] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;
    fetch(WORLD_TOPO_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return;
        const fc = feature(
          topo,
          topo.objects.countries as GeometryCollection,
        ) as unknown as GeoJSON.FeatureCollection;
        setGeo(fc);
      })
      .catch((e) => console.error("Failed to load world topojson:", e));
    return () => {
      cancelled = true;
    };
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Set of visited country numeric IDs
  const visitedIds = useMemo(() => {
    const s = new Set<string>();
    cities.forEach((c) => {
      if (c.country_code) {
        const num = ISO_A2_TO_NUM[c.country_code];
        if (num) s.add(num);
      }
    });
    return s;
  }, [cities]);

  const palette = isDark
    ? {
        bg: "#0a0e1a",
        landFill: "#1f2937",
        landStroke: "#374151",
        visitedFill: "#0891b2",
        visitedStroke: "#06b6d4",
      }
    : {
        bg: "#eaf4f8",
        landFill: "#cfd8dc",
        landStroke: "#90a4ae",
        visitedFill: "#0ea5e9",
        visitedStroke: "#0369a1",
      };

  const styleFn = (f?: GeoJSON.Feature) => {
    if (!f) return {};
    const id = String(f.id);
    const visited = visitedIds.has(id);
    return {
      fillColor: visited ? palette.visitedFill : palette.landFill,
      fillOpacity: visited ? 0.85 : 0.9,
      color: visited ? palette.visitedStroke : palette.landStroke,
      weight: visited ? 1 : 0.4,
    };
  };

  const pinIcon = useMemo(
    () =>
      L.divIcon({
        className: "city-pin",
        html: `<div style="
            transform: translate(-50%,-100%);
            font-size: 26px;
            line-height: 1;
            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.6));
          ">📍</div>`,
        iconSize: [26, 26],
        iconAnchor: [0, 0],
      }),
    [],
  );

  const activePinIcon = useMemo(
    () =>
      L.divIcon({
        className: "city-pin-active",
        html: `<div style="
            transform: translate(-50%,-100%);
            font-size: 36px;
            line-height: 1;
            filter: drop-shadow(0 3px 6px rgba(245,158,11,0.8));
          ">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [0, 0],
      }),
    [],
  );

  return (
    <div style={{ height: 480, width: "100%", background: palette.bg }}>
      <MapContainer
        center={[20, 60]}
        zoom={2}
        minZoom={2}
        maxZoom={8}
        scrollWheelZoom={true}
        worldCopyJump={false}
        style={{ height: "100%", width: "100%", background: palette.bg }}
        attributionControl={false}
      >
        {/* No tile layer — pure choropleth */}

        {geo && (
          <GeoJSON
            key={isDark ? "dark" : "light"}
            data={geo}
            style={styleFn as L.StyleFunction<GeoJSON.Feature>}
          />
        )}

        {cities.map((city) =>
          activeCity === city.name ? (
            <CircleMarker
              key={`halo-${city.name}`}
              center={[city.lat, city.lng]}
              radius={16}
              pathOptions={{
                color: "#f59e0b",
                weight: 2,
                fillColor: "#f59e0b",
                fillOpacity: 0.25,
              }}
            />
          ) : null,
        )}

        {cities.map((city) => (
          <Marker
            key={city.name}
            position={[city.lat, city.lng]}
            icon={activeCity === city.name ? activePinIcon : pinIcon}
            eventHandlers={{ click: () => onSelect(city.name) }}
          >
            <Tooltip direction="top" offset={[0, -28]} opacity={1}>
              <strong>{city.name}</strong>
              <br />
              <span style={{ fontSize: 11, opacity: 0.8 }}>{city.country}</span>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 180, maxWidth: 220 }}>
                {city.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={city.image}
                    alt={city.name}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 4,
                      marginBottom: 6,
                    }}
                  />
                )}
                <div style={{ fontWeight: 700, fontSize: 14 }}>{city.name}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{city.country}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        <FlyToActive cities={cities} active={activeCity} />
      </MapContainer>
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-default-400">
        <span>
          <span
            className="inline-block w-3 h-3 rounded-sm align-middle mr-1"
            style={{ background: palette.visitedFill }}
          />
          Visited country
        </span>
        <span>Scroll to zoom · Drag to pan · Click a pin</span>
      </div>
    </div>
  );
}
