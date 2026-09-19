import { createRequire } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getMiddlewareRouteMatcher } from "next/dist/shared/lib/router/utils/middleware-route-matcher";
import type { ProxyMatcher } from "next/dist/build/analysis/get-page-static-info";

/**
 * Authoritative tests for the `config.matcher` in `proxy.ts`.
 *
 * Rather than re-implementing Next's matcher semantics (which is what a naive
 * `new RegExp("^" + matcher + "$")` does), this compiles the matcher with the
 * exact same function Next uses at build time
 * (`getMiddlewareMatchers` -> `tryToParsePath`) and evaluates it with the same
 * runtime matcher (`getMiddlewareRouteMatcher`). A `true` result means
 * "next-intl middleware runs for this path"; `false` means "the request
 * bypasses next-intl entirely and is handled by the app/static layer".
 */

const require_ = createRequire(import.meta.url);
const { getMiddlewareMatchers } = require_(
  "next/dist/build/analysis/get-page-static-info",
) as {
  // Exported at runtime but missing from Next's .d.ts.
  getMiddlewareMatchers: (
    matcherOrMatchers: string | string[],
    nextConfig: Record<string, unknown>,
  ) => ProxyMatcher[];
};

const ROOT = resolve(__dirname, "..");
const PROXY_PATH = join(ROOT, "proxy.ts");

/**
 * Read `export const config = {...}` out of proxy.ts without importing the
 * module (importing it would pull in `next-intl/middleware`, which is ESM-only
 * and not resolvable in the vitest node environment).
 */
function readProxyConfig(): { matcher: string | string[] } {
  const src = readFileSync(PROXY_PATH, "utf8");
  const declIndex = src.indexOf("export const config");
  if (declIndex === -1) throw new Error("proxy.ts: `export const config` not found");

  const open = src.indexOf("{", declIndex);
  if (open === -1) throw new Error("proxy.ts: config object literal not found");

  let depth = 0;
  let quote: string | null = null;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      i = src.indexOf("\n", i);
      if (i === -1) break;
      continue;
    }
    if (ch === "/" && next === "*") {
      i = src.indexOf("*/", i) + 1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error("proxy.ts: unbalanced config object literal");

  return new Function(`return (${src.slice(open, end + 1)});`)() as {
    matcher: string | string[];
  };
}

const proxyConfig = readProxyConfig();
const compiledMatchers = getMiddlewareMatchers(proxyConfig.matcher, {});
const routeMatcher = getMiddlewareRouteMatcher(compiledMatchers);

/** true = next-intl proxy runs for this path. */
function proxied(pathname: string): boolean {
  return routeMatcher(
    pathname,
    {} as Parameters<typeof routeMatcher>[1],
    {} as Parameters<typeof routeMatcher>[2],
  );
}

/** Every file under `public/`, as the URL path it is served on. */
function publicUrlPaths(dir = join(ROOT, "public"), prefix = ""): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return publicUrlPaths(full, `${prefix}/${entry}`);
    return [`${prefix}/${entry}`];
  });
}

describe("proxy matcher: paths that MUST reach next-intl", () => {
  it.each([
    ["/", "root redirects to the default locale"],
    ["/ko", "korean home"],
    ["/en", "english home"],
    ["/ko/jobs", "korean list"],
    ["/en/jobs", "english list"],
    ["/ko/jobs/12345", "korean detail"],
    ["/en/jobs/12345", "english detail"],
    ["/ko/jobs?q=seoul&sort=newest", "query strings are not part of the pathname"],
  ])("%s is proxied (%s)", (pathname) => {
    expect(proxied(pathname.split("?")[0])).toBe(true);
  });

  it.each([
    "/wp-login.php",
    "/xmlrpc.php",
    "/foo.bar",
    "/.env",
    "/admin/config.php",
    "/old-site/index.php",
  ])(
    "dotted junk path %s is proxied, so it can never arrive at [locale] unvalidated",
    (pathname) => {
      expect(proxied(pathname)).toBe(true);
    },
  );
});

describe("proxy matcher: paths that MUST bypass next-intl", () => {
  it.each([
    "/api/suggest",
    "/_next/static/chunks/main.js",
    "/_next/image",
    "/_vercel/insights/view",
  ])("system route %s bypasses the proxy", (pathname) => {
    expect(proxied(pathname)).toBe(false);
  });

  it.each([
    ["/robots.txt", "app/robots.ts"],
    ["/sitemap.xml", "app/sitemap.ts"],
    ["/icon.svg", "app/icon.svg"],
    ["/favicon.ico", "browser default request"],
  ])("metadata route %s bypasses the proxy (%s)", (pathname) => {
    expect(proxied(pathname)).toBe(false);
  });

  it.each(["/fonts/Pretendard.woff2", "/fonts/Pretendard.woff", "/styles.css", "/app.js"])(
    "allowlisted asset %s bypasses the proxy",
    (pathname) => {
      expect(proxied(pathname)).toBe(false);
    },
  );

  it.each(publicUrlPaths())(
    "public/ asset %s is served, not locale-redirected",
    (pathname) => {
      expect(proxied(pathname)).toBe(false);
    },
  );
});

