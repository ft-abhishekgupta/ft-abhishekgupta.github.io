import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

import { GithubIcon } from "@/components/icons";
import { ArrowIcon, LinkedInIcon, MailIcon } from "@/components/home/primitives";
import Magnetic from "@/components/motion/Magnetic";
import SplitReveal from "@/components/motion/SplitReveal";
import { profile } from "@/config/resume";
import { siteConfig } from "@/config/site";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

const socials = [
  { href: siteConfig.links.linkedIn, label: "LinkedIn", handle: "in/ft-abhishekgupta", Icon: LinkedInIcon },
  { href: siteConfig.links.github, label: "GitHub", handle: "@ft-abhishekgupta", Icon: GithubIcon },
  { href: `mailto:${profile.email}`, label: "Email", handle: profile.email, Icon: MailIcon },
];

export default function Contact() {
  const rootRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from("[data-contact-row]", {
          y: 50,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1,
          scrollTrigger: { trigger: "[data-contact-rows]", start: "top 85%", once: true },
        });
        gsap.from("[data-orb]", {
          scale: 0.4,
          autoAlpha: 0,
          rotate: -40,
          duration: 1.4,
          ease: "elastic.out(1, 0.6)",
          scrollTrigger: { trigger: "[data-orb]", start: "top 90%", once: true },
        });
      });
    },
    { scope: rootRef },
  );

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section
      ref={rootRef}
      className="relative isolate scroll-mt-6 overflow-hidden py-24 sm:py-36"
      id="contact"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[26rem] w-[56rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <SplitReveal
              as="h2"
              className="text-[clamp(3.5rem,11vw,10rem)] font-semibold leading-[0.88] tracking-[-0.045em]"
              stagger={0.03}
              type="chars"
            >
              Let&apos;s build something.
            </SplitReveal>
            <SplitReveal
              as="p"
              className="mt-8 max-w-lg text-lg leading-relaxed text-default-500"
              delay={0.2}
            >
              Building something ambitious, or want to trade notes on
              distributed systems? My inbox is open.
            </SplitReveal>
          </div>

          <div className="flex justify-start lg:justify-end" data-orb>
            <Magnetic strength={0.45}>
              <a
                className="group relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-secondary text-lg font-semibold text-signal-ink sm:h-52 sm:w-52"
                href={`mailto:${profile.email}`}
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-foreground transition-transform duration-700 ease-signal group-hover:translate-y-0" />
                <span className="relative flex items-center gap-2 transition-colors duration-500 group-hover:text-background">
                  Say hello
                  <ArrowIcon className="h-5 w-5 -rotate-45 transition-transform duration-500 ease-signal group-hover:rotate-0" />
                </span>
              </a>
            </Magnetic>
          </div>
        </div>

        <ul className="mt-20 border-t border-default-200" data-contact-rows>
          <li className="border-b border-default-200" data-contact-row>
            <button
              className="group flex w-full items-center justify-between gap-4 py-6 text-left sm:py-8"
              data-cursor={copied ? "Copied" : "Copy"}
              type="button"
              onClick={copyEmail}
            >
              <span className="min-w-0">
                <span className="block text-sm text-default-400">Email</span>
                <span className="mt-1 block truncate text-2xl font-medium tracking-tight transition-transform duration-700 ease-signal group-hover:translate-x-3 sm:text-4xl">
                  {profile.email}
                </span>
              </span>
              <span className="relative h-6 min-w-[5.5rem] overflow-hidden text-right text-sm text-default-500" aria-live="polite">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={copied ? "copied" : "copy"}
                    animate={{ y: 0, opacity: 1 }}
                    className={copied ? "absolute right-0 text-secondary" : "absolute right-0"}
                    exit={{ y: -20, opacity: 0 }}
                    initial={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {copied ? "Copied" : "Click to copy"}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </li>
          {socials.slice(0, 2).map(({ href, label, handle, Icon }) => (
            <li key={label} className="border-b border-default-200" data-contact-row>
              <a
                className="group flex items-center justify-between gap-4 py-6 sm:py-8"
                href={href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="min-w-0">
                  <span className="block text-sm text-default-400">{label}</span>
                  <span className="mt-1 block truncate text-2xl font-medium tracking-tight transition-transform duration-700 ease-signal group-hover:translate-x-3 sm:text-4xl">
                    {handle}
                  </span>
                </span>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-default-200 text-default-500 transition-all duration-500 ease-signal group-hover:border-secondary group-hover:bg-secondary group-hover:text-signal-ink">
                  <Icon className="h-5 w-5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
