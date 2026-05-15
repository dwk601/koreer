import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/lib/i18n/navigation";

export default async function JobNotFound() {
  const t = await getTranslations("detail");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-sm">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 h-10 min-h-touch px-2 rounded-md text-ink-mute transition-colors hover:text-ink"
        >
          <svg aria-hidden viewBox="0 0 12 12" className="size-3">
            <path
              d="M9 2 L3 6 L9 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("backToList")}
        </Link>
      </div>

      <div className="mt-10">
        <EmptyState
          as="h1"
          title={t("notFoundTitle")}
          description={t("notFoundSub")}
          action={
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 h-10 min-h-touch font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
            >
              {t("backToList")}
            </Link>
          }
        />
      </div>
    </div>
  );
}
