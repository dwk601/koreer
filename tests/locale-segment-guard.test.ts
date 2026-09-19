import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Static audit of the `app/[locale]` segment.
 *
 * The production crash (`RangeError: Incorrect locale information provided`)
 * happened because a page body ran with an unvalidated `params.locale` and
 * handed it straight to `new Intl.NumberFormat(...)`. The layout's `hasLocale`
 * check does not protect pages: in the App Router the layout and the page
 * render concurrently, so the page can reach `Intl` before the layout's
 * `notFound()` unwinds the render.
 *
 * These tests assert the ordering invariant on the source itself so the guard
 * cannot be dropped or moved below a locale-sensitive call in a later edit.
 */

const ROOT = resolve(__dirname, "..");
const LOCALE_SEGMENT = join(ROOT, "app", "[locale]");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith(".tsx") || full.endsWith(".ts") ? [full] : [];
  });
}

function read(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

/**
 * Source of a single top-level export (`export function X`,
 * `export async function X`, `export default async function X`), up to the
 * next top-level `export`.
 */
function exportBody(src: string, name: string): string {
  const pattern = new RegExp(
    `export\\s+(?:default\\s+)?(?:async\\s+)?function\\s+${name}\\b`,
  );
  const match = pattern.exec(src);
  if (!match) throw new Error(`export \`${name}\` not found`);
  const start = match.index;
  const nextExport = src.indexOf("\nexport ", start + 1);
  return src.slice(start, nextExport === -1 ? src.length : nextExport);
}

/** Index of the first locale-sensitive construction in a source slice. */
function firstLocaleSensitiveUse(src: string): number {
  const match = /new Intl\.[A-Za-z]+\(/.exec(src);
  return match ? match.index : -1;
}

const PAGES = [
  "app/[locale]/page.tsx",
  "app/[locale]/jobs/page.tsx",
  "app/[locale]/jobs/[id]/page.tsx",
] as const;

describe("assertLocale is wired into every page", () => {
  it.each(PAGES)("%s imports assertLocale", (page) => {
    expect(read(page)).toContain(
      'import { assertLocale } from "@/lib/i18n/assert-locale"',
    );
  });

  it.each(PAGES)("%s validates the raw param before any other work", (page) => {
    const src = read(page);
    const awaitParams = src.indexOf("await params");
    const guard = src.indexOf("assertLocale(");
    expect(awaitParams).toBeGreaterThan(-1);
    expect(guard).toBeGreaterThan(awaitParams);

    // Nothing locale-sensitive may appear between destructuring and the guard.
    const between = src.slice(awaitParams, guard);
    expect(between).not.toMatch(/new Intl\./);
    expect(between).not.toMatch(/setRequestLocale\(/);
    expect(between).not.toMatch(/getTranslations\(/);
  });

  it.each(PAGES)("%s never passes a raw param into Intl", (page) => {
    const src = read(page);
    // The raw value is only ever read as `locale: rawLocale`, and `rawLocale`
    // must not be used anywhere except the assertLocale call.
    const rawUses = [...src.matchAll(/\brawLocale\b/g)].length;
    const rawDeclarations = [...src.matchAll(/locale: rawLocale/g)].length;
    const guardedUses = [...src.matchAll(/assertLocale\(rawLocale\)/g)].length;
    expect(rawUses).toBe(rawDeclarations + guardedUses);
  });

  it("every file under app/[locale] that constructs Intl also guards first", () => {
    const offenders: string[] = [];
    for (const file of walk(LOCALE_SEGMENT)) {
      const src = readFileSync(file, "utf8");
      const intlIndex = firstLocaleSensitiveUse(src);
      if (intlIndex === -1) continue;
      const guardIndex = src.indexOf("assertLocale(");
      if (guardIndex === -1 || guardIndex > intlIndex) {
        offenders.push(relative(ROOT, file));
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("generateMetadata runs independently of the page and must guard too", () => {
  it("app/[locale]/jobs/page.tsx generateMetadata guards", () => {
    const body = exportBody(read("app/[locale]/jobs/page.tsx"), "generateMetadata");
    expect(body).toContain("assertLocale(rawLocale)");
    expect(body.indexOf("assertLocale(")).toBeLessThan(body.indexOf("getTranslations("));
  });

  it("app/[locale]/jobs/[id]/page.tsx generateMetadata guards", () => {
    const body = exportBody(
      read("app/[locale]/jobs/[id]/page.tsx"),
      "generateMetadata",
    );
    expect(body).toContain("assertLocale(rawLocale)");
    expect(body.indexOf("assertLocale(")).toBeLessThan(body.indexOf("getTranslations("));
  });

  it("app/[locale]/page.tsx has no generateMetadata (inherits the layout's)", () => {
    expect(read("app/[locale]/page.tsx")).not.toContain("generateMetadata");
  });
});

describe("detail page no longer re-reads the locale from request context", () => {
  it("uses the validated param for Intl.DateTimeFormat instead of getLocale()", () => {
    const src = read("app/[locale]/jobs/[id]/page.tsx");
    expect(src).not.toContain("getLocale");
    expect(src).toContain("const lang = locale;");
    expect(src).toContain("new Intl.DateTimeFormat(lang,");
  });
});

describe("locale validation covers metadata and image routes", () => {
  it("app/[locale]/layout.tsx generateMetadata validates before translations", () => {
    const src = read("app/[locale]/layout.tsx");
    const body = exportBody(src, "generateMetadata");
    expect(body).toContain("assertLocale(rawLocale)");
    expect(body.indexOf("assertLocale(")).toBeLessThan(body.indexOf("getTranslations("));
    expect(body).toContain("canonical: `/${locale}`");
  });

  it("app/[locale]/opengraph-image.tsx validates before translations", () => {
    const src = read("app/[locale]/opengraph-image.tsx");
    expect(src).toContain("assertLocale(rawLocale)");
    expect(src.indexOf("assertLocale(")).toBeLessThan(src.indexOf("getTranslations("));
    expect(src).toContain("getTranslations({ locale, namespace: \"app\" })");
  });
});
