import { test, expect } from "../fixtures";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  expect(metrics.scrollWidth, "document should not overflow horizontally").toBeLessThanOrEqual(
    metrics.clientWidth + 1,
  );
  expect(metrics.bodyScrollWidth, "body should not overflow horizontally").toBeLessThanOrEqual(
    metrics.clientWidth + 1,
  );
}

test.describe("UI — mobile layout", () => {
  test("home and jobs pages do not create sideways scrolling", async ({ page }) => {
    for (const path of ["/en", "/en/jobs", "/ko", "/ko/jobs"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoHorizontalOverflow(page);
    }
  });

  test("mobile language switcher uses compact non-wrapping labels", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) > 600, "mobile-only layout check");

    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    const switcher = page.getByRole("group", { name: "Language" }).first();
    const koButton = switcher.getByRole("button", { name: "한국어" });
    const enButton = switcher.getByRole("button", { name: "English" });
    await expect(koButton).toBeVisible();
    await expect(enButton).toBeVisible();
    await expect.poll(() => koButton.evaluate((el) => (el as HTMLElement).innerText)).toBe("KO");
    await expect.poll(() => enButton.evaluate((el) => (el as HTMLElement).innerText)).toBe("EN");

    const koBox = await koButton.boundingBox();
    const enBox = await enButton.boundingBox();
    expect(koBox?.width ?? 0).toBeGreaterThan(36);
    expect(enBox?.width ?? 0).toBeGreaterThan(36);
    expect(koBox?.height ?? 0).toBeLessThanOrEqual(48);
    expect(enBox?.height ?? 0).toBeLessThanOrEqual(48);
  });
});
