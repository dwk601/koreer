import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { assertLocale } from "@/lib/i18n/assert-locale";
import { formatPostedRelative } from "@/lib/format";

describe("locale guards", () => {
  it("accepts supported locales and narrows them", () => {
    expect(assertLocale("ko")).toBe("ko");
    expect(assertLocale("en")).toBe("en");
  });

  it.each(["wp-login.php", "foo.bar", "xx", "", "en_US"])(
    "rejects invalid locale %s",
    (locale) => {
      expect(() => assertLocale(locale)).toThrow();
    },
  );

  it.each(["wp-login.php", "foo.bar"])(
    "falls back instead of throwing for invalid relative-time locale %s",
    (locale) => {
      expect(() =>
        formatPostedRelative("2026-05-13", locale, new Date("2026-05-13T00:00:00Z")),
      ).not.toThrow();
      expect(
        formatPostedRelative("2026-05-13", locale, new Date("2026-05-13T00:00:00Z")),
      ).toEqual(expect.any(String));
    },
  );
});

describe("proxy locale coverage", () => {
  it("runs for dotted junk paths so next-intl can redirect them before [locale]", () => {
    const proxySource = readFileSync(resolve(__dirname, "../proxy.ts"), "utf8");
    const matcher = proxySource.match(/matcher:\s*(["'`])([\s\S]+?)\1/)?.[2];
    expect(matcher).toBeDefined();
    expect(matcher).not.toContain(".*\\\\..*");

    const matcherRegex = new RegExp(`^${matcher?.replaceAll("\\\\", "\\")}$`);
    expect(matcherRegex.test("/wp-login.php")).toBe(true);
    expect(matcherRegex.test("/foo.bar")).toBe(true);

    // Actual metadata and known public assets remain outside the proxy.
    expect(matcherRegex.test("/favicon.ico")).toBe(false);
    expect(matcherRegex.test("/robots.txt")).toBe(false);
    expect(matcherRegex.test("/styles.css")).toBe(false);
  });
});
