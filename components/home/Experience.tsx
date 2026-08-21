import { Reveal, SectionHeading } from "@/components/home/primitives";
import { achievements, timeline } from "@/config/resume";

export default function Experience() {
  return (
    <section
      className="mx-auto max-w-6xl scroll-mt-6 px-4 py-14 sm:px-6 sm:py-16"
      id="experience"
    >
      <SectionHeading
        eyebrow="Journey"
        title="Experience"
        description="Six years of shipping high-scale systems and the schooling that got me there."
      />

      <ol className="relative mx-auto max-w-3xl">
        {timeline.map((entry, i) => {
          const isWork = entry.kind === "work";

          return (
            <li
              key={`${entry.org}-${entry.period}`}
              className="grid grid-cols-[1.5rem_1fr] gap-x-4 pb-10 last:pb-0 sm:grid-cols-[2rem_1fr] sm:gap-x-6"
            >
              {/* Rail */}
              <div className="relative flex justify-center">
                {i < timeline.length - 1 && (
                  <span className="absolute bottom-[-2.5rem] top-7 w-px bg-gradient-to-b from-default-200 to-default-100" />
                )}
                <span
                  className={`relative z-10 mt-2 h-3.5 w-3.5 rounded-full ring-4 ring-background ${
                    isWork
                      ? "bg-primary shadow-[0_0_0_3px_rgba(56,189,248,0.18)]"
                      : "bg-default-300"
                  }`}
                />
              </div>

              <Reveal delay={i * 0.06}>
                <article className="group rounded-2xl border border-default-200/70 bg-content1/60 p-5 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-content1 hover:shadow-xl hover:shadow-primary/5 sm:p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-xs tracking-tight text-primary">
                      {entry.period}
                    </span>
                    {entry.location && (
                      <span className="text-xs text-default-400">
                        · {entry.location}
                      </span>
                    )}
                    {entry.meta && (
                      <span className="rounded-full bg-default-100 px-2 py-0.5 text-[11px] font-medium text-default-500">
                        {entry.meta}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary sm:text-xl">
                    {entry.role}
                  </h3>
                  <p className="mt-0.5 text-sm text-default-500">{entry.org}</p>

                  <ul className="mt-4 space-y-2.5">
                    {entry.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-sm leading-relaxed text-default-500"
                      >
                        <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  {entry.tags && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-default-200 px-2 py-0.5 text-[11px] font-medium text-default-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>

      <Reveal className="mx-auto mt-12 max-w-3xl" delay={0.1}>
        <div className="flex flex-wrap justify-center gap-2">
          {achievements.map((item) => (
            <span
              key={item}
              className="rounded-full border border-default-200/70 bg-default-50/60 px-3.5 py-1.5 text-xs font-medium text-default-500 transition-colors hover:border-primary/40 hover:text-primary"
            >
              ★ {item}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
