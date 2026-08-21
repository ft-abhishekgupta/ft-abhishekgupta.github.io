import { ArrowIcon, Reveal, SectionHeading } from "@/components/home/primitives";
import { highlights } from "@/config/resume";
import NextLink from "next/link";

export default function Highlights() {
  return (
    <section
      className="relative isolate scroll-mt-6 overflow-hidden py-14 sm:py-16"
      id="work"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-secondary/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          description="Things I've designed, built and shipped on my own time — from Android apps to smart contracts."
          eyebrow="Personal work"
          title="Projects"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, i) => {
            const external = Boolean(item.href);

            const inner = (
              <>
                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary via-cyan-400 to-secondary opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-50" />

                <div className="relative flex h-full flex-col rounded-2xl border border-default-200/70 bg-content1 p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary">
                      {item.metric}
                    </span>
                    {external && (
                      <ArrowIcon className="h-4 w-4 -rotate-45 text-default-400 transition-all duration-300 group-hover:rotate-0 group-hover:text-primary" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold leading-snug transition-colors duration-300 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-default-400">
                    {item.role}
                  </p>

                  <p className="mt-3 flex-grow text-sm leading-relaxed text-default-500">
                    {item.blurb}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5 border-t border-default-100 pt-4">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-default-100 px-2 py-0.5 text-[11px] font-medium text-default-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            );

            const className =
              "group relative block h-full rounded-2xl transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.015]";

            return (
              <Reveal key={item.title} className="h-full" delay={(i % 3) * 0.08}>
                {external ? (
                  <a
                    className={className}
                    href={item.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={className}>{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 text-center" delay={0.1}>
          <NextLink
            className="group inline-flex items-center gap-2 rounded-full border border-default-200 px-5 py-2.5 text-sm font-semibold text-default-600 transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
            href="/projects"
          >
            Browse every project
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </NextLink>
        </Reveal>
      </div>
    </section>
  );
}
