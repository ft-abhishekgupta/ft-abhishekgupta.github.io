import { useRef } from "react";

import { profile } from "@/config/resume";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";

/**
 * The summary, read at the reader's pace: the section pins and each word
 * lights up as the scroll passes over it.
 */
export default function Statement() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-statement]", { type: "words" });

        gsap.set(split.words, { opacity: 0.14 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=130%",
            pin: true,
            scrub: 0.5,
          },
        });

        tl.to(split.words, { opacity: 1, stagger: 0.1, ease: "none", duration: 0.4 })
          .from("[data-pulse-rule]", { scaleX: 0, ease: "none", duration: 2 }, 0);

        return () => split.revert();
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      aria-label="About"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <p
          className="max-w-6xl text-[clamp(2rem,5.2vw,4.75rem)] font-medium leading-[1.06] tracking-[-0.03em]"
          data-statement
        >
          {profile.summary}
        </p>
        <div className="mt-12 flex items-center gap-4 text-sm text-default-400">
          <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />
          <span
            aria-hidden="true"
            className="h-px flex-1 origin-left bg-gradient-to-r from-secondary to-transparent"
            data-pulse-rule
          />
        </div>
      </div>
    </section>
  );
}
