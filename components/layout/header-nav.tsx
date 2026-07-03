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
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-full pr-3 font-semibold tracking-tight transition-colors hover:bg-surface-muted/60"
          aria-label={t("app.name")}
        >
          <Image
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="size-9 rounded-[0.85rem] transition-transform group-hover:scale-[1.03]"
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
                      "relative inline-flex h-10 min-h-touch items-center rounded-full px-3.5 font-medium transition-colors",
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
            <li className="ml-1">
              <LocaleSwitcher />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
