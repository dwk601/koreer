import { defineRouting } from "next-intl/routing";

/**
 * Central routing configuration.
 *
 * Korean is the primary audience, so it is the default locale.
 * The prefix strategy keeps both locales visible in URLs for SEO and
 * explicit language selection (`/ko/...`, `/en/...`).
 */
export const routing = defineRouting({
  locales: ["ko", "en"] as const,
  defaultLocale: "ko",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
