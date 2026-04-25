import Tile from "@/components/Tile";
import rawData from "../scripts/data/games.json";
import { Chip, Input, Select, SelectItem, Switch } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { useMemo, useState } from "react";

interface GameItem {
  name: string;
  imageUrl: string;
  slug: string;
  gameId: string;
  userRating: number | null;
  backloggdUrl: string;
  year: number | null;
}

const data: GameItem[] = rawData as GameItem[];

type SortOption = "default" | "name-asc" | "name-desc" | "rated" | "year-new" | "year-old";

export default function Games() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [ratedOnly, setRatedOnly] = useState(false);
  const [decadeFilter, setDecadeFilter] = useState<string>("all");

  // Compute available decades
  const decades = useMemo(() => {
    const ds = new Set<number>();
    data.forEach((g) => {
      if (g.year) ds.add(Math.floor(g.year / 10) * 10);
    });
    return Array.from(ds).sort((a, b) => b - a);
  }, []);

  const filteredGames = useMemo(() => {
    let games = [...data];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      games = games.filter((g) => g.name.toLowerCase().includes(q));
    }

    // Rated filter
    if (ratedOnly) {
      games = games.filter((g) => g.userRating !== null);
    }

    // Decade filter
    if (decadeFilter !== "all") {
      const decade = parseInt(decadeFilter);
      games = games.filter((g) => g.year && g.year >= decade && g.year < decade + 10);
    }

    // Sort
    switch (sortBy) {
      case "name-asc":
        games.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        games.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rated":
        games.sort((a, b) => (b.userRating ?? 0) - (a.userRating ?? 0));
        break;
      case "year-new":
        games.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case "year-old":
        games.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
        break;
      default:
        break;
    }

    return games;
  }, [search, sortBy, ratedOnly, decadeFilter]);

  const ratedCount = data.filter((g) => g.userRating !== null).length;

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-center flex-row gap-2 mb-4">
          <Chip color="primary" size="lg" variant="bordered">
            {data.length}
          </Chip>
          <h1 className="text-3xl font-bold text-center my-8 p-4">
            Games Played
          </h1>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6 justify-center">
          <Input
            className="max-w-xs"
            placeholder="Search games..."
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
        {(search || ratedOnly || decadeFilter !== "all") && (
          <p className="text-center text-sm text-default-400 mb-4">
            Showing {filteredGames.length} of {data.length} games
          </p>
        )}

        {/* Game grid */}
        <div className="flex flex-wrap justify-center">
          {filteredGames.map((item, index) => (
            <Tile
              key={item.slug || index}
              name={item.name}
              imageUrl={item.imageUrl}
              slug={item.slug}
              userRating={item.userRating}
              backloggdUrl={item.backloggdUrl}
              year={item.year}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <p className="text-center text-default-400 mt-8">
            No games found matching &quot;{search}&quot;
          </p>
        )}

        {/* Footer link */}
        <div className="text-center mt-8 mb-4">
          <a
            href="https://backloggd.com/u/ftAbhishek/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            View full profile on Backloggd →
          </a>
        </div>
      </div>
    </DefaultLayout>
  );
}
