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

/** Duration of the loader's lift-off once the scene finishes. */
export const LOADER_EXIT = 0.8;

/**
 * Delay (from mount) before on-mount entrances start. After a route change
 * this lands when the lifting loader uncovers the top of the page, so the
 * header's motion is seen from its first frame instead of under the overlay.
 */
export const entranceDelay = () => (navigated ? SCENE_HOLD + LOADER_EXIT * 0.5 : 0);

let fontsReady: Promise<unknown> | null = null;

/** Resolves once webfonts are in and the main thread has a quiet moment. */
function settled() {
  fontsReady ??= document.fonts?.ready ?? Promise.resolve();

  return fontsReady.then(
    () =>
      new Promise<void>((resolve) => {
        const idle = (window as Window & {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
        }).requestIdleCallback;

        if (idle) idle(() => requestAnimationFrame(() => resolve()), { timeout: 300 });
        else setTimeout(() => requestAnimationFrame(() => resolve()), 50);
      }),
  );
}

/**
 * Plays a paused entrance animation at the right moment: after the loading
 * screen is out of the way, fonts have swapped in (so split text never
 * re-flows mid-animation) and hydration has stopped hogging the main thread
 * (so the first frames aren't dropped). Returns a cancel function.
 */
export function playEntrance(anim: { play: () => unknown }, extraDelay = 0) {
  const mountedAt = performance.now();
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const unsubscribe = intro.onDone(() => {
    const target = entranceDelay() * 1000 + extraDelay * 1000;

    settled().then(() => {
      if (cancelled) return;
      const wait = Math.max(0, target - (performance.now() - mountedAt));

      timer = setTimeout(() => !cancelled && anim.play(), wait);
    });
  });

  return () => {
    cancelled = true;
    unsubscribe();
    clearTimeout(timer);
  };
}

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
