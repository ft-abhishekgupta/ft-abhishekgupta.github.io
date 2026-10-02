import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";

import { RollText } from "@/components/navbar";
import { profile } from "@/config/resume";
import { siteConfig } from "@/config/site";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";

function useLocalTime(timeZone: string) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone,
    });
    const update = () => setTime(fmt.format(new Date()));

    update();
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [timeZone]);

  return time;
}

const socials = [
  { label: "GitHub", href: siteConfig.links.github },
  { label: "LinkedIn", href: siteConfig.links.linkedIn },
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "Résumé", href: profile.resumeUrl },
];

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const time = useLocalTime("Asia/Kolkata");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-wordmark]", {
          type: "chars",
          mask: "chars",
          charsClass: "split-char",
        });

        gsap.from(split.chars, {
          yPercent: 105,
          ease: "none",
          stagger: { each: 0.04, from: "center" },
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <footer
      ref={rootRef}
      className="relative mt-16 overflow-hidden border-t border-default-100 pt-14"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="max-w-xs text-2xl font-semibold leading-tight tracking-tight">
            Got a system that has to stay up? Let&apos;s talk.
          </p>
          <a
            className="group mt-4 inline-flex text-default-500 transition-colors hover:text-secondary"
            href={`mailto:${profile.email}`}
          >
            <RollText>{profile.email}</RollText>
          </a>
        </div>

        <nav aria-label="Footer">
          <p className="mb-3 text-sm text-default-400">Pages</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {siteConfig.navMenuItems.map((item) => (
              <li key={item.href}>
                <NextLink
                  className="group text-default-600 transition-colors hover:text-foreground"
                  href={item.href}
                >
                  <RollText>{item.label}</RollText>
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-sm text-default-400">Elsewhere</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  className="group text-default-600 transition-colors hover:text-foreground"
                  href={s.href}
                  rel="noopener noreferrer"
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                >
                  <RollText>{s.label}</RollText>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-default-400">
            {profile.location}
            <span className="ml-2 font-mono tabular-nums text-default-600">
              {time ?? "--:--:--"} IST
            </span>
          </p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="mt-12 select-none whitespace-nowrap text-center text-[21.5vw] font-bold leading-[0.78] tracking-[-0.04em] text-default-100 [font-variation-settings:'wdth'_75]"
        data-wordmark
      >
        Abhishek Gupta
      </p>
    </footer>
  );
}
