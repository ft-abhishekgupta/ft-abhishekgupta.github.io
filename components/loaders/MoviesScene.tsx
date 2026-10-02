import { useRef } from "react";

import { SceneShell, useScene } from "@/components/loaders/shared";
import { gsap } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";

/**
 * Movies: an Academy-style film leader counts down 3-2-1 under projector
 * grain, letterbox bars close in, and the latest watch gets the marquee.
 */
export default function MoviesScene({ data }: { data?: LoaderData }) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = data?.items?.[0];

  useScene(ref, (q) => {
    const num = q("[data-num]")[0];
    const sweep = q("[data-sweep]");
    const tl = gsap.timeline();

    tl.from(q("[data-bar]"), { scaleY: 0, duration: 0.5, ease: "signal" }, 0)
      .from(q("[data-leader]"), { scale: 0.8, autoAlpha: 0, duration: 0.35 }, 0);

    ["3", "2", "1"].forEach((n, i) => {
      const at = i * 0.33;

      tl.call(() => {
        num.textContent = n;
      }, undefined, at)
        .fromTo(sweep, { "--sweep": "0deg" }, { "--sweep": "360deg", duration: 0.33, ease: "none" }, at)
        .fromTo(num, { scale: 1.12 }, { scale: 1, duration: 0.25, ease: "power2.out" }, at);
    });

    tl.to(q("[data-leader]"), { scale: 1.6, autoAlpha: 0, duration: 0.3, ease: "signalIn" }, 1.0)
      .from(q("[data-now]"), { y: 20, autoAlpha: 0, duration: 0.4 }, 0.85);
  });

  return (
    <SceneShell ref={ref} caption="Rolling film" className="projector-flicker">
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.16] mix-blend-screen"
        preload="auto"
        src="/video/film-grain.mp4"
      />

      {/* Sprocket strips */}
      <div className="sprockets absolute inset-y-0 left-3 w-4 rounded sm:left-6 sm:w-5" />
      <div className="sprockets absolute inset-y-0 right-3 w-4 rounded sm:right-6 sm:w-5" />

      {/* Letterbox */}
      <div className="absolute inset-x-0 top-0 h-[11vh] origin-top bg-black" data-bar />
      <div className="absolute inset-x-0 bottom-0 h-[11vh] origin-bottom bg-black" data-bar />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-10">
        <div className="relative h-56 w-56 sm:h-72 sm:w-72" data-leader>
          <div className="leader-sweep absolute inset-0 rounded-full" data-sweep />
          <div className="absolute inset-0 rounded-full border-2 border-[#E8ECF5]/70" />
          <div className="absolute inset-5 rounded-full border border-[#E8ECF5]/40" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#E8ECF5]/40" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#E8ECF5]/40" />
          <span
            className="absolute inset-0 flex items-center justify-center text-8xl font-semibold tabular-nums sm:text-9xl"
            data-num
          >
            3
          </span>
        </div>

        <div className="text-center" data-now>
          <p className="text-sm text-signal-amber">Now showing</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">
            {latest ?? "Movies"}
          </p>
        </div>
      </div>
    </SceneShell>
  );
}
