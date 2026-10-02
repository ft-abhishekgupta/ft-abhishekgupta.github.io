import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

import { SectionHeading } from "@/components/home/primitives";
import VelocityMarquee from "@/components/motion/VelocityMarquee";
import { achievements, timeline } from "@/config/resume";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const EASE = [0.16, 1, 0.3, 1] as const;

function splitPeriod(period: string) {
  const [from, to] = period.split(/\s*-\s*/);

  return { from: from?.replace(/^[A-Za-z]+\s/, "") ?? period, to: to?.replace(/^[A-Za-z]+\s/, "") };
}

export default function Experience() {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-entry]");

      // Active entry tracking works with or without motion (it drives the
      // sticky period readout and the rail dots).
      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          end: "bottom 60%",
          toggleClass: "is-active",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from("[data-rail-fill]", {
          scaleY: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-rail]",
            start: "top 60%",
            end: "bottom 60%",
            scrub: 0.4,
          },
        });

        items.forEach((item) => {
          gsap.from(item.querySelectorAll("[data-entry-part]"), {
            y: 40,
            autoAlpha: 0,
            stagger: 0.07,
            duration: 1,
            scrollTrigger: { trigger: item, start: "top 82%", once: true },
          });
        });
      });
    },
    { scope: rootRef },
  );

  const current = timeline[active];
  const { from, to } = splitPeriod(current.period);

  return (
    <section ref={rootRef} className="scroll-mt-6 py-24 sm:py-32" id="experience">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          description="Six years of designing, shipping and running services at Xbox, and the schooling that got me there."
          title="Experience"
        />

        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
          {/* Sticky readout of the entry currently under the reading line */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <p className="font-mono text-sm text-default-400">
                {String(active + 1).padStart(2, "0")} / {String(timeline.length).padStart(2, "0")}
              </p>
              <div className="relative mt-4 h-[11rem] overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={active}
                    animate={{ y: "0%", opacity: 1 }}
                    className="absolute inset-0"
                    exit={{ y: "-60%", opacity: 0 }}
                    initial={{ y: "60%", opacity: 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <p className="text-7xl font-semibold leading-[0.9] tracking-[-0.04em] xl:text-8xl">
                      {from}
                    </p>
                    <p className="mt-2 text-3xl font-medium tracking-tight text-default-400">
                      {to ? `to ${to}` : ""}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <p className="mt-4 text-lg text-default-500">{current.org}</p>
            </div>
          </div>

          <ol className="relative" data-rail>
            <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-default-200" />
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-secondary"
              data-rail-fill
            />

            {timeline.map((entry, i) => (
              <li
                key={`${entry.org}-${entry.period}`}
                className="group relative pb-16 pl-10 last:pb-0 sm:pl-14"
                data-entry
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 bg-background transition-all duration-500",
                    "border-default-300 group-[.is-active]:scale-125 group-[.is-active]:border-secondary group-[.is-active]:bg-secondary group-[.is-active]:shadow-[0_0_0_6px_rgba(255,176,32,0.15)]",
                  )}
                />

                <p className="font-mono text-sm text-default-400" data-entry-part>
                  <span className="lg:hidden">{entry.period}</span>
                  <span className="hidden lg:inline">
                    {entry.kind === "work" ? "Work" : "Education"}
                  </span>
                  {entry.meta && <span className="ml-3 text-secondary">{entry.meta}</span>}
                </p>
                <h3
                  className="mt-3 text-2xl font-semibold leading-tight tracking-tight transition-colors duration-500 group-[.is-active]:text-foreground sm:text-3xl"
                  data-entry-part
                >
                  {entry.role}
                </h3>
                <p className="mt-1 text-default-500" data-entry-part>
                  {entry.org}
                  {entry.location && <span className="text-default-400">, {entry.location}</span>}
                </p>

                <ul className="mt-6 space-y-3">
                  {entry.points.map((point) => (
                    <li
                      key={point}
                      className="relative pl-5 text-[15px] leading-relaxed text-default-500 sm:text-base"
                      data-entry-part
                    >
                      <span className="absolute left-0 top-[0.7em] h-px w-2.5 bg-default-400" />
                      {point}
                    </li>
                  ))}
                </ul>

                {entry.tags && (
                  <div className="mt-6 flex flex-wrap gap-2" data-entry-part>
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-default-200 px-3 py-1 text-xs text-default-500 transition-colors duration-300 hover:border-secondary hover:text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Recognition, as a slow ribbon that reacts to scroll */}
      <div className="mt-28 border-y border-default-100 py-8 sm:mt-36 sm:py-10">
        <VelocityMarquee speed={55}>
          {achievements.map((item) => (
            <span
              key={item}
              className="flex items-center gap-8 pr-8 text-4xl font-semibold tracking-tight sm:gap-12 sm:pr-12 sm:text-6xl"
            >
              <span className="ghost-text">{item}</span>
              <span className="h-3 w-3 shrink-0 rounded-full bg-secondary" />
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}