/**
 * The commit under review replaced "any path containing a dot bypasses the
 * proxy" with an extension allowlist. The tests below pin the *current*
 * (defective) behaviour so the regressions are visible and a future fix will
 * have to update them deliberately. They are documented in the review report;
 * none of them is the intended behaviour.
 */
describe("proxy matcher: DEFECTS pinned by this review", () => {
  it.each([
    ["/brochure.pdf", "pdf"],
    ["/site.webmanifest", "webmanifest"],
    ["/manifest.webmanifest", "webmanifest"],
    ["/promo.mp4", "mp4"],
    ["/promo.webm", "webm"],
    ["/sitemap.xsl", "xsl stylesheet for sitemaps"],
    ["/export.csv", "csv"],
    ["/module.wasm", "wasm"],
    ["/font.otf", "otf"],
    ["/apple-touch-icon.PNG", "uppercase extension"],
    ["/logo.SVG", "uppercase extension"],
    ["/.well-known/apple-app-site-association", "extensionless well-known file"],
    ["/.well-known/assetlinks", "extensionless well-known file"],
  ])(
    "DEFECT-REGRESSION: static file %s is now locale-redirected instead of served (%s)",
    (pathname) => {
      // true == the request is redirected to /ko/<path> and then 404s.
      expect(proxied(pathname)).toBe(true);
    },
  );

  it.each([
    ["/faviconXico", "favicon.ico is unescaped, so `.` is a wildcard"],
    ["/faviconAico", "favicon.ico is unescaped"],
    ["/sitemapAxml", "sitemap.xml is unescaped"],
    ["/robotsAtxt", "robots.txt is unescaped"],
  ])("DEFECT: %s wrongly bypasses the proxy (%s)", (pathname) => {
    expect(proxied(pathname)).toBe(false);
  });

  it.each([
    ["/apifoo", "the `api` alternative is not anchored with a `/` or `$`"],
    ["/api-docs", "`api` prefix match"],
    ["/trpcx", "`trpc` prefix match"],
    ["/_nextfoo", "`_next` prefix match"],
    ["/_vercelish", "`_vercel` prefix match"],
    ["/robots.txtx", "`robots.txt` prefix match"],
    ["/sitemap.xml.bak", "`sitemap.xml` prefix match"],
    ["/favicon.icons", "`favicon.ico` prefix match"],
  ])(
    "DEFECT: %s wrongly bypasses the proxy and reaches [locale] as a raw segment (%s)",
    (pathname) => {
      expect(proxied(pathname)).toBe(false);
    },
  );

  it("DEFECT: bypassed prefix paths still deliver an invalid locale to the app layer", () => {
    // These are exactly the shapes that used to crash: a single path segment
    // that becomes `params.locale` because the proxy never saw the request.
    // They only 404 (instead of throwing RangeError) because `assertLocale`
    // runs first in the page — the matcher does not protect them.
    for (const pathname of ["/robots.txtx", "/favicon.icons", "/sitemap.xml.bak"]) {
      expect(proxied(pathname)).toBe(false);
      expect(() => new Intl.NumberFormat(pathname.slice(1))).toThrow(RangeError);
    }
    // These bypass too but happen to be Intl-parsable, so they were never
    // part of the crash signature.
    for (const pathname of ["/apifoo", "/trpcx"]) {
      expect(proxied(pathname)).toBe(false);
      expect(() => new Intl.NumberFormat(pathname.slice(1))).not.toThrow();
    }
  });
});

describe("proxy matcher: structural expectations", () => {
  it("is a single string matcher (array form would need per-entry review)", () => {
    expect(typeof proxyConfig.matcher).toBe("string");
    expect(compiledMatchers).toHaveLength(1);
  });

  it("no longer contains the blanket dotted-path bypass", () => {
    expect(String(proxyConfig.matcher)).not.toContain(".*\\..*)");
  });

  it("compiles to a regex that Next will accept", () => {
    expect(compiledMatchers[0].regexp).toContain("(?!");
    expect(() => new RegExp(compiledMatchers[0].regexp)).not.toThrow();
  });
});
