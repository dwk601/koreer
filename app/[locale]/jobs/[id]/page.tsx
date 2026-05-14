import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { getJob } from "@/lib/api/jobs";
import type { JobDetail } from "@/lib/api/schemas";
import { LanguageChip, Badge } from "@/components/ui/chip";
import { formatPostedRelative, formatSalary } from "@/lib/format";
import { daysSincePosted } from "@/lib/date";

// Detail pages cache aggressively via the API client; no need to opt out.
type PageParams = { locale: string; id: string };
type Props = { params: Promise<PageParams> };

const LANGUAGE_LABEL: Record<string, string> = {
  korean: "KO",
  english: "EN",
  bilingual: "KO · EN",
};

const SOURCE_LABEL: Record<string, string> = {
  gtksa: "GTKSA",
  linkedin: "LinkedIn",
  indeed: "Indeed",
  jobkoreausa: "JobKoreaUSA",
  workingus: "WorkingUS",
  wowseattle: "Wow Seattle",
  radiokorea: "Radio Korea",
  koreadaily: "Korea Daily",
};

async function loadJob(idStr: string): Promise<JobDetail | null> {
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) return null;
  try {
    return await getJob(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
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
  const description = (job.description ?? "")
    .replace(/\s+/g, " ")
    .slice(0, 160)
    .trim();
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
    [job.location.city, job.location.state].filter(Boolean).join(", ") ||
    job.location.raw ||
    "";
  const postedRelative = formatPostedRelative(job.post_date, lang);
  const postedAbsolute = job.post_date
    ? new Intl.DateTimeFormat(lang, {
        year: "numeric",
        month: "short",
        day: "numeric",
        // post_date is a date-only string at UTC midnight; pin the formatter to
        // UTC so users west of UTC don't see the previous day.
        timeZone: "UTC",
      }).format(new Date(job.post_date + "T00:00:00Z"))
    : "";
  const daysOld = daysSincePosted(job.post_date);
  const languageLabel = LANGUAGE_LABEL[job.language] ?? job.language;
  const sourceLabel = SOURCE_LABEL[job.source] ?? job.source;

  const categories = (job.job_category ?? []).slice(0, 6);
  const description = job.description?.trim() ?? "";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      {/* Back link */}
      <div className="text-sm">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-ink-mute transition-colors hover:text-ink"
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
      </div>

      {/* Header */}
      <header className="mt-6 flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <LanguageChip language={job.language} label={languageLabel} />
          <Badge tone="muted">{sourceLabel}</Badge>
          {daysOld != null && daysOld <= 7 && (
            <Badge tone="accent">
              {daysOld === 0 ? t("jobs.card.postedToday") : postedRelative}
            </Badge>
          )}
        </div>
        <h1
          className="font-semibold tracking-tight text-balance"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", lineHeight: 1.1 }}
        >
          {job.title}
        </h1>
        {job.company && (
          <p className="text-lg text-ink-soft">{job.company}</p>
        )}

        {/* Meta grid */}
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <MetaRow label={tDetail("location")} value={locationDisplay || "—"} />
          <MetaRow
            label={tDetail("salary")}
            value={salary ?? t("jobs.card.salaryUnavailable")}
          />
          <MetaRow
            label={tDetail("postedOn")}
            value={
              job.post_date
                ? `${postedRelative} · ${postedAbsolute}`
                : "—"
            }
          />
          <MetaRow label={tDetail("source")} value={sourceLabel} />
          {categories.length > 0 && (
            <MetaRow
              label={tDetail("category")}
              value={categories
                .map((c) => c.replace(/_/g, " "))
                .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                .join(", ")}
              wide
            />
          )}
        </dl>

        {job.link && (
          <div className="mt-2">
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
            >
              {tDetail("applyExternal")}
              <svg
                aria-hidden
                viewBox="0 0 14 14"
                className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
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
            </a>
            <p className="mt-2 text-xs text-ink-mute">{tDetail("applyNote")}</p>
          </div>
        )}
      </header>

      {/* Description */}
      {description && (
        <section className="mt-8 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
          {description}
        </section>
      )}

      {/* JSON-LD structured data for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJobPostingJsonLd(job)) }}
      />
    </div>
  );
}

function MetaRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

/**
 * Build schema.org JobPosting structured data.
 * See https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */
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

  if (
    job.salary.min != null ||
    job.salary.max != null
  ) {
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

  // Drop undefined keys for cleaner output.
  return JSON.parse(JSON.stringify(jsonLd));
}
