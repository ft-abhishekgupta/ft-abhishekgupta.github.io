import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import LoaderScene from "@/components/loaders/LoaderScene";
import type { LoaderData } from "@/lib/loader";
import { intro, LOADER_EXIT, SCENE_HOLD } from "@/lib/motion";

const SEEN_KEY = "ag-intro-seen";

/**
 * First-visit loading screen (once per session), showing the scene for
 * whichever page the visitor landed on. Server-rendered so it covers the very
 * first paint; repeat visits and reduced-motion users are filtered out by the
 * inline script in _document before hydration, so it never flashes.
 */
export default function Preloader({ loader }: { loader?: LoaderData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);
  // Freeze the landing route so a fast click can't swap the scene mid-play.
  const [pathname] = useState(useRouter().pathname);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;

    if (!root || html.dataset.intro === "skip") {
      intro.finish();
      setMounted(false);
      return;
    }

    html.style.overflow = "hidden";

    const finish = () => {
      html.style.overflow = "";
      html.dataset.intro = "skip";
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage may be unavailable (private mode) */
      }
      setMounted(false);
    };

    // The scene's CSS animations started at first paint, not at hydration,
    // so hold only for whatever is left of the scene. The lift itself is a CSS
    // transition so it stays smooth even if the main thread is still busy.
    const paint =
      performance.getEntriesByName("first-contentful-paint")[0]?.startTime ??
      performance.getEntriesByName("first-paint")[0]?.startTime ??
      0;
    const elapsed = (performance.now() - paint) / 1000;
    const hold = Math.max(0.1, SCENE_HOLD + 0.2 - elapsed);
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        root.classList.add("is-lifting");
        // Release the page entrance midway so the header animates as it is uncovered.
        timers.push(setTimeout(() => intro.finish(), LOADER_EXIT * 450));
        timers.push(setTimeout(finish, LOADER_EXIT * 1000 + 80));
      }, hold * 1000),
    );

    return () => {
      timers.forEach(clearTimeout);
      html.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="preloader fixed inset-0 z-[100] overflow-hidden"
    >
      <div className="h-full w-full">
        <LoaderScene data={loader} pathname={pathname} />
      </div>
    </div>
  );
}
