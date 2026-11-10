"use client";

import { cn } from "@/lib/utils";

type Props = {
  names: readonly string[];
  className?: string;
};

export function PerformerMarquee({ names, className }: Props) {
  const row = [...names, ...names];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-on-void-line py-5",
        className,
      )}
      aria-label="Past performers"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-void to-transparent" />
      <div className="brochure-marquee flex w-max gap-10 whitespace-nowrap">
        {row.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="font-display text-2xl font-semibold tracking-tight text-on-void/90 sm:text-3xl"
          >
            {name}
            <span className="ml-10 text-ember" aria-hidden>
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
