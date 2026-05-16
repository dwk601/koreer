/**
 * Typed API callers for the koreaJobApiV2 REST API.
 *
 * All read functions (getJob, getJobByRecordId, listJobs, getStats, getFacets)
 * are wrapped with React.cache() for per-request deduplication. This ensures
 * that identical calls within a single render pass hit a cached promise,
 * reducing upstream API load. Cross-request caching is handled by the
 * upstream API's Redis layer.
 */

import { cache } from "react";
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

/** Primary list/search endpoint.
 * Per-request memoized via React.cache() — repeated calls with the same params object
 * within one request hit a cached promise. Callers must pass the same params reference
 * for dedup to work (the jobs list page does this via a single parseListParams call).
 */
export const listJobs = cache(
  async (
    params: ListJobsParams = {},
    options: Pick<ApiFetchOptions, "revalidate" | "signal" | "tags" | "timeoutMs"> = {},
  ): Promise<ListResponse> => {
    return apiFetch("/api/v1/jobs", listResponseSchema, {
      query: toQuery(withFreshnessDefault(params)),
      revalidate: 60,
      tags: ["jobs:list"],
      ...options,
    });
  },
);

/** Filter-aware facet counts; useful for sidebar UIs.
 * Per-request memoized via React.cache() — repeated calls with the same params object
 * within one request hit a cached promise.
 */
export const getFacets = cache(
  async (
    params: ListJobsParams = {},
    options: Pick<ApiFetchOptions, "revalidate" | "signal" | "tags" | "timeoutMs"> = {},
  ): Promise<FacetsResponse> => {
    return apiFetch("/api/v1/jobs/facets", facetsResponseSchema, {
      query: toQuery(withFreshnessDefault(params)),
      revalidate: 120,
      tags: ["jobs:facets"],
      ...options,
    });
  },
);

/** Detail lookup by numeric id. Throws `ApiError` with status=404 if missing.
 * Per-request memoized via React.cache() — repeated calls with the same id within
 * one request hit a cached promise.
 */
export const getJob = cache(
  async (
    id: number,
    options: Pick<ApiFetchOptions, "revalidate" | "signal" | "timeoutMs"> = {},
  ): Promise<JobDetail> => {
    return apiFetch(`/api/v1/jobs/${encodeURIComponent(String(id))}`, jobDetailSchema, {
      revalidate: 300,
      ...options,
    });
  },
);

/** Detail lookup by scraper-stable record_id.
 * Per-request memoized via React.cache() — repeated calls with the same recordId within
 * one request hit a cached promise.
 */
export const getJobByRecordId = cache(
  async (
    recordId: string,
    options: Pick<ApiFetchOptions, "revalidate" | "signal"> = {},
  ): Promise<JobDetail> => {
    return apiFetch(
      `/api/v1/jobs/record/${encodeURIComponent(recordId)}`,
      jobDetailSchema,
      {
        revalidate: 300,
        ...options,
      },
    );
  },
);

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

/** Aggregate stats (total jobs, breakdowns, salary stats).
 * Per-request memoized via React.cache() — repeated calls within one request
 * hit a cached promise.
 */
export const getStats = cache(
  async (
    options: Pick<ApiFetchOptions, "revalidate" | "signal"> = {},
  ): Promise<StatsResponse> => {
    return apiFetch("/api/v1/jobs/stats", statsResponseSchema, {
      revalidate: 300,
      tags: ["jobs:stats"],
      ...options,
    });
  },
);
