import Contact from "@/components/home/Contact";
import Experience from "@/components/home/Experience";
import Hero from "@/components/home/Hero";
import Highlights from "@/components/home/Highlights";
import OffDuty, { type OffDutyData } from "@/components/home/OffDuty";
import Statement from "@/components/home/Statement";
import TechTicker from "@/components/home/TechTicker";
import DefaultLayout from "@/layouts/default";
import { decodeEntities } from "@/lib/loader";
import clicks from "../scripts/data/clicks.json";
import games from "../scripts/data/games.json";
import movies from "../scripts/data/movies.json";
import travel from "../scripts/data/travel.json";

export default function IndexPage({ offDuty }: { offDuty: OffDutyData }) {
  return (
    <DefaultLayout fullWidth>
      <Hero />
      <Statement />
      <TechTicker />
      <Experience />
      <Highlights />
      <OffDuty data={offDuty} />
      <Contact />
    </DefaultLayout>
  );
}

/** Builds a compact snapshot of the hobby feeds so the home bundle stays small. */
export function getStaticProps(): { props: { offDuty: OffDutyData } } {
  const playing = games.filter((g) => g.status === "playing" && g.imageUrl);
  const played = games.filter((g) => g.status === "played" && g.imageUrl);
  const watched = movies.filter((m) => m.source === "watched" && m.imageUrl);
  const shots = [...(clicks as { localPath: string; timestamp?: string }[])]
    .filter((c) => c.localPath)
    .sort((a, b) => (b.timestamp ?? "").localeCompare(a.timestamp ?? ""));
  const withImages = travel.filter((t) => t.image);
  const places = [...withImages].sort(() => Math.random() - 0.5).slice(0, 6);

  return {
    props: {
      offDuty: {
        playing: [...playing, ...played]
          .slice(0, 3)
          .map((g) => ({ name: decodeEntities(g.name), imageUrl: g.imageUrl })),
        playedCount: games.filter((g) => g.status === "played").length,
        movies: watched.slice(0, 8).map((m) => ({ name: decodeEntities(m.name), imageUrl: m.imageUrl })),
        watchedCount: movies.filter((m) => m.source === "watched").length,
        clicks: shots.slice(0, 5).map((c) => c.localPath),
        clicksCount: clicks.length,
        places: places.map((t) => ({ name: t.name, country: t.country, image: t.image as string })),
        citiesCount: travel.length,
        countriesCount: new Set(travel.map((t) => t.country)).size,
      },
    },
  };
}