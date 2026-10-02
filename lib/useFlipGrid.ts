import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { Flip, gsap, prefersReducedMotion } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * FLIP-animates a grid whenever `items` changes: survivors glide to their new
 * slots, newcomers pop in. Wrap any state setter that reorders/filters the
 * grid with the returned `withFlip` so the "before" layout is captured first.
 * Children opt in with a stable `data-flip-id`.
 */
export function useFlipGrid(ref: RefObject<HTMLElement>, items: unknown) {
  const state = useRef<Flip.FlipState | null>(null);

  const capture = useCallback(() => {
    if (!ref.current || prefersReducedMotion()) return;
    state.current = Flip.getState(ref.current.querySelectorAll("[data-flip-id]"));
  }, [ref]);

  useIsoLayoutEffect(() => {
    const before = state.current;

    state.current = null;
    if (!before || !ref.current) return;

    const flip = Flip.from(before, {
      targets: ref.current.querySelectorAll("[data-flip-id]"),
      duration: 0.7,
      ease: "signal",
      stagger: { amount: 0.25 },
      simple: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 0.5, stagger: { amount: 0.35 } },
        ),
    });

    return () => {
      flip.progress(1).kill();
    };
  }, [items, ref]);

  return useCallback(
    <A extends unknown[]>(fn: (...args: A) => void) =>
      (...args: A) => {
        capture();
        fn(...args);
      },
    [capture],
  );
}
