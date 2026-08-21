import { GithubIcon } from "@/components/icons";
import {
  ArrowIcon,
  LinkedInIcon,
  MailIcon,
  Reveal,
  SectionHeading,
} from "@/components/home/primitives";
import { profile } from "@/config/resume";
import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";

const socials = [
  {
    href: `mailto:${profile.email}`,
    label: "Email",
    handle: profile.email,
    Icon: MailIcon,
  },
  {
    href: siteConfig.links.linkedIn,
    label: "LinkedIn",
    handle: "in/ft-abhishekgupta",
    Icon: LinkedInIcon,
  },
  {
    href: siteConfig.links.github,
    label: "GitHub",
    handle: "@ft-abhishekgupta",
    Icon: GithubIcon,
  },
];

export default function Contact() {
  return (
    <section
      className="relative isolate scroll-mt-6 overflow-hidden border-t border-default-100 py-14 sm:py-16"
      id="contact"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-[-14rem] left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          description="Building something ambitious, or just want to trade notes on distributed systems? My inbox is open."
          eyebrow="Contact"
          title="Let's build something"
        />

        <Reveal className="mx-auto max-w-3xl">
          <div className="grid gap-3 sm:grid-cols-3">
            {socials.map(({ href, label, handle, Icon }) => (
              <motion.a
                key={label}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-default-200/70 bg-content1/50 p-6 text-center backdrop-blur transition-all duration-300 hover:border-primary/50 hover:bg-content1 hover:shadow-xl hover:shadow-primary/10"
                href={href}
                rel="noopener noreferrer"
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                whileHover={{ y: -6 }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-default-100 text-default-500 transition-colors duration-300 group-hover:bg-primary/15 group-hover:text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-0.5 block truncate text-xs text-default-400">
                    {handle}
                  </span>
                </span>
              </motion.a>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-10 text-center" delay={0.1}>
          <a
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
            href={`mailto:${profile.email}`}
          >
            Say hello
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <p className="mt-5 text-xs text-default-400">
            Based in {profile.location} · Open to interesting conversations.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
