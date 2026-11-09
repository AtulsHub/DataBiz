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
        "relative overflow-hidden border-b border-line bg-paper pt-12 pb-12 sm:pt-16 sm:pb-16",
        className,
      )}
    >
      <Container>
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
