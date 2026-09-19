import { describe, expect, it } from "vitest";

import { assertLocale } from "@/lib/i18n/assert-locale";
import { routing } from "@/lib/i18n/routing";

const NOT_FOUND_DIGEST = "NEXT_HTTP_ERROR_FALLBACK;404";

function digestOf(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (error) {
    return (error as { digest?: string }).digest;
  }
  return undefined;
}

/** Junk single-segment paths taken from the production access log pattern. */
const SCANNER_SEGMENTS = [
  "wp-login.php",
  "wp-admin.php",
  "xmlrpc.php",
  ".env",
  ".git",
  ".DS_Store",
  "config.json.bak",
  "index.php",
  "phpinfo.php",
  "robots.txtx",
  "favicon.icons",
  "sitemap.xml.bak",
];

describe("assertLocale: accepted values", () => {
  it.each(routing.locales)("accepts the configured locale %s", (locale) => {
    expect(assertLocale(locale)).toBe(locale);
  });

  it("returns a value that is always safe for Intl constructors", () => {
    for (const locale of routing.locales) {
      const validated = assertLocale(locale);
      expect(() => new Intl.NumberFormat(validated)).not.toThrow();
      expect(() => new Intl.DateTimeFormat(validated)).not.toThrow();
      expect(() => new Intl.RelativeTimeFormat(validated)).not.toThrow();
    }
  });
});

describe("assertLocale: rejected values produce a 404, not a 500", () => {
  it.each(SCANNER_SEGMENTS)("rejects scanner path %s with the Next 404 digest", (segment) => {
    expect(() => assertLocale(segment)).toThrow();
    expect(digestOf(() => assertLocale(segment))).toBe(NOT_FOUND_DIGEST);
  });

  it("rejects the exact segment from the production stack trace before Intl runs", () => {
    // Without the guard this is the crash: RangeError from Intl.NumberFormat.
    expect(() => new Intl.NumberFormat("wp-login.php")).toThrow(RangeError);
    expect(digestOf(() => assertLocale("wp-login.php"))).toBe(NOT_FOUND_DIGEST);
  });

  it.each([
    ["", "empty segment"],
    [" ", "whitespace"],
    ["KO", "uppercase"],
    ["Ko", "mixed case"],
    ["ko-KR", "region subtag"],
    ["en-US", "region subtag"],
    ["en_US", "underscore form (invalid for Intl)"],
    ["kO", "mixed case"],
    ["ko ", "trailing space"],
    [" ko", "leading space"],
    ["ko/en", "path separator"],
    ["jobs", "app route segment"],
    ["..", "traversal"],
    ["zh", "unsupported locale"],
    ["x".repeat(300), "overlong segment"],
    ["한국어", "non-ascii"],
  ])("rejects %s (%s)", (segment) => {
    expect(digestOf(() => assertLocale(segment))).toBe(NOT_FOUND_DIGEST);
  });

  it("is an exact allowlist of routing.locales, nothing more", () => {
    const accepted = [
      ...routing.locales,
      "KO",
      "ko-KR",
      "en-GB",
      "eng",
      "kor",
      "wp-login.php",
    ].filter((candidate) => {
      try {
        assertLocale(candidate);
        return true;
      } catch {
        return false;
      }
    });
    expect(accepted).toEqual([...routing.locales]);
  });
});
