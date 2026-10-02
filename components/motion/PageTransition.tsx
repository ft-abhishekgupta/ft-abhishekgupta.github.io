import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";

import LoaderScene from "@/components/loaders/LoaderScene";
import { ScrollTrigger } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";
import {
  hasNavigated,
  LOADER_EXIT,
  markNavigated,
  resetScroll,
  SCENE_HOLD,
} from "@/lib/motion";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The incoming page's loading screen: a route-specific scene that plays for
 * SCENE_HOLD seconds, then wipes upward off the new page. Only mounts after a
 * client-side navigation (the first visit is handled by the Preloader), and
 * unmounts once lifted so videos and tickers stop.
 */
function RouteLoader({ pathname, data }: { pathname: string; data?: LoaderData }) {
  const reduce = Boolean(useReducedMotion());
  const [done, setDone] = useState(() => !hasNavigated());

  if (done) return null;

  const lift = reduce
    ? { duration: 0 }
    : { duration: LOADER_EXIT, ease: EASE, delay: SCENE_HOLD };

  // Wipe via opposing translations (outer up, inner down) rather than an
  // animated clip-path: identical look, but it stays on the compositor instead
  // of repainting a full-screen scene every frame while the page header animates.
  return (
    <motion.div
      animate={{ y: "-100%" }}
      aria-hidden="true"
      className="fixed inset-0 z-[91] overflow-hidden will-change-transform"
      initial={{ y: "0%" }}
      transition={lift}
      onAnimationComplete={() => setDone(true)}
    >
      <motion.div
        animate={{ y: "100%" }}
        className="h-full w-full will-change-transform"
        initial={{ y: "0%" }}
        transition={lift}
      >
        {!reduce && <LoaderScene data={data} pathname={pathname} />}
      </motion.div>
    </motion.div>
  );
}

/**
 * Route transition: an ink panel rises to cover the outgoing page, then the
 * destination's own loading scene plays and lifts away. Keyed on pathname so
 * in-page hash jumps never trigger it.
 */
export default function PageTransition({
  children,
  loader,
}: {
  children: React.ReactNode;
  loader?: LoaderData;
}) {
  const router = useRouter();
  const reduce = Boolean(useReducedMotion());

  return (
    <AnimatePresence
      initial={false}
      mode="wait"
      onExitComplete={() => {
        markNavigated();
        resetScroll();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }}
    >
      <motion.div key={router.pathname}>
        {children}

        {/* Cover: rises from the bottom as the old page leaves */}
        <motion.div
          animate={{ scaleY: 0 }}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[90] origin-bottom bg-signal-ink"
          exit={{ scaleY: 1 }}
          initial={{ scaleY: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.55, ease: EASE }}
        />
        <RouteLoader data={loader} pathname={router.pathname} />
      </motion.div>
    </AnimatePresence>
  );
}
