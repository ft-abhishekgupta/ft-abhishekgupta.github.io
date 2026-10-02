import { useRef } from "react";

import { SceneShell, useScene } from "@/components/loaders/shared";
import { gsap, SplitText } from "@/lib/gsap";

// One heartbeat: flat baseline, a P-wave bump, the QRS spike, a T-wave, flat.
const TRACE =
  "M0 60 H330 C345 60 350 48 362 48 C374 48 378 60 392 60 H420 L432 74 L448 6 L466 112 L480 44 L492 60 H540 C560 60 568 40 590 40 C612 40 618 60 640 60 H1000";

/** Home: the signature heartbeat draws across while the name rises. */
export default function HomeScene() {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, (q) => {
    const counter = q("[data-counter]")[0];
    const path = q("path")[0];
    const split = new SplitText(q("[data-name]"), {
      type: "chars",
      mask: "chars",
      charsClass: "split-char",
    });
    const count = { value: 0 };

    gsap
      .timeline()
      .to(count, {
        value: 100,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
          counter.textContent = String(Math.round(count.value)).padStart(3, "0");
        },
      })
      .to(path, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0)
      .from(split.chars, { yPercent: 110, stagger: 0.025, duration: 0.8 }, 0.1);

    return () => split.revert();
  });

  return (
    <SceneShell ref={ref} caption="Connecting">
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 sm:inset-x-10">
        <svg
          className="h-24 w-full overflow-visible sm:h-32"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 120"
        >
          <path
            d={TRACE}
            pathLength={1}
            stroke="#FFB020"
            strokeDasharray={1}
            strokeDashoffset={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-6 sm:inset-x-10 sm:bottom-10">
        <p className="text-4xl font-semibold leading-none tracking-tight sm:text-7xl" data-name>
          Abhishek Gupta
        </p>
        <span className="font-mono text-4xl tabular-nums text-signal-amber sm:text-7xl" data-counter>
          000
        </span>
      </div>
    </SceneShell>
  );
}
