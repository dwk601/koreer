import { cn } from "@/lib/cn";
import type { JobLanguage } from "@/lib/api/schemas";

export function LanguageChip({
  language,
  label,
  className,
}: {
  language: JobLanguage;
  label: string;
  className?: string;
}) {
  const toneClass =
    language === "korean"
      ? "bg-chip-ko-bg text-chip-ko-ink"
      : language === "english"
        ? "bg-chip-en-bg text-chip-en-ink"
        : "bg-chip-bi-bg text-chip-bi-ink";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 type-label",
        toneClass,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "muted" | "accent";
  className?: string;
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent text-accent-ink"
      : tone === "muted"
        ? "bg-surface-muted text-ink-mute"
        : "bg-surface text-ink-soft border border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
