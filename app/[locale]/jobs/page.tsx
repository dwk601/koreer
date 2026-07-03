import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JobCard } from "@/components/jobs/job-card";
import { SearchBar } from "@/components/search/search-bar";
import { Pagination } from "@/components/jobs/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { FilterSheet } from "@/components/search/filter-sheet";
import { SortSelect } from "@/components/search/sort-select";
import { ActiveFilterChips } from "@/components/search/active-filter-chips";
import { Link } from "@/lib/i18n/navigation";
import { listJobs, getStats } from "@/lib/api/jobs";
import {
  hasActiveFilters,
  parseListParams,
  toQueryString,
  type RawSearchParams,
} from "@/lib/url/search-params";
import type { ListResponse, Facets } from "@/lib/api/schemas";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "jobs" });
  return {
    title: t("pageTitle"),
    alternates: {
      canonical: `/${locale}/jobs`,
      languages: {
        ko: "/ko/jobs",
        en: "/en/jobs",
        "x-default": "/ko/jobs",
      },
    },
  };
}

export default async function JobsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;
  const parsed = parseListParams(raw);
  const t = await getTranslations("jobs");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[0.78fr_1fr] lg:items-end">
        <div>
          <p className="type-label text-ink-mute">{t("freshnessPromise")}</p>
          <h1 className="mt-3 type-headline">{t("pageTitle")}</h1>
        </div>
        <SearchBar initialQuery={parsed.q ?? ""} variant="compact" />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
        <Suspense key={"facets-" + JSON.stringify(parsed)} fallback={<SidebarSkeleton />}>
          <SidebarFetcher parsed={parsed} />
        </Suspense>

        <main>
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <ActiveFilterChips params={parsed} />
            </div>
            <div className="flex items-center justify-between gap-2 lg:justify-end">
              <Suspense fallback={null}>
                <MobileFilterTrigger parsed={parsed} />
              </Suspense>
              <SortSelect params={parsed} />
            </div>
          </div>

          <Suspense key={"results-" + JSON.stringify(parsed)} fallback={<ResultsSkeleton />}>
            <Results parsed={parsed} locale={locale} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

async function SidebarFetcher({ parsed }: { parsed: ReturnType<typeof parseListParams> }) {
  let facets: Facets;
  let allSources: Record<string, number> | undefined;
  try {
    const [listRes, statsRes] = await Promise.all([listJobs(parsed), getStats()]);
    facets = listRes.facets;
    allSources = statsRes.by_source;
  } catch {
    facets = {
      source: {},
      language: {},
      job_category: {},
      location_state: {},
      salary_bucket: {},
    };
  }
  return (
    <div className="hidden lg:block lg:sticky lg:top-28 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1">
      <div className="rounded-2xl border border-border bg-surface/55 p-3">
        <FilterSidebar params={parsed} facets={facets} allSources={allSources} />
      </div>
    </div>
  );
}

async function MobileFilterTrigger({ parsed }: { parsed: ReturnType<typeof parseListParams> }) {
  let facets: Facets;
  let allSources: Record<string, number> | undefined;
  let resultCount = 0;
  try {
    const [listRes, statsRes] = await Promise.all([listJobs(parsed), getStats()]);
    facets = listRes.facets;
    allSources = statsRes.by_source;
    resultCount = listRes.total_estimated;
  } catch {
    facets = {
      source: {},
      language: {},
      job_category: {},
      location_state: {},
      salary_bucket: {},
    };
  }
  return (
    <div className="lg:hidden">
      <FilterSheet
        params={parsed}
        facets={facets}
        allSources={allSources}
        resultCount={resultCount}
      />
    </div>
  );
}

async function Results({
  parsed,
  locale,
}: {
  parsed: ReturnType<typeof parseListParams>;
  locale: string;
}) {
  const t = await getTranslations("jobs");

  let list: ListResponse;
  try {
    list = await listJobs(parsed);
  } catch {
    return (
      <div className="mt-8">
        <EmptyState title={t("noResultsTitle")} description={t("noResultsSub")} />
      </div>
    );
  }

  const count = list.total_estimated;
  const resultsPhrase = t("pageSub", {
    count: new Intl.NumberFormat(locale).format(count),
  });

  if (list.items.length === 0) {
    return (
      <div className="mt-8">
        <p className="type-caption text-ink-mute">{resultsPhrase}</p>
        <EmptyState
          className="mt-6"
          title={t("noResultsTitle")}
          description={t("noResultsSub")}
          action={
            hasActiveFilters(parsed) ? (
              <Link
                href="/jobs"
                className="inline-flex h-10 min-h-touch items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
              >
                {t("clearFilters")}
              </Link>
            ) : null
          }
        />
      </div>
    );
  }

  const baseQs = toQueryString({ ...parsed, cursor: undefined });

  return (
    <section className="mt-6">
      <p className="type-caption text-ink-mute">{resultsPhrase}</p>

      <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {list.items.map((job) => (
          <li key={job.id}>
            <JobCard job={job} />
          </li>
        ))}
      </ul>

      <Pagination
        baseQuery={baseQs}
        cursor={parsed.cursor}
        nextCursor={list.next_cursor}
        page={parsed.page ?? 1}
      />
    </section>
  );
}

async function SidebarSkeleton() {
  const t = await getTranslations("app");
  return (
    <div aria-busy="true" aria-live="polite" className="motion-safe:animate-pulse motion-reduce:opacity-70">
      <span className="sr-only">{t("loading")}</span>
      <div className="hidden rounded-2xl border border-border bg-surface/55 p-4 lg:block">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2 border-b border-border py-4 last:border-b-0">
            <div className="h-3 w-24 rounded bg-surface-muted" />
            <div className="h-3 w-full rounded bg-surface-muted/70" />
            <div className="h-3 w-3/4 rounded bg-surface-muted/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function ResultsSkeleton() {
  const t = await getTranslations("app");
  return (
    <div aria-busy="true" aria-live="polite" className="mt-6 motion-safe:animate-pulse motion-reduce:opacity-70">
      <span className="sr-only">{t("loading")}</span>
      <div className="h-4 w-56 rounded bg-surface-muted" />
      <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="h-[172px] rounded-2xl border border-border bg-surface" />
        ))}
      </ul>
    </div>
  );
}
