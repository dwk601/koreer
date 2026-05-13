import type { MetadataRoute } from "next";

import { routing } from "@/lib/i18n/routing";
import { listJobs } from "@/lib/api/jobs";

const MAX_DETAIL_URLS = 200;

/**
 * Locale-aware sitemap.
 *
 * Each canonical URL carries `alternates.languages` (Next.js 16 will render
 * these as `<xhtml:link rel="alternate" hreflang="...">` entries) with an
 * `x-default` pointing at the Korean variant since Korean is our primary
 * audience.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [];
  // Home and Jobs for each locale
  for (const path of ["", "/jobs"]) {
    for (const locale of routing.locales) {
      staticEntries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "hourly" : "hourly",
        priority: path === "" ? 1.0 : 0.9,
        alternates: {
          languages: Object.fromEntries([
            ...routing.locales.map((l) => [l, `${base}/${l}${path}`] as const),
            ["x-default", `${base}/${routing.defaultLocale}${path}`] as const,
          ]),
        },
      });
    }
  }

  // Top-N freshest detail pages. If the API is unreachable (build-time in the
  // sandbox, for instance) fall back to the static entries only — better
  // partial sitemap than a failed deploy.
  let detailEntries: MetadataRoute.Sitemap = [];
  try {
    const list = await listJobs(
      { limit: MAX_DETAIL_URLS, sort: "newest" },
      { revalidate: 300 },
    );
    detailEntries = list.items.flatMap((job) => {
      const lastModified = job.post_date
        ? new Date(job.post_date + "T00:00:00Z")
        : now;
      return routing.locales.map((locale) => ({
        url: `${base}/${locale}/jobs/${job.id}`,
        lastModified,
        changeFrequency: "daily" as const,
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries([
            ...routing.locales.map(
              (l) => [l, `${base}/${l}/jobs/${job.id}`] as const,
            ),
            ["x-default", `${base}/${routing.defaultLocale}/jobs/${job.id}`] as const,
          ]),
        },
      }));
    });
  } catch {
    // Silent fallback — structural entries still ship.
  }

  return [...staticEntries, ...detailEntries];
}
