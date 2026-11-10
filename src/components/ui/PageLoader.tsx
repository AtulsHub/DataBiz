import { Container } from "./Container";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  compact?: boolean;
};

export function PageLoader({
  label = "Loading…",
  className,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-mute",
        compact ? "py-10" : "min-h-[40vh] py-16 sm:py-24",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Container className="flex items-center justify-center gap-3 text-sm">
        <Spinner />
        <span>{label}</span>
      </Container>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-sm bg-line/50", className)}
    />
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading form">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="h-11 w-full" />
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="h-11 w-full" />
      <SkeletonBlock className="h-11 w-full" />
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading account">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-10 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-16 w-full" />
        <SkeletonBlock className="h-16 w-full" />
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div
      className="min-h-full bg-paper lg:flex"
      aria-busy="true"
      aria-label="Loading desk"
    >
      <aside className="hidden w-64 shrink-0 border-r border-line p-6 lg:block">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-8 w-[85%]" />
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-8 w-[75%]" />
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-6 sm:p-10">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="mt-4 h-9 w-56 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-lg" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
