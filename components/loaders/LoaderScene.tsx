import React from "react";

import ClicksScene from "@/components/loaders/ClicksScene";
import GamesScene from "@/components/loaders/GamesScene";
import HomeScene from "@/components/loaders/HomeScene";
import MoviesScene from "@/components/loaders/MoviesScene";
import ProjectsScene from "@/components/loaders/ProjectsScene";
import ResumeScene from "@/components/loaders/ResumeScene";
import TravelScene from "@/components/loaders/TravelScene";
import type { LoaderData } from "@/lib/loader";

export { SCENE_HOLD } from "@/components/loaders/shared";

const SCENES: Record<string, React.ComponentType<{ data?: LoaderData }>> = {
  "/": HomeScene,
  "/games": GamesScene,
  "/movies": MoviesScene,
  "/clicks": ClicksScene,
  "/travel": TravelScene,
  "/projects": ProjectsScene,
  "/resume": ResumeScene,
};

/** Picks the loading scene that matches the destination route. */
export default function LoaderScene({
  pathname,
  data,
}: {
  pathname: string;
  data?: LoaderData;
}) {
  const Scene = SCENES[pathname] ?? HomeScene;

  return <Scene data={data} />;
}
