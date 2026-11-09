import { Button } from "./Button";

type Props = {
  label: string;
  title: string;
  body: string;
  action?: { href: string; label: string };
};

export function EmptyState({ label, title, body, action }: Props) {
  return (
    <div className="border border-dashed border-line-strong bg-paper-elevated/50 px-6 py-10 sm:px-8">
      <p className="eyebrow">{label}</p>
      <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-xl text-mute leading-relaxed">{body}</p>
      {action ? (
        <div className="mt-6">
          <Button href={action.href} variant="ghost" size="sm">
            {action.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
