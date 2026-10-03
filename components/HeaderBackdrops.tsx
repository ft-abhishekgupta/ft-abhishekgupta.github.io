import React, { useRef } from "react";

import VelocityMarquee from "@/components/motion/VelocityMarquee";
import SmartImage from "@/components/SmartImage";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Builds ambient looping animations for a backdrop, only when motion is allowed,
 * and pauses them whenever the header is scrolled out of view.
 */
function useBackdropLoop(
  ref: React.RefObject<HTMLElement>,
  build: (root: HTMLElement) => gsap.core.Animation[],
) {
  useGSAP(
    () => {
      const root = ref.current;

      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const anims = build(root);
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => anims.forEach((a) => (self.isActive ? a.resume() : a.pause())),
        });

        if (!st.isActive) anims.forEach((a) => a.pause());
      });
    },
    { scope: ref },
  );
}

/** Looping, muted background clip for a page header. */
export function VideoBackdrop({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      preload="metadata"
      src={src}
    />
  );
}

/**
 * Two tilted rows of artwork drifting in opposite directions (and reacting to
 * scroll velocity) behind a page title.
 */
export function ImageWall({
  images,
  aspect = "aspect-[2/3]",
  width = "w-28 sm:w-36",
}: {
  images: string[];
  aspect?: string;
  width?: string;
}) {
  const half = Math.ceil(images.length / 2);
  const rows = [images.slice(0, half), images.slice(half)];

  return (
    <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 -rotate-6 scale-110 flex-col gap-3">
      {rows.map((row, r) => (
        <VelocityMarquee key={r} copies={3} reverse={r === 1} speed={22}>
          {row.map((src) => (
            <div key={src} className={`mr-3 shrink-0 overflow-hidden rounded-lg ${width}`}>
              <SmartImage alt="" className={`${aspect} w-full object-cover`} loading="lazy" src={src} wrapperClassName={`${aspect} w-full`} />
            </div>
          ))}
        </VelocityMarquee>
      ))}
    </div>
  );
}

/**
 * Contact-sheet columns: photos stacked in vertical strips that drift up and
 * down at slightly different speeds, like film running through a loupe.
 */
