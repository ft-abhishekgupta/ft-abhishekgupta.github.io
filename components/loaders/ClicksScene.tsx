import { useId, useRef } from "react";

import SmartImage from "@/components/SmartImage";
import { SceneShell, useScene } from "@/components/loaders/shared";
import { gsap } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";

const CORNERS = [
  "left-[8vw] top-[12vh] border-l-2 border-t-2",
  "right-[8vw] top-[12vh] border-r-2 border-t-2",
  "left-[8vw] bottom-[12vh] border-l-2 border-b-2",
  "right-[8vw] bottom-[12vh] border-r-2 border-b-2",
];

// Six-bladed iris: a hexagonal aperture plus each side extended outward so the
// blade edges read as they sweep in.
const HEX = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i;

  return [Math.round(Math.cos(a) * 1000) / 10, Math.round(Math.sin(a) * 1000) / 10];
});
const BLADE_EDGES = HEX.map(([x1, y1], i) => {
  const [x2, y2] = HEX[(i + 1) % 6];
  const dx = x2 - x1;
  const dy = y2 - y1;

  return { x1: x1 - dx * 4, y1: y1 - dy * 4, x2: x2 + dx * 4, y2: y2 + dy * 4 };
});
const OPEN = 3.2;
const TICKS = 17;

/**
 * Clicks: looking through the viewfinder at the newest photo. The live view
 * starts out of focus, autofocus hunts and racks it sharp, the iris blades
 * snap shut and open, the exposure blooms on the image itself, and the frame
 * slides out as a print. No full-screen white: the scene stays in ink.
 */
