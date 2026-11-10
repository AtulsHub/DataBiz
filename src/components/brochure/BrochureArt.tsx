"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Full-bleed constellation — data network as the hero visual. */
export function ConstellationField({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative isolate overflow-hidden", className)} aria-hidden>
      <svg
        viewBox="0 0 960 720"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="edgeFade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--ember)" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Soft wash */}
        <ellipse cx="620" cy="280" rx="280" ry="220" fill="url(#nodeGlow)" opacity="0.35" />
        <ellipse cx="280" cy="480" rx="200" ry="160" fill="var(--glow-cool)" opacity="0.35" />

        {/* Grid plane */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="40"
            y1={80 + i * 70}
            x2="920"
            y2={120 + i * 68}
            stroke="var(--line-strong)"
            strokeOpacity="0.22"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={60 + i * 90}
            y1="40"
            x2={20 + i * 95}
            y2="680"
            stroke="var(--line)"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        ))}

        {/* Edges */}
        <g stroke="url(#edgeFade)" strokeWidth="1.4">
          <line x1="180" y1="220" x2="360" y2="160" />
          <line x1="360" y1="160" x2="520" y2="240" />
          <line x1="520" y1="240" x2="700" y2="180" />
          <line x1="700" y1="180" x2="820" y2="300" />
          <line x1="360" y1="160" x2="300" y2="340" />
          <line x1="520" y1="240" x2="480" y2="420" />
          <line x1="480" y1="420" x2="640" y2="500" />
          <line x1="300" y1="340" x2="480" y2="420" />
          <line x1="180" y1="220" x2="140" y2="400" />
          <line x1="640" y1="500" x2="780" y2="460" />
          <line x1="700" y1="180" x2="620" y2="320" />
          <line x1="620" y1="320" x2="480" y2="420" />
        </g>

        {/* Nodes */}
        {(
          [
            [180, 220, 10],
            [360, 160, 14],
            [520, 240, 11],
            [700, 180, 16],
            [820, 300, 9],
            [300, 340, 8],
            [480, 420, 13],
            [640, 500, 10],
            [140, 400, 7],
            [780, 460, 8],
            [620, 320, 9],
          ] as const
        ).map(([x, y, r], i) => (
          <motion.circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={r}
            fill={i % 3 === 0 ? "var(--ember)" : "var(--ink)"}
            fillOpacity={i % 3 === 0 ? 0.9 : 0.55}
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={reduce ? undefined : { scale: 1, opacity: 1 }}
            transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        {/* Pulse rings on hub */}
        {!reduce ? (
          <>
            <motion.circle
              cx="700"
              cy="180"
              r="16"
              stroke="var(--ember)"
              strokeOpacity="0.5"
              fill="none"
              animate={{ r: [16, 42], opacity: [0.5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="480"
              cy="420"
              r="13"
              stroke="var(--ink)"
              strokeOpacity="0.35"
              fill="none"
              animate={{ r: [13, 36], opacity: [0.4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}

export function ChartMark({
  kind,
  className,
}: {
  kind: "bars" | "line" | "radar";
  className?: string;
}) {
  if (kind === "bars") {
    return (
      <svg viewBox="0 0 120 88" className={cn("text-ember", className)} aria-hidden>
        <rect x="8" y="48" width="18" height="32" fill="currentColor" opacity="0.35" />
        <rect x="36" y="28" width="18" height="52" fill="currentColor" opacity="0.55" />
        <rect x="64" y="12" width="18" height="68" fill="currentColor" />
        <rect x="92" y="36" width="18" height="44" fill="currentColor" opacity="0.7" />
      </svg>
    );
  }
  if (kind === "line") {
    return (
      <svg viewBox="0 0 120 88" className={cn("text-ember", className)} aria-hidden>
        <polyline
          points="8,68 32,52 52,58 72,28 92,34 112,14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="112" cy="14" r="5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 88" className={cn("text-ember", className)} aria-hidden>
      <polygon
        points="60,10 98,38 84,78 36,78 22,38"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon
        points="60,28 78,42 72,62 48,62 42,42"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

export function CampusMapArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden
    >
      <rect
        x="20"
        y="30"
        width="380"
        height="260"
        rx="4"
        stroke="var(--line-strong)"
        strokeDasharray="6 8"
        opacity="0.6"
      />
      <path
        d="M60 240 C120 200, 160 260, 220 210 C280 160, 320 200, 360 150"
        stroke="var(--ember)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="70" y="70" width="70" height="50" fill="var(--ink)" fillOpacity="0.08" />
      <rect x="170" y="90" width="90" height="60" fill="var(--ember)" fillOpacity="0.12" />
      <rect x="290" y="70" width="60" height="80" fill="var(--ink)" fillOpacity="0.1" />
      <rect x="90" y="160" width="110" height="45" fill="var(--ink)" fillOpacity="0.07" />
      <circle cx="220" cy="210" r="8" fill="var(--ember)" />
      <circle cx="360" cy="150" r="6" fill="var(--ink)" fillOpacity="0.7" />
      <text
        x="230"
        y="206"
        fill="var(--mute)"
        fontSize="11"
        fontFamily="var(--font-jetbrains), monospace"
      >
        DataBiz
      </text>
    </svg>
  );
}

export function SignalBars({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  return (
    <div className={cn("flex h-10 items-end gap-1", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="w-2 rounded-sm bg-ember transition-opacity"
          style={{
            height: `${28 + i * 14}%`,
            opacity: i < level ? 1 : 0.18,
          }}
        />
      ))}
    </div>
  );
}
