"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";
import { LocaleSwitcher } from "./locale-switcher";

const NAV = [
  { href: "/", key: "home" as const, match: (p: string) => p === "/" },
  {
    href: "/jobs",
    key: "jobs" as const,
    match: (p: string) => p === "/jobs" || p.startsWith("/jobs/"),
  },
];

export function HeaderNav() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 font-semibold tracking-tight"
          aria-label={t("app.name")}
        >
          <span
            aria-hidden
            className="inline-block size-2 rounded-full bg-accent transition-transform group-hover:scale-110"
          />
          <span className="text-[17px] leading-none">{t("app.name")}</span>
        </Link>

        <nav aria-label="primary">
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map(({ href, key, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "relative inline-flex h-9 items-center rounded-md px-3 transition-colors",
                      active
                        ? "text-ink"
                        : "text-ink-mute hover:text-ink hover:bg-surface-muted",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {t(`nav.${key}`)}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-px bg-ink"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
            <li className="ml-2">
              <LocaleSwitcher />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
