import { cn } from "@/lib/utils";

type Props = {
  index?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "inverse" | "signal";
};

/** Compact meta label — kept for older pages during the redesign. */
export function DeskLabel({
  index,
  children,
  className,
  tone = "default",
}: Props) {
  return (
    <p
      className={cn(
        "font-mono text-[0.68rem] uppercase tracking-[0.2em]",
        tone === "default" && "text-mute",
        tone === "inverse" && "text-white/45",
        tone === "signal" && "text-ember",
        className,
      )}
    >
      {index ? <span className="mr-3 text-ember">{index}</span> : null}
      {children}
    </p>
  );
}
