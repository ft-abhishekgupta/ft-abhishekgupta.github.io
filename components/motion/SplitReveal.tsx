import React, { useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { playEntrance } from "@/lib/motion";

type Props = {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  /** Split granularity; each piece rises out of its own mask. */
  type?: "lines" | "words" | "chars";
  stagger?: number;
  delay?: number;
  /** ScrollTrigger start; pass null to play immediately on mount. */
  start?: string | null;
} & Omit<React.HTMLAttributes<HTMLElement>, "children">;

/**
 * The site's single entrance pattern for type: text rises out of a mask,
 * line by line (or word/char), once it scrolls into view. Re-splits itself
 * when fonts load or the viewport reflows.
 */
export default function SplitReveal({
  as: Tag = "div",
  children,
  className,
  type = "lines",
  stagger = 0.08,
  delay = 0,
  start = "top 88%",
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, (context) => {
        const el = ref.current;

        if (!el) return;

        let split: SplitText | null = null;
        let current: gsap.core.Tween | null = null;
        let scheduled = false;
        let started = false;
        let cancelEntrance = () => {};
        let cancelled = false;

        const build = () => {
          split = SplitText.create(el, {
            type: type === "lines" ? "lines" : type === "words" ? "words,lines" : "chars,words",
            mask: type,
            linesClass: "split-line",
            wordsClass: "split-word",
            charsClass: "split-char",
            autoSplit: true,
            onSplit(self) {
              const targets =
                type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
              const vars: gsap.TweenVars = {
                yPercent: 110,
                opacity: 0,
                duration: type === "chars" ? 1.3 : 1.15,
                ease: "power4.out",
                stagger,
              };

              gsap.set(el, { visibility: "visible" });

              if (start) {
                return gsap.from(targets, {
                  ...vars,
                  delay,
                  scrollTrigger: { trigger: el, start, once: true },
                });
              }

              // On-mount reveals wait for the loader, fonts and a quiet main
              // thread. Re-splits (resize) swap the tween without rescheduling.
              const tween = gsap.from(targets, { ...vars, paused: true });

              current = tween;
              if (!scheduled) {
                scheduled = true;
                cancelEntrance = playEntrance({
                  play: () => {
                    started = true;
                    current?.play();
                  },
                }, delay);
              } else if (started) {
                tween.play();
              }

              return tween;
            },
          });
        };

        // Split against the final webfont so line breaks never shift mid-tween.
        (document.fonts?.ready ?? Promise.resolve()).then(() => {
          if (!cancelled) context.add(build);
        });

        return () => {
          cancelled = true;
          cancelEntrance();
          split?.revert();
        };
      });
    },
    { scope: ref },
  );

  // Immediate (on-mount) reveals start hidden so the server-rendered text
  // doesn't flash before being split; CSS only applies this when motion is on.
  return React.createElement(
    Tag,
    { ref, className, ...(start ? {} : { "data-intro-hide": "" }), ...rest },
    children,
  );
}
