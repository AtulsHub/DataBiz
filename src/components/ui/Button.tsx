import Link from "next/link";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-ink text-paper hover:bg-ember focus-visible:outline-ember",
  ember:
    "bg-ember text-white hover:bg-ember-deep focus-visible:outline-ink",
  ghost:
    "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-paper-elevated",
  inverse:
    "bg-paper-elevated text-ink hover:bg-ember hover:text-white focus-visible:outline-ember",
  link: "bg-transparent text-ember underline-offset-4 hover:underline px-0 h-auto",
  /* legacy names mapped during redesign */
  signal:
    "bg-ember text-white hover:bg-ember-deep focus-visible:outline-ink",
  spark:
    "bg-ember text-white hover:bg-ember-deep focus-visible:outline-ink",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

type Common = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

type ButtonAsButton = Common &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
    pending?: boolean;
    pendingLabel?: React.ReactNode;
  };

type ButtonAsLink = Common & {
  href: string;
  external?: boolean;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, className, variant = "primary", size = "md" } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-tight transition-[background,color,border-color,transform] duration-200 ease-field active:translate-y-px",
    variants[variant],
    variant !== "link" && sizes[size],
    className,
  );

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  const {
    href: _href,
    variant: _variant,
    size: _size,
    children: _children,
    className: _className,
    pending = false,
    pendingLabel,
    disabled,
    ...rest
  } = buttonProps;

  return (
    <button
      className={classes}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? (
        <>
          <Spinner className="size-3.5" label="Working" />
          <span>{pendingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
