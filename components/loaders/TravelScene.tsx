import { useRef } from "react";

import { SceneShell, useScene } from "@/components/loaders/shared";
import { gsap } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";

const FLAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const STATUS = ["Boarding", "On time", "Departed"];
const WIDTH = 11;
const ROUTE = "M40 150 C 260 -10, 740 -10, 960 150";

/**
 * Travel: a split-flap departures board clatters through letters before
 * settling on places I've actually been, while a flight arcs overhead.
 */
export default function TravelScene({ data }: { data?: LoaderData }) {
  const ref = useRef<HTMLDivElement>(null);
  const rows = (data?.rows?.length ? data.rows : [{ title: "Travel", sub: "" }]).slice(0, 3);

  useScene(ref, (q) => {
    const tl = gsap.timeline();
    const route = q("[data-route]")[0] as unknown as SVGPathElement;

    tl.from(q("[data-row]"), { autoAlpha: 0, y: 16, stagger: 0.06, duration: 0.3 });

    q("[data-flap]").forEach((cell, i) => {
      const final = cell.dataset.flap ?? " ";

      tl.fromTo(
        cell,
        { rotationX: -90 },
        { rotationX: 0, duration: 0.09, repeat: 5, ease: "none" },
        0.05 + (i % WIDTH) * 0.025,
      ).to(
        cell,
        {
          duration: 0.6 + (i % WIDTH) * 0.03,
          scrambleText: { text: final, chars: FLAP, speed: 1 },
          ease: "none",
        },
        "<",
      );
    });

    tl.fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut" }, 0)
      .to(
        q("[data-plane]"),
        {
          duration: 1.1,
          ease: "power1.inOut",
          motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], autoRotate: true },
        },
        0,
      )
      .from(q("[data-status]"), { autoAlpha: 0, stagger: 0.1, duration: 0.2, ease: "steps(2)" }, 0.75);
  });

  return (
    <SceneShell ref={ref} caption="Departures">
      <div className="flex h-full flex-col items-center justify-center gap-8 px-4">
        <svg aria-hidden="true" className="h-28 w-[min(92vw,56rem)] overflow-visible sm:h-40" fill="none" viewBox="0 0 1000 160">
          <path d={ROUTE} stroke="#E8ECF5" strokeDasharray="6 10" strokeOpacity={0.18} strokeWidth={2} />
          <path
            d={ROUTE}
            data-route
            pathLength={1}
            stroke="#FFB020"
            strokeDasharray={1}
            strokeDashoffset={1}
            strokeWidth={2}
          />
          <circle cx={40} cy={150} fill="#FFB020" r={6} />
          <circle cx={960} cy={150} fill="#5B84FF" r={6} />
          <g data-plane transform="translate(40 150) rotate(-35)">
            <path d="M-14 0 L10 -3 L14 0 L10 3 Z M-2 -1 L-8 -12 L-4 -12 L6 -1 Z M-2 1 L-8 12 L-4 12 L6 1 Z M-12 -1 L-15 -6 L-12 -6 L-8 -1 Z M-12 1 L-15 6 L-12 6 L-8 1 Z" fill="#E8ECF5" />
          </g>
        </svg>

        <div className="w-[min(94vw,46rem)] rounded-2xl border border-[#E8ECF5]/10 bg-[#0B1122] p-3 font-mono sm:p-5">
          {rows.map((row, r) => {
            const label = row.title.toUpperCase().slice(0, WIDTH).padEnd(WIDTH, " ");

            return (
              <div
                key={r}
                className="flex items-center justify-between gap-3 border-b border-[#E8ECF5]/5 py-2 last:border-0 sm:gap-6"
                data-row
              >
                <span className="flex gap-[3px] [perspective:400px]">
                  {label.split("").map((ch, i) => (
                    <span
                      key={i}
                      className="flex h-7 w-5 items-center justify-center rounded-[3px] bg-[#141B31] text-sm font-semibold text-[#E8ECF5] sm:h-10 sm:w-7 sm:text-xl"
                      data-flap={ch}
                    >
                      {ch.trim() ? ch : "\u00a0"}
                    </span>
                  ))}
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-sm text-[#E8ECF5]/50 sm:block">{row.sub}</span>
                <span
                  className={`shrink-0 text-xs sm:text-sm ${r === 0 ? "text-signal-amber" : "text-[#E8ECF5]/60"}`}
                  data-status
                >
                  {STATUS[r]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
}
