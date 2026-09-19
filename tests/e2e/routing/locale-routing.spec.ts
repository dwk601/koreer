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
  "/apifoo", // bypasses the proxy (unanchored `api` alternative)
  "/robots.txtx", // bypasses the proxy (unanchored `robots.txt` alternative)
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
 * DEFECT-REGRESSION pinned by the senior review: the extension allowlist in
 * proxy.ts sends every static file whose extension is not on the list through
 * next-intl, which redirects it to /ko/<file>. Before this commit any dotted
 * path bypassed the proxy and the file was served from public/.
 *
 * Observable without adding fixture files: a bypassed path 404s directly,
 * while a proxied one answers 307 -> /ko/<path>.
 */
test.describe("DEFECT-REGRESSION: public assets with non-allowlisted extensions", () => {
  for (const path of [
    "/brochure.pdf",
    "/site.webmanifest",
    "/promo.mp4",
    "/sitemap.xsl",
    "/export.csv",
    "/logo.SVG",
  ]) {
    test(`${path} is locale-redirected instead of served`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(307);
      expect(res.headers().location).toContain(`/ko${path}`);
    });
  }

  test("allowlisted extensions still bypass the proxy", async ({ request }) => {
    const res = await request.get("/next.svg", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
});

/**
 * DEFECT pinned by the senior review: opengraph-image.tsx does not validate
 * the locale segment, so an invalid locale returns a cacheable 200 image
 * instead of a 404.
 */
test("DEFECT: /<invalid-locale>/opengraph-image returns 200", async ({ request }) => {
  const res = await request.get("/apifoo/opengraph-image", { maxRedirects: 0 });
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
});
