// Node-only smoke verification for the API client and URL helpers.
// Run: `npx tsx scripts/verify-api.ts` (dev-only; not shipped).

import { listJobs, getStats, getJob, suggestJobs } from "../lib/api/jobs";
import {
  parseListParams,
  toQueryString,
  toggleInList,
  hasActiveFilters,
} from "../lib/url/search-params";
import { freshnessCutoff, daysSincePosted } from "../lib/date";

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

// --- Unit checks (no network) ---

const cutoff = freshnessCutoff(new Date("2026-05-13T00:00:00Z"));
assert(cutoff === "2026-03-14", `freshnessCutoff(2026-05-13) = ${cutoff}`);

assert(daysSincePosted("2026-05-10", new Date("2026-05-13T00:00:00Z")) === 3, "daysSincePosted 3 days");
assert(daysSincePosted("2026-05-14", new Date("2026-05-13T00:00:00Z")) === 0, "daysSincePosted clamps negative to 0");

const parsed = parseListParams({
  q: "nurse",
  source: ["indeed", "linkedin"],
  language: "korean",
  job_category: "office",
  location_state: "ca",
  salary_min: "50000",
  sort: "newest",
  limit: "500",
});
assert(parsed.q === "nurse", "q parsed");
assert(Array.isArray(parsed.source) && parsed.source.length === 2, "source is array of 2");
assert(parsed.language === "korean", "language parsed");
assert(Array.isArray(parsed.job_category) && parsed.job_category[0] === "office", "job_category array");
assert(parsed.location_state === "CA", "state normalised to uppercase");
assert(parsed.salary_min === 50000, "salary_min int");
assert(parsed.sort === "newest", "sort parsed");
assert(parsed.limit === 100, "limit clamped to 100");

const bad = parseListParams({ sort: "bogus", language: "martian", limit: "-3" });
assert(bad.sort === undefined, "invalid sort dropped");
assert(bad.language === undefined, "invalid language dropped");
assert(bad.limit === 1, "negative limit clamped to 1");

const qs = toQueryString(parsed);
assert(qs.includes("q=nurse") && qs.includes("source=indeed") && qs.includes("source=linkedin"), "toQueryString repeats arrays");

assert(hasActiveFilters(parsed) === true, "hasActiveFilters true when filters applied");
assert(hasActiveFilters(parseListParams({})) === false, "hasActiveFilters false for bare params");

const toggled = toggleInList(parsed, "source", "indeed");
assert(!toggled.includes("source=indeed"), "toggle removes existing value");
const readded = toggleInList({ ...parsed, source: [] }, "source", "indeed");
assert(readded.includes("source=indeed"), "toggle adds missing value");

// --- Network checks (only if API_BASE_URL is reachable) ---

async function main() {
  if (process.env.SKIP_NETWORK === "1") {
    console.log("skipping network checks (SKIP_NETWORK=1)");
    return;
  }
  try {
    const stats = await getStats({ revalidate: false });
    assert(
      typeof stats.total_jobs === "number" && stats.total_jobs > 0,
      `getStats total_jobs=${stats.total_jobs}`,
    );

    const list = await listJobs(
      { limit: 3, sort: "newest" },
      { revalidate: false },
    );
    assert(list.items.length > 0, `listJobs returns items (got ${list.items.length})`);
    const freshestDaysAgo = daysSincePosted(list.items[0]!.post_date);
    assert(
      freshestDaysAgo != null && freshestDaysAgo <= 60,
      `freshest item is within 60 days (${freshestDaysAgo}d)`,
    );
    console.log("  sample:", list.items[0]?.title, "·", list.items[0]?.source);

    const detail = await getJob(list.items[0]!.id, { revalidate: false });
    assert(detail.id === list.items[0]!.id, "getJob returns matching id");

    const sugg = await suggestJobs("nurse", { limit: 3 });
    assert(Array.isArray(sugg.items), `suggestJobs items length ${sugg.items.length}`);
  } catch (e) {
    console.error("network check failed:", (e as Error).message);
    process.exitCode = 1;
  }
}

main();
