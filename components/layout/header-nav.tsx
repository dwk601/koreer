"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

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
    <header className="sticky top-0 z-30 border-b border-border bg-bg/88 backdrop-blur supports-[backdrop-filter]:bg-bg/78">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:h-[4.5rem] sm:flex-nowrap sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="group order-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-full pr-2 font-semibold tracking-tight transition-colors hover:bg-surface-muted/60 sm:flex-none sm:gap-3 sm:pr-3"
          aria-label={t("app.name")}
        >
          <Image
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            priority
            className="size-10 shrink-0 rounded-[0.9rem] shadow-[0_8px_22px_-16px_rgb(var(--shadow-tint)/0.55)] transition-transform group-hover:scale-[1.03] sm:size-9"
          />
          <span className="truncate text-[17px] leading-none">{t("app.name")}</span>
        </Link>

        <nav aria-label="primary" className="order-3 w-full min-w-0 sm:order-2 sm:w-auto">
          <ul className="flex w-full min-w-0 items-center gap-1 text-sm sm:w-auto">
            {NAV.map(({ href, key, match }) => {
              const active = match(pathname);
              return (
                <li key={href} className="min-w-0 flex-1 sm:flex-none">
                  <Link
                    href={href}
                    className={cn(
                      "relative inline-flex h-10 min-h-touch w-full items-center justify-center rounded-full px-3 font-medium transition-colors sm:w-auto sm:px-3.5",
                      active
                        ? "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-border)]"
                        : "text-ink-mute hover:bg-surface-muted/70 hover:text-ink",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <LocaleSwitcher className="order-2 sm:order-3" />
      </div>
    </header>
  );
}
