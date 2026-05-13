import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/navigation";
import type { JobSummary } from "@/lib/api/schemas";
import { cn } from "@/lib/cn";
import {
  formatLocation,
  formatPostedRelative,
  formatSalary,
} from "@/lib/format";

import { LanguageChip } from "@/components/ui/chip";

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
  const sourceLabel = SOURCE_LABEL[job.source] ?? job.source;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-[border-color,box-shadow,transform]",
        "hover:border-border-strong hover:shadow-[0_8px_28px_-18px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <Link
        href={`/jobs/${job.id}`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none"
        aria-label={job.title}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink">
            {job.title}
          </h3>
          {job.company && (
            <p className="mt-1 truncate text-[13px] text-ink-soft">
              {job.company}
            </p>
          )}
        </div>
        <LanguageChip
          language={job.language}
          label={languageLabel}
          className="relative z-10 shrink-0"
        />
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-mute">
        {location && <span className="truncate">{location}</span>}
        {location && (salary || posted) && <DotSep />}
        {salary ? (
          <span className="font-medium text-ink-soft">{salary}</span>
        ) : (
          variant === "default" && (
            <span className="italic">{t("card.salaryUnavailable")}</span>
          )
        )}
        {salary && posted && <DotSep />}
        <span>{posted}</span>
      </div>

      {variant === "default" && (
        <div className="relative z-10 mt-auto flex items-center justify-between pt-2 text-[10.5px] text-ink-mute">
          <span className="uppercase tracking-[0.14em]">{sourceLabel}</span>
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
