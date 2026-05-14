import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import type { ListJobsParams } from "@/lib/api/jobs";
import { toQueryString } from "@/lib/url/search-params";
import { inferSalaryBucket } from "@/lib/salary-bucket";
import { formatSourceLabel } from "@/lib/sources";

type ChipSpec = { label: string; removeParams: Partial<ListJobsParams> };

export async function ActiveFilterChips({
  params,
}: {
  params: ListJobsParams;
}) {
  const t = await getTranslations("jobs");

  const chips: ChipSpec[] = [];

  if (params.q) {
    chips.push({
      label: `"${params.q}"`,
      removeParams: { q: undefined },
    });
  }

  for (const value of params.source ?? []) {
    chips.push({
      label: formatSourceLabel(value),
      removeParams: {
        source: (params.source ?? []).filter((v) => v !== value),
      },
    });
  }

  if (params.language) {
    chips.push({
      label: t(
        `languageLabel.${params.language}` as
          | "languageLabel.korean"
          | "languageLabel.english"
          | "languageLabel.bilingual",
      ),
      removeParams: { language: undefined },
    });
  }

  for (const value of params.job_category ?? []) {
    chips.push({
      label: capitalize(value.replace(/_/g, " ")),
      removeParams: {
        job_category: (params.job_category ?? []).filter((v) => v !== value),
      },
    });
  }

  if (params.location_state) {
    chips.push({
      label: params.location_state,
      removeParams: { location_state: undefined },
    });
  }

  const activeBucket = inferSalaryBucket(params);
  if (activeBucket) {
    chips.push({
      label: t(
        `salaryLabel.${activeBucket}` as
          | "salaryLabel.free"
          | "salaryLabel.under_40k"
          | "salaryLabel.40k_80k"
          | "salaryLabel.80k_120k"
          | "salaryLabel.over_120k",
      ),
      removeParams: { salary_min: undefined, salary_max: undefined },
    });
  }

  if (chips.length === 0) return null;

  const allClearQs = toQueryString({
    // preserve only the sort; drop every other filter + q
    sort: params.sort,
    limit: params.limit,
  });
  const allClearHref = allClearQs ? `/jobs?${allClearQs}` : "/jobs";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => {
        const nextQs = toQueryString(
          { ...params, cursor: undefined },
          chip.removeParams,
        );
        const href = nextQs ? `/jobs?${nextQs}` : "/jobs";
        return (
          <Link
            key={`${chip.label}-${i}`}
            href={href as "/jobs"}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
          >
            <span className="font-medium">{chip.label}</span>
            <svg
              aria-hidden
              viewBox="0 0 10 10"
              className="size-2.5 text-ink-mute group-hover:text-ink"
            >
              <path
                d="M2 2 L8 8 M8 2 L2 8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        );
      })}
      {chips.length > 1 && (
        <Link
          href={allClearHref as "/jobs"}
          className="text-[12px] font-medium text-ink-mute underline-offset-2 hover:text-ink hover:underline"
        >
          {t("clearFilters")}
        </Link>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
