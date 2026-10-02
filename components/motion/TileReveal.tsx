import { useEffect } from "react";

import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Rises grid tiles (`.tile-reveal`) into place the first time they scroll into
 * view. A single observer flags each tile once with `data-in` and stops
 * watching it, so revealed tiles cost nothing per frame (the previous CSS
 * scroll-timeline version kept hundreds of timelines live while idle).
 * The flag is an attribute rather than a class so React re-renders of the
 * tile's className can't reset it.
 */
export default function TileReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const html = document.documentElement;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const io = new IntersectionObserver(
      (entries) => {
        let i = 0;

        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;

          io.unobserve(el);
          // Tiles arriving together cascade slightly instead of popping at once.
          el.style.transitionDelay = `${Math.min(i++ * 45, 315)}ms`;
          el.dataset.in = "";
          const t = setTimeout(() => {
            el.style.transitionDelay = "";
            timers.delete(t);
          }, 1300);

          timers.add(t);
        });
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    const watch = (root: ParentNode) =>
      root.querySelectorAll?.<HTMLElement>(".tile-reveal:not([data-in])").forEach((el) => io.observe(el));

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches(".tile-reveal:not([data-in])")) io.observe(n);
          watch(n);
        }),
      );
    });

    html.classList.add("tile-reveal-on");
    watch(document);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      timers.forEach(clearTimeout);
      html.classList.remove("tile-reveal-on");
    };
  }, []);

  return null;
}
