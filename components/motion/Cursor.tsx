import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

type CursorState = "default" | "link" | "label" | "hidden";

const INTERACTIVE = "a, button, [role='button'], [role='tab'], label, select, summary";
const TEXT_INPUT = "input, textarea, [contenteditable='true']";

/**
 * Two-part pointer: an amber dot that tracks 1:1 and a ring that trails with
 * spring-like lag. Hovering links grows the ring; elements with
 * `data-cursor="Label"` swap it for a filled label disc. Only enabled for fine
 * pointers with motion allowed — touch and reduced-motion users keep the OS
 * cursor.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;

    if (!dot || !ring || !label) return;
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion())
      return;

    document.documentElement.classList.add("has-cursor");

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    let visible = false;

    const setState = (state: CursorState, text = "") => {
      ring.dataset.state = state;
      label.textContent = text;
      gsap.to(dot, {
        scale: state === "default" ? 1 : 0,
        duration: 0.25,
        overwrite: "auto",
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      const spot = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(".spotlight");

      if (spot) {
        const r = spot.getBoundingClientRect();

        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      const tilt = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-tilt]") ?? null;

      if (tilt !== tilted) {
        untilt();
        tilted = tilt;
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;

        tilt.classList.add("is-tilting");
        tilt.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
        tilt.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
        tilt.style.setProperty("--gx", `${px * 100}%`);
        tilt.style.setProperty("--gy", `${py * 100}%`);
      }
    };

    let tilted: HTMLElement | null = null;
    const untilt = () => {
      if (!tilted) return;
      tilted.classList.remove("is-tilting");
      tilted.style.removeProperty("--rx");
      tilted.style.removeProperty("--ry");
      tilted = null;
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;

      if (!target?.closest) return;
      if (target.closest(TEXT_INPUT)) return setState("hidden");

      const labelled = target.closest<HTMLElement>("[data-cursor]");

      if (labelled) return setState("label", labelled.dataset.cursor ?? "");
      if (target.closest(INTERACTIVE)) return setState("link");
      setState("default");
    };

    const onLeave = () => {
      visible = false;
      untilt();
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    };

    const onDown = () => gsap.to(ring, { scale: 0.82, duration: 0.15 });
    const onUp = () =>
      gsap.to(ring, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const reset = () => setState("default");

    router.events.on("routeChangeStart", reset);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      router.events.off("routeChangeStart", reset);
    };
  }, [router.events]);

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" data-state="default">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
    </>
  );
}
