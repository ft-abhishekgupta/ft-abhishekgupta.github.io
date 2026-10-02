import { useRef } from "react";

import { SceneShell, useScene } from "@/components/loaders/shared";
import { gsap } from "@/lib/gsap";

const LINES = [
  "w-2/5 h-3",
  "w-3/5 h-1.5",
  "w-full h-1.5",
  "w-11/12 h-1.5",
  "w-1/3 h-2 mt-3",
  "w-full h-1.5",
  "w-10/12 h-1.5",
  "w-full h-1.5",
  "w-1/3 h-2 mt-3",
  "w-11/12 h-1.5",
  "w-9/12 h-1.5",
];

/** Resume: a single page feeds out of a printer, typesetting as it goes. */
export default function ResumeScene() {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, (q) => {
    gsap
      .timeline()
      .fromTo(
        q("[data-sheet]"),
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "steps(14)" },
      )
      .from(q("[data-line]"), { scaleX: 0, stagger: 0.07, duration: 0.25, ease: "power2.out" }, 0.15)
      .to(q("[data-dot]"), { opacity: 1, stagger: 0.25, duration: 0.05 }, 0.2);
  });

  return (
    <SceneShell ref={ref} caption="Printing">
      <div className="flex h-full flex-col items-center justify-center gap-0">
        <div className="relative z-10 h-6 w-[min(80vw,22rem)] rounded-full bg-[#141B31] shadow-[inset_0_-4px_0_#070B16]">
          <span className="absolute left-1/2 top-1/2 h-1 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        </div>
        <div className="-mt-3 h-[min(52vh,26rem)] w-[min(66vw,18rem)] overflow-hidden">
          <div
            className="flex h-full flex-col gap-2 rounded-b-md bg-[#F3F5FA] p-5 pt-8 shadow-2xl"
            data-sheet
            style={{ clipPath: "inset(0% 0% 100% 0%)" }}
          >
            {LINES.map((cls, i) => (
              <span key={i} className={`block origin-left rounded-full bg-[#070B16]/70 ${cls}`} data-line />
            ))}
          </div>
        </div>
        <p className="mt-8 flex items-center gap-2 text-sm text-[#E8ECF5]/70">
          Page 1 of 1
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-signal-amber opacity-0" data-dot />
          ))}
        </p>
      </div>
    </SceneShell>
  );
}
