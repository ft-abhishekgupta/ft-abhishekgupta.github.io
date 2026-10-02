import React, { useRef } from "react";

import { SectionHeading, TechLogo } from "@/components/home/primitives";
import VelocityMarquee from "@/components/motion/VelocityMarquee";
import { skillGroups, techStack, type Tech } from "@/config/resume";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const ICON_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  className: "h-6 w-6",
};

const GROUP_ICONS: Record<string, React.ReactNode> = {
  "Backend & Architecture": (
    <svg {...ICON_PROPS}>
      <rect height="6" rx="2" width="17" x="3.5" y="4" />
      <rect height="6" rx="2" width="17" x="3.5" y="14" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
  "Cloud & Data": (
    <svg {...ICON_PROPS}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" />
    </svg>
  ),
  "Languages & Frameworks": (
    <svg {...ICON_PROPS}>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />
    </svg>
  ),
  "Reliability & DevOps": (
    <svg {...ICON_PROPS}>
      <path d="M3 12h3.5l2-5.5 3.5 11 2.5-7 1.5 4h5" />
    </svg>
  ),
  "Security & Identity": (
    <svg {...ICON_PROPS}>
      <path d="M12 3 4.5 6v6c0 4.4 3.2 7.9 7.5 9 4.3-1.1 7.5-4.6 7.5-9V6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  "AI Engineering": (
    <svg {...ICON_PROPS}>
      <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8 12 3.5Z" />
      <path d="m18.6 15 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </svg>
  ),
};

function LogoRow({ items }: { items: Tech[] }) {
  return (
    <>
      {items.map((tech) => (
        <span
          key={tech.slug}
          className="group/item flex select-none items-center gap-3 px-6 text-default-400 sm:px-9"
          style={{ ["--brand" as string]: tech.color }}
        >
          <TechLogo
            className="h-8 w-8 transition-[color,transform] duration-500 ease-signal group-hover/item:-rotate-6 group-hover/item:scale-110 group-hover/item:text-[var(--brand)] sm:h-10 sm:w-10"
            slug={tech.slug}
          />
          <span className="whitespace-nowrap text-xl font-medium tracking-tight transition-colors duration-300 group-hover/item:text-foreground sm:text-3xl">
            {tech.name}
          </span>
        </span>
      ))}
    </>
  );
}

export default function TechTicker() {
  const listRef = useRef<HTMLOListElement>(null);
  const half = Math.ceil(techStack.length / 2);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-skill-row]");

        gsap.set(rows, { autoAlpha: 0, y: 50 });
        gsap.set("[data-row-rule]", { scaleX: 0 });

        ScrollTrigger.batch(rows, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.09, duration: 1 });
            gsap.to(
              batch.map((row) => row.querySelector("[data-row-rule]")),
              { scaleX: 1, stagger: 0.09, duration: 1.4, ease: "signalInOut" },
            );
          },
        });
      });
    },
    { scope: listRef },
  );

  return (
    <section className="scroll-mt-12 py-24 sm:py-32" id="toolkit">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          description="The languages, platforms and practices I reach for when a service has to be fast, observable and hard to break."
          title="Toolkit"
        />
      </div>

      <div className="flex flex-col gap-5 sm:gap-7">
        <VelocityMarquee speed={38}>
          <LogoRow items={techStack.slice(0, half)} />
        </VelocityMarquee>
        <VelocityMarquee reverse speed={38}>
          <LogoRow items={techStack.slice(half)} />
        </VelocityMarquee>
      </div>

      <ol ref={listRef} className="mx-auto mt-20 max-w-7xl px-4 sm:mt-28 sm:px-6">
        {skillGroups.map((group) => (
          <li key={group.title} className="group relative" data-skill-row>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px origin-left bg-default-200"
              data-row-rule
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-left scale-x-0 bg-content2 transition-transform duration-700 ease-signal group-hover:scale-x-100"
            />
            <div className="relative grid gap-4 py-7 sm:py-9 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-baseline lg:gap-10">
              <h3 className="flex items-center gap-4 text-2xl font-semibold tracking-tight transition-transform duration-700 ease-signal group-hover:translate-x-3 sm:text-4xl">
                <span className="text-secondary transition-transform duration-700 ease-signal group-hover:rotate-[-12deg] group-hover:scale-110">
                  {GROUP_ICONS[group.title]}
                </span>
                {group.title}
              </h3>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-base text-default-500 sm:text-lg">
                {group.items.map((item, i) => (
                  <li
                    key={item}
                    className="transition-colors duration-300 group-hover:text-foreground"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
        <li aria-hidden="true" className="h-px bg-default-200" />
      </ol>
    </section>
  );
}
