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
type SourceFilter = "all" | "watched" | "watchlist";
type MediaTypeFilter = "all" | "movie" | "tv";

export default function Movies() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("year-new");
  const [ratedOnly, setRatedOnly] = useState(false);
  const [decadeFilter, setDecadeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("watched");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all");

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

    if (sourceFilter !== "all") {
      movies = movies.filter((m) => m.source === sourceFilter);
    }

    if (languageFilter !== "all") {
      movies = movies.filter((m) => m.language === languageFilter);
    }

    if (mediaTypeFilter !== "all") {
      movies = movies.filter((m) => m.mediaType === mediaTypeFilter);
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
  }, [search, sortBy, ratedOnly, decadeFilter, sourceFilter, languageFilter, mediaTypeFilter]);

  const ratedCount = data.filter((m) => m.userRating !== null).length;
  const watchedCount = data.filter((m) => m.source === "watched").length;
  const watchlistCount = data.filter((m) => m.source === "watchlist").length;
  const movieCount = data.filter((m) => m.mediaType === "movie").length;
  const tvCount = data.filter((m) => m.mediaType === "tv").length;
  const hasFilters =
    search || ratedOnly || decadeFilter !== "all" || sourceFilter !== "all" || languageFilter !== "all" || mediaTypeFilter !== "all";

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-center flex-row gap-2 mb-4">
          <Chip color="secondary" size="lg" variant="bordered">
            {filteredMovies.length}
          </Chip>
          <h1 className="text-3xl font-bold text-center my-8 p-4">
            Movies & TV
          </h1>
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
            placeholder="Sort by"
            size="sm"
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
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
            placeholder="Decade"
            size="sm"
            selectedKeys={[decadeFilter]}
            onChange={(e) => setDecadeFilter(e.target.value || "all")}
            items={[{ key: "all", label: "All Decades" }, ...decades.map((d) => ({ key: String(d), label: `${d}s` }))]}
          >
            {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
          </Select>
          {watchlistCount > 0 && (
            <Select
              className="max-w-[160px]"
              placeholder="Source"
              size="sm"
              selectedKeys={[sourceFilter]}
              onChange={(e) =>
                setSourceFilter((e.target.value || "all") as SourceFilter)
              }
            >
              <SelectItem key="all">All ({data.length})</SelectItem>
              <SelectItem key="watched">Watched ({watchedCount})</SelectItem>
              <SelectItem key="watchlist">
                Watchlist ({watchlistCount})
              </SelectItem>
            </Select>
          )}
          {languages.length > 1 && (
            <Select
              className="max-w-[150px]"
              placeholder="Language"
              size="sm"
              selectedKeys={[languageFilter]}
              onChange={(e) => setLanguageFilter(e.target.value || "all")}
            >
              {[
                <SelectItem key="all">All Languages</SelectItem>,
                ...languages.map((lang) => (
                  <SelectItem key={lang}>{lang}</SelectItem>
                )),
              ]}
            </Select>
          )}
          {(movieCount > 0 && tvCount > 0) && (
            <Select
              className="max-w-[150px]"
              placeholder="Type"
              size="sm"
              selectedKeys={[mediaTypeFilter]}
              onChange={(e) =>
                setMediaTypeFilter((e.target.value || "all") as MediaTypeFilter)
              }
            >
              <SelectItem key="all">All Types</SelectItem>
              <SelectItem key="movie">🎬 Movies ({movieCount})</SelectItem>
              <SelectItem key="tv">📺 TV Series ({tvCount})</SelectItem>
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
            Showing {filteredMovies.length} of {data.length} movies
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
