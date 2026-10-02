import React from "react";

import { SceneShell } from "@/components/loaders/shared";

// One heartbeat: flat baseline, a P-wave bump, the QRS spike, a T-wave, flat.
const TRACE =
  "M0 60 H330 C345 60 350 48 362 48 C374 48 378 60 392 60 H420 L432 74 L448 6 L466 112 L480 44 L492 60 H540 C560 60 568 40 590 40 C612 40 618 60 640 60 H1000";

const WORDS = ["Abhishek", "Gupta"];

// Odometer strips for 000 → 100: each column is a stack of digits translated
// in hard steps, so the counter is a pure transform animation.
const COLUMNS = [
  ["0", "1"],
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  Array.from({ length: 101 }, (_, i) => String(i % 10)),
];

/**
 * Home: the signature heartbeat sweeps across while the name rises and the
 * counter rolls to 100.
 *
 * Deliberately CSS-only (no GSAP, no React state): this scene is the
 * first-visit loader, so it must start on the very first paint and keep
 * running on the compositor while the main thread is busy hydrating. Every
 * animated property is a transform; the trace is revealed by a sliding cover
 * rather than by animating stroke-dashoffset, which needs the main thread.
 */
export default function HomeScene() {
  let index = 0;

  return (
    <SceneShell caption="Connecting">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 sm:inset-x-10">
        <div className="relative overflow-hidden">
          <svg
            className="block h-24 w-full sm:h-32"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1000 120"
          >
            <path
              d={TRACE}
              stroke="#FFB020"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* Cover slides off to the right; its leading edge is a glowing scan line. */}
          <div aria-hidden="true" className="loader-trace-cover absolute inset-y-0 left-0 w-full">
            <span className="absolute inset-0 bg-signal-ink" />
            <span className="absolute inset-y-0 left-0 w-[3px] bg-signal-amber shadow-[0_0_18px_4px_rgba(255,176,32,0.55)]" />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-6 sm:inset-x-10 sm:bottom-10">
        <p className="text-4xl font-semibold leading-none tracking-tight sm:text-7xl">
          {WORDS.map((word, w) => (
            <React.Fragment key={word}>
              {w > 0 && " "}
              <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                {word.split("").map((ch, c) => (
                  <span
                    key={c}
                    className="loader-rise inline-block"
                    style={{ animationDelay: `${0.1 + index++ * 0.03}s` }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </React.Fragment>
          ))}
        </p>

        <span className="flex font-mono text-4xl leading-none tabular-nums text-signal-amber sm:text-7xl">
          {COLUMNS.map((digits, c) => (
            <span key={c} className="block h-[1em] overflow-hidden">
              <span
                className="loader-odometer block"
                style={
                  {
                    "--n": digits.length - 1,
                    animationTimingFunction: `steps(${digits.length - 1}, jump-end)`,
                  } as React.CSSProperties
                }
              >
                {digits.map((d, i) => (
                  <span key={i} className="block h-[1em]">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </span>
      </div>
    </SceneShell>
  );
}
