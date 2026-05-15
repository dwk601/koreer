"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { useRouter } from "@/lib/i18n/navigation";
import type { ListJobsParams } from "@/lib/api/jobs";
import { toQueryString } from "@/lib/url/search-params";
import type { JobSort } from "@/lib/api/schemas";

const OPTIONS: JobSort[] = [
  "relevance",
  "newest",
  "salary_high",
  "salary_low",
  "company_az",
];

export function SortSelect({
  params,
  className,
}: {
  params: ListJobsParams;
  className?: string;
}) {
  const t = useTranslations("jobs.sort");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const current = params.sort ?? (params.q ? "relevance" : "newest");

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextSort = e.target.value as JobSort;
    const next = { ...params, sort: nextSort, cursor: undefined, page: undefined };
    const qs = toQueryString(next);
    const href = qs ? `/jobs?${qs}` : "/jobs";
    startTransition(() => {
      router.push(href as "/jobs");
    });
  }

  return (
    <label className={className}>
      <span className="sr-only">{t("label")}</span>
      <div className="relative">
        <select
          value={current}
          onChange={onChange}
          className="appearance-none h-10 min-h-touch rounded-full border border-border bg-surface px-4 pr-9 text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
        >
          {OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {t(opt)}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="absolute right-3 top-1/2 -translate-y-1/2 size-[0.625rem] pointer-events-none text-ink-mute"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 4 L6 8 L10 4" />
        </svg>
      </div>
    </label>
  );
}
