import clsx from "clsx";
import React, { RefObject } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

export { SCENE_HOLD } from "@/lib/motion";

type Q = (selector: string) => HTMLElement[];

/**
 * Runs a scene's choreography once on mount, scoped to its root and gated on
 * motion preferences (reduced-motion users never see scenes play).
 */
export function useScene(
  ref: RefObject<HTMLElement>,
  build: (q: Q, root: HTMLElement) => void | (() => void),
) {
  useGSAP(
    () => {
      const root = ref.current;

      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => build(gsap.utils.selector(root) as Q, root));
    },
    { scope: ref },
  );
}

/** Full-bleed ink stage with a small orientation caption. */
export const SceneShell = React.forwardRef<
  HTMLDivElement,
  { caption: string; className?: string; children: React.ReactNode }
>(function SceneShell({ caption, className, children }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(
        "relative h-full w-full overflow-hidden bg-signal-ink text-[#E8ECF5]",
        className,
      )}
    >
      {children}
      <p
        className="absolute left-6 top-6 z-20 flex items-center gap-2 text-sm text-[#E8ECF5]/60 sm:left-10 sm:top-8"
        data-caption
      >
        <span className="h-2 w-2 rounded-full bg-signal-amber" />
        <span data-caption-text>{caption}</span>
      </p>
    </div>
  );
});
