import React from "react";

/**
 * Deterministic generative artwork for project cards, drawn in the same signal
 * vocabulary as the hero trace: stacked waveforms, rings, or a spectrum,
 * varied by index so each card gets its own fingerprint.
 */
const W = 640;
const H = 300;

function wave(freq: number, amp: number, phase: number, y: number, damp = 0) {
  let d = "";

  for (let x = 0; x <= W; x += 8) {
    const t = x / W;
    const env = damp ? Math.exp(-damp * Math.abs(t - 0.5) * 4) : 1;
    const yy = y + Math.sin(t * Math.PI * 2 * freq + phase) * amp * env;

    d += `${x === 0 ? "M" : "L"}${x} ${yy.toFixed(1)} `;
  }

  return d;
}

function Waves({ seed }: { seed: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeWidth={1.4}>
      {Array.from({ length: 9 }).map((_, i) => (
        <path
          key={i}
          className={i === 4 ? "text-secondary" : "text-primary"}
          d={wave(1.5 + seed * 0.4 + i * 0.12, 26 + i * 3, i * 0.45 + seed, 70 + i * 20, 0.6)}
          opacity={i === 4 ? 1 : 0.25 + (i % 3) * 0.12}
          stroke="currentColor"
        />
      ))}
    </g>
  );
}

function Rings({ seed }: { seed: number }) {
  return (
    <g fill="none" strokeWidth={1.2}>
      {Array.from({ length: 11 }).map((_, i) => (
        <circle
          key={i}
          className={i === 6 ? "text-secondary" : "text-primary"}
          cx={W * (0.62 + (seed % 2) * 0.08)}
          cy={H * 0.62}
          opacity={i === 6 ? 1 : 0.2 + (i % 4) * 0.1}
          r={18 + i * 22}
          stroke="currentColor"
          strokeDasharray={i % 3 === 0 ? "3 7" : undefined}
        />
      ))}
    </g>
  );
}

function Spectrum({ seed }: { seed: number }) {
  const bars = 40;

  return (
    <g>
      {Array.from({ length: bars }).map((_, i) => {
        const t = i / bars;
        const h = Math.round(
          30 +
            Math.abs(Math.sin(t * Math.PI * (2.2 + seed * 0.3)) * 120) +
            Math.abs(Math.sin(t * 23 + seed)) * 40,
        );
        const hot = i === Math.floor(bars * 0.62);

        return (
          <rect
            key={i}
            className={hot ? "text-secondary" : "text-primary"}
            fill="currentColor"
            height={h}
            opacity={hot ? 1 : 0.18 + (i % 5) * 0.08}
            rx={3}
            width={W / bars - 6}
            x={i * (W / bars) + 3}
            y={H - h - 20}
          />
        );
      })}
    </g>
  );
}

export default function ProjectArt({ index }: { index: number }) {
  const kind = index % 3;
  const seed = Math.floor(index / 3) + 1;

  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${W} ${H}`}
    >
      {kind === 0 && <Waves seed={seed} />}
      {kind === 1 && <Rings seed={seed} />}
      {kind === 2 && <Spectrum seed={seed} />}
    </svg>
  );
}
