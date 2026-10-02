import { useRef } from "react";

import { SceneShell, useScene } from "@/components/loaders/shared";
import { gsap } from "@/lib/gsap";
import type { LoaderData } from "@/lib/loader";

const BAR = 24;

/**
 * Projects: a terminal clones the GitHub account and builds it — the command
 * types itself, the log scrolls, the progress bar fills, the build goes green.
 */
export default function ProjectsScene({ data }: { data?: LoaderData }) {
  const ref = useRef<HTMLDivElement>(null);
  const repos = data?.stats?.[0]?.value ?? 0;
  const names = data?.items ?? [];

  useScene(ref, (q) => {
    const bar = q("[data-bar]")[0];
    const pct = q("[data-pct]")[0];
    const progress = { v: 0 };

    gsap
      .timeline()
      .fromTo(q("[data-cmd]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.4, ease: "steps(28)" })
      .from(q("[data-log]"), { autoAlpha: 0, stagger: 0.07, duration: 0.01 }, 0.42)
      .to(progress, {
        v: 1,
        duration: 0.55,
        ease: "power1.inOut",
        onUpdate: () => {
          const filled = Math.round(progress.v * BAR);

          bar.textContent = "#".repeat(filled) + ".".repeat(BAR - filled);
          pct.textContent = `${Math.round(progress.v * 100)}%`;
        },
      }, 0.5)
      .from(q("[data-done]"), { autoAlpha: 0, x: -8, duration: 0.2 }, 1.08);
  });

  return (
    <SceneShell ref={ref} caption="Building">
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-[min(94vw,44rem)] overflow-hidden rounded-2xl border border-[#E8ECF5]/10 bg-[#0B1122] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#E8ECF5]/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono text-xs text-[#E8ECF5]/40">~/ft-abhishekgupta</span>
          </div>
          <div className="space-y-1.5 p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm">
            <p>
              <span className="text-signal-amber">$ </span>
              <span className="inline-block" data-cmd style={{ clipPath: "inset(0 100% 0 0)" }}>
                git clone github.com/ft-abhishekgupta
              </span>
            </p>
            <p className="text-[#E8ECF5]/60" data-log>
              Cloning into &apos;projects&apos;...
            </p>
            <p className="text-[#E8ECF5]/60" data-log>
              remote: Enumerating {repos} repositories, done.
            </p>
            {names.slice(0, 3).map((n) => (
              <p key={n} className="truncate text-[#E8ECF5]/40" data-log>
                &nbsp;&nbsp;+ {n}
              </p>
            ))}
            <p className="text-[#E8ECF5]/80" data-log>
              Building [<span className="text-[#5B84FF]" data-bar>{".".repeat(BAR)}</span>]{" "}
              <span data-pct>0%</span>
            </p>
            <p className="text-[#28C840]" data-done>
              ✓ Build succeeded
            </p>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
