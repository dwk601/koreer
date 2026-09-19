import { expect, test } from "@playwright/test";

/**
 * End-to-end verification of the routing contract touched by the
 * "guard invalid locale route segments" fix.
 *
 * Run with the mock API dev server that playwright.config.ts starts:
 *   npx playwright test tests/e2e/routing/locale-routing.spec.ts --project=chromium
 */

const RENDERED = ["/ko", "/en", "/ko/jobs", "/en/jobs", "/ko/jobs/123", "/en/jobs/123"];

const JUNK = [
  "/wp-login.php", // the path from the production stack trace
  "/xmlrpc.php",
  "/foo.bar",
  "/.env",
  "/apifoo", // proxied now that `api` is anchored with (?:/|$)
  "/api-docs", // proxied: `api` prefix must not be treated as the system route
  "/trpcx",
  "/_nextfoo",
  "/_vercelish",
  "/robots.txtx", // dotted: bypasses the proxy and 404s from the static layer
  "/sitemap.xml.bak",
  "/favicon.icons",
  "/faviconXico", // proxied: no unescaped-dot wildcard left in the matcher
  "/apifoo/jobs", // invalid locale reaching the list page
  "/apifoo/jobs/123", // invalid locale reaching the detail page
  "/zh", // well-formed but unsupported locale
];

test("/ redirects to the default locale", async ({ request }) => {
  const res = await request.get("/", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers().location).toMatch(/\/ko$/);
});

test.describe("supported routes render", () => {
  for (const path of RENDERED) {
    test(`${path} renders 200`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toContain(`<html lang="${path.startsWith("/ko") ? "ko" : "en"}"`);
    });
  }
});

test.describe("metadata routes are served, not locale-redirected", () => {
  test("/robots.txt", async ({ request }) => {
    const res = await request.get("/robots.txt", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("User-Agent");
  });

  test("/sitemap.xml", async ({ request }) => {
    const res = await request.get("/sitemap.xml", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("<urlset");
  });

  test("/icon.svg", async ({ request }) => {
    const res = await request.get("/icon.svg", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
});

test.describe("junk paths 404 without a RangeError", () => {
  for (const path of JUNK) {
    test(`${path} ends in a 404 with no locale error surfaced`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(404);
      const body = await res.text();
      expect(body).not.toMatch(/Incorrect locale|RangeError/i);
    });
  }
});

/**
 * Static files must never enter locale negotiation, whatever their extension.
 * The regression this pins: an extension allowlist in the matcher sent every
 * unlisted extension through next-intl, which answered 307 -> /ko/<file> and
 * then 404'd, so the file became unreachable.
 *
 * Observable without adding fixture files: a bypassed path 404s directly from
 * the static layer, while a proxied one answers 307 -> /ko/<path>.
 */
test.describe("public assets bypass the proxy regardless of extension", () => {
  for (const path of [
    "/brochure.pdf",
    "/site.webmanifest",
    "/manifest.webmanifest",
    "/promo.mp4",
    "/promo.webm",
    "/sitemap.xsl",
    "/export.csv",
    "/module.wasm",
    "/font.otf",
    "/.well-known/apple-app-site-association",
  ]) {
    test(`${path} is never locale-redirected`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      // No such fixture exists, so a bypassed request 404s from the static
      // layer. The assertion that matters is that it is NOT a 307 to /ko/...
      expect(res.status()).not.toBe(307);
      expect(res.status()).toBe(404);
      expect(res.headers().location).toBeUndefined();
    });
  }

  for (const path of ["/next.svg", "/logo.svg", "/window.svg"]) {
    test(`real public asset ${path} is served`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
    });
  }
});

/**
 * opengraph-image.tsx validates its locale segment, so an invalid locale can
 * never produce a cacheable 200 image. `/apifoo/...` is proxied first (the
 * `api` alternative is anchored), so the observable contract is 307 -> 404.
 */
test.describe("opengraph-image is locale-validated", () => {
  test("/ko/opengraph-image renders a PNG", async ({ request }) => {
    const res = await request.get("/ko/opengraph-image", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("/<invalid-locale>/opengraph-image never returns an image", async ({ request }) => {
    const noRedirect = await request.get("/apifoo/opengraph-image", { maxRedirects: 0 });
    expect(noRedirect.status()).not.toBe(200);

    const followed = await request.get("/apifoo/opengraph-image");
    expect(followed.status()).toBe(404);
    expect(followed.headers()["content-type"]).not.toContain("image/png");
  });

  test("an already-prefixed invalid locale 404s without a redirect hop", async ({
    request,
  }) => {
    const res = await request.get("/ko/apifoo/opengraph-image", { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("/zh/opengraph-image 404s (well-formed but unsupported locale)", async ({
    request,
  }) => {
    const res = await request.get("/zh/opengraph-image");
    expect(res.status()).toBe(404);
    expect(res.headers()["content-type"]).not.toContain("image/png");
  });
});
