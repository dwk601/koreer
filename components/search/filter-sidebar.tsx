"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";

import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";
import type { Facets } from "@/lib/api/schemas";
import type { ListJobsParams } from "@/lib/api/jobs";
import { toQueryString } from "@/lib/url/search-params";
import {
  SALARY_BUCKETS,
  bucketToRange,
  inferSalaryBucket,
  type SalaryBucket,
} from "@/lib/salary-bucket";

const MAX_OPTIONS_COLLAPSED = 8;

const SOURCE_LABEL: Record<string, string> = {
  gtksa: "GTKSA",
  linkedin: "LinkedIn",
  indeed: "Indeed",
  jobkoreausa: "JobKoreaUSA",
  workingus: "WorkingUS",
  wowseattle: "Wow Seattle",
  radiokorea: "Radio Korea",
  koreadaily: "Korea Daily",
};

type Props = {
  params: ListJobsParams;
  facets: Facets;
  className?: string;
};

export function FilterSidebar({ params, facets, className }: Props) {
  const t = useTranslations("jobs.filter");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: ListJobsParams) {
    const qs = toQueryString(next);
    const href = qs ? `/jobs?${qs}` : "/jobs";
    startTransition(() => {
      router.push(href as "/jobs");
    });
  }

  function toggleMulti(key: "source" | "job_category", value: string) {
    const current = params[key] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    navigate({
      ...params,
      [key]: next.length ? next : undefined,
      cursor: undefined,
    });
  }

  function setSingle<K extends keyof ListJobsParams>(
    key: K,
    value: ListJobsParams[K] | undefined,
  ) {
    const nextVal =
      (params[key] as unknown) === (value as unknown) ? undefined : value;
    navigate({ ...params, [key]: nextVal, cursor: undefined });
  }

  function setSalaryBucket(bucket: SalaryBucket) {
    const active = inferSalaryBucket(params);
    if (active === bucket) {
      navigate({
        ...params,
        salary_min: undefined,
        salary_max: undefined,
        cursor: undefined,
      });
      return;
    }
    const range = bucketToRange(bucket);
    navigate({
      ...params,
      salary_min: range.salary_min,
      salary_max: range.salary_max,
      cursor: undefined,
    });
  }

  const activeBucket = useMemo(() => inferSalaryBucket(params), [params]);

  return (
    <aside
      className={cn(
        "flex flex-col gap-1",
        pending && "opacity-70 transition-opacity",
        className,
      )}
      aria-label={t("title")}
    >
      {/* ---- Source ---- */}
      <FacetSection title={t("source")}>
        <CheckboxList
          options={sortEntries(facets.source)}
          selected={params.source ?? []}
          onToggle={(v) => toggleMulti("source", v)}
          labelFor={(v) => SOURCE_LABEL[v] ?? v}
        />
      </FacetSection>

      {/* ---- Language ---- */}
      <FacetSection title={t("language")}>
        <RadioList
          options={sortEntries(facets.language)}
          selected={params.language}
          onSelect={(v) =>
            setSingle(
              "language",
              v as NonNullable<ListJobsParams["language"]>,
            )
          }
          labelFor={(v) =>
            t(`language.${v}` as "language.korean" | "language.english" | "language.bilingual")
          }
        />
      </FacetSection>

      {/* ---- Category ---- */}
      <FacetSection title={t("job_category")}>
        <CheckboxList
          options={sortEntries(facets.job_category)}
          selected={params.job_category ?? []}
          onToggle={(v) => toggleMulti("job_category", v)}
          labelFor={(v) => capitalize(v.replace(/_/g, " "))}
        />
      </FacetSection>

      {/* ---- Location (state) ---- */}
      <FacetSection title={t("location_state")}>
        <RadioList
          options={sortEntries(facets.location_state)}
          selected={params.location_state}
          onSelect={(v) => setSingle("location_state", v)}
          labelFor={(v) => v}
        />
      </FacetSection>

      {/* ---- Salary bucket ---- */}
      <FacetSection title={t("salary_bucket")} defaultOpen>
        <ul className="flex flex-col gap-1">
          {SALARY_BUCKETS.map((bucket) => {
            const count = facets.salary_bucket[bucket] ?? 0;
            if (count === 0) return null;
            const isActive = activeBucket === bucket;
            return (
              <li key={bucket}>
                <label
                  className={cn(
                    "group flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-surface-muted text-ink"
                      : "text-ink-soft hover:bg-surface-muted/60 hover:text-ink",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <input
                      type="radio"
                      name="salary_bucket"
                      className="size-3.5 accent-accent"
                      checked={isActive}
                      onChange={() => setSalaryBucket(bucket)}
                    />
                    <span className="truncate">
                      {t(`salary.${bucket}` as
                        | "salary.free"
                        | "salary.under_40k"
                        | "salary.40k_80k"
                        | "salary.80k_120k"
                        | "salary.over_120k")}
                    </span>
                  </span>
                  <span className="tabular-nums text-[12px] text-ink-mute">
                    {count.toLocaleString()}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </FacetSection>
    </aside>
  );
}

// ---------- Sub-components ----------

function FacetSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-border py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left text-[13px] font-semibold uppercase tracking-[0.08em] text-ink"
        aria-expanded={open}
      >
        {title}
        <svg
          viewBox="0 0 12 12"
          className={cn(
            "size-3 text-ink-mute transition-transform",
            open ? "rotate-180" : "",
          )}
          aria-hidden
        >
          <path
            d="M2 4 L6 8 L10 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </section>
  );
}

function CheckboxList({
  options,
  selected,
  onToggle,
  labelFor,
}: {
  options: Array<[string, number]>;
  selected: string[];
  onToggle: (v: string) => void;
  labelFor: (v: string) => string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, MAX_OPTIONS_COLLAPSED);
  return (
    <div>
      <ul className="flex flex-col gap-0.5">
        {visible.map(([value, count]) => {
          const isChecked = selected.includes(value);
          return (
            <li key={value}>
              <label
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isChecked
                    ? "bg-surface-muted text-ink"
                    : "text-ink-soft hover:bg-surface-muted/60 hover:text-ink",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-3.5 rounded-sm accent-accent"
                    checked={isChecked}
                    onChange={() => onToggle(value)}
                  />
                  <span className="truncate">{labelFor(value)}</span>
                </span>
                <span className="tabular-nums text-[12px] text-ink-mute">
                  {count.toLocaleString()}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > MAX_OPTIONS_COLLAPSED && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-xs font-medium text-ink-mute hover:text-ink"
        >
          {showAll ? "− Show fewer" : `+ Show ${options.length - MAX_OPTIONS_COLLAPSED} more`}
        </button>
      )}
    </div>
  );
}

function RadioList({
  options,
  selected,
  onSelect,
  labelFor,
}: {
  options: Array<[string, number]>;
  selected?: string;
  onSelect: (v: string) => void;
  labelFor: (v: string) => string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, MAX_OPTIONS_COLLAPSED);
  return (
    <div>
      <ul className="flex flex-col gap-0.5">
        {visible.map(([value, count]) => {
          const isActive = selected === value;
          return (
            <li key={value}>
              <label
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-surface-muted text-ink"
                    : "text-ink-soft hover:bg-surface-muted/60 hover:text-ink",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="radio"
                    className="size-3.5 accent-accent"
                    checked={isActive}
                    onChange={() => onSelect(value)}
                  />
                  <span className="truncate">{labelFor(value)}</span>
                </span>
                <span className="tabular-nums text-[12px] text-ink-mute">
                  {count.toLocaleString()}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > MAX_OPTIONS_COLLAPSED && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-xs font-medium text-ink-mute hover:text-ink"
        >
          {showAll ? "− Show fewer" : `+ Show ${options.length - MAX_OPTIONS_COLLAPSED} more`}
        </button>
      )}
    </div>
  );
}

// ---------- helpers ----------

function sortEntries(record: Record<string, number>): Array<[string, number]> {
  return Object.entries(record)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
