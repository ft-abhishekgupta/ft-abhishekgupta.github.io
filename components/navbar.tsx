import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { GithubIcon } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";
import { getLenis } from "@/lib/motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Text that rolls to a duplicate of itself on hover. */
export function RollText({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      setScrolled(y > 12);
      if (Math.abs(y - last.current) < 6) return;
      setHidden(y > last.current && y > 160);
      last.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { hidden, scrolled };
}

export const Navbar = () => {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { hidden, scrolled } = useHideOnScroll();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);

    router.events.on("routeChangeStart", close);

    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  useEffect(() => {
    const lenis = getLenis();

    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        className="sticky top-0 z-50 w-full"
        initial={false}
        transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
      >
        <div
          className={clsx(
            "transition-[background-color,border-color,backdrop-filter] duration-500",
            scrolled && !open
              ? "border-b border-default-100/60 bg-background/70 backdrop-blur-xl"
              : "border-b border-transparent",
          )}
        >
          <nav
            aria-label="Main"
            className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
          >
            <NextLink
              className="group flex items-center gap-2.5 font-semibold tracking-tight"
              href="/"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
              </span>
              <RollText>Abhishek Gupta</RollText>
            </NextLink>

            <ul className="hidden items-center gap-1 lg:flex">
              {siteConfig.navItems.map((item) => {
                const active = router.pathname === item.href;

                return (
                  <li key={item.href} className="relative">
                    {active && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-default-100"
                        layoutId="nav-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <NextLink
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "text-foreground"
                          : "text-default-500 hover:text-foreground",
                      )}
                      href={item.href}
                    >
                      <RollText>{item.label}</RollText>
                    </NextLink>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-1">
              <a
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full text-default-500 transition-colors hover:text-foreground"
                href={siteConfig.links.github}
                rel="noopener noreferrer"
                target="_blank"
              >
                <GithubIcon size={20} />
              </a>
              <ThemeSwitch />
              <button
                aria-controls="mobile-menu"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-default-200 lg:hidden"
                type="button"
                onClick={() => setOpen((o) => !o)}
              >
                <motion.span
                  animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                  className="absolute h-[1.5px] w-4 rounded bg-foreground"
                  transition={{ duration: 0.35, ease: EASE }}
                />
                <motion.span
                  animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                  className="absolute h-[1.5px] w-4 rounded bg-foreground"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-background px-6 pb-10 pt-24 lg:hidden"
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            id="mobile-menu"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="flex flex-col gap-1">
              {siteConfig.navMenuItems.map((item, i) => {
                const active = router.pathname === item.href;

                return (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      animate={{ y: "0%" }}
                      exit={{ y: "100%" }}
                      initial={{ y: "100%" }}
                      transition={{
                        duration: reduce ? 0 : 0.6,
                        ease: EASE,
                        delay: reduce ? 0 : 0.15 + i * 0.045,
                      }}
                    >
                      <NextLink
                        className={clsx(
                          "flex items-baseline gap-3 py-1 text-5xl font-semibold tracking-tight",
                          active ? "text-secondary" : "text-foreground",
                        )}
                        href={item.href}
                      >
                        {item.label}
                      </NextLink>
                    </motion.div>
                  </li>
                );
              })}
            </ul>

            <motion.div
              animate={{ opacity: 1 }}
              className="flex gap-6 text-sm text-default-500"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ delay: reduce ? 0 : 0.45 }}
            >
              <a href={siteConfig.links.github} rel="noopener noreferrer" target="_blank">
                GitHub
              </a>
              <a href={siteConfig.links.linkedIn} rel="noopener noreferrer" target="_blank">
                LinkedIn
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
