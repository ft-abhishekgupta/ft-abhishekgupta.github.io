import clsx from "clsx";
import { useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis } from "@/lib/motion";

const gauss = (p: number, mu: number, sigma: number) =>
  Math.exp(-((p - mu) ** 2) / (2 * sigma * sigma));

/** One heartbeat as a sum of gaussians: P-wave, QRS complex, T-wave. */
function beat(p: number) {
  return (
    0.1 * gauss(p, 0.3, 0.025) -
    0.14 * gauss(p, 0.425, 0.007) +
    1 * gauss(p, 0.45, 0.009) -
    0.3 * gauss(p, 0.475, 0.008) +
    0.2 * gauss(p, 0.62, 0.04)
  );
}

/**
 * The site's signature motif: a live monitoring trace that keeps a steady
 * rhythm. Scrolling quickens the pulse; the pointer injects interference where
 * it hovers. It is decorative, so it pauses offscreen and freezes to a single
 * frame for reduced-motion users.
 */
export default function SignalTrace({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const reduce = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let color = "#FFB020";
    let phase = 0;
    let visible = true;
    let frame = 0;
    const pointer = { x: -9999, energy: 0 };
    const pulse = { speed: 1 };

    const readColor = () => {
      color = getComputedStyle(canvas).color || color;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColor();
    };

    const draw = (time: number) => {
      const period = Math.max(240, Math.min(w * 0.36, 420));
      const mid = h * 0.62;
      const amp = h * 0.52;

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();

      let headY = mid;

      for (let x = 0; x <= w; x += 2) {
        const p = (((x + phase) % period) + period) % period / period;
        const d = Math.abs(x - pointer.x);
        const near = Math.max(0, 1 - d / 140) * pointer.energy;
        const noise =
          near *
          (Math.sin(x * 0.21 + time * 23) * 0.6 + Math.sin(x * 0.07 - time * 11) * 0.4) *
          0.22;
        const y = mid - (beat(p) + noise) * amp;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        headY = y;
      }

      ctx.stroke();

      // Write head on the right edge, where the newest sample lands.
      ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(w - 2, headY, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (time: number, deltaTime: number) => {
      if (!visible || document.hidden) return;

      const lenis = getLenis();
      const velocity = Math.abs(lenis?.velocity ?? 0);
      const target = 1 + Math.min(velocity / 6, 4);

      pulse.speed += (target - pulse.speed) * 0.06;
      pointer.energy *= 0.96;
      phase += (Math.min(deltaTime, 64) / 1000) * 110 * pulse.speed;

      if (++frame % 60 === 0) readColor();
      draw(time);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();

      pointer.x = e.clientX - rect.left;
      pointer.energy = Math.min(1, pointer.energy + 0.12);
    };

    resize();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });

    ro.observe(canvas);

    if (reduce) {
      draw(0);
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });

    io.observe(canvas);

    const host = canvas.closest("section") ?? window;

    host.addEventListener("pointermove", onPointer as EventListener, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      host.removeEventListener("pointermove", onPointer as EventListener);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={clsx("block h-full w-full text-secondary", className)}
    />
  );
}
