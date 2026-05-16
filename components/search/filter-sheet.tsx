"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";
import { toQueryString } from "@/lib/url/search-params";
import { FilterSidebar } from "./filter-sidebar";
import type { ListJobsParams } from "@/lib/api/jobs";
import type { Facets } from "@/lib/api/schemas";

type Props = {
  params: ListJobsParams;
  facets: Facets;
  allSources?: Record<string, number>;
  resultCount: number;
};

/** Clear every facet filter, keeping only search query and sort. */
function resetFacetFilters(params: ListJobsParams): ListJobsParams {
  const next: ListJobsParams = {};
  if (params.q) next.q = params.q;
  if (params.sort) next.sort = params.sort;
  if (params.limit) next.limit = params.limit;
  return next;
}

export function FilterSheet({
  params,
  facets,
  allSources,
  resultCount,
}: Props) {
  const t = useTranslations("jobs");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draftParams, setDraftParams] = useState<ListJobsParams>(params);
  const [sidebarKey, setSidebarKey] = useState(0);

  // Seed draft from current URL params before opening the sheet
  const handleOpen = useCallback(() => {
    setDraftParams(params);
    setSidebarKey((k) => k + 1);
    setIsOpen(true);
  }, [params]);

  // Body scroll lock — prevent background page from scrolling while the
  // full-screen dialog is open on mobile.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Count active filters in the draft (for the trigger badge + header)
  const activeFilterCount =
    (draftParams.source?.length ?? 0) +
    (draftParams.language ? 1 : 0) +
    (draftParams.job_category?.length ?? 0) +
    (draftParams.location_state ? 1 : 0) +
    (draftParams.salary_min || draftParams.salary_max ? 1 : 0);

  // dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // Close only when the dialog itself was clicked, not its children.
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const applyFilters = useCallback(() => {
    const qs = toQueryString({
      ...draftParams,
      cursor: undefined,
      page: undefined,
    });
    const href = qs ? `/jobs?${qs}` : "/jobs";
    router.push(href as "/jobs");
    setIsOpen(false);
  }, [draftParams, router]);

  const handleReset = useCallback(() => {
    setDraftParams(resetFacetFilters(params));
    setSidebarKey((k) => k + 1);
  }, [params]);

  const hasResults = resultCount > 0;

  return (
    <>
      {/* Trigger — pill button, only visible below lg breakpoint */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 h-10 min-h-touch px-3 rounded-full border border-border bg-surface text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
        aria-label={t("filter.title")}
      >
        <svg
          viewBox="0 0 14 14"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M2 3h10M4 7h6M5.5 11h3" />
        </svg>
        {t("filter.title")}
        {activeFilterCount > 0 && (
          <>
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold">{activeFilterCount}</span>
          </>
        )}
      </button>

      {/* Full-screen dialog for mobile */}
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="filter-modal backdrop:bg-black/40"
      >
        <div className="flex flex-col h-full">
          {/* Header — sticky, with safe-area padding for the notch */}
          <div
            className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg px-3 py-2.5"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
          >
            {/* Back arrow — signals "go back to the list" */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center size-10 rounded-md text-ink-mute hover:text-ink hover:bg-surface-muted transition-colors shrink-0"
              aria-label="Close filters"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 6 L9 12 L15 18" />
              </svg>
            </button>

            <h2 className="type-title flex-1 min-w-0">{t("filter.title")}</h2>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="h-9 min-h-touch px-3 rounded-md type-caption font-medium text-ink-mute hover:text-ink hover:bg-surface-muted transition-colors shrink-0"
              >
                {t("filter.resetAll")}
              </button>
            )}
          </div>

          {/* Body — scrollable filter content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <FilterSidebar
              key={sidebarKey}
              params={draftParams}
              facets={facets}
              allSources={allSources}
              mode="batch"
              initialParams={draftParams}
              onChange={setDraftParams}
            />
          </div>

          {/* Footer — sticky, with safe-area padding for the home indicator */}
          <div
            className="sticky bottom-0 border-t border-border bg-bg px-4 pt-4"
            style={{
              paddingBottom: "max(16px, env(safe-area-inset-bottom))",
            }}
          >
            <button
              type="button"
              onClick={hasResults ? applyFilters : undefined}
              disabled={!hasResults}
              className={cn(
                "w-full inline-flex items-center justify-center h-11 min-h-touch-primary rounded-full px-5 font-medium transition-colors",
                hasResults
                  ? "bg-accent text-accent-ink hover:opacity-90"
                  : "bg-surface-muted text-ink-mute cursor-not-allowed",
              )}
            >
              {hasResults
                ? t("filter.showResults", { count: resultCount })
                : t("filter.noResults")}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