export default function ClicksScene({ data }: { data?: LoaderData }) {
  const ref = useRef<HTMLDivElement>(null);
  const maskId = `iris-${useId().replace(/:/g, "")}`;
  const frames = data?.stats?.[0]?.value;
  const image = data?.image ?? null;

  useScene(ref, (q) => {
    const blades = q("[data-blades]");
    const live = q("[data-live]");

    gsap.set(blades, { scale: OPEN, rotation: 0, svgOrigin: "0 0" });
    gsap.set(live, { filter: "blur(28px) brightness(1)", scale: 1.18, opacity: 0 });

    gsap
      .timeline()
      // Frame lines and the out-of-focus live view arrive together.
      .from(q("[data-corner]"), { scale: 1.6, autoAlpha: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.03 })
      .to(live, { opacity: 0.5, duration: 0.35, ease: "power1.out" }, 0.05)
      // Autofocus hunts: the box jitters while focus breathes in and out.
      .to(q("[data-af]"), { keyframes: [{ x: 14, y: -8 }, { x: -10, y: 6 }, { x: 4, y: -2 }], duration: 0.36, ease: "none" }, 0.18)
      .to(live, { keyframes: [{ filter: "blur(12px) brightness(1)" }, { filter: "blur(20px) brightness(1)" }, { filter: "blur(9px) brightness(1)" }], duration: 0.36, ease: "none" }, 0.18)
      .to(q("[data-needle]"), { keyframes: [{ left: "22%" }, { left: "70%" }, { left: "41%" }], duration: 0.36, ease: "none" }, 0.18)
      // Lock: box turns amber and the image racks sharp.
      .to(q("[data-af]"), { x: 0, y: 0, scale: 0.82, borderColor: "#FFB020", duration: 0.14 }, 0.55)
      .to(q("[data-af-label]"), { opacity: 1, duration: 0.05 }, 0.58)
      .to(q("[data-needle]"), { left: "50%", duration: 0.2, ease: "back.out(3)" }, 0.55)
      .to(live, { filter: "blur(0px) brightness(1)", scale: 1.06, opacity: 0.62, duration: 0.3, ease: "power2.out" }, 0.56)
      // Shutter: blades close fast, reopen a touch slower.
      .to(blades, { scale: 0.001, rotation: 35, duration: 0.13, ease: "power2.in" }, 0.86)
      .to(q("[data-af]"), { autoAlpha: 0, duration: 0.05 }, 0.92)
      .to(blades, { scale: OPEN, rotation: 70, duration: 0.3, ease: "power3.out" }, 1.0)
      // Exposure blooms on the photo, then the frame ejects as a print.
      .fromTo(live, { filter: "blur(0px) brightness(1.7)" }, { filter: "blur(0px) brightness(1)", opacity: 0.22, duration: 0.6, ease: "power2.out", immediateRender: false }, 1.0)
      .to(q("[data-caption-text]"), { duration: 0.4, scrambleText: { text: "Captured", chars: "lowerCase" } }, 1.0)
      .fromTo(
        q("[data-review]"),
        { xPercent: -50, yPercent: -50, left: "50%", top: "50%", scale: 1.9, rotate: 0, autoAlpha: 0 },
        { left: "84%", top: "68%", scale: 1, rotate: -5, autoAlpha: 1, duration: 0.6, ease: "power3.out", immediateRender: false },
        1.02,
      )
      .to(q("[data-shot]"), { scrambleText: { text: String(frames ?? ""), chars: "0123456789" }, duration: 0.6 }, 0.2);
  });

  return (
    <SceneShell ref={ref} caption="Focusing">
      {/* Live view: the newest photo, out of focus until AF locks. */}
      {image && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-0 will-change-[filter,transform]"
          data-live
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#070B16_85%)]" />

      {/* Rule-of-thirds grid */}
      <div className="absolute inset-x-[8vw] inset-y-[12vh] opacity-20">
        <span className="absolute inset-y-0 left-1/3 w-px bg-[#E8ECF5]" />
        <span className="absolute inset-y-0 left-2/3 w-px bg-[#E8ECF5]" />
        <span className="absolute inset-x-0 top-1/3 h-px bg-[#E8ECF5]" />
        <span className="absolute inset-x-0 top-2/3 h-px bg-[#E8ECF5]" />
      </div>

      {CORNERS.map((c) => (
        <span key={c} className={`absolute h-10 w-10 border-[#E8ECF5]/80 sm:h-14 sm:w-14 ${c}`} data-corner />
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-24 w-24 border-2 border-[#E8ECF5]/80 sm:h-28 sm:w-28" data-af>
          <span
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-signal-amber opacity-0"
            data-af-label
          >
            AF locked
          </span>
        </div>
      </div>

      {/* HUD: exposure meter + settings */}
      <div className="absolute inset-x-[8vw] bottom-[4vh] flex flex-col gap-3 font-mono text-xs text-[#E8ECF5]/70 sm:text-sm">
        <div className="relative mx-auto w-[min(70vw,22rem)] pt-3">
          <span className="absolute top-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-signal-amber" data-needle style={{ left: "10%" }} />
          <div className="flex items-end justify-between">
            {Array.from({ length: TICKS }).map((_, i) => (
              <span key={i} className={`w-px bg-[#E8ECF5]/60 ${i % 4 === 0 ? "h-3" : "h-1.5"}`} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[#E8ECF5]/50">
            <span>-2</span>
            <span>-1</span>
            <span>0</span>
            <span>+1</span>
            <span>+2</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>1/250 &nbsp; f/2.8 &nbsp; ISO 100</span>
          <span>
            <span data-shot>{frames ?? ""}</span> frames
          </span>
        </div>
      </div>

      {image && (
        <div
          className="invisible absolute left-[84%] top-[68%] w-32 rounded-md bg-[#E8ECF5] p-1.5 pb-5 shadow-2xl shadow-black/60 sm:w-44"
          data-review
        >
          <SmartImage
            hideOnError
            alt=""
            className="aspect-square w-full object-cover"
            src={image}
            wrapperClassName="aspect-square w-full rounded-sm bg-[#070B16]"
          />
        </div>
      )}

      {/* Iris blades */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="-100 -100 200 200"
      >
        <defs>
          <mask height={4000} id={maskId} maskUnits="userSpaceOnUse" width={4000} x={-2000} y={-2000}>
            <rect fill="white" height={4000} width={4000} x={-2000} y={-2000} />
            <g data-blades transform={`scale(${OPEN})`}>
              <polygon fill="black" points={HEX.map((p) => p.join(",")).join(" ")} />
            </g>
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <rect fill="#04070E" height={4000} width={4000} x={-2000} y={-2000} />
          <g data-blades transform={`scale(${OPEN})`}>
            {BLADE_EDGES.map((l, i) => (
              <line key={i} stroke="#24304F" strokeWidth={1.5} vectorEffect="non-scaling-stroke" {...l} />
            ))}
          </g>
        </g>
      </svg>
    </SceneShell>
  );
}
