import { Reveal, TechLogo } from "@/components/home/primitives";
import { skillGroups, techStack, type Tech } from "@/config/resume";
import React from "react";

const ICON_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  className: "h-5 w-5",
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

const ACCENTS = [
  "border-sky-500/25 bg-sky-500/10 text-sky-400",
  "border-cyan-500/25 bg-cyan-500/10 text-cyan-400",
  "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  "border-amber-500/25 bg-amber-500/10 text-amber-400",
  "border-rose-500/25 bg-rose-500/10 text-rose-400",
  "border-violet-500/25 bg-violet-500/10 text-violet-400",
];

function TickerRow({
  items,
  reverse = false,
}: {
  items: Tech[];
  reverse?: boolean;
}) {
  // Four copies keep the strip wider than any viewport, so the -50% loop never
  // exposes a gap on ultra-wide screens.
  const loop = [...items, ...items, ...items, ...items];

  return (
    <div className="marquee-viewport group flex overflow-hidden">
      <div
        className={`flex w-max shrink-0 items-center ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        } group-hover:[animation-play-state:paused]`}
      >
        {loop.map((tech, i) => (
          <span
            key={`${tech.slug}-${i}`}
            className="group/item flex select-none items-center gap-3 px-5 text-default-400 transition-colors duration-300 sm:px-7"
            style={{ ["--brand" as string]: tech.color }}
          >
            <TechLogo
              className="h-7 w-7 transition-colors duration-300 group-hover/item:text-[var(--brand)] sm:h-8 sm:w-8"
              slug={tech.slug}
            />
            <span className="whitespace-nowrap text-sm font-medium transition-colors duration-300 group-hover/item:text-foreground sm:text-base">
              {tech.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TechTicker() {
  const half = Math.ceil(techStack.length / 2);

  return (
    <section className="scroll-mt-12" id="toolkit">
      {/* Logo marquee band */}
      <div className="border-y border-default-100 bg-default-50/40 py-10">
        <Reveal className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-default-400">
            Tools I reach for
          </p>
        </Reveal>

        <div className="flex flex-col gap-6">
          <TickerRow items={techStack.slice(0, half)} />
          <TickerRow reverse items={techStack.slice(half)} />
          <div className="mx-auto mt-6 grid w-full max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {skillGroups.map((group, i) => (
              <Reveal key={group.title} className="h-full" delay={i * 0.07}>
                <div className="group flex h-full flex-col rounded-2xl border border-default-200/70 bg-content1/60 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        ACCENTS[i % ACCENTS.length]
                      }`}
                    >
                      {GROUP_ICONS[group.title]}
                    </span>
                    <h3 className="text-sm font-bold leading-tight">
                      {group.title}
                    </h3>
                  </div>

                  <ul className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-default-200/60 bg-default-100/60 px-2 py-1 text-[11px] font-medium text-default-500 transition-colors group-hover:border-default-300/60"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
