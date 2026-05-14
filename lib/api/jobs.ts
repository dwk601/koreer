import { apiFetch, type ApiFetchOptions } from "./client";
import { freshnessCutoff } from "@/lib/date";
import {
  facetsResponseSchema,
  jobDetailSchema,
  listResponseSchema,
  statsResponseSchema,
  suggestResponseSchema,
  type FacetsResponse,
  type JobDetail,
  type ListResponse,
  type StatsResponse,
  type SuggestResponse,
} from "./schemas";

/**
 * Shared parameter shape for list + facets. Mirrors the FastAPI query
 * signature; all fields are optional.
 */
export interface ListJobsParams {
  q?: string;
  source?: string[];
  language?: "korean" | "english" | "bilingual";
  job_category?: string[];
  location_state?: string;
  location_city?: string;
  salary_min?: number;
  salary_max?: number;
  salary_unit?: string;
  salary_currency?: string;
  /** Filter by start of posting date range. */
  post_date_from?: string;
  post_date_to?: string;
  company_inferred?: boolean;
  sort?: "relevance" | "newest" | "salary_high" | "salary_low" | "company_az";
  cursor?: string;
  limit?: number;
}

/** Fills in post_date_from = today − 60d unless the caller already set it. */
function withFreshnessDefault(params: ListJobsParams): ListJobsParams {
  if (params.post_date_from) return params;
  return { ...params, post_date_from: freshnessCutoff() };
}

function toQuery(params: ListJobsParams): ApiFetchOptions["query"] {
  return {
    q: params.q,
    source: params.source,
    language: params.language,
    job_category: params.job_category,
    location_state: params.location_state,
    location_city: params.location_city,
    salary_min: params.salary_min,
    salary_max: params.salary_max,
    salary_unit: params.salary_unit,
    salary_currency: params.salary_currency,
    post_date_from: params.post_date_from,
    post_date_to: params.post_date_to,
    company_inferred: params.company_inferred,
    sort: params.sort,
    cursor: params.cursor,
    limit: params.limit,
  };
}

/** Primary list/search endpoint. */
export async function listJobs(
  params: ListJobsParams = {},
  options: Pick<ApiFetchOptions, "revalidate" | "signal" | "tags" | "timeoutMs"> = {},
): Promise<ListResponse> {
  return apiFetch("/api/v1/jobs", listResponseSchema, {
    query: toQuery(withFreshnessDefault(params)),
    revalidate: 60,
    tags: ["jobs:list"],
    ...options,
  });
}

/** Filter-aware facet counts; useful for sidebar UIs. */
export async function getFacets(
  params: ListJobsParams = {},
  options: Pick<ApiFetchOptions, "revalidate" | "signal" | "tags" | "timeoutMs"> = {},
): Promise<FacetsResponse> {
  return apiFetch("/api/v1/jobs/facets", facetsResponseSchema, {
    query: toQuery(withFreshnessDefault(params)),
    revalidate: 120,
    tags: ["jobs:facets"],
    ...options,
  });
}

/** Detail lookup by numeric id. Throws `ApiError` with status=404 if missing. */
export async function getJob(
  id: number,
  options: Pick<ApiFetchOptions, "revalidate" | "signal" | "timeoutMs"> = {},
): Promise<JobDetail> {
  return apiFetch(`/api/v1/jobs/${encodeURIComponent(String(id))}`, jobDetailSchema, {
    revalidate: 300,
    ...options,
  });
}

/** Detail lookup by scraper-stable record_id. */
export async function getJobByRecordId(
  recordId: string,
  options: Pick<ApiFetchOptions, "revalidate" | "signal"> = {},
): Promise<JobDetail> {
  return apiFetch(
    `/api/v1/jobs/record/${encodeURIComponent(recordId)}`,
    jobDetailSchema,
    {
      revalidate: 300,
      ...options,
    },
  );
}

/** Autocomplete suggestions for the search box. */
export async function suggestJobs(
  q: string,
  opts: { limit?: number; signal?: AbortSignal } = {},
): Promise<SuggestResponse> {
  if (!q || q.trim().length === 0) return { items: [] };
  return apiFetch("/api/v1/jobs/suggest", suggestResponseSchema, {
    query: { q, limit: opts.limit ?? 8 },
    revalidate: 30,
    signal: opts.signal,
    tags: ["jobs:suggest"],
  });
}

/** Aggregate stats (total jobs, breakdowns, salary stats). */
export async function getStats(
  options: Pick<ApiFetchOptions, "revalidate" | "signal"> = {},
): Promise<StatsResponse> {
  return apiFetch("/api/v1/jobs/stats", statsResponseSchema, {
    revalidate: 300,
    tags: ["jobs:stats"],
    ...options,
  });
}
