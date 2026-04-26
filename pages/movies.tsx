import Tile from "@/components/Tile";
import rawData from "../scripts/data/movies.json";
import { Chip, Input, Select, SelectItem, Switch } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { useMemo, useState } from "react";

interface MovieItem {
  name: string;
  slug: string;
  year: number | null;
  imageUrl: string;
  userRating: number | null;
  letterboxdUrl: string;
  source: string;
  language: string | null;
  mediaType: string | null;
}

const data: MovieItem[] = rawData as MovieItem[];

type SortOption = "default" | "name-asc" | "name-desc" | "year-new" | "year-old" | "rated";
type SourceFilter = "watched" | "watchlist";

export default function Movies() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("year-new");
  const [ratedOnly, setRatedOnly] = useState(false);
  const [decadeFilter, setDecadeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("watched");
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  const decades = useMemo(() => {
    const ds = new Set<number>();
    data.forEach((m) => {
      if (m.year) ds.add(Math.floor(m.year / 10) * 10);
    });
    return Array.from(ds).sort((a, b) => b - a);
  }, []);

  const languages = useMemo(() => {
    const ls = new Set<string>();
    data.forEach((m) => {
      if (m.language) ls.add(m.language);
    });
    return Array.from(ls).sort();
  }, []);

  const filteredMovies = useMemo(() => {
    let movies = [...data];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      movies = movies.filter((m) => m.name.toLowerCase().includes(q));
    }

    if (ratedOnly) {
      movies = movies.filter((m) => m.userRating !== null);
    }

    // Source filter (always applied, like games status filter)
    movies = movies.filter((m) => m.source === sourceFilter);

    if (languageFilter !== "all") {
      movies = movies.filter((m) => m.language === languageFilter);
    }

    if (decadeFilter !== "all") {
      const decade = parseInt(decadeFilter);
      movies = movies.filter(
        (m) => m.year && m.year >= decade && m.year < decade + 10
      );
    }

    switch (sortBy) {
      case "name-asc":
        movies.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        movies.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rated":
        movies.sort((a, b) => (b.userRating ?? 0) - (a.userRating ?? 0));
        break;
      case "year-new":
        movies.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case "year-old":
        movies.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
        break;
      default:
        break;
    }

    return movies;
  }, [search, sortBy, ratedOnly, decadeFilter, sourceFilter, languageFilter]);

  const ratedCount = data.filter((m) => m.userRating !== null && m.source === sourceFilter).length;
  const watchedCount = data.filter((m) => m.source === "watched").length;
  const watchlistCount = data.filter((m) => m.source === "watchlist").length;
  const hasFilters =
    search || ratedOnly || decadeFilter !== "all" || languageFilter !== "all";

  const sourceLabels: Record<SourceFilter, string> = {
    watched: "🎬 Watched",
    watchlist: "📋 Watchlist",
  };

  const sourceCounts: Record<SourceFilter, number> = {
    watched: watchedCount,
    watchlist: watchlistCount,
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-center flex-row gap-2 mb-4">
          <Chip color="secondary" size="lg" variant="bordered">
            {filteredMovies.length}
          </Chip>
          <h1 className="text-3xl font-bold text-center my-8 p-4">
            Movies {sourceLabels[sourceFilter]}
          </h1>
        </div>

        {/* Source filter tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {(Object.keys(sourceCounts) as SourceFilter[]).map((source) => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                sourceFilter === source
                  ? "bg-secondary text-white shadow-lg scale-105"
                  : "bg-default-100 text-default-600 hover:bg-default-200"
              }`}
            >
              {sourceLabels[source]} ({sourceCounts[source]})
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6 justify-center">
          <Input
            className="max-w-xs"
            placeholder="Search movies..."
            value={search}
            onValueChange={setSearch}
            isClearable
            onClear={() => setSearch("")}
            startContent={<span className="text-default-400">🔍</span>}
            size="sm"
          />
          <Select
            className="max-w-[180px]"
            label="Sort by"
            size="sm"
            selectedKeys={new Set([sortBy])}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSortBy(val as SortOption);
            }}
          >
            <SelectItem key="default">Recently Added</SelectItem>
            <SelectItem key="name-asc">Name (A → Z)</SelectItem>
            <SelectItem key="name-desc">Name (Z → A)</SelectItem>
            <SelectItem key="year-new">Newest First</SelectItem>
            <SelectItem key="year-old">Oldest First</SelectItem>
            <SelectItem key="rated">Highest Rated</SelectItem>
          </Select>
          <Select
            className="max-w-[140px]"
            label="Decade"
            size="sm"
            selectedKeys={new Set([decadeFilter])}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              setDecadeFilter(val || "all");
            }}
            items={[{ key: "all", label: "All Decades" }, ...decades.map((d) => ({ key: String(d), label: `${d}s` }))]}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          {languages.length > 0 && (
            <Select
              className="max-w-[150px]"
              label="Language"
              size="sm"
              selectedKeys={new Set([languageFilter])}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string;
                setLanguageFilter(val || "all");
              }}
            >
              {[
                <SelectItem key="all">All Languages</SelectItem>,
                ...languages.map((lang) => (
                  <SelectItem key={lang}>{lang}</SelectItem>
                )),
              ]}
            </Select>
          )}
          {ratedCount > 0 && (
            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                isSelected={ratedOnly}
                onValueChange={setRatedOnly}
              />
              <span className="text-sm text-default-500">
                Rated only ({ratedCount})
              </span>
            </div>
          )}
        </div>

        {/* Results count */}
        {hasFilters && (
          <p className="text-center text-sm text-default-400 mb-4">
            Showing {filteredMovies.length} of {sourceCounts[sourceFilter]} movies
          </p>
        )}

        {/* Movie grid */}
        <div className="flex flex-wrap justify-center">
          {filteredMovies.map((item, index) => (
            <Tile
              key={item.slug || index}
              name={item.name}
              imageUrl={item.imageUrl}
              slug={item.slug}
              userRating={item.userRating}
              backloggdUrl={item.letterboxdUrl}
              year={item.year}
            />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <p className="text-center text-default-400 mt-8">
            No movies found matching &quot;{search}&quot;
          </p>
        )}

        {/* Footer link */}
        <div className="text-center mt-8 mb-4">
          <a
            href="https://letterboxd.com/ftabhishekgupta/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            View full profile on Letterboxd →
          </a>
        </div>
      </div>
    </DefaultLayout>
  );
}
