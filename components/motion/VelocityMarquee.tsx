import clsx from "clsx";
import React, { useEffect, useRef } from "react";

import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Endless marquee that reacts to the reader: scrolling speeds it up, the scroll
 * direction flips its travel, fast flicks skew it, and hovering eases it almost
 * to a stop so items can be read.
 */
export default function VelocityMarquee({
  children,
  speed = 45,
  reverse = false,
  copies = 4,
  className,
  trackClassName,
}: {
  children: React.ReactNode;
  /** Base travel in px/second. */
  speed?: number;
  reverse?: boolean;
  copies?: number;
  className?: string;
  trackClassName?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;

    if (!root || !track || prefersReducedMotion()) return;

    const first = track.children[0] as HTMLElement | undefined;

    if (!first) return;

    let width = first.offsetWidth;
    let x = reverse ? -width : 0;
    let visible = true;
    const state = { boost: 0, hover: 1, dir: 1 };
    const setX = gsap.quickSetter(track, "x", "px");
    const setSkew = gsap.quickSetter(track, "skewX", "deg");
    const sign = reverse ? 1 : -1;

    const tick = (_t: number, deltaTime: number) => {
      if (!visible) return;
      const dt = Math.min(deltaTime, 64) / 1000;

      x += sign * state.dir * speed * (1 + state.boost) * state.hover * dt;
      x = gsap.utils.wrap(-width, 0, x);
      setX(x);
      // Lean into the direction of travel while the scroll boost decays.
      setSkew(gsap.utils.clamp(-6, 6, -sign * state.dir * state.boost * 1.1));
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (visible = self.isActive),
      onUpdate: (self) => {
        const v = self.getVelocity();

        state.dir = self.direction;
        gsap.to(state, {
          boost: Math.min(Math.abs(v) / 250, 7),
          duration: 0.2,
          overwrite: true,
          onComplete: () => {
            gsap.to(state, { boost: 0, duration: 1.4, ease: "power2.out" });
          },
        });
      },
    });

    const ro = new ResizeObserver(() => {
      width = first.offsetWidth;
    });

    ro.observe(first);

    const onEnter = () => gsap.to(state, { hover: 0.15, duration: 0.6 });
    const onLeave = () => gsap.to(state, { hover: 1, duration: 0.8 });

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
      gsap.killTweensOf(state);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reverse, speed]);

  return (
    <div ref={rootRef} className={clsx("marquee-viewport overflow-hidden", className)}>
      <div ref={trackRef} className={clsx("flex w-max will-change-transform", trackClassName)}>
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} aria-hidden={i > 0 || undefined} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
