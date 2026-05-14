/**
 * Number of days a job posting is considered "fresh".
 *
 * The whole site is built around this freshness window: we never surface a
 * listing older than this in list views. The cutoff is injected as
 * `post_date_from` on every list/facets request unless a caller explicitly
 * overrides it.
 */
export const FRESHNESS_DAYS = 60;

/**
 * Returns the inclusive earliest date (YYYY-MM-DD, UTC) that a posting can
 * have to still be considered fresh.
 */
export function freshnessCutoff(
  now: Date = new Date(),
  days: number = FRESHNESS_DAYS,
): string {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff.toISOString().slice(0, 10);
}

/** Days between a post_date (YYYY-MM-DD) and `now`. Clamped to ≥ 0.
 *  Returns `null` when `postDate` is null or invalid. */
export function daysSincePosted(
  postDate: string | null,
  now: Date = new Date(),
): number | null {
  if (postDate == null) return null;
  const then = new Date(postDate + "T00:00:00Z").getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = now.getTime() - then;
  return Math.max(0, Math.floor(diffMs / 86_400_000));
}
