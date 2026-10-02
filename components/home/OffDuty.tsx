import NextLink from "next/link";
import { useRef } from "react";

import { ArrowIcon, SectionHeading } from "@/components/home/primitives";
import VelocityMarquee from "@/components/motion/VelocityMarquee";
import SmartImage from "@/components/SmartImage";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

export interface OffDutyData {
  playing: { name: string; imageUrl: string }[];
  playedCount: number;
  movies: { name: string; imageUrl: string }[];
  watchedCount: number;
  clicks: string[];
  clicksCount: number;
  places: { name: string; country: string; image: string }[];
  citiesCount: number;
  countriesCount: number;
}

const tileClass =
  "spotlight group relative flex h-full w-full overflow-hidden rounded-[1.75rem] border border-default-200/70 bg-content1 transition-colors duration-500 hover:border-secondary/60";

function TileLabel({ kicker, title, meta }: { kicker: string; title: string; meta?: string }) {
  return (
    <div className="relative z-10 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm text-default-400">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          {kicker}
        </p>
        <p className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{title}</p>
        {meta && <p className="mt-1 text-sm text-default-500">{meta}</p>}
      </div>
      <span className="flex h-11 w-11 shrink-0 -rotate-45 items-center justify-center rounded-full border border-default-200 transition-all duration-500 ease-signal group-hover:rotate-0 group-hover:border-secondary group-hover:bg-secondary group-hover:text-signal-ink">
        <ArrowIcon className="h-4 w-4" />
      </span>
    </div>
  );
}

/**
 * Life outside work, pulled from the same daily-synced feeds as the
 * collection pages: what's in the console, on the screen, through the lens
 * and on the map. Each tile keeps moving while it's on screen.
 */
