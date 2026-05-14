import { z } from "zod";

/**
 * Schemas mirror the real response shape of koreaJobApiV2
 * (see README `Endpoint reference`). They use `.loose()` so forward-compatible
 * fields don't break parsing, but lock down the names we rely on.
 */

export const languageSchema = z.enum(["korean", "english", "bilingual"]);
export type JobLanguage = z.infer<typeof languageSchema>;

export const salaryUnitSchema = z.enum([
  "yearly",
  "monthly",
  "weekly",
  "daily",
  "hourly",
]);
export type SalaryUnit = z.infer<typeof salaryUnitSchema>;

export const sortSchema = z.enum([
  "relevance",
  "newest",
  "salary_high",
  "salary_low",
  "company_az",
]);
export type JobSort = z.infer<typeof sortSchema>;

/** Shape of items returned by the list/search endpoint. */
export const jobSummarySchema = z
  .object({
    id: z.number(),
    record_id: z.string(),
    title: z.string(),
    company: z.string().nullable(),
    company_inferred: z.boolean().optional(),
    location_city: z.string().nullable(),
    location_state: z.string().nullable(),
    salary_min: z.number().nullable(),
    salary_max: z.number().nullable(),
    salary_unit: z.string().nullable(),
    salary_currency: z.string().nullable(),
    language: languageSchema,
    post_date: z.string().nullable(),
    source: z.string(),
  })
  .loose();
export type JobSummary = z.infer<typeof jobSummarySchema>;

/** Detailed shape from `/jobs/{id}` and `/jobs/record/{record_id}`. */
export const jobDetailSchema = z
  .object({
    id: z.number(),
    record_id: z.string(),
    source: z.string(),
    title: z.string(),
    company: z.string().nullable(),
    company_inferred: z.boolean().optional(),
    location: z
      .object({
        raw: z.string().nullable(),
        city: z.string().nullable(),
        state: z.string().nullable(),
      })
      .loose(),
    salary: z
      .object({
        min: z.number().nullable(),
        max: z.number().nullable(),
        unit: z.string().nullable(),
        currency: z.string().nullable(),
        parsed: z.boolean().optional(),
        raw: z.string().nullable(),
      })
      .loose(),
    description: z.string().nullable(),
    description_length: z.number().optional(),
    job_category: z.array(z.string()).default([]),
    language: languageSchema,
    post_date: z.string().nullable(),
    post_date_raw: z.string().nullable().optional(),
    /** External apply / source URL. */
    link: z.string().nullable().optional(),
    contact: z.string().nullable().optional(),
    scraped_at: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .loose();
export type JobDetail = z.infer<typeof jobDetailSchema>;

const facetCountSchema = z.record(z.string(), z.number());

export const facetsSchema = z
  .object({
    source: facetCountSchema.default({}),
    language: facetCountSchema.default({}),
    job_category: facetCountSchema.default({}),
    location_state: facetCountSchema.default({}),
    salary_bucket: facetCountSchema.default({}),
  })
  .loose();
export type Facets = z.infer<typeof facetsSchema>;

export const listResponseSchema = z
  .object({
    items: z.array(jobSummarySchema),
    facets: facetsSchema,
    next_cursor: z.string().nullable().default(null),
    total_estimated: z.number().default(0),
  })
  .loose();
export type ListResponse = z.infer<typeof listResponseSchema>;

export const facetsResponseSchema = z
  .object({
    facets: facetsSchema,
    total_estimated: z.number().default(0),
  })
  .loose();
export type FacetsResponse = z.infer<typeof facetsResponseSchema>;

export const suggestItemSchema = z
  .object({
    value: z.string(),
    type: z.string().optional(),
  })
  .loose();
export type SuggestItem = z.infer<typeof suggestItemSchema>;

export const suggestResponseSchema = z
  .object({
    items: z.array(suggestItemSchema).default([]),
  })
  .loose();
export type SuggestResponse = z.infer<typeof suggestResponseSchema>;

export const statsResponseSchema = z
  .object({
    total_jobs: z.number(),
    by_source: facetCountSchema.default({}),
    by_language: facetCountSchema.default({}),
    by_category: facetCountSchema.default({}),
    salary_stats: z
      .object({
        min_salary: z.number().nullable(),
        max_salary: z.number().nullable(),
        avg_salary: z.number().nullable(),
        sample_size: z.number().optional(),
      })
      .loose()
      .optional(),
  })
  .loose();
export type StatsResponse = z.infer<typeof statsResponseSchema>;

/** Standard error envelope returned on non-2xx responses. */
export const apiErrorSchema = z
  .object({
    error: z
      .object({
        code: z.string().optional(),
        message: z.string().optional(),
        detail: z.unknown().optional(),
      })
      .loose(),
  })
  .loose();
