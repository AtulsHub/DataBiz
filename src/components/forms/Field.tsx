import { cn } from "@/lib/utils";

const control =
  "w-full rounded-sm border border-line-strong bg-paper-elevated px-3 text-sm text-ink placeholder:text-steel/60 focus:border-signal focus:outline-none";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  id,
  label,
  hint,
  required,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden className="ml-1 text-signal">
            *
          </span>
        ) : (
          <span className="ml-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-steel">
            Optional
          </span>
        )}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-steel">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass = cn(control, "h-11");
export const textareaClass = cn(control, "min-h-32 py-2.5 leading-relaxed");
