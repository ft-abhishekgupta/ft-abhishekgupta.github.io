import type Lenis from "lenis";

/**
 * Tiny app-wide signals shared by the motion chrome:
 *  - intro: resolves once the first-load preloader has lifted, so the hero can
 *    choreograph its entrance against it.
 *  - lenis: the active smooth-scroll instance (null when reduced motion is on).
 */
let introDone = false;
const introSubs = new Set<() => void>();

export const intro = {
  isDone: () => introDone,
  finish() {
    if (introDone) return;
    introDone = true;
    introSubs.forEach((fn) => fn());
    introSubs.clear();
  },
  onDone(fn: () => void) {
    if (introDone) {
      fn();
      return () => {};
    }
    introSubs.add(fn);
    return () => {
      introSubs.delete(fn);
    };
  },
};

/** Seconds a route's loading scene plays before its overlay lifts away. */
export const SCENE_HOLD = 1.3;

/** Extra delay for on-mount entrances so they play as the loader lifts. */
export const entranceDelay = () => (navigated ? SCENE_HOLD + 0.25 : 0.1);

let lenisInstance: Lenis | null = null;

/** True once the visitor has made at least one client-side route change. */
let navigated = false;

export const markNavigated = () => {
  navigated = true;
};

export const hasNavigated = () => navigated;

export const setLenis = (lenis: Lenis | null) => {
  lenisInstance = lenis;
};

export const getLenis = () => lenisInstance;

/** Scroll to the top instantly, through Lenis when it is driving the page. */
export function resetScroll() {
  if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
