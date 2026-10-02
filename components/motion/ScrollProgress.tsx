import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Hairline amber progress bar pinned to the top edge of the viewport. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const bar = barRef.current;

    if (!bar) return;

    const setScale = gsap.quickSetter(bar, "scaleX");
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScale(self.progress),
    });

    setScale(0);

    return () => st.kill();
  }, [router.pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left scale-x-0 bg-gradient-to-r from-primary via-primary to-secondary"
    />
  );
}
