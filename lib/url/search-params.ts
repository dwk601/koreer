import { languageSchema, sortSchema } from "@/lib/api/schemas";
import type { ListJobsParams } from "@/lib/api/jobs";

/** Shape accepted for `parseListParams`: Next.js searchParams (already awaited). */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Hard upper bound to match the API (1..100). */
const LIMIT_MIN = 1;
const LIMIT_MAX = 100;
const DEFAULT_LIMIT = 20;

/**
 * Parse loose URL search params into a typed `ListJobsParams` suitable for
 * `listJobs`/`getFacets`. Unknown/invalid values are dropped silently so
 * that a tampered URL never throws.
 */
export function parseListParams(input: RawSearchParams): ListJobsParams {
  const params: ListJobsParams = {};

  const q = firstString(input.q);
  if (q) params.q = q.slice(0, 200);

  const sources = asStringArray(input.source);
  if (sources.length) params.source = sources;

  const lang = firstString(input.language);
  const langParsed = lang ? languageSchema.safeParse(lang) : undefined;
  if (langParsed?.success) params.language = langParsed.data;

  const cats = asStringArray(input.job_category);
  if (cats.length) params.job_category = cats;

  const state = firstString(input.location_state);
  if (state) params.location_state = state.toUpperCase().slice(0, 2);

  const city = firstString(input.location_city);
  if (city) params.location_city = city.slice(0, 80);

  const salaryMin = asInt(input.salary_min);
  if (salaryMin !== undefined && salaryMin >= 0)
    params.salary_min = salaryMin;
  const salaryMax = asInt(input.salary_max);
  if (salaryMax !== undefined && salaryMax >= 0)
    params.salary_max = salaryMax;

  const salaryUnit = firstString(input.salary_unit);
  if (salaryUnit) params.salary_unit = salaryUnit;
  const salaryCurrency = firstString(input.salary_currency);
  if (salaryCurrency) params.salary_currency = salaryCurrency;

  const postFrom = firstString(input.post_date_from);
  if (postFrom && /^\d{4}-\d{2}-\d{2}$/.test(postFrom))
    params.post_date_from = postFrom;
  const postTo = firstString(input.post_date_to);
  if (postTo && /^\d{4}-\d{2}-\d{2}$/.test(postTo))
    params.post_date_to = postTo;

  const sort = firstString(input.sort);
  const sortParsed = sort ? sortSchema.safeParse(sort) : undefined;
  if (sortParsed?.success) params.sort = sortParsed.data;

  const cursor = firstString(input.cursor);
  if (cursor) params.cursor = cursor;

  const limit = asInt(input.limit);
  params.limit = clamp(limit ?? DEFAULT_LIMIT, LIMIT_MIN, LIMIT_MAX);

  return params;
}

/**
 * Serialize the currently active params back into a `URLSearchParams`.
 * Pass `overrides` to change one value while preserving the rest.
 */
export function toQueryString(
  params: ListJobsParams,
  overrides: Partial<ListJobsParams> = {},
): string {
  const merged: ListJobsParams = { ...params, ...overrides };
  const out = new URLSearchParams();

  if (merged.q) out.set("q", merged.q);
  if (merged.source?.length)
    for (const v of merged.source) out.append("source", v);
  if (merged.language) out.set("language", merged.language);
  if (merged.job_category?.length)
    for (const v of merged.job_category) out.append("job_category", v);
  if (merged.location_state) out.set("location_state", merged.location_state);
  if (merged.location_city) out.set("location_city", merged.location_city);
  if (merged.salary_min !== undefined)
    out.set("salary_min", String(merged.salary_min));
  if (merged.salary_max !== undefined)
    out.set("salary_max", String(merged.salary_max));
  if (merged.salary_unit) out.set("salary_unit", merged.salary_unit);
  if (merged.salary_currency)
    out.set("salary_currency", merged.salary_currency);
  if (merged.post_date_from) out.set("post_date_from", merged.post_date_from);
  if (merged.post_date_to) out.set("post_date_to", merged.post_date_to);
  if (merged.sort) out.set("sort", merged.sort);
  if (merged.cursor) out.set("cursor", merged.cursor);
  if (merged.limit && merged.limit !== DEFAULT_LIMIT)
    out.set("limit", String(merged.limit));

  return out.toString();
}

/**
 * Helper that toggles a single value in a multi-valued filter and returns a
 * new query string. Used by FilterSidebar checkboxes.
 */
export function toggleInList(
  params: ListJobsParams,
  key: "source" | "job_category",
  value: string,
): string {
  const current = params[key] ?? [];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  // Reset cursor when filters change — it's no longer valid.
  return toQueryString(params, {
    [key]: next.length ? next : undefined,
    cursor: undefined,
  } as Partial<ListJobsParams>);
}

/** True when `params` has any filter/search applied beyond pagination. */
export function hasActiveFilters(params: ListJobsParams): boolean {
  return Boolean(
    params.q ||
      params.source?.length ||
      params.language ||
      params.job_category?.length ||
      params.location_state ||
      params.location_city ||
      params.salary_min !== undefined ||
      params.salary_max !== undefined ||
      params.salary_unit ||
      params.salary_currency ||
      params.post_date_from ||
      params.post_date_to ||
      (params.sort && params.sort !== "relevance"),
  );
}

// ---------- tiny utilities ----------

function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" && s.trim() !== "" ? s : undefined;
}

function asStringArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.filter((s): s is string => typeof s === "string" && s !== "");
}

function asInt(v: string | string[] | undefined): number | undefined {
  const s = firstString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) && Number.isInteger(n) ? n : undefined;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