export function PhotoColumns({ images, columns = 7 }: { images: string[]; columns?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const cols = Array.from({ length: columns }, (_, c) => images.filter((_, i) => i % columns === c));

  useBackdropLoop(ref, (root) =>
    gsap.utils.toArray<HTMLElement>("[data-col]", root).map((col, i) => {
      const up = i % 2 === 0;
      const tween = gsap.fromTo(
        col,
        { yPercent: up ? 0 : -50 },
        { yPercent: up ? -50 : 0, duration: 46 + (i % 3) * 9, ease: "none", repeat: -1 },
      );

      return tween.progress((i * 0.23) % 1);
    }),
  );

  return (
    <div ref={ref} className="absolute inset-0 flex items-start justify-center">
      <div className="flex -translate-y-24 -rotate-[8deg] scale-125 gap-3 sm:gap-4">
        {cols.map((col, c) => (
          <div key={c} className="w-28 shrink-0 sm:w-40">
            <div className="flex flex-col will-change-transform" data-col>
              {[0, 1].map((copy) =>
                col.map((src) => (
                  <div key={`${copy}-${src}`} className="pb-3 sm:pb-4">
                    <SmartImage
                      alt=""
                      className="aspect-[4/5] w-full object-cover"
                      loading="lazy"
                      src={src}
                      wrapperClassName="aspect-[4/5] w-full rounded-xl"
                    />
                  </div>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Isometric desk of screenshots on a blueprint grid, sliding slowly away from
 * the viewer while a scanner line sweeps across it.
 */
export function ScreenshotPlane({ images, copies = 3 }: { images: string[]; copies?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useBackdropLoop(ref, (root) => [
    gsap.fromTo(
      root.querySelector("[data-plane-track]"),
      { yPercent: 0 },
      { yPercent: -100 / copies, duration: 70, ease: "none", repeat: -1 },
    ),
    gsap.fromTo(
      root.querySelector("[data-plane-scan]"),
      { yPercent: -100 },
      { yPercent: 500, duration: 7, ease: "sine.inOut", repeat: -1, repeatDelay: 1.5 },
    ),
  ]);

  return (
    <div ref={ref} className="absolute inset-0 [perspective:1100px]">
      <div className="absolute left-1/2 top-1/2 h-[1700px] w-[170vw] overflow-hidden [transform:translate(-50%,-50%)_rotateX(52deg)_rotateZ(-24deg)]">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--nextui-default-300)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--nextui-default-300)/0.35)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="relative will-change-transform" data-plane-track>
          {Array.from({ length: copies }).map((_, copy) => (
            <div key={copy} className="grid grid-cols-4 gap-6 pb-6">
              {images.map((src) => (
                <SmartImage
                  key={`${copy}-${src}`}
                  alt=""
                  className="aspect-video w-full object-cover object-top"
                  loading="lazy"
                  src={src}
                  wrapperClassName="aspect-video w-full rounded-xl shadow-2xl ring-1 ring-default-300/40"
                />
              ))}
            </div>
          ))}
        </div>
        <div
          className="absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-transparent via-secondary/25 to-transparent"
          data-plane-scan
        />
      </div>
    </div>
  );
}

/**
 * Travel postcards: city photos cross-fading with a slow Ken Burns pan, under a
 * dashed flight route that a little plane keeps flying.
 */
export function PostcardSlideshow({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);

  useBackdropLoop(ref, (root) => {
    const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", root);
    const anims: gsap.core.Animation[] = [];
    const n = slides.length;

    if (n > 1) {
      const hold = 5.5;
      const fade = 1.6;
      const tl = gsap.timeline({ repeat: -1 });

      slides.forEach((el, k) => {
        const start = k * hold;
        const dir = k % 2 ? 1 : -1;
        const from = { scale: 1.02, xPercent: -2 * dir };
        const to = { scale: 1.14, xPercent: 2 * dir };
        const span = hold + fade;

        if (k < n - 1) {
          tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade, ease: "sine.inOut" }, start)
            .to(el, { autoAlpha: 0, duration: fade, ease: "sine.inOut" }, start + hold)
            .fromTo(el, from, { ...to, duration: span, ease: "none" }, start);
        } else {
          // The last slide straddles the loop seam: it fades out at t=0 while
          // the first fades in, so the repeat is continuous.
          const mid = {
            scale: from.scale + (to.scale - from.scale) * (hold / span),
            xPercent: from.xPercent + (to.xPercent - from.xPercent) * (hold / span),
          };

          tl.fromTo(el, { autoAlpha: 1 }, { autoAlpha: 0, duration: fade, ease: "sine.inOut" }, 0)
            .fromTo(el, mid, { ...to, duration: fade, ease: "none" }, 0)
            .fromTo(
              el,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: fade, ease: "sine.inOut", immediateRender: false },
              start,
            )
            .fromTo(el, from, { ...mid, duration: hold, ease: "none", immediateRender: false }, start);
        }
      });
      tl.time(fade);
      anims.push(tl);
    }

    const route = routeRef.current;

    if (route) {
      anims.push(
        gsap.to(route, { strokeDashoffset: -120, duration: 6, ease: "none", repeat: -1 }),
        gsap.to(root.querySelector("[data-plane]"), {
          duration: 14,
          ease: "sine.inOut",
          repeat: -1,
          repeatDelay: 0.8,
          motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], autoRotate: 90 },
        }),
        gsap.fromTo(
          root.querySelectorAll("[data-pin-ring]"),
          { scale: 0.6, autoAlpha: 0.9, transformOrigin: "50% 50%" },
          { scale: 2.6, autoAlpha: 0, duration: 2, ease: "power1.out", repeat: -1, stagger: 1 },
        ),
      );
    }

    return anims;
  });

  return (
    <div ref={ref} className="absolute inset-0">
      {images.map((src, i) => (
        <div key={src} className={`absolute inset-0 ${i === 0 ? "" : "opacity-0"}`} data-slide>
          <SmartImage alt="" className="h-full w-full object-cover" loading="lazy" src={src} wrapperClassName="h-full w-full" />
        </div>
      ))}
      <div className="absolute inset-0 bg-background/15" />
      <svg
        className="absolute inset-0 h-full w-full text-secondary"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1000 400"
      >
        <path
          ref={routeRef}
          d="M 120 330 C 330 40, 640 40, 900 190"
          opacity={0.75}
          stroke="currentColor"
          strokeDasharray="10 14"
          strokeLinecap="round"
          strokeWidth={2.5}
        />
        {[
          [120, 330],
          [900, 190],
        ].map(([cx, cy]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} fill="currentColor" r={5} />
            <circle cx={cx} cy={cy} data-pin-ring r={5} stroke="currentColor" strokeWidth={2} />
          </g>
        ))}
        <g data-plane>
          <path
            d="M0 -11 L2 -3 L11 2 L11 4.5 L2 2 L1.2 8 L4 10.5 L4 12 L0 11 L-4 12 L-4 10.5 L-1.2 8 L-2 2 L-11 4.5 L-11 2 L-2 -3 Z"
            fill="currentColor"
            transform="translate(120 330) scale(1.4)"
          />
        </g>
      </svg>
    </div>
  );
}
