import { useRef } from "react";

import { GithubIcon } from "@/components/icons";
import SmartImage from "@/components/SmartImage";
import SignalTrace from "@/components/home/SignalTrace";
import {
  ArrowIcon,
  DownloadIcon,
  LinkedInIcon,
  MailIcon,
} from "@/components/home/primitives";
import Magnetic from "@/components/motion/Magnetic";
import { SCENE_HOLD } from "@/components/loaders/shared";
import { credentials, profile } from "@/config/resume";
import { siteConfig } from "@/config/site";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { hasNavigated, intro } from "@/lib/motion";

const socials = [
  { href: siteConfig.links.github, label: "GitHub", Icon: GithubIcon },
  { href: siteConfig.links.linkedIn, label: "LinkedIn", Icon: LinkedInIcon },
  { href: `mailto:${profile.email}`, label: "Email", Icon: MailIcon },
];

const sections = [
  { id: "toolkit", label: "Toolkit" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const NAME_LINES = profile.name.split(" ");
const SCRAMBLE_CHARS = "01<>/{}[]#$%&*+=";

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;

      if (!root) return;

      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const chars = q<HTMLElement>(".kinetic-char");
        const roleEl = q<HTMLElement>("[data-role]")[0];
        const lead = SplitText.create(q("[data-lead]"), {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });

        gsap.set(q("[data-intro-hide]"), { visibility: "visible" });

        // ── Entrance: a single orchestrated moment after the preloader lifts.
        const tl = gsap.timeline({ paused: true });

        tl.from(chars, {
          yPercent: 115,
          rotate: 7,
          duration: 1.25,
          stagger: 0.035,
        })
          .from(
            q("[data-portrait]"),
            { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: "signalInOut" },
            0.05,
          )
          .from(q("[data-portrait] img"), { scale: 1.35, duration: 1.8 }, 0.05)
          .from(q("[data-status]"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0.3)
          .from(lead.lines, { yPercent: 115, stagger: 0.08, duration: 1 }, 0.45)
          .from(roleEl, { autoAlpha: 0, x: -16, duration: 0.8 }, 0.5)
          .from(
            q("[data-cta]"),
            { y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.9 },
            0.6,
          )
          .from(
            q("[data-trace]"),
            { clipPath: "inset(0% 100% 0% 0%)", duration: 1.6, ease: "power2.inOut" },
            0.5,
          )
          .from(q("[data-cred]"), { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.8 }, 0.75)
          .from(q("[data-cue]"), { autoAlpha: 0, duration: 0.6 }, 1.1);

        q<HTMLElement>("[data-cred-value]").forEach((el, i) => {
          tl.to(
            el,
            {
              duration: 0.9,
              scrambleText: { text: el.textContent ?? "", chars: SCRAMBLE_CHARS, speed: 0.5 },
            },
            0.85 + i * 0.07,
          );
        });

        // ── Role ticker: scramble between roles once the entrance settles.
        const roles = gsap.timeline({ repeat: -1, paused: true });

        profile.roles.slice(1).concat(profile.roles[0]).forEach((role) => {
          roles
            .to(roleEl, {
              duration: 1.1,
              ease: "none",
              scrambleText: { text: role, chars: SCRAMBLE_CHARS, speed: 0.45 },
            }, "+=2.2");
        });
        let entered = false;

        tl.eventCallback("onComplete", () => {
          entered = true;
          roles.play();
        });

        const start = () => tl.delay(hasNavigated() ? SCENE_HOLD + 0.3 : 0.05).play();
        const unsubscribe = intro.onDone(start);

        // ── Scroll-out: the name drifts apart and the portrait sinks back.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
              onToggle: (self) => {
                if (!entered) return;
                if (self.isActive) roles.resume();
                else roles.pause();
              },
            },
          })
          .to(q("[data-line='0']"), { xPercent: -10, ease: "none" }, 0)
          .to(q("[data-line='1']"), { xPercent: 14, ease: "none" }, 0)
          .to(q("[data-portrait-wrap]"), { yPercent: 22, scale: 0.92, ease: "none" }, 0);

        // ── Proximity type: letters thicken and widen as the pointer nears.
        const fine = window.matchMedia("(pointer: fine)").matches;
        const setters = chars.map((c) => ({
          wght: gsap.quickTo(c, "--wght", { duration: 0.6, ease: "power3" }),
          wdth: gsap.quickTo(c, "--wdth", { duration: 0.6, ease: "power3" }),
        }));
        const onMove = contextSafe!((e: PointerEvent) => {
          chars.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            const t = gsap.utils.clamp(0, 1, 1 - d / 320);

            setters[i].wght(560 + t * 240);
            setters[i].wdth(84 + t * 16);
          });
        });
        const onLeave = contextSafe!(() => {
          setters.forEach((s) => {
            s.wght(640);
            s.wdth(100);
          });
        });

        // ── Portrait tilt toward the pointer.
        const card = q<HTMLElement>("[data-portrait-tilt]")[0];
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3" });
        const onTilt = contextSafe!((e: PointerEvent) => {
          const r = card.getBoundingClientRect();

          ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 10);
          rx(((e.clientY - (r.top + r.height / 2)) / r.height) * -10);
        });
        const onTiltLeave = contextSafe!(() => {
          rx(0);
          ry(0);
        });

        if (fine) {
          root.addEventListener("pointermove", onMove);
          root.addEventListener("pointerleave", onLeave);
          card.addEventListener("pointermove", onTilt);
          card.addEventListener("pointerleave", onTiltLeave);
        }

        return () => {
          unsubscribe();
          lead.revert();
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
          card.removeEventListener("pointermove", onTilt);
          card.removeEventListener("pointerleave", onTiltLeave);
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative isolate -mt-16 flex min-h-[100svh] flex-col overflow-hidden pt-16"
    >
      {/* Ambient layer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-[-12rem] h-[36rem] w-[48rem] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-24 right-[-8rem] h-72 w-72 rounded-full bg-secondary/10 blur-[110px]" />
        <div className="hero-grid absolute inset-0" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-4 pb-6 pt-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-14 lg:pt-10">
        {/* ── Copy ── */}
        <div className="min-w-0">
          <p
            className="flex items-center gap-2.5 text-sm text-default-500 sm:text-base"
            data-intro-hide
            data-status
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            {profile.headline} at Microsoft Xbox
          </p>

          <h1
            aria-label={profile.name}
            className="mt-5 text-[clamp(4.1rem,22vw,10.25rem)] font-semibold leading-[0.86] tracking-[-0.045em] sm:mt-6"
          >
            {NAME_LINES.map((line, li) => (
              <span
                key={line}
                aria-hidden="true"
                className={li === 1 ? "block pl-[0.6em] sm:pl-[1.1em]" : "block"}
                data-line={li}
              >
                <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                  {line.split("").map((ch, ci) => (
                    <span key={ci} className="kinetic-char" data-intro-hide>
                      {ch}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </h1>

          <p
            aria-label={profile.roles.join(", ")}
            className="mt-6 flex min-h-[2rem] items-center font-mono text-base text-primary sm:text-xl"
          >
            <span aria-hidden="true" className="mr-2 text-secondary">
              &gt;
            </span>
            <span aria-hidden="true" data-intro-hide data-role>
              {profile.roles[0]}
            </span>
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-[1.1em] w-[2px] animate-caret bg-primary align-middle"
            />
          </p>

          <p
            className="mt-5 max-w-xl text-lg leading-relaxed text-default-500 sm:text-xl"
            data-intro-hide
            data-lead
          >
            {profile.tagline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <div data-cta data-intro-hide>
              <Magnetic>
                <a
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-colors duration-300 hover:bg-secondary hover:text-signal-ink"
                  href="#work"
                >
                  See my work
                  <ArrowIcon className="h-4 w-4 transition-transform duration-500 ease-signal group-hover:translate-x-1" />
                </a>
              </Magnetic>
            </div>
            <div data-cta data-intro-hide>
              <Magnetic>
                <a
                  className="group inline-flex items-center gap-2 rounded-full border border-default-300 px-6 py-3.5 text-sm font-semibold transition-colors duration-300 hover:border-foreground"
                  download
                  href={profile.resumeUrl}
                >
                  <DownloadIcon className="h-4 w-4 transition-transform duration-500 ease-signal group-hover:translate-y-0.5" />
                  Résumé
                </a>
              </Magnetic>
            </div>
            <div className="flex items-center gap-1 sm:ml-2" data-cta data-intro-hide>
              {socials.map(({ href, label, Icon }) => (
                <Magnetic key={label} strength={0.5}>
                  <a
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-default-500 transition-colors duration-300 hover:text-secondary"
                    href={href}
                    rel="noopener noreferrer"
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>
        </div>

        {/* ── Portrait ── */}
        <div
          className="order-first flex justify-center [perspective:1000px] lg:order-last"
          data-portrait-wrap
        >
          <div
            className="relative w-[13rem] sm:w-[17rem] lg:w-[21rem] xl:w-[23rem]"
            data-portrait-tilt
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-content1"
              data-intro-hide
              data-portrait
            >
              <SmartImage
                alt={profile.name}
                className="h-full w-full object-cover"
                height={720}
                src={profile.photo}
                webpSrc={profile.photoWebp}
                width={720}
                wrapperClassName="h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-signal-ink/70 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-xs text-white/80">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  {profile.location}
                </span>
                <span className="font-mono">online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live trace ── */}
      <div
        className="relative h-24 w-full sm:h-28 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_100%)]"
        data-intro-hide
        data-trace
      >
        <SignalTrace />
      </div>

      {/* ── Credentials + section links ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-6 pt-2 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <dl className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          {credentials.map((item) => (
            <div
              key={item.label}
              className="border-l border-default-200 pl-4 pr-6"
              data-cred
              data-intro-hide
            >
              <dt className="sr-only">{item.label}</dt>
              <dd className="text-base font-semibold sm:text-lg" data-cred-value>
                {item.value}
              </dd>
              <dd className="text-xs text-default-400 sm:text-sm">{item.label}</dd>
            </div>
          ))}
        </dl>

        <nav aria-label="Page sections" className="flex items-center gap-1" data-cue data-intro-hide>
          {sections.map((s) => (
            <a
              key={s.id}
              className="group rounded-full px-3 py-1.5 text-sm text-default-500 transition-colors hover:text-foreground"
              href={`#${s.id}`}
            >
              <span className="roll">
                <span>{s.label}</span>
                <span aria-hidden="true">{s.label}</span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
