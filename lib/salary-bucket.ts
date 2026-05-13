import type { ListJobsParams } from "@/lib/api/jobs";

/**
 * Salary bucket keys returned by the API facets endpoint. These are view-only
 * summaries of the underlying `salary_min`/`salary_max` fields; to *filter*,
 * we map a bucket back to a (min, max) pair and send that instead.
 */
export type SalaryBucket =
  | "free"
  | "under_40k"
  | "40k_80k"
  | "80k_120k"
  | "over_120k";

export const SALARY_BUCKETS: SalaryBucket[] = [
  "under_40k",
  "40k_80k",
  "80k_120k",
  "over_120k",
  "free",
];

/** Infer the active bucket from an already-parsed `ListJobsParams`. */
export function inferSalaryBucket(
  params: Pick<ListJobsParams, "salary_min" | "salary_max">,
): SalaryBucket | undefined {
  const { salary_min: min, salary_max: max } = params;
  if (min === undefined && max === undefined) return undefined;
  if (min === undefined && max === 40_000) return "under_40k";
  if (min === 40_000 && max === 80_000) return "40k_80k";
  if (min === 80_000 && max === 120_000) return "80k_120k";
  if (min === 120_000 && max === undefined) return "over_120k";
  return undefined;
}

/** Return the min/max pair that maps to a bucket. `free` clears both. */
export function bucketToRange(
  bucket: SalaryBucket,
): { salary_min?: number; salary_max?: number } {
  switch (bucket) {
    case "free":
      return { salary_min: undefined, salary_max: undefined };
    case "under_40k":
      return { salary_min: undefined, salary_max: 40_000 };
    case "40k_80k":
      return { salary_min: 40_000, salary_max: 80_000 };
    case "80k_120k":
      return { salary_min: 80_000, salary_max: 120_000 };
    case "over_120k":
      return { salary_min: 120_000, salary_max: undefined };
  }
}
