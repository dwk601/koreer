"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { cn } from "@/lib/cn";
import { routing } from "@/lib/i18n/routing";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

const SHORT_LABEL: Record<string, string> = {
  ko: "KO",
  en: "EN",
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "flex min-h-touch shrink-0 items-center rounded-full border border-border bg-surface p-0.5 text-[11px] shadow-[0_1px_0_0_rgb(var(--shadow-tint)/0.04)] sm:text-xs",
        className,
      )}
      role="group"
      aria-label={t("switcher")}
    >
      {routing.locales.map((l) => {
        const isActive = l === locale;
        return (
          <button
            key={l}
            type="button"
            disabled={isPending}
            onClick={() => {
              if (isActive) return;
              startTransition(() => {
                router.replace(pathname, { locale: l });
              });
            }}
            className={cn(
              "inline-flex h-9 min-h-touch min-w-11 items-center justify-center whitespace-nowrap rounded-full px-2 font-semibold leading-none transition-colors disabled:cursor-wait disabled:opacity-70 sm:min-w-10 sm:px-3",
              isActive
                ? "bg-accent text-accent-ink"
                : "text-ink-mute hover:bg-surface-muted hover:text-ink",
            )}
            aria-label={t(l)}
            aria-pressed={isActive}
          >
            <span aria-hidden className="sm:hidden">
              {SHORT_LABEL[l]}
            </span>
            <span className="hidden sm:inline">{t(l)}</span>
          </button>
        );
      })}
    </div>
  );
}
