import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { EmptyState } from "@/components/ui/empty-state";

export default async function JobNotFound() {
  const tError = await getTranslations("error");
  const tDetail = await getTranslations("detail");
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6">
      <EmptyState
        title={tError("notFoundJobTitle")}
        description={tError("notFoundJobSub")}
        action={
          <Link
            href="/jobs"
            className="inline-flex h-9 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
          >
            {tDetail("backToList")}
          </Link>
        }
      />
    </div>
  );
}
