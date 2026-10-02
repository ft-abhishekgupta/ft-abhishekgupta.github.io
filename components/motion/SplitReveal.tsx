import React, { useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { entranceDelay, intro } from "@/lib/motion";

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

      mm.add(MOTION_OK, () => {
        const el = ref.current;

        if (!el) return;

        const split = SplitText.create(el, {
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
              yPercent: 115,
              rotate: type === "lines" ? 0 : 6,
              duration: 1.1,
              stagger,
              delay,
            };

            if (start) {
              return gsap.from(targets, {
                ...vars,
                scrollTrigger: { trigger: el, start, once: true },
              });
            }

            // On-mount reveals wait for the page's loading screen to lift.
            const tween = gsap.from(targets, { ...vars, paused: true });

            intro.onDone(() => tween.delay(delay + entranceDelay()).play());

            return tween;
          },
        });

        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return React.createElement(Tag, { ref, className, ...rest }, children);
}
