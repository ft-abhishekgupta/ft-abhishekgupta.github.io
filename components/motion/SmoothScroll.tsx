import Lenis from "lenis";
import { useEffect } from "react";

import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { setLenis } from "@/lib/motion";

/** Elements that own their wheel/touch gestures (maps, dialogs, popovers). */
const PREVENT_SELECTOR = [
  "[data-lenis-prevent]",
  ".leaflet-container",
  "[role='dialog']",
  "[role='listbox']",
  "[data-slot='listbox']",
].join(",");

/**
 * Inertial smooth scrolling driven from GSAP's ticker so Lenis and
 * ScrollTrigger share one clock (no double rAF, no pin jitter).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.11,
      wheelMultiplier: 1,
      anchors: { offset: -24 },
      allowNestedScroll: true,
      prevent: (node) => Boolean(node.closest?.(PREVENT_SELECTOR)),
    });

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);

    gsap.ticker.add(tick);
    // Keep GSAP's default lag smoothing: after a long task (hydration, image
    // decode) tweens resume where they were instead of jumping ahead, which
    // is what made entrance animations skip most of their motion.

    // Late-arriving webfonts change line breaks and therefore trigger offsets.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
