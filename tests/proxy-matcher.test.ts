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
  ])("dotted paths %s bypass locale negotiation", (pathname) => {
    expect(proxied(pathname)).toBe(false);
  });
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

describe("proxy matcher: static-file and boundary coverage", () => {
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
    "static file %s bypasses locale negotiation (%s)",
    (pathname) => {
      expect(proxied(pathname)).toBe(false);
    },
  );

  it.each([
    ["/faviconXico", "favicon.ico is unescaped, so `.` is a wildcard"],
    ["/faviconAico", "favicon.ico is unescaped"],
    ["/sitemapAxml", "sitemap.xml is unescaped"],
    ["/robotsAtxt", "robots.txt is unescaped"],
  ])("non-file path %s is proxied (%s)", (pathname) => {
    expect(proxied(pathname)).toBe(true);
  });

  it.each([
    ["/apifoo", "the `api` alternative must end at `/` or `$`"],
    ["/api-docs", "`api` prefix must not match"],
    ["/trpcx", "`trpc` prefix must not match"],
    ["/_nextfoo", "`_next` prefix must not match"],
    ["/_vercelish", "`_vercel` prefix must not match"],
  ])("non-system prefix %s is proxied (%s)", (pathname) => {
    expect(proxied(pathname)).toBe(true);
  });

  it("dotted system-like names remain static bypasses without literal allowlist entries", () => {
    for (const pathname of ["/robots.txtx", "/favicon.icons", "/sitemap.xml.bak"]) {
      expect(proxied(pathname)).toBe(false);
    }
  });
});

describe("proxy matcher: structural expectations", () => {
  it("is a single string matcher (array form would need per-entry review)", () => {
    expect(typeof proxyConfig.matcher).toBe("string");
    expect(compiledMatchers).toHaveLength(1);
  });

  it("contains the blanket dotted-path bypass for all static extensions", () => {
    expect(String(proxyConfig.matcher)).toContain(".*\\..*");
  });

  it("compiles to a regex that Next will accept", () => {
    expect(compiledMatchers[0].regexp).toContain("(?!");
    expect(() => new RegExp(compiledMatchers[0].regexp)).not.toThrow();
  });
});
