import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * Brand motion identity (see the motion-design skill):
 *   signature ease  "signal"   expo-like decelerate, used for ~80% of entrances
 *   exit ease       "signalIn" accelerate, for things leaving the screen
 *   durations       quick 0.25s · standard 0.7s · slow 1.2s
 *   entrance        text rises out of a mask; blocks rise 40px and settle
 */
export const DUR = { quick: 0.25, standard: 0.7, slow: 1.2 } as const;

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    ScrambleTextPlugin,
    CustomEase,
    Flip,
    MotionPathPlugin,
  );
  CustomEase.create("signal", "0.16, 1, 0.3, 1");
  CustomEase.create("signalIn", "0.7, 0, 0.84, 0");
  CustomEase.create("signalInOut", "0.76, 0, 0.24, 1");
  gsap.defaults({ ease: "signal", duration: DUR.standard });
  registered = true;
}

/** Media query used with gsap.matchMedia() to gate decorative motion. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export { Flip, gsap, ScrollTrigger, SplitText, useGSAP };
