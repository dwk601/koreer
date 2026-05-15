"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { routing } from "@/lib/i18n/routing";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="flex items-center rounded-md border border-border bg-surface p-0.5 text-xs min-h-touch"
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
            className={
              "rounded-[5px] px-2 py-1 h-9 min-h-touch transition-colors " +
              (isActive
                ? "bg-accent text-accent-ink"
                : "text-ink-mute hover:text-ink hover:bg-surface-muted")
            }
            aria-pressed={isActive}
          >
            {t(l)}
          </button>
        );
      })}
    </div>
  );
}