export default function OffDuty({ data }: { data: OffDutyData }) {
  const rootRef = useRef<HTMLElement>(null);
  const covers = data.playing.slice(0, 3);
  const place = data.places[0];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const tiles = gsap.utils.toArray<HTMLElement>("[data-duty]");

        gsap.set(tiles, { autoAlpha: 0, y: 60, scale: 0.96 });
        ScrollTrigger.batch(tiles, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.1, duration: 1.1 }),
        });

        // Cover fan breathes; photos cross-fade with a slow push-in; the
        // destination name flips through every place on the list.
        const loops: gsap.core.Animation[] = [];

        loops.push(
          gsap.to("[data-cover]", {
            y: (i: number) => [-8, -16, -8][i] ?? -8,
            duration: 2.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: 0.3,
          }),
        );

        const frames = gsap.utils.toArray<HTMLElement>("[data-frame]");

        if (frames.length > 1) {
          const show = gsap.timeline({ repeat: -1 });

          frames.forEach((frame, i) => {
            const next = frames[(i + 1) % frames.length];

            show
              .fromTo(frame, { scale: 1.02 }, { scale: 1.14, duration: 3, ease: "none" })
              .to(frame, { autoAlpha: 0, duration: 0.8, ease: "power1.inOut" }, "-=0.8")
              .fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" }, "<");
          });
          loops.push(show);
        }

        const placeEl = rootRef.current?.querySelector<HTMLElement>("[data-place]");
        const metaEl = rootRef.current?.querySelector<HTMLElement>("[data-place-meta]");

        if (placeEl && data.places.length > 1) {
          const cycle = gsap.timeline({ repeat: -1 });

          data.places.slice(1).concat(data.places[0]).forEach((p) => {
            cycle
              .to(placeEl, { duration: 0.9, scrambleText: { text: p.name, chars: "upperCase", speed: 0.6 } }, "+=2.2")
              .call(() => {
                if (metaEl) metaEl.textContent = p.country;
              });
          });
          loops.push(cycle);
        }

        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l.resume() : l.pause())),
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="py-24 sm:py-32" id="off-duty">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          description="What I'm playing, watching, shooting and where I've been, synced from my profiles every day."
          title="Off the clock"
        />

        <div className="grid gap-4 lg:auto-rows-[19rem] lg:grid-cols-12">
          {/* Now playing */}
          <div className="min-w-0 lg:col-span-5 lg:row-span-2" data-duty>
            <NextLink className={`${tileClass} min-h-[26rem] flex-col justify-between p-6 sm:p-8`} data-cursor="Games" href="/games">
              <div className="relative mx-auto mt-4 h-64 w-full max-w-sm flex-1 lg:mt-10 [--spread:62%] [--tilt:8deg] group-hover:[--spread:80%] group-hover:[--tilt:12deg] sm:h-80">
                {covers.map((c, i) => (
                  <div
                    key={c.name}
                    className="absolute left-1/2 top-0 w-36 transition-transform duration-700 ease-signal sm:w-44"
                    style={{
                      transform: `translateX(calc(-50% + ${i - 1} * var(--spread))) rotate(calc(${i - 1} * var(--tilt)))`,
                      zIndex: i === 1 ? 3 : 1,
                    }}
                  >
                    <div
                      className="overflow-hidden rounded-xl shadow-2xl shadow-black/50"
                      data-cover
                    >
                      <SmartImage
                        alt={c.name}
                        className="aspect-[3/4] w-full object-cover"
                        src={c.imageUrl}
                        wrapperClassName="aspect-[3/4] w-full transition-transform duration-700 ease-signal group-hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <TileLabel
                kicker="Now playing"
                meta={`${data.playedCount} games finished so far`}
                title={covers.map((c) => c.name).slice(0, 2).join(" and ") || "Games"}
              />
            </NextLink>
          </div>

          {/* Recently watched */}
          <div className="min-w-0 lg:col-span-7" data-duty>
            <NextLink className={`${tileClass} min-h-[19rem] flex-col justify-between py-6 sm:py-8`} data-cursor="Movies" href="/movies">
              <VelocityMarquee copies={3} speed={28}>
                {data.movies.map((m) => (
                  <div key={m.name} className="mr-3 w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
                    <SmartImage
                      alt={m.name}
                      className="aspect-[2/3] w-full object-cover"
                      src={m.imageUrl}
                      wrapperClassName="aspect-[2/3] w-full"
                    />
                  </div>
                ))}
              </VelocityMarquee>
              <div className="px-6 sm:px-8">
                <TileLabel
                  kicker="Recently watched"
                  meta={`${data.watchedCount} films logged`}
                  title={data.movies[0]?.name ?? "Movies"}
                />
              </div>
            </NextLink>
          </div>

          {/* Latest frames */}
          <div className="min-w-0 lg:col-span-4" data-duty>
            <NextLink className={`${tileClass} min-h-[19rem] flex-col justify-end p-6 sm:p-8`} data-cursor="Clicks" href="/clicks">
              <div className="absolute inset-0">
                {data.clicks.map((src, i) => (
                  <div
                    key={src}
                    className="absolute inset-0"
                    data-frame
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    <SmartImage alt="" className="h-full w-full object-cover" src={src} wrapperClassName="h-full w-full" />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-signal-ink via-signal-ink/30 to-transparent" />
              </div>
              <div className="text-[#E8ECF5] [&_p]:!text-[#E8ECF5]/80">
                <TileLabel kicker="Latest frames" meta={`${data.clicksCount} photos`} title="Clicks" />
              </div>
            </NextLink>
          </div>

          {/* Places */}
          <div className="min-w-0 lg:col-span-3" data-duty>
            <NextLink className={`${tileClass} min-h-[19rem] flex-col justify-end p-6 sm:p-8`} data-cursor="Travel" href="/travel">
              {place && (
                <div className="absolute inset-0">
                  <SmartImage
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[2s] ease-signal group-hover:scale-110"
                    src={place.image}
                    wrapperClassName="h-full w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-signal-ink via-signal-ink/40 to-transparent" />
                </div>
              )}
              <div className="relative z-10 text-[#E8ECF5]">
                <p className="flex items-center gap-2 text-sm text-[#E8ECF5]/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Been to
                </p>
                <p className="mt-1 truncate font-mono text-2xl font-semibold uppercase tracking-tight" data-place>
                  {place?.name ?? "Travel"}
                </p>
                <p className="text-sm text-[#E8ECF5]/70" data-place-meta>
                  {place?.country}
                </p>
                <p className="mt-4 text-sm text-[#E8ECF5]/70">
                  {data.citiesCount} cities in {data.countriesCount} countries
                </p>
              </div>
            </NextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
