import React, { useEffect, useRef } from "react";

import { DrawRule } from "@/components/home/primitives";
import SplitReveal from "@/components/motion/SplitReveal";
import { gsap, MOTION_OK, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { entranceDelay, intro } from "@/lib/motion";

/** A number that counts toward its new value whenever it changes. */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef({ n: 0 });
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = String(value);
      shown.current.n = value;
      return;
    }

    let tween: gsap.core.Tween | undefined;
    const delay = first.current ? entranceDelay() : 0;

    first.current = false;
    if (delay) el.textContent = "0";

    const unsubscribe = intro.onDone(() => {
      tween = gsap.to(shown.current, {
        n: value,
        delay,
        duration: 1.2,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = String(Math.round(shown.current.n));
        },
      });
    });

    return () => {
      unsubscribe();
      tween?.kill();
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

export interface PageStat {
  value: number;
  label: string;
}

/**
 * Shared opener for the collection pages: oversized title rising out of its
 * mask, live counters that re-count when filters change, and a drawn rule.
 */
export default function PageHeader({
  title,
  description,
  stats = [],
  backdrop,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  stats?: PageStat[];
  /** Full-bleed moving artwork behind the title (video, image wall). */
  backdrop?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (!backdrop) return;
        gsap.to("[data-backdrop]", {
          yPercent: 22,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.from("[data-backdrop]", { autoAlpha: 0, scale: 1.08, duration: 1.6, delay: entranceDelay() });
      });
    },
    { scope: ref },
  );

  return (
    <header ref={ref} className="relative isolate pb-10 pt-10 sm:pb-14 sm:pt-16">
      {backdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 bottom-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_35%,transparent)]"
        >
          <div className="absolute inset-0" data-backdrop>
            {backdrop}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/55" />
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <SplitReveal
          as="h1"
          className="text-[clamp(3.5rem,12vw,8.5rem)] font-semibold leading-[0.88] tracking-[-0.045em]"
          stagger={0.03}
          start={null}
          type="chars"
        >
          {title}
        </SplitReveal>

        {stats.length > 0 && (
          <dl className="flex gap-8 pb-2">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  <CountUp value={s.value} />
                </dd>
                <dd className="mt-1 flex items-center gap-2 text-sm text-default-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {description && (
        <div className="mt-6 max-w-2xl text-base leading-relaxed text-default-500 sm:text-lg">
          {description}
        </div>
      )}
      {children}
      <DrawRule className="mt-10" />
    </header>
  );
}
