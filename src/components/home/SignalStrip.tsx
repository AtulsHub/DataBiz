import { site } from "@/content/site";

const items = [
  ...site.approach,
  "DataBrew Show",
  "Workshops",
  "Hackathons",
  "Student projects",
];

export function SignalStrip() {
  const loop = [...items, ...items];

  return (
    <section className="overflow-hidden border-b border-line bg-paper-elevated">
      <div className="flex items-center gap-0 border-b border-line/70 px-[var(--gutter)] py-2">
        <p className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel">
          Approach · feed
        </p>
        <div className="editorial-rule ml-4 flex-1" />
      </div>
      <div className="relative py-3.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-paper-elevated to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-paper-elevated to-transparent" />
        <div className="marquee-track gap-10 px-6">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-10 whitespace-nowrap font-display text-sm font-semibold tracking-tight text-ink sm:text-base"
            >
              <span className="text-signal">/</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
