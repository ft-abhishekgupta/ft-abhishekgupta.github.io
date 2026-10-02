import { useRef } from "react";

import { SceneShell, useScene } from "@/components/loaders/shared";
import { gsap } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";

const BLOCKS = 14;

/**
 * Games: a cartridge-era boot screen over a live Conway's Game of Life loop.
 * The bar fills in hard steps like a console reading a memory card, then
 * PRESS START blinks.
 */
export default function GamesScene({ data }: { data?: LoaderData }) {
  const ref = useRef<HTMLDivElement>(null);
  const played = data?.stats?.find((s) => s.label === "played")?.value;
  const playing = data?.items?.[0];
  const tip = [
    played ? `${played} games cleared.` : null,
    playing ? `Now playing ${playing}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  useScene(ref, (q) => {
    gsap
      .timeline()
      .from(q("[data-title] span"), {
        y: 24,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.3,
        ease: "steps(3)",
      })
      .to(q("[data-block]"), { opacity: 1, stagger: 0.055, duration: 0.01, ease: "none" }, 0.1)
      .from(q("[data-tip]"), { autoAlpha: 0, duration: 0.2, ease: "steps(2)" }, 0.3)
      .to(q("[data-start]"), {
        opacity: 1,
        repeat: 5,
        yoyo: true,
        duration: 0.12,
        ease: "steps(1)",
      }, 0.95);
  });

  return (
    <SceneShell ref={ref} caption="Loading Games">
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="pixelated absolute inset-0 h-full w-full object-cover opacity-45"
        preload="auto"
        src="/video/games-life.mp4"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,11,22,0.55),#070B16_75%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-6 text-center font-pixel">
        <p className="text-[10px] text-signal-amber sm:text-xs">PLAYER 1</p>
        <h2 className="flex text-3xl leading-none sm:text-6xl" data-title>
          {"GAMES".split("").map((ch, i) => (
            <span key={i} className="inline-block">
              {ch}
            </span>
          ))}
        </h2>

        <div className="flex w-[min(86vw,30rem)] gap-1 border-2 border-[#E8ECF5]/80 p-1.5">
          {Array.from({ length: BLOCKS }).map((_, i) => (
            <span
              key={i}
              className="h-5 flex-1 bg-signal-amber opacity-0 sm:h-6"
              data-block
            />
          ))}
        </div>

        {tip && (
          <p className="max-w-md text-[9px] uppercase leading-loose text-[#E8ECF5]/70 sm:text-[11px]" data-tip>
            Tip: {tip}
          </p>
        )}

        <p className="text-xs opacity-0 sm:text-sm" data-start>
          PRESS START
        </p>
      </div>
    </SceneShell>
  );
}
