import { describe, expect, it } from "vitest";

import { formatPostedRelative } from "@/lib/format";
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

  it("the only in-repo caller passes a next-intl-resolved locale, so the fallback is currently unreachable in prod", () => {
    // components/jobs/job-card.tsx uses `await getLocale()`, and
    // lib/i18n/request.ts already narrows that to routing.locales.
    for (const locale of routing.locales) {
      expect(formatPostedRelative("2026-05-18", locale, NOW)).not.toBeNull();
    }
  });
});
