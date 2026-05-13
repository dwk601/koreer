import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export async function Header() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-baseline gap-2 font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="inline-block size-2 rounded-full bg-accent"
          />
          <span className="text-[17px] leading-none">{t("app.name")}</span>
        </Link>

        <nav aria-label={t("nav.home")}>
          <ul className="flex items-center gap-2 text-sm">
            <li>
              <NavLink href="/">{t("nav.home")}</NavLink>
            </li>
            <li>
              <NavLink href="/jobs">{t("nav.jobs")}</NavLink>
            </li>
            <li>
              <LocaleSwitcher />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md px-2.5 py-1.5 text-ink-soft transition-colors hover:text-ink hover:bg-surface-muted"
    >
      {children}
    </Link>
  );
}
