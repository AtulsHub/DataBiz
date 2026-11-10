import { Container } from "./Container";
import { cn } from "@/lib/utils";

type Props = {
  index?: string;
  label: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "split";
};

export function PageHero({
  label,
  title,
  description,
  children,
  className,
  align = "left",
}: Props) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-line hero-wash pt-12 pb-12 sm:pt-16 sm:pb-16",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-ember/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full blur-3xl"
        style={{ background: "var(--glow-cool)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "var(--glow-mint)" }}
      />
      <Container className="relative">
        <p className="eyebrow">{label}</p>
        <div
          className={cn(
            "mt-4 grid gap-6",
            align === "split" && "lg:grid-cols-[1.15fr_0.85fr] lg:items-end",
          )}
        >
          <h1 className="font-display text-[clamp(2.35rem,5.5vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink text-balance">
            {title}
          </h1>
          {(description || children) && (
            <div className="max-w-xl">
              {description ? (
                <p className="font-serif text-lg leading-relaxed text-mute text-balance sm:text-xl">
                  {description}
                </p>
              ) : null}
              {children}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
