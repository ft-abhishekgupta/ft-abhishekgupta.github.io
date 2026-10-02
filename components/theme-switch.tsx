import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";
import { flushSync } from "react-dom";

import { MoonFilledIcon, SunFilledIcon } from "@/components/icons";
import { prefersReducedMotion } from "@/lib/gsap";

export interface ThemeSwitchProps {
  className?: string;
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/**
 * Theme toggle that floods the new palette outward from the button as an
 * expanding circle (View Transitions API), falling back to an instant swap.
 */
export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-10 w-10" />;

  const isDark = resolvedTheme !== "light";
  const next = isDark ? "light" : "dark";

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as ViewTransitionDoc;

    if (!doc.startViewTransition || prefersReducedMotion()) {
      setTheme(next);
      return;
    }

    const x = e.clientX || window.innerWidth - 40;
    const y = e.clientY || 32;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = doc.startViewTransition(() => {
      const root = document.documentElement;

      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.76, 0, 0.24, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      aria-label={`Switch to ${next} theme`}
      className={
        "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-default-500 transition-colors hover:text-foreground " +
        (className ?? "")
      }
      type="button"
      onClick={toggle}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={isDark ? "moon" : "sun"}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -24, rotate: 90, opacity: 0 }}
          initial={{ y: 24, rotate: -90, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {isDark ? <MoonFilledIcon size={20} /> : <SunFilledIcon size={20} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
