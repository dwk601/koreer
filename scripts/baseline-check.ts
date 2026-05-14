async function main() {
  const origFetch = globalThis.fetch;
  const calls: string[] = [];
  (globalThis as unknown as { fetch: typeof fetch }).fetch = async (url: string, init?: RequestInit) => {
    calls.push(String(url));
    return origFetch(url, init);
  };

  process.env.API_BASE_URL = "https://api-srku356jbc5fqtrtwff3j3pd.50.146.245.162.sslip.io";

  const { listJobs, getStats } = await import("../lib/api/jobs");
  const { parseListParams } = await import("../lib/url/search-params");

  const parsed = parseListParams({ q: "nurse" });

  // Simulate new /jobs page: listJobs (x2 for sidebar+results, deduped) + getStats
  // getFacets is no longer called — sidebar reads listJobs.facets
  await Promise.all([
    listJobs(parsed, { revalidate: false }).catch(() => null), // Results boundary
    listJobs(parsed, { revalidate: false }).catch(() => null), // SidebarFetcher (deduped)
    getStats({ revalidate: false }).catch(() => null),
  ]);

  console.log("=== BASELINE API CALLS ===");
  for (const url of calls) {
    const u = new URL(url);
    console.log(u.pathname + "?" + u.searchParams.toString());
  }
  console.log("\n=== post_date_from present? ===");
  for (const url of calls) {
    const u = new URL(url);
    console.log(u.pathname, "->", u.searchParams.has("post_date_from") ? "YES: " + u.searchParams.get("post_date_from") : "NO");
  }
  const listCalls = calls.filter(u => new URL(u).pathname === "/api/v1/jobs");
  const facetCalls = calls.filter(u => new URL(u).pathname === "/api/v1/jobs/facets");
  console.log("\n=== Redundant facets call? ===");
  console.log("listJobs calls:", listCalls.length);
  console.log("getFacets calls:", facetCalls.length);
}
main().catch(e => { console.error(e); process.exit(1); });
