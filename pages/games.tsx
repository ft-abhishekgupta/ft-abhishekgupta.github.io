import Tile from "@/components/tile";
import data from "../scripts/data/games.json";
import { Chip, Input, Select, SelectItem, Switch } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { useMemo, useState } from "react";

type SortOption = "default" | "name-asc" | "name-desc" | "rated";

export default function Games() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [ratedOnly, setRatedOnly] = useState(false);

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
      default:
        break;
    }

    return games;
  }, [search, sortBy, ratedOnly]);

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
            <SelectItem key="rated">Highest Rated</SelectItem>
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
        {(search || ratedOnly) && (
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
