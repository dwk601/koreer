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
  type JobSummary,
  type JobDetail,
  type ListResponse,
  type StatsResponse,
  type SuggestResponse,
} from "./schemas";

const E2E_MOCK_API = process.env.E2E_MOCK_API === "1";

const mockItems: JobSummary[] = [
  {
    id: 123,
    record_id: "rec-123",
    title: "Senior Engineer",
    company: "Tech Corp",
    location_city: "San Francisco",
    location_state: "CA",
    salary_min: 120000,
    salary_max: 160000,
    salary_unit: "yearly",
    salary_currency: "USD",
    language: "english",
    post_date: "2026-05-10",
    source: "indeed",
  },
  {
    id: 456,
    record_id: "rec-456",
    title: "Product Manager",
    company: "StartUp Inc",
    location_city: "New York",
    location_state: "NY",
    salary_min: 100000,
    salary_max: 140000,
    salary_unit: "yearly",
    salary_currency: "USD",
    language: "english",
    post_date: "2026-05-12",
    source: "linkedin",
  },
  {
    id: 1,
    record_id: "rec-1",
    title: "Job with date",
    company: "Company A",
    location_city: "Atlanta",
    location_state: "GA",
    salary_min: null,
    salary_max: null,
    salary_unit: null,
    salary_currency: null,
    language: "english",
    post_date: "2026-05-10",
    source: "indeed",
  },
  {
    id: 2,
    record_id: "rec-2",
    title: "Job without date",
    company: "Company B",
    location_city: "Boston",
    location_state: "MA",
    salary_min: null,
    salary_max: null,
    salary_unit: null,
    salary_currency: null,
    language: "english",
    post_date: null,
    source: "linkedin",
  },
  {
    id: 3,
    record_id: "rec-3",
    title: "공고",
    company: "회사",
    location_city: null,
    location_state: null,
    salary_min: null,
    salary_max: null,
    salary_unit: null,
    salary_currency: null,
    language: "korean",
    post_date: null,
    source: "indeed",
  },
];

const mockFacets = {
  source: { indeed: 3, linkedin: 2 },
  language: { english: 4, korean: 1 },
  job_category: { engineering: 2, product: 1 },
  location_state: { CA: 1, NY: 1, GA: 1, MA: 1 },
  salary_bucket: { free: 2, under_40k: 0, "40k_80k": 0, "80k_120k": 1, over_120k: 2 },
};

function toMockDetail(job: JobSummary): JobDetail {
  return {
    id: job.id,
    record_id: job.record_id,
    source: job.source,
    title: job.title,
    company: job.company,
    location: {
      raw: [job.location_city, job.location_state].filter(Boolean).join(", ") || null,
      city: job.location_city,
      state: job.location_state,
    },
    salary: {
      min: job.salary_min,
      max: job.salary_max,
      unit: job.salary_unit,
      currency: job.salary_currency,
      raw: null,
    },
    description: "A deterministic E2E fixture listing used to verify Koreer flows.",
    job_category: ["engineering"],
    language: job.language,
    post_date: job.post_date,
    post_date_raw: job.post_date,
    link: "https://example.com/apply",
  };
}

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
    if (E2E_MOCK_API) {
      return {
        items: mockItems,
        facets: mockFacets,
        next_cursor: params.cursor ? null : "cursor_123",
        total_estimated: mockItems.length,
      };
    }
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
    if (E2E_MOCK_API) {
      return { facets: mockFacets, total_estimated: mockItems.length };
    }
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
    if (E2E_MOCK_API) {
      const job = mockItems.find((item) => item.id === id) ?? mockItems[0];
      return toMockDetail(job);
    }
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
    if (E2E_MOCK_API) {
      const job = mockItems.find((item) => item.record_id === recordId) ?? mockItems[0];
      return toMockDetail(job);
    }
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
  if (E2E_MOCK_API) {
    return {
      items: mockItems
        .filter((item) => item.title.toLowerCase().includes(q.toLowerCase()))
        .slice(0, opts.limit ?? 8)
        .map((item) => ({ value: item.title, type: "title" })),
    };
  }
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
    if (E2E_MOCK_API) {
      return {
        total_jobs: mockItems.length,
        by_source: mockFacets.source,
        by_language: mockFacets.language,
        by_category: mockFacets.job_category,
      };
    }
    return apiFetch("/api/v1/jobs/stats", statsResponseSchema, {
      revalidate: 300,
      tags: ["jobs:stats"],
      ...options,
    });
  },
);
