import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import type { JobSummary } from "@/lib/api/schemas";
import { cn } from "@/lib/cn";
import {
  formatLocation,
  formatPostedRelative,
  formatSalary,
} from "@/lib/format";
import { formatSourceLabel } from "@/lib/sources";

import { LanguageChip } from "@/components/ui/chip";

const LANGUAGE_LABEL: Record<string, string> = {
  korean: "KO",
  english: "EN",
  bilingual: "KO · EN",
};

export async function JobCard({
  job,
  variant = "default",
  className,
}: {
  job: JobSummary;
  variant?: "default" | "compact";
  className?: string;
}) {
  const locale = await getLocale();
  const t = await getTranslations("jobs");

  const location = formatLocation(job);
  const salary = formatSalary(job);
  const posted = formatPostedRelative(job.post_date, locale);
  const languageLabel = LANGUAGE_LABEL[job.language] ?? job.language;
  const sourceLabel = formatSourceLabel(job.source);

  // Build accessible aria-label with full provenance
  const ariaLabelParts = [
    job.title,
    job.company,
    location || t("card.locationUnavailable"),
    salary || t("card.salaryUnavailable"),
    posted || t("card.dateUnknown"),
    languageLabel,
    sourceLabel,
  ].filter(Boolean);
  const ariaLabel = ariaLabelParts.join(", ");

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-[border-color,box-shadow,transform]",
        "hover:border-border-strong hover:shadow-[0_8px_28px_-18px_rgb(var(--shadow-tint)/0.22)] hover:-translate-y-px",
        className,
      )}
    >
      <Link
        href={`/jobs/${job.id}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-focus)] focus-visible:rounded-xl focus:outline-none"
        aria-label={ariaLabel}
      />

      <div className="pointer-events-none relative z-0 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 type-card-title text-ink">
            {job.title}
          </h3>
          {job.company && (
            <p className="mt-1 truncate type-caption text-ink-soft">
              {job.company}
            </p>
          )}
        </div>
        <LanguageChip
          language={job.language}
          label={languageLabel}
          className="relative z-10 shrink-0 pointer-events-auto"
        />
      </div>

      <div className="pointer-events-none relative z-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 type-caption text-ink-mute">
        {location && <span className="truncate">{location}</span>}
        {location && <DotSep />}
        {salary ? (
          <span className="font-medium text-ink-soft">{salary}</span>
        ) : (
          variant === "default" && (
            <span className="text-ink-mute">{t("card.salaryUnavailable")}</span>
          )
        )}
        {salary && <DotSep />}
        {posted != null ? (
          <span>{posted}</span>
        ) : (
          <span className="text-ink-mute">{t("card.dateUnknown")}</span>
        )}
      </div>

      {variant === "default" && (
        <div className="pointer-events-none relative z-0 mt-auto flex items-center justify-between pt-2 type-label text-ink-mute">
          <span className="type-label">{sourceLabel}</span>
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
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
        </div>
      )}
    </article>
  );
}

function DotSep() {
  return (
    <span aria-hidden className="text-ink-mute/50">
      ·
    </span>
  );
}
