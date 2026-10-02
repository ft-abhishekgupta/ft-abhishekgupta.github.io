import NextLink from "next/link";
import { useRef } from "react";

import ProjectArt from "@/components/home/ProjectArt";
import { ArrowIcon } from "@/components/home/primitives";
import Magnetic from "@/components/motion/Magnetic";
import SplitReveal from "@/components/motion/SplitReveal";
import { highlights } from "@/config/resume";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Personal projects as a horizontal reel: on large screens the section pins
 * and vertical scroll drives the track sideways, with each card's artwork
 * drifting at its own rate. Small screens and reduced motion get a stack.
 */
export default function Highlights() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = root?.querySelector<HTMLElement>("[data-track]");

      if (!root || !track) return;

      const mm = gsap.matchMedia();

      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const reel = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
          const art = card.querySelector("[data-art]");

          gsap.fromTo(
            art,
            { xPercent: -12 },
            {
              xPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: reel,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
          gsap.from(card, {
            rotate: 4,
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: reel,
              start: "left 110%",
              end: "left 55%",
              scrub: true,
            },
          });
        });

        gsap.to("[data-reel-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: true,
          },
        });
      });

      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        ScrollTrigger.batch("[data-card]", {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { y: 60, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, stagger: 0.1, duration: 1 },
            ),
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative scroll-mt-0 overflow-hidden py-24 sm:py-32 lg:py-0"
      id="work"
    >
      <div className="lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
        <div
          className="flex flex-col gap-6 px-4 sm:px-6 lg:w-max lg:flex-row lg:items-stretch lg:gap-8 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-[12vw] lg:motion-reduce:w-auto lg:motion-reduce:overflow-x-auto"
          data-track
        >
          {/* Intro panel */}
          <div className="flex shrink-0 flex-col justify-between gap-8 lg:w-[28rem] lg:py-4">
            <div>
              <SplitReveal
                as="h2"
                className="text-5xl font-semibold leading-[0.92] tracking-[-0.035em] sm:text-7xl lg:text-8xl"
                stagger={0.025}
                type="chars"
              >
                Projects
              </SplitReveal>
              <SplitReveal
                as="p"
                className="mt-6 max-w-sm text-base leading-relaxed text-default-500 sm:text-lg"
                delay={0.15}
              >
                Things I&apos;ve designed, built and shipped on my own time, from
                Android apps to smart contracts.
              </SplitReveal>
            </div>
            <div className="hidden items-center gap-3 text-sm text-default-400 lg:flex">
              Keep scrolling
              <span className="relative h-px w-16 overflow-hidden bg-default-200">
                <span className="absolute inset-0 origin-left scale-x-0 bg-secondary" data-reel-progress />
              </span>
            </div>
          </div>

          {highlights.map((item, i) => (
            <a
              key={item.title}
              className="spotlight group relative flex shrink-0 flex-col overflow-hidden rounded-[1.75rem] border border-default-200/70 bg-content1 transition-colors duration-500 hover:border-secondary/60 lg:h-[72svh] lg:max-h-[44rem] lg:w-[min(30rem,36vw)]"
              data-card
              data-cursor="Open"
              href={item.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="relative h-48 overflow-hidden border-b border-default-200/70 sm:h-56 lg:h-[46%]">
                <div className="absolute inset-y-0 -left-[15%] w-[130%] transition-transform duration-1000 ease-signal group-hover:scale-110" data-art>
                  <ProjectArt index={i} />
                </div>
                <span className="absolute left-5 top-5 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-secondary backdrop-blur">
                  {item.metric}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-sm text-default-400">{item.role}</p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-default-500">
                  {item.blurb}
                </p>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-default-200 px-2.5 py-0.5 text-xs text-default-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-default-200 transition-all duration-500 ease-signal group-hover:rotate-0 group-hover:border-secondary group-hover:bg-secondary group-hover:text-signal-ink -rotate-45">
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}

          {/* Closing panel */}
          <div className="flex shrink-0 items-center justify-center py-10 lg:w-[22rem] lg:py-0">
            <Magnetic strength={0.4}>
              <NextLink
                className="flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-full border border-default-300 text-center text-lg font-semibold transition-colors duration-500 hover:border-secondary hover:bg-secondary hover:text-signal-ink sm:h-52 sm:w-52"
                href="/projects"
              >
                Every project
                <ArrowIcon className="h-5 w-5" />
              </NextLink>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
