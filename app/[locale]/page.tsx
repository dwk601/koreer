import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { SearchBar } from "@/components/search/search-bar";
import { listJobs, getStats } from "@/lib/api/jobs";
import type { ListResponse, StatsResponse } from "@/lib/api/schemas";

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

  // Top 3 categories by volume for the stats strip.
  const topCategories = Object.entries(stats.by_category)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const totalFmt = new Intl.NumberFormat(locale).format(stats.total_jobs);

  return (
    <div className="relative">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:pt-24">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink-mute">
            {t("home.heroEyebrow")}
          </p>
          <h1
            className="mt-5 max-w-4xl font-semibold leading-[1.02] tracking-tight text-balance"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.75rem)" }}
          >
            {t("home.heroTitle")}
            <br />
            <span className="text-ink-mute">{t("home.heroTitleAccent")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-snug text-ink-soft">
            {t("home.heroSub")}
          </p>

          <div className="mt-10 max-w-2xl">
            <SearchBar />
          </div>

          {/* Stats strip */}
          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-3 lg:max-w-2xl">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                {t("home.statsTotal")}
              </dt>
              <dd className="mt-1 font-semibold tracking-tight tabular-nums text-ink" style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}>
                {totalFmt}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                {t("home.statsCategory")}
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {topCategories.map(([cat, count]) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-ink-soft"
                  >
                    <span className="font-medium text-ink capitalize">{cat}</span>
                    <span className="text-ink-mute tabular-nums">
                      {new Intl.NumberFormat(locale).format(count)}
                    </span>
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ---------- RECENT JOBS ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-4 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              {t("home.freshEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("home.freshTitle")}
            </h2>
          </div>
          <Link
            href="/jobs"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
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
 * Subtle, non-generic hero backdrop: a soft diagonal gradient with a thin
 * hairline wash. Uses CSS only so it's zero-cost and respects dark mode.
 */
function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(1200px 400px at 85% -10%, color-mix(in oklab, var(--color-chip-ko-bg) 55%, transparent), transparent 60%), linear-gradient(180deg, transparent, color-mix(in oklab, var(--color-surface-muted) 60%, transparent) 95%)",
      }}
    />
  );
}
