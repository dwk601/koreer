import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { getJob, listJobs } from "@/lib/api/jobs";
import type { JobDetail } from "@/lib/api/schemas";
import { LanguageChip, Badge } from "@/components/ui/chip";
import { JobCard } from "@/components/jobs/job-card";
import { formatPostedRelative, formatSalary } from "@/lib/format";
import { formatSourceLabel } from "@/lib/sources";
import { daysSincePosted } from "@/lib/date";

type PageParams = { locale: string; id: string };
type Props = { params: Promise<PageParams> };

const LANGUAGE_LABEL: Record<string, string> = {
  korean: "KO",
  english: "EN",
  bilingual: "KO + EN",
};

async function loadJob(idStr: string): Promise<JobDetail | null> {
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) return null;
  try {
    return await getJob(id);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.code === "TIMEOUT")) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const job = await loadJob(id).catch(() => null);
  if (!job) {
    const t = await getTranslations({ locale, namespace: "error" });
    return { title: t("notFoundJobTitle") };
  }
  const description = (job.description ?? "").replace(/\s+/g, " ").slice(0, 160).trim();
  return {
    title: job.title,
    description: description || undefined,
    alternates: {
      canonical: `/${locale}/jobs/${job.id}`,
      languages: {
        ko: `/ko/jobs/${job.id}`,
        en: `/en/jobs/${job.id}`,
        "x-default": `/ko/jobs/${job.id}`,
      },
    },
    openGraph: {
      type: "article",
      title: job.title,
      description: description || undefined,
      locale: locale === "ko" ? "ko_KR" : "en_US",
    },
    robots: { index: true, follow: true },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const job = await loadJob(id);
  if (!job) notFound();

  const t = await getTranslations();
  const tDetail = await getTranslations("detail");

  const lang = await getLocale();
  const salary = formatSalary({
    salary_min: job.salary.min,
    salary_max: job.salary.max,
    salary_unit: job.salary.unit,
    salary_currency: job.salary.currency,
  });
  const locationDisplay =
    [job.location.city, job.location.state].filter(Boolean).join(", ") || job.location.raw || "";
  const postedRelative = formatPostedRelative(job.post_date, lang);
  const postedAbsolute = job.post_date
    ? new Intl.DateTimeFormat(lang, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(job.post_date + "T00:00:00Z"))
    : "";
  const daysOld = daysSincePosted(job.post_date);
  const languageLabel = LANGUAGE_LABEL[job.language] ?? job.language;
  const sourceLabel = formatSourceLabel(job.source);

  const categories = (job.job_category ?? []).slice(0, 6);
  const description = job.description?.trim() ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/jobs"
        className="inline-flex h-10 min-h-touch items-center gap-2 rounded-full px-3 text-sm font-medium text-ink-mute transition-colors hover:bg-surface-muted/70 hover:text-ink"
      >
        <svg aria-hidden viewBox="0 0 12 12" className="size-3">
          <path
            d="M9 2 L3 6 L9 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {tDetail("backToList")}
      </Link>

      <header className="mt-5 grid gap-6 border-b border-border pb-9 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageChip language={job.language} label={languageLabel} />
            <Badge tone="muted">{sourceLabel}</Badge>
            {daysOld != null && daysOld <= 7 && (
              <Badge tone="accent">
                {daysOld === 0 ? t("jobs.card.postedToday") : postedRelative}
              </Badge>
            )}
          </div>
          <h1 className="mt-5 type-headline text-balance">{job.title}</h1>
          {job.company && <p className="mt-4 type-body text-ink-soft">{job.company}</p>}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-4 lg:sticky lg:top-28">
          <dl className="grid grid-cols-1 gap-4 text-sm">
            <MetaRow label={tDetail("location")} value={locationDisplay || t("jobs.card.locationUnavailable")} />
            <MetaRow label={tDetail("salary")} value={salary ?? t("jobs.card.salaryUnavailable")} />
            <MetaRow
              label={tDetail("postedOn")}
              value={job.post_date ? `${postedRelative} · ${postedAbsolute}` : t("jobs.card.dateUnknown")}
            />
            <MetaRow label={tDetail("source")} value={sourceLabel} />
            {categories.length > 0 && (
              <MetaRow
                label={tDetail("category")}
                value={categories
                  .map((c) => c.replace(/_/g, " "))
                  .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                  .join(", ")}
              />
            )}
          </dl>

          {job.link && (
            <div className="mt-5 border-t border-border pt-4">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group inline-flex h-11 min-h-touch-primary w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
              >
                {tDetail("applyExternal")}
                <span className="grid size-7 place-items-center rounded-full bg-accent-ink/12 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg aria-hidden viewBox="0 0 14 14" className="size-3.5">
                    <path
                      d="M4 3 L11 3 L11 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 3 L3 11"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
              <p className="mt-2 text-xs text-ink-mute">{tDetail("applyNote")}</p>
            </div>
          )}
        </aside>
      </header>

      {description && (
        <article className="prose mt-9 max-w-3xl whitespace-pre-line type-body text-ink-soft">
          {description}
        </article>
      )}

      <RelatedFromSource currentId={job.id} source={job.source} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJobPostingJsonLd(job)) }}
      />
    </div>
  );
}

async function RelatedFromSource({ currentId, source }: { currentId: number; source: string }) {
  const t = await getTranslations("detail");
  const sourceLabel = formatSourceLabel(source);

  let items;
  try {
    const res = await listJobs({ source: [source], sort: "newest", limit: 4 });
    items = res.items.filter((j) => j.id !== currentId).slice(0, 3);
  } catch {
    return null;
  }

  if (items.length < 2) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <p className="type-label text-ink-mute">{t("relatedEyebrow", { source: sourceLabel })}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <h2 className="type-title">{t("relatedTitle")}</h2>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-label text-ink-mute">{label}</dt>
      <dd className="mt-1 font-medium leading-6 text-ink">{value}</dd>
    </div>
  );
}

function buildJobPostingJsonLd(job: JobDetail) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? "",
    datePosted: job.post_date,
    identifier: {
      "@type": "PropertyValue",
      name: "Koreer",
      value: String(job.id),
    },
    hiringOrganization: job.company
      ? {
          "@type": "Organization",
          name: job.company,
        }
      : undefined,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location.city ?? undefined,
        addressRegion: job.location.state ?? undefined,
        addressCountry: "US",
      },
    },
  };

  if (job.salary.min != null || job.salary.max != null) {
    const unitMap: Record<string, string> = {
      yearly: "YEAR",
      monthly: "MONTH",
      weekly: "WEEK",
      daily: "DAY",
      hourly: "HOUR",
    };
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: (job.salary.currency ?? "USD").toUpperCase(),
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary.min ?? undefined,
        maxValue: job.salary.max ?? undefined,
        unitText: unitMap[job.salary.unit ?? ""] ?? "YEAR",
      },
    };
  }

  if (job.link) {
    jsonLd.applicantLocationRequirements = undefined;
    jsonLd.directApply = false;
    jsonLd.url = job.link;
  }

  return JSON.parse(JSON.stringify(jsonLd));
}
