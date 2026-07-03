import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { SearchBar } from "@/components/search/search-bar";
import { listJobs, getStats } from "@/lib/api/jobs";
import type { ListResponse, StatsResponse } from "@/lib/api/schemas";
import { SOURCE_LABEL } from "@/lib/sources";

// The home page surfaces the freshest jobs + live stats. Render on-demand
// (with the API client's 60s revalidation) so we never serve stale results
// after a build, and so build does not depend on upstream availability.
export const dynamic = "force-dynamic";

const emptyList: ListResponse = {
  items: [],
  facets: {
    source: {},
    language: {},
    job_category: {},
    location_state: {},
    salary_bucket: {},
  },
  next_cursor: null,
  total_estimated: 0,
};
const emptyStats: StatsResponse = {
  total_jobs: 0,
  by_source: {},
  by_language: {},
  by_category: {},
};

async function safeListJobs() {
  try {
    return await listJobs({ limit: 6, sort: "newest" });
  } catch {
    return emptyList;
  }
}
async function safeGetStats() {
  try {
    return await getStats();
  } catch {
    return emptyStats;
  }
}

/**
 * Home page — editorial hero, search, recent jobs, live stats.
 *
 * Pure Server Component. Parallel-fetches `listJobs` + `getStats` so the
 * page renders in a single round-trip to the API.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  // Parallel fetches — independent requests should never await sequentially.
  const [list, stats] = await Promise.all([safeListJobs(), safeGetStats()]);

  const totalFmt = new Intl.NumberFormat(locale).format(stats.total_jobs);
  const sourceCount = Object.keys(stats.by_source).length || Object.keys(SOURCE_LABEL).length;

  return (
    <div className="relative">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:pt-28">
          <p className="type-label text-ink-mute">
            {t("home.heroEyebrow")}
          </p>
          <h1 className="mt-5 max-w-4xl type-display">
            {t("home.heroTitle")}
            <span className="block mt-2 type-headline text-ink-mute">
              {t("home.heroTitleAccent")}
            </span>
          </h1>
          <p className="mt-6 max-w-xl type-body text-ink-soft">
            {t("home.heroSub")}
          </p>

          <div className="mt-10 max-w-2xl">
            <SearchBar />
          </div>

          {/* Stats sentence */}
          <p className="mt-14 border-t border-border pt-8 max-w-2xl type-body text-ink-soft">
            {t("home.statsLine", { total: totalFmt, sources: sourceCount })}
          </p>
        </div>
      </section>

      {/* ---------- RECENT JOBS ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-4 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="type-label text-ink-mute">
              {t("home.freshEyebrow")}
            </p>
            <h2 className="mt-2 type-title">
              {t("home.freshTitle")}
            </h2>
          </div>
          <Link
            href="/jobs"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 h-10 min-h-touch font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
          >
            {t("home.freshCta")}
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className="size-3 transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M3 2 L9 6 L3 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Subtle, non-generic hero backdrop. A quiet warm wash at top-right with
 * a hairline fade to the muted surface so the stats strip sits on a
 * different plane from the hero. Pure CSS, dark-mode safe via color-mix.
 */
function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(900px 340px at 92% -8%, color-mix(in oklab, var(--color-chip-ko-bg) 65%, transparent), transparent 65%), linear-gradient(180deg, transparent 70%, color-mix(in oklab, var(--color-surface-muted) 45%, transparent) 100%)",
      }}
    />
  );
}
