import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { routing, type Locale } from "./routing";

/**
 * Narrow a dynamic route segment to one of the locales supported by the app.
 *
 * Dynamic segments can still be rendered before a parent layout decides that
 * the route is invalid, so pages must perform this check themselves before
 * doing any locale-sensitive work.
 */
export function assertLocale(locale: string): Locale {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return locale;
}
