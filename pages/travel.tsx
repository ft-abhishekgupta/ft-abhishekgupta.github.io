import DefaultLayout from "@/layouts/default";
import type { LoaderData } from "@/lib/loader";
import SmartImage from "@/components/SmartImage";
import PageHeader from "@/components/PageHeader";
import { PostcardSlideshow } from "@/components/HeaderBackdrops";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { useFlipGrid } from "@/lib/useFlipGrid";
import rawData from "../scripts/data/travel.json";

interface City {
  name: string;
  country: string;
  country_code?: string;
  lat: number;
  lng: number;
  source?: string;
  source_id?: string;
  image?: string;
  image_source?: string;
  image_credit?: string;
  wiki_extract?: string;
  wiki_url?: string;
}

const cities: City[] = rawData as City[];

// Eight photos spread evenly across the (country-sorted) list so the slideshow
// isn't all from one place.
const withPhotos = cities.filter((c) => c.image);
const POSTCARDS = Array.from({ length: Math.min(8, withPhotos.length) }, (_, i) =>
  withPhotos[Math.floor((i * withPhotos.length) / Math.min(8, withPhotos.length))].image as string,
);

const CityMap = dynamic(() => import("@/components/CityMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] flex items-center justify-center text-default-400 text-sm">
      Loading map…
    </div>
  ),
});

type SortOption = "default" | "name-asc";

export default function Travel() {
  const [search, setSearchState] = useState("");
  const [sortBy, setSortByState] = useState<SortOption>("default");
  const [countryFilter, setCountryFilterState] = useState<string>("all");
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const countries = useMemo(() => {
    const c = new Set<string>();
    cities.forEach((city) => c.add(city.country));
    return Array.from(c).sort();
  }, []);

  const filtered = useMemo(() => {
    let list = [...cities];
    if (countryFilter !== "all") {
      list = list.filter((c) => c.country === countryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q),
      );
    }
    if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [search, sortBy, countryFilter]);

  const gridRef = useRef<HTMLDivElement>(null);
  const withFlip = useFlipGrid(gridRef, filtered);
  const setSearch = withFlip(setSearchState);
  const setSortBy = withFlip(setSortByState);
  const setCountryFilter = withFlip(setCountryFilterState);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl px-2 sm:px-4">
        <PageHeader
          backdrop={<PostcardSlideshow images={POSTCARDS} />}
          description={
            <>
              Cities I&apos;ve been to, synced from{" "}
              <a
                className="text-foreground underline decoration-secondary underline-offset-4 transition-colors hover:text-secondary"
                href="https://beeneverywhere.net/user/40272"
                rel="noreferrer"
                target="_blank"
              >
                beeneverywhere.net
              </a>
              .
            </>
          }
          stats={[
            { value: cities.length, label: cities.length === 1 ? "city" : "cities" },
            { value: countries.length, label: countries.length === 1 ? "country" : "countries" },
          ]}
          title="Travel"
        />

        {/* Map */}
        <div
          className="mb-8 overflow-hidden rounded-[1.75rem] border border-default-200 bg-content1"
          data-lenis-prevent
        >
          <CityMap
            cities={cities}
            activeCity={activeCity}
            onSelect={(name) => setActiveCity(name)}
          />
        </div>

        {/* Country filter pills */}
        {countries.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setCountryFilter("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                countryFilter === "all"
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "bg-default-100 text-default-600 hover:bg-default-200"
              }`}
            >
              All ({cities.length})
            </button>
            {countries.map((c) => {
              const count = cities.filter((x) => x.country === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCountryFilter(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    countryFilter === c
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "bg-default-100 text-default-600 hover:bg-default-200"
                  }`}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6 justify-center">
          <input
            className="px-3 py-2 rounded-lg bg-default-100 text-sm placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/40 w-full max-w-xs"
            placeholder="🔍 Search cities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 rounded-lg bg-default-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="default">Default order</option>
            <option value="name-asc">Name (A → Z)</option>
          </select>
        </div>

        {/* Card grid */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {filtered.map((city) => (
            <div key={city.source_id || city.name} data-flip-id={city.source_id || city.name}>
            <article
              id={`city-${city.name}`}
              className={`tile-reveal group h-full rounded-2xl border bg-content1 overflow-hidden transition-[border-color,box-shadow] duration-300 hover:shadow-xl ${
                activeCity === city.name
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-default-200 hover:border-primary/30"
              }`}
            >
              {city.image ? (
                <div className="relative h-44 w-full overflow-hidden bg-default-100">
                  <SmartImage
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    wrapperClassName="absolute inset-0 transition-transform duration-1000 ease-signal group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h2 className="text-xl font-bold drop-shadow-lg">
                      📍 {city.name}
                    </h2>
                    <span className="text-xs uppercase tracking-wider opacity-90">
                      {city.country}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <h2 className="text-xl font-bold">📍 {city.name}</h2>
                  <span className="text-xs uppercase tracking-wider text-default-400">
                    {city.country}
                  </span>
                </div>
              )}
            </article>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-default-400 mt-8">
            No cities found{search ? ` matching "${search}"` : ""}.
          </p>
        )}

        <p className="text-center text-xs text-default-400 mt-10 mb-4">
          Map &amp; images via Wikipedia · More dots to come ✈️
        </p>
      </div>
    </DefaultLayout>
  );
}

export function getStaticProps(): { props: { loader: LoaderData } } {
  // A fresh trio of destinations for the departures board on every build.
  const picks = [...cities].sort(() => Math.random() - 0.5).slice(0, 3);

  return {
    props: {
      loader: {
        stats: [
          { label: "cities", value: cities.length },
          { label: "countries", value: new Set(cities.map((c) => c.country)).size },
        ],
        rows: picks.map((c) => ({ title: c.name, sub: c.country })),
      },
    },
  };
}