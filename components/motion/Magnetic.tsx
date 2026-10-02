import clsx from "clsx";
import React, { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Pulls its child toward the pointer while hovered and springs back on leave.
 * The inner layer travels further than the shell, giving the label a little
 * parallax "follow-through" inside the button.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const shellRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const inner = innerRef.current;

    if (!shell || !inner) return;
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion())
      return;

    const xTo = gsap.quickTo(shell, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(shell, "y", { duration: 0.6, ease: "power3" });
    const ixTo = gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3" });
    const iyTo = gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);

      xTo(dx * strength);
      yTo(dy * strength);
      ixTo(dx * strength * 0.4);
      iyTo(dy * strength * 0.4);
    };

    const onLeave = () => {
      gsap.to([shell, inner], {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.35)",
        overwrite: true,
      });
    };

    shell.addEventListener("pointermove", onMove);
    shell.addEventListener("pointerleave", onLeave);

    return () => {
      shell.removeEventListener("pointermove", onMove);
      shell.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([shell, inner]);
    };
  }, [strength]);

  return (
    <span ref={shellRef} className={clsx("inline-block", className)}>
      <span ref={innerRef} className="block">
        {children}
      </span>
    </span>
  );
}
