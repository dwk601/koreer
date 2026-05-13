import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";

/**
 * Cursor-based pagination.
 *
 * The API returns a single forward `next_cursor`; there is no backward cursor
 * so we keep the pattern simple:
 *   - "Back to first" when we're past page 1 (cursor is set on the URL)
 *   - "Next page" when `next_cursor` is present
 *
 * `baseQuery` carries every filter/sort the user had applied minus `cursor`
 * itself so these links preserve state.
 */
export async function Pagination({
  baseQuery,
  cursor,
  nextCursor,
}: {
  baseQuery: string;
  cursor?: string;
  nextCursor?: string | null;
}) {
  const t = await getTranslations("jobs.pagination");
  if (!cursor && !nextCursor) return null;

  const firstHref =
    "/jobs" + (baseQuery ? `?${baseQuery}` : "");
  const nextHref =
    "/jobs?" +
    (baseQuery ? `${baseQuery}&` : "") +
    `cursor=${encodeURIComponent(nextCursor ?? "")}`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm"
    >
      <div>
        {cursor && (
          <Link
            href={firstHref}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-4 py-2 font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
          >
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className="size-3"
            >
              <path
                d="M9 2 L3 6 L9 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("first")}
          </Link>
        )}
      </div>

      <div>
        {nextCursor && (
          <Link
            href={nextHref}
            className="group inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            {t("next")}
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className="size-3 transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M3 2 L9 6 L3 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </nav>
  );
}
