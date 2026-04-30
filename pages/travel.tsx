import DefaultLayout from "@/layouts/default";
import { Chip } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
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
  image_credit?: string;
  wiki_extract?: string;
  wiki_url?: string;
}

const cities: City[] = rawData as City[];

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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [countryFilter, setCountryFilter] = useState<string>("all");
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

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl px-2 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-center flex-row gap-2 mb-2">
          <Chip color="primary" size="lg" variant="bordered">
            {cities.length} {cities.length === 1 ? "city" : "cities"}
          </Chip>
          <h1 className="text-2xl sm:text-3xl font-bold text-center my-4 sm:my-6 p-2 sm:p-4">
            🌏 Travel
          </h1>
          <Chip color="warning" size="lg" variant="bordered">
            {countries.length}{" "}
            {countries.length === 1 ? "country" : "countries"}
          </Chip>
        </div>

        <p className="text-center text-sm text-default-500 mb-1">
          Cities I&apos;ve been to.
        </p>
        <p className="text-center text-xs text-default-400 mb-6">
          Synced from{" "}
          <a
            href="https://beeneverywhere.net/user/40272"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            beeneverywhere.net
          </a>
        </p>

        {/* Map */}
        <div className="rounded-2xl border border-default-200 bg-content1 overflow-hidden mb-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((city) => (
            <article
              id={`city-${city.name}`}
              key={city.source_id || city.name}
              className={`rounded-2xl border bg-content1 overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                activeCity === city.name
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-default-200 hover:border-primary/30"
              }`}
            >
              {city.image ? (
                <div className="relative h-44 w-full overflow-hidden bg-default-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
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
