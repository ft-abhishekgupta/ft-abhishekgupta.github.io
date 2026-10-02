import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";

import LoaderScene, { SCENE_HOLD } from "@/components/loaders/LoaderScene";
import { ScrollTrigger } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";
import { hasNavigated, markNavigated, resetScroll } from "@/lib/motion";

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

  return (
    <motion.div
      animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
      aria-hidden="true"
      className="fixed inset-0 z-[91]"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={reduce ? { duration: 0 } : { duration: 0.85, ease: EASE, delay: SCENE_HOLD }}
      onAnimationComplete={() => setDone(true)}
    >
      {!reduce && <LoaderScene data={data} pathname={pathname} />}
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
