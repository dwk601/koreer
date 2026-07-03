import type { JobSummary } from "@/lib/api/schemas";
import { daysSincePosted } from "@/lib/date";

/**
 * Human-readable salary summary. Returns null when salary is not listed
 * so the caller can fall back to a localized "not listed" string.
 *
 *   formatSalary({salary_min: 80000, salary_max: 120000, salary_unit: 'yearly', salary_currency: 'USD'})
 *     -> "$80K-$120K/yr"
 */
export function formatSalary(
  job: Pick<
    JobSummary,
    "salary_min" | "salary_max" | "salary_unit" | "salary_currency"
  >,
): string | null {
  const { salary_min, salary_max, salary_unit, salary_currency } = job;
  if (salary_min == null && salary_max == null) return null;

  const currency = (salary_currency ?? "USD").toUpperCase();
  const symbol = currency === "USD" ? "$" : currency + " ";

  const unitSuffix =
    salary_unit === "yearly"
      ? "/yr"
      : salary_unit === "monthly"
        ? "/mo"
        : salary_unit === "weekly"
          ? "/wk"
          : salary_unit === "daily"
            ? "/day"
            : salary_unit === "hourly"
              ? "/hr"
              : "";

  const fmt = (n: number) => {
    if (salary_unit === "hourly") return n.toFixed(0);
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toFixed(0);
  };

  if (salary_min != null && salary_max != null && salary_min !== salary_max) {
    return `${symbol}${fmt(salary_min)}-${symbol}${fmt(salary_max)}${unitSuffix}`;
  }
  const single = salary_min ?? salary_max!;
  return `${symbol}${fmt(single)}${unitSuffix}`;
}

/**
 * Locale-aware "posted X ago" string. Returns null when post_date is null
 * so callers can render a localized fallback instead of an empty string.
 */
export function formatPostedRelative(
  postDate: string | null,
  locale: string,
  now: Date = new Date(),
): string | null {
  const days = daysSincePosted(postDate, now);
  if (days == null) return null;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (days === 0) return rtf.format(0, "day"); // "today" / "오늘"
  return rtf.format(-days, "day");
}

/** Pretty location string: "Atlanta, GA" / "GA" / "". */
export function formatLocation(
  job: Pick<JobSummary, "location_city" | "location_state">,
): string {
  const parts = [job.location_city, job.location_state].filter(Boolean);
  return parts.join(", ");
}
