import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { SearchBar } from "@/components/search/search-bar";
import { listJobs, getStats } from "@/lib/api/jobs";
import type { ListResponse, StatsResponse } from "@/lib/api/schemas";
import { SOURCE_LABEL, formatSourceLabel } from "@/lib/sources";

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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const [list, stats] = await Promise.all([safeListJobs(), safeGetStats()]);

  const totalFmt = new Intl.NumberFormat(locale).format(stats.total_jobs);
  const sourceEntries = Object.entries(stats.by_source).length
    ? Object.entries(stats.by_source)
    : Object.keys(SOURCE_LABEL).map((key) => [key, 0] as [string, number]);
  const sourceCount = sourceEntries.length || Object.keys(SOURCE_LABEL).length;
  const topSources = sourceEntries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5);

  return (
    <div className="relative overflow-hidden">
      <HeroBackdrop />

      <section className="relative mx-auto grid min-h-[calc(100dvh-4.5rem)] w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.72fr)] lg:gap-12 lg:pt-12">
        <div>
          <p className="type-label text-ink-mute">{t("home.heroEyebrow")}</p>
          <h1 className="mt-5 max-w-4xl type-display">
            {t("home.heroTitle")}
            <span className="block text-ink-mute">{t("home.heroTitleAccent")}</span>
          </h1>
          <p className="mt-7 max-w-xl type-body text-ink-soft">
            {t("home.heroSub")}
          </p>

          <div className="mt-9 max-w-2xl">
            <SearchBar />
          </div>
        </div>

        <aside className="paper-panel rounded-[2rem] p-3 lg:translate-y-10">
          <div className="rounded-[1.55rem] border border-border bg-bg/70 p-5 sm:p-6">
            <p className="type-label text-ink-mute">{t("home.statsEyebrow")}</p>
            <div className="mt-5 border-b border-border pb-5">
              <p className="text-[clamp(3rem,7vw,5rem)] font-semibold leading-none tracking-[-0.06em] tabular-nums">
                {totalFmt}
              </p>
              <p className="mt-2 type-caption text-ink-mute">
                {t("home.statsLine", { total: totalFmt, sources: sourceCount })}
              </p>
            </div>
            <ul className="mt-5 space-y-2.5">
              {topSources.map(([source, count]) => (
                <li key={source} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                  <span className="truncate text-ink-soft">{formatSourceLabel(source)}</span>
                  <span className="tabular-nums text-ink-mute">
                    {new Intl.NumberFormat(locale).format(count)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-5 border-t border-border pt-10 md:grid-cols-[0.7fr_1fr] md:items-end">
          <div>
            <p className="type-label text-ink-mute">{t("home.freshEyebrow")}</p>
            <h2 className="mt-3 type-title">{t("home.freshTitle")}</h2>
          </div>
          <div className="flex items-end justify-between gap-4 md:justify-end">
            <p className="hidden max-w-sm text-sm leading-6 text-ink-mute md:block">
              {t("home.freshSub")}
            </p>
            <Link
              href="/jobs"
              className="group inline-flex h-11 min-h-touch-primary items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
            >
              {t("home.freshCta")}
              <span className="grid size-7 place-items-center rounded-full bg-accent-ink/12 transition-transform group-hover:translate-x-0.5">
                <svg aria-hidden viewBox="0 0 12 12" className="size-3">
                  <path
                    d="M3 2 L9 6 L3 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(900px 380px at 88% 4%, color-mix(in oklab, var(--color-chip-ko-bg) 58%, transparent), transparent 68%), radial-gradient(760px 360px at 12% 28%, color-mix(in oklab, var(--color-surface) 72%, transparent), transparent 72%), linear-gradient(180deg, transparent 72%, color-mix(in oklab, var(--color-surface-muted) 42%, transparent) 100%)",
      }}
    />
  );
}
