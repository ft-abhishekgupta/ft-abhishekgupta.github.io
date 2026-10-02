import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

import SplitReveal from "@/components/motion/SplitReveal";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Renders a monochrome logo from /public/logos via CSS masking so the glyph can
 * inherit any colour (brand colour on hover, muted grey at rest).
 */
export function TechLogo({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const url = `url(/logos/${slug}.svg)`;

  return (
    <span
      aria-hidden="true"
      className={clsx("inline-block shrink-0 bg-current", className)}
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

/**
 * Editorial section opener: an oversized title that rises out of its mask,
 * a hairline that draws across underneath, and a short description set
 * against the right edge on wide screens.
 */
export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={clsx("mb-12 sm:mb-16", className)}>
      <div className="grid items-end gap-5 lg:grid-cols-[1fr_minmax(0,24rem)]">
        <SplitReveal
          as="h2"
          className="text-5xl font-semibold leading-[0.92] tracking-[-0.035em] sm:text-7xl lg:text-8xl"
          type="chars"
          stagger={0.025}
        >
          {title}
        </SplitReveal>
        {description && (
          <SplitReveal
            as="p"
            className="max-w-md text-base leading-relaxed text-default-500 sm:text-lg"
            delay={0.15}
          >
            {description}
          </SplitReveal>
        )}
      </div>
      <DrawRule className="mt-8" />
    </div>
  );
}

/** Hairline that draws itself left-to-right as it enters the viewport. */
export function DrawRule({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={clsx("h-px origin-left bg-default-200", className)}
      initial={{ scaleX: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 1.4, ease: EASE }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView={{ scaleX: 1 }}
    />
  );
}

export const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    viewBox="0 0 24 24"
    {...props}
  >
    <rect height="15" rx="3" width="19" x="2.5" y="4.5" />
    <path d="m3.5 6.5 7.35 5.5a2 2 0 0 0 2.3 0L20.5 6.5" strokeLinecap="round" />
  </svg>
);

export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M12 3.5v11m0 0 4-4m-4 4-4-4" />
    <path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

export const ArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M5 12h14m0 0-5-5m5 5-5 5" />
  </svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
