"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { FilterSidebar } from "./filter-sidebar";
import type { ListJobsParams } from "@/lib/api/jobs";
import type { Facets } from "@/lib/api/schemas";

type Props = {
  params: ListJobsParams;
  facets: Facets;
  allSources?: Record<string, number>;
  resultCount: number;
};

export function FilterSheet({
  params,
  facets,
  allSources,
  resultCount,
}: Props) {
  const t = useTranslations("jobs");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  const activeFilterCount =
    (params.source?.length ?? 0) +
    (params.language ? 1 : 0) +
    (params.job_category?.length ?? 0) +
    (params.location_state ? 1 : 0) +
    (params.salary_min || params.salary_max ? 1 : 0);

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
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 h-10 min-h-touch px-3 rounded-full border border-border bg-surface text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
        aria-label={t("filter.title")}
      >
        {t("filter.title")}
        {activeFilterCount > 0 && (
          <>
            <span className="inline-block size-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold">{activeFilterCount}</span>
          </>
        )}
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        className="fixed inset-0 z-40 max-h-[85dvh] w-full rounded-t-2xl border-t border-border bg-bg p-0 backdrop:bg-black/40 motion-safe:animate-in motion-safe:slide-in-from-bottom-10 motion-reduce:opacity-70"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
            <h2 className="type-title">{t("filter.title")}</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center size-10 rounded-md text-ink-mute hover:text-ink hover:bg-surface-muted transition-colors"
              aria-label="Close filters"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <FilterSidebar params={params} facets={facets} allSources={allSources} />
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-surface px-4 py-4 sm:px-6 sticky bottom-0">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full inline-flex items-center justify-center h-11 min-h-touch-primary rounded-full bg-accent px-5 font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              {t("filter.showResults", { count: resultCount })}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
