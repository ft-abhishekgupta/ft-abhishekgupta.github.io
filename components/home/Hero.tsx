import { GithubIcon } from "@/components/icons";
import SmartImage from "@/components/SmartImage";
import {
  ArrowIcon,
  ChevronDownIcon,
  DownloadIcon,
  LinkedInIcon,
  MailIcon,
} from "@/components/home/primitives";
import { profile, credentials } from "@/config/resume";
import { siteConfig } from "@/config/site";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

function useTypewriter(words: string[], enabled: boolean) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const word = words[index % words.length];

    if (!deleting && text === word) {
      const hold = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(hold);
    }

    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const tick = setTimeout(
      () =>
        setText((current) =>
          deleting
            ? word.slice(0, current.length - 1)
            : word.slice(0, current.length + 1),
        ),
      deleting ? 38 : 78,
    );

    return () => clearTimeout(tick);
  }, [text, deleting, index, words, enabled]);

  return enabled ? text : words[0];
}

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

export default function Hero() {
  const reduce = useReducedMotion();
  const typed = useTypewriter(profile.roles, !reduce);

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[130px]" />
        <div className="absolute right-[-6rem] top-32 h-80 w-80 rounded-full bg-secondary/25 blur-[120px]" />
        <div className="absolute bottom-[-10rem] left-[-4rem] h-80 w-80 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="hero-grid absolute inset-0" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-14">
        {/* ── Portrait ── */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="order-first flex justify-center lg:order-last"
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            className="relative aspect-square w-[15rem] sm:w-[19rem] lg:w-[23rem]"
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -inset-[3px] overflow-hidden rounded-[2rem]">
              <span className="ring-spin" />
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-content1 shadow-2xl shadow-black/40">
              <SmartImage
                alt={profile.name}
                className="h-full w-full object-cover"
                height={720}
                src={profile.photo}
                webpSrc={profile.photoWebp}
                width={720}
                wrapperClassName="h-full w-full rounded-[2rem]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-xs backdrop-blur-md sm:-left-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-medium text-white/90"></span>
              <span className="text-white/60">{profile.location}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Copy ── */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-default-200/60 bg-default-100/50 px-3 py-1.5 text-xs font-medium text-default-600 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {profile.headline}
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            <span className="block text-default-400">Hi, I&apos;m</span>
            <span className="mt-1 block bg-gradient-to-br from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              {profile.name}
            </span>
          </h1>

          <p
            aria-label={profile.roles.join(", ")}
            className="mt-4 flex min-h-[2.25rem] items-center font-mono text-lg text-primary sm:text-2xl"
          >
            <span aria-hidden="true" className="mr-2 text-default-400">
              &gt;
            </span>
            <span aria-hidden="true">{typed}</span>
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-[1.1em] w-[2px] animate-caret bg-primary align-middle"
            />
          </p>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-default-500 sm:text-lg">
            {profile.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
              href="#work"
            >
              View my work
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              className="group inline-flex items-center gap-2 rounded-full border border-default-200 px-6 py-3 text-sm font-semibold text-default-700 transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary"
              download
              href={profile.resumeUrl}
            >
              <DownloadIcon className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Résumé
            </a>

            <div className="ml-1 flex items-center gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-default-200 text-default-500 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:text-primary hover:shadow-lg hover:shadow-primary/20"
                  href={href}
                  rel="noopener noreferrer"
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-default-200/60 bg-default-200/40 sm:grid-cols-4">
            {credentials.map((item, i) => (
              <motion.div
                key={item.label}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background/80 px-4 py-4 backdrop-blur"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                transition={{ duration: 0.45, delay: 0.3 + i * 0.06 }}
              >
                <dt className="text-base font-bold text-primary sm:text-lg">
                  {item.value}
                </dt>
                <dd className="mt-0.5 text-[10px] uppercase tracking-wider text-default-400 sm:text-[11px]">
                  {item.label}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>

      {/* Section navigation */}
      <motion.nav
        animate={{ opacity: 1, y: 0 }}
        aria-label="Page sections"
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 sm:pb-8"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                className="block rounded-full border border-default-200/70 bg-content1/50 px-4 py-2 text-xs font-medium text-default-500 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-lg hover:shadow-primary/10"
                href={`#${section.id}`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          aria-label="Scroll to next section"
          className="mx-auto mt-4 flex h-8 w-8 items-center justify-center rounded-full text-default-400 transition-colors hover:text-primary"
          href="#toolkit"
        >
          <ChevronDownIcon className="h-5 w-5 animate-bounce" />
        </a>
      </motion.nav>
    </section>
  );
}
