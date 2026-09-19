import { afterEach, describe, expect, it, vi } from "vitest";

import { formatPostedRelative } from "@/lib/format";
import { assertLocale } from "@/lib/i18n/assert-locale";
import { routing } from "@/lib/i18n/routing";

const NOW = new Date("2026-05-20T12:00:00Z");

describe("formatPostedRelative: never throws on a bad locale", () => {
  it.each(["wp-login.php", "foo.bar", ".env", "en_US", "", "..", "x".repeat(300)])(
    "survives locale %s",
    (locale) => {
      expect(() => formatPostedRelative("2026-05-18", locale, NOW)).not.toThrow();
      expect(formatPostedRelative("2026-05-18", locale, NOW)).toEqual(expect.any(String));
    },
  );

  it("still returns null when there is no post date, whatever the locale", () => {
    expect(formatPostedRelative(null, "wp-login.php", NOW)).toBeNull();
    expect(formatPostedRelative(null, "ko", NOW)).toBeNull();
  });

  it("produces per-locale output for supported locales", () => {
    const ko = formatPostedRelative("2026-05-18", "ko", NOW);
    const en = formatPostedRelative("2026-05-18", "en", NOW);
    expect(ko).not.toBe(en);
    expect(en).toBe("2 days ago");
    expect(ko).toBe("그저께"); // numeric: "auto"
  });

  it("uses numeric: auto for today", () => {
    expect(formatPostedRelative("2026-05-20", "en", NOW)).toBe("today");
    expect(formatPostedRelative("2026-05-20", "ko", NOW)).toBe("오늘");
  });
});

describe("formatPostedRelative locale normalization and fallback", () => {
  it.each([
    ["en-US", "valid BCP-47 English variant"],
    ["en-GB", "valid BCP-47 English variant"],
    ["EN", "uppercase English"],
    ["en-u-nu-latn", "valid Unicode extension"],
  ])("normalizes %s (%s) to the supported base language", (locale) => {
    expect(() => new Intl.RelativeTimeFormat(locale)).not.toThrow();
    expect(formatPostedRelative("2026-05-18", locale, NOW)).toBe("2 days ago");
  });

  it("falls back to Korean for an unsupported caller value", () => {
    const fromBug = formatPostedRelative("2026-05-18", "jobs", NOW);
    const fromKorean = formatPostedRelative("2026-05-18", "ko", NOW);
    expect(fromBug).toBe(fromKorean);
  });

  it("normalization keeps output identical to the base language, not the region", () => {
    const en = formatPostedRelative("2026-05-18", "en", NOW);
    for (const variant of ["en-US", "en-GB", "en-AU", "EN", "en-u-nu-latn"]) {
      expect(formatPostedRelative("2026-05-18", variant, NOW)).toBe(en);
    }
    const ko = formatPostedRelative("2026-05-18", "ko", NOW);
    for (const variant of ["ko-KR", "KO", "ko-Hang-KR"]) {
      expect(formatPostedRelative("2026-05-18", variant, NOW)).toBe(ko);
    }
    expect(en).not.toBe(ko);
  });

  it("normalization does not widen the supported set to other languages", () => {
    const ko = formatPostedRelative("2026-05-18", "ko", NOW);
    const en = formatPostedRelative("2026-05-18", "en", NOW);
    // Valid BCP-47 but unsupported languages must fall back to Korean rather
    // than render in their own language.
    for (const unsupported of ["zh-CN", "ja", "de-DE", "fr", "zh-Hant"]) {
      expect(formatPostedRelative("2026-05-18", unsupported, NOW)).toBe(ko);
      expect(formatPostedRelative("2026-05-18", unsupported, NOW)).not.toBe(en);
    }
  });

  /**
   * Documented consequence of normalizing with `Intl.Locale`: ISO 639-2
   * three-letter codes canonicalize to their two-letter alias, so the
   * formatter accepts `eng`/`kor` even though `assertLocale` (the *route*
   * guard) rejects them. That asymmetry is intentional - a formatter may be
   * liberal, a route segment may not - so pin both halves.
   */
  it("accepts ISO 639-2 aliases that the route guard still rejects", () => {
    expect(formatPostedRelative("2026-05-18", "eng", NOW)).toBe(
      formatPostedRelative("2026-05-18", "en", NOW),
    );
    expect(formatPostedRelative("2026-05-18", "kor", NOW)).toBe(
      formatPostedRelative("2026-05-18", "ko", NOW),
    );
    // The route guard must stay strict: these are not valid URL segments.
    expect(() => assertLocale("eng")).toThrow();
    expect(() => assertLocale("kor")).toThrow();
  });

  it("handles locales whose language subtag is absent", () => {
    // `new Intl.Locale("und").language` is undefined, which must not leak into
    // the Intl.RelativeTimeFormat constructor.
    for (const locale of ["und", "und-US"]) {
      expect(() => formatPostedRelative("2026-05-18", locale, NOW)).not.toThrow();
      expect(formatPostedRelative("2026-05-18", locale, NOW)).toBe(
        formatPostedRelative("2026-05-18", routing.defaultLocale, NOW),
      );
    }
  });

  it("the only in-repo caller passes a next-intl-resolved locale, so the fallback is currently unreachable in prod", () => {
    // components/jobs/job-card.tsx uses `await getLocale()`, and
    // lib/i18n/request.ts already narrows that to routing.locales.
    for (const locale of routing.locales) {
      expect(formatPostedRelative("2026-05-18", locale, NOW)).not.toBeNull();
    }
  });
});

/**
 * The fallback used to be completely silent, so a caller bug (passing a route
 * segment, a country, or an unresolved locale) was indistinguishable from a
 * deliberate Korean render. A dev-only warning is the signal channel.
 */
describe("formatPostedRelative: the fallback is observable in development", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function warningsFor(locale: string, nodeEnv: string): string[] {
    vi.stubEnv("NODE_ENV", nodeEnv);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    formatPostedRelative("2026-05-18", locale, NOW);
    return warn.mock.calls.map((call) => String(call[0]));
  }

  it.each(["wp-login.php", "jobs", "zh", "en_US", "", ".."])(
    "warns in development when %s really falls back",
    (locale) => {
      const warnings = warningsFor(locale, "development");
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("formatPostedRelative");
      expect(warnings[0]).toContain(routing.defaultLocale);
      // The *original* input must be echoed, not the normalized value, or the
      // message cannot be traced back to the caller.
      expect(warnings[0]).toContain(locale === "" ? '""' : locale);
    },
  );

  it.each(["ko", "en", "en-US", "en-GB", "EN", "en-u-nu-latn", "ko-KR"])(
    "does not warn for %s, which is supported or normalizes to a supported locale",
    (locale) => {
      expect(warningsFor(locale, "development")).toEqual([]);
    },
  );

  it.each(["production", "test"])(
    "stays silent in %s so the log is not polluted by scanner traffic",
    (nodeEnv) => {
      expect(warningsFor("wp-login.php", nodeEnv)).toEqual([]);
    },
  );

  it("never warns before returning null for a missing post date", () => {
    expect(warningsFor2(null, "wp-login.php")).toEqual([]);

    function warningsFor2(postDate: string | null, locale: string): string[] {
      vi.stubEnv("NODE_ENV", "development");
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(formatPostedRelative(postDate, locale, NOW)).toBeNull();
      return warn.mock.calls.map((call) => String(call[0]));
    }
  });
});
