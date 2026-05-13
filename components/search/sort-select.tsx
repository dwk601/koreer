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
    const next = { ...params, sort: nextSort, cursor: undefined };
    const qs = toQueryString(next);
    const href = qs ? `/jobs?${qs}` : "/jobs";
    startTransition(() => {
      router.push(href as "/jobs");
    });
  }

  return (
    <label className={className}>
      <span className="sr-only">{t("label")}</span>
      <select
        value={current}
        onChange={onChange}
        className="h-9 rounded-full border border-border bg-surface px-4 pr-8 text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {t(opt)}
          </option>
        ))}
      </select>
    </label>
  );
}
