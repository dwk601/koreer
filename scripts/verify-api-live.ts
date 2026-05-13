import dns from "node:dns";

// Sandbox-only: force all DNS lookups to the Tailscale IP for the Coolify host.
const origLookup = dns.lookup;
(dns as unknown as { lookup: typeof dns.lookup }).lookup = ((
  hostname: string,
  opts: unknown,
  cb?: unknown,
) => {
  const callback = (typeof opts === "function" ? opts : cb) as (
    e: Error | null,
    a: string,
    f: number,
  ) => void;
  if (hostname.endsWith("sslip.io")) {
    return callback(null, "100.92.189.13", 4);
  }
  return origLookup(hostname, opts as never, callback as never);
}) as typeof dns.lookup;

// Traefik listens on :80 for this host; use http://.
process.env.API_BASE_URL =
  "http://api-srku356jbc5fqtrtwff3j3pd.50.146.245.162.sslip.io";

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

async function main() {
  const { listJobs, getStats, getJob, suggestJobs, getFacets } = await import(
    "../lib/api/jobs.js"
  );
  const { daysSincePosted } = await import("../lib/date.js");

  const stats = await getStats({ revalidate: false });
  assert(stats.total_jobs > 0, `stats.total_jobs = ${stats.total_jobs}`);

  const list = await listJobs(
    { limit: 5, sort: "newest" },
    { revalidate: false },
  );
  assert(list.items.length > 0, `list returns ${list.items.length} items`);
  const age = daysSincePosted(list.items[0]!.post_date);
  assert(age <= 60, `freshest item is ${age} days old (≤60)`);
  console.log(
    "  sample:",
    list.items[0]?.title,
    "·",
    list.items[0]?.company ?? "(no company)",
    "·",
    list.items[0]?.source,
  );

  const f = await getFacets({ q: "nurse" }, { revalidate: false });
  assert(
    typeof f.facets.language.korean === "number" ||
      typeof f.facets.language.english === "number",
    `facets.language has counts`,
  );

  const detail = await getJob(list.items[0]!.id, { revalidate: false });
  assert(detail.id === list.items[0]!.id, "detail.id matches");

  const sugg = await suggestJobs("nurse", { limit: 3 });
  assert(Array.isArray(sugg.items), `suggest items (${sugg.items.length})`);
}

main().catch((e) => {
  console.error("network check failed:", (e as Error).message);
  process.exit(1);
});
