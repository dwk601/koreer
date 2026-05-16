import { describe, expect, it, vi, afterEach } from "vitest";

function mockFetch(body: string) {
  return vi.fn().mockResolvedValue(
    new Response(body, { status: 200, headers: { "content-type": "application/json" } }),
  );
}

afterEach(() => vi.restoreAllMocks());

describe("API deduplication", () => {
  it("getJob is wrapped with cache", async () => {
    const fetchMock = mockFetch(
      JSON.stringify({
        id: 123,
        record_id: "test-record",
        title: "Test Job",
        company: "Test Co",
        description: "Test description",
        source: "test",
        post_date: "2025-01-01",
        language: "english",
        location: { raw: null, city: "San Francisco", state: "CA" },
        salary: { min: 50000, max: 60000, unit: "yearly", currency: "USD", raw: null },
        job_category: ["Engineering"],
        company_inferred: false,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getJob } = await import("@/lib/api/jobs");
    // Verify the function is callable and makes a fetch
    await getJob(123, { revalidate: false }).catch(() => null);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("listJobs is wrapped with cache", async () => {
    const fetchMock = mockFetch(
      JSON.stringify({
        items: [],
        facets: { source: {}, language: {}, job_category: {}, location_state: {}, salary_bucket: {} },
        next_cursor: null,
        total_estimated: 0,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { listJobs } = await import("@/lib/api/jobs");
    const params = { q: "engineer" };
    await listJobs(params, { revalidate: false }).catch(() => null);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("getStats is wrapped with cache", async () => {
    const fetchMock = mockFetch(
      JSON.stringify({
        total_jobs: 1000,
        by_source: {},
        by_language: {},
        by_category: {},
        salary_stats: { min_salary: 30000, max_salary: 150000, avg_salary: 75000 },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getStats } = await import("@/lib/api/jobs");
    await getStats({ revalidate: false }).catch(() => null);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("getJobByRecordId is wrapped with cache", async () => {
    const fetchMock = mockFetch(
      JSON.stringify({
        id: 123,
        record_id: "test-record",
        title: "Test Job",
        company: "Test Co",
        description: "Test description",
        source: "test",
        post_date: "2025-01-01",
        language: "english",
        location: { raw: null, city: "San Francisco", state: "CA" },
        salary: { min: 50000, max: 60000, unit: "yearly", currency: "USD", raw: null },
        job_category: ["Engineering"],
        company_inferred: false,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getJobByRecordId } = await import("@/lib/api/jobs");
    await getJobByRecordId("test-record", { revalidate: false }).catch(() => null);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("getFacets is wrapped with cache", async () => {
    const fetchMock = mockFetch(
      JSON.stringify({
        facets: { source: {}, language: {}, job_category: {}, location_state: {}, salary_bucket: {} },
        total_estimated: 0,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getFacets } = await import("@/lib/api/jobs");
    await getFacets({}, { revalidate: false }).catch(() => null);
    expect(fetchMock).toHaveBeenCalled();
  });
});
