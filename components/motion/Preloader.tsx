import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import LoaderScene, { SCENE_HOLD } from "@/components/loaders/LoaderScene";
import { gsap } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";
import { intro } from "@/lib/motion";

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

    const tl = gsap
      .timeline({ delay: SCENE_HOLD + 0.2, onComplete: finish })
      .add(() => intro.finish())
      .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "signalInOut" }, 0.1);

    return () => {
      tl.kill();
      html.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="preloader fixed inset-0 z-[100]"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <LoaderScene data={loader} pathname={pathname} />
    </div>
  );
}
