import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main" | "nav";
  width?: "default" | "narrow" | "wide";
};

export function Container({
  children,
  className,
  as: Tag = "div",
  width = "default",
}: Props) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-[var(--gutter)]",
        width === "default" && "max-w-[var(--measure)]",
        width === "narrow" && "max-w-3xl",
        width === "wide" && "max-w-[80rem]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
