import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/60 px-6 py-14 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="mb-5 flex size-10 items-center justify-center rounded-full bg-surface-muted text-ink-mute"
      >
        <svg
          viewBox="0 0 20 20"
          className="size-[1.1em]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m17 17-3.2-3.2" />
        </svg>
      </div>
      <h2 className="type-title text-ink">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-md type-caption text-ink-mute">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
