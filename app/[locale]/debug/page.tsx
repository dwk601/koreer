import { getStats, listJobs } from "@/lib/api/jobs";

// Never cache during verification
export const dynamic = "force-dynamic";

/**
 * TEMP: /[locale]/debug renders a raw snapshot of the live API so we can
 * sanity-check types and freshness filtering. Delete before shipping.
 */
export default async function DebugPage() {
  const [stats, list] = await Promise.all([
    getStats({ revalidate: false }),
    listJobs({ limit: 3, sort: "newest" }, { revalidate: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-sm">
      <section>
        <h2 className="font-semibold">stats</h2>
        <pre className="overflow-auto rounded-md border border-border bg-surface p-3">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </section>
      <section>
        <h2 className="font-semibold">list (first 3 newest)</h2>
        <p className="text-ink-mute">
          total_estimated: {list.total_estimated} · items:{" "}
          {list.items.length} · next_cursor: {list.next_cursor ?? "null"}
        </p>
        <pre className="overflow-auto rounded-md border border-border bg-surface p-3">
          {JSON.stringify(list.items, null, 2)}
        </pre>
      </section>
    </div>
  );
}
