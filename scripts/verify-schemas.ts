import fs from "node:fs";

async function main() {
  const {
    statsResponseSchema,
    listResponseSchema,
    jobDetailSchema,
    suggestResponseSchema,
    facetsResponseSchema,
  } = await import("../lib/api/schemas.js");

  const FIX = "/tmp/api-fixtures";
  const read = (name: string) =>
    JSON.parse(fs.readFileSync(`${FIX}/${name}.json`, "utf8"));

  function check<T>(label: string, schema: { safeParse: (d: unknown) => { success: boolean; error?: unknown; data?: T } }, data: unknown) {
    const r = schema.safeParse(data);
    if (!r.success) {
      console.error(`FAIL: ${label}`);
      console.error(r.error);
      process.exitCode = 1;
      return undefined;
    }
    console.log(`ok: ${label}`);
    return r.data;
  }

  const stats = check("statsResponseSchema", statsResponseSchema, read("stats"));
  if (stats) console.log(`  total_jobs=${(stats as { total_jobs: number }).total_jobs}`);

  const list = check("listResponseSchema", listResponseSchema, read("list"));
  if (list) {
    const l = list as { items: { title: string; post_date: string }[]; total_estimated: number };
    console.log(`  items=${l.items.length} total=${l.total_estimated} first='${l.items[0]?.title}' posted=${l.items[0]?.post_date}`);
  }

  check("jobDetailSchema", jobDetailSchema, read("detail"));
  check("suggestResponseSchema", suggestResponseSchema, read("suggest"));
  check("facetsResponseSchema", facetsResponseSchema, read("facets"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
