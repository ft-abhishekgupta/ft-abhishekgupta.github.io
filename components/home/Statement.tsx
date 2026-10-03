import { useRef } from "react";

import { profile } from "@/config/resume";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";

/**
 * The summary, revealed once as it enters the viewport: lines rise out of
 * their masks while the words light up in a quick left-to-right wave. Plays on
 * time rather than being scrubbed, so it never holds the reader's scroll.
 */
export default function Statement() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    (context) => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const el = rootRef.current?.querySelector<HTMLElement>("[data-statement]");

        if (!el) return;

        let split: SplitText | null = null;
        let cancelled = false;

        const build = () => {
          split = SplitText.create(el, {
            type: "words,lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              const tl = gsap.timeline({
                scrollTrigger: { trigger: el, start: "top 75%", once: true },
              });

              tl.from(self.lines, { yPercent: 100, duration: 1, ease: "power4.out", stagger: 0.07 })
                .fromTo(
                  self.words,
                  { opacity: 0.14 },
                  { opacity: 1, duration: 0.5, ease: "power1.out", stagger: 0.035 },
                  0.15,
                )
                .from("[data-pulse-rule]", { scaleX: 0, duration: 1.2, ease: "signal" }, 0.4);

              return tl;
            },
          });
        };

        // Split against the final webfont so line breaks never shift mid-tween.
        (document.fonts?.ready ?? Promise.resolve()).then(() => {
          if (!cancelled) context.add(build);
        });

        return () => {
          cancelled = true;
          split?.revert();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-label="About" className="relative overflow-hidden py-24 sm:py-32">
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