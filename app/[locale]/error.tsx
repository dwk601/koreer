"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/lib/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Forward to console for dev; a production logger would replace this.
    console.error("[locale error]", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6">
      <EmptyState
        title={t("generalTitle")}
        description={t("generalSub")}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              {t("retry")}
            </button>
            <Link
              href="/"
              className="inline-flex h-9 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
            >
              {t("home")}
            </Link>
          </div>
        }
      />
    </div>
  );
}
