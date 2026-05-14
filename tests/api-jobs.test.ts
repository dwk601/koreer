import { describe, expect, it, vi, afterEach } from "vitest";
import { freshnessCutoff } from "@/lib/date";

// Minimal valid list/facets response shapes
const listBody = JSON.stringify({
  items: [],
  facets: { source: {}, language: {}, job_category: {}, location_state: {}, salary_bucket: {} },
  next_cursor: null,
  total_estimated: 0,
});
const facetsBody = JSON.stringify({
  facets: { source: {}, language: {}, job_category: {}, location_state: {}, salary_bucket: {} },
  total_estimated: 0,
});

function mockFetch(body: string) {
  return vi.fn().mockResolvedValue(
    new Response(body, { status: 200, headers: { "content-type": "application/json" } }),
  );
}

afterEach(() => vi.restoreAllMocks());

describe("listJobs freshness injection", () => {
  it("injects post_date_from = today-60d when caller omits it", async () => {
    const fetchMock = mockFetch(listBody);
    vi.stubGlobal("fetch", fetchMock);
    const { listJobs } = await import("@/lib/api/jobs");
    await listJobs({}, { revalidate: false }).catch(() => null);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("post_date_from")).toBe(freshnessCutoff());
  });

  it("respects caller-supplied post_date_from override", async () => {
    const fetchMock = mockFetch(listBody);
    vi.stubGlobal("fetch", fetchMock);
    const { listJobs } = await import("@/lib/api/jobs");
    await listJobs({ post_date_from: "2020-01-01" }, { revalidate: false }).catch(() => null);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("post_date_from")).toBe("2020-01-01");
  });
});

describe("getFacets freshness injection", () => {
  it("injects post_date_from = today-60d when caller omits it", async () => {
    const fetchMock = mockFetch(facetsBody);
    vi.stubGlobal("fetch", fetchMock);
    const { getFacets } = await import("@/lib/api/jobs");
    await getFacets({}, { revalidate: false }).catch(() => null);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("post_date_from")).toBe(freshnessCutoff());
  });
});
