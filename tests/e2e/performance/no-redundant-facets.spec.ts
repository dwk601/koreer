import { test, expect } from "../fixtures";

test.describe("Performance - no redundant facets", () => {
  test("does not call the legacy facets endpoint from the browser", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/v1/jobs/facets")) requests.push(url);
    });

    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    expect(requests).toHaveLength(0);
  });

  test("filters and results both render from the list response", async ({ page }, testInfo) => {
    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    if (testInfo.project.name === "mobile-chrome") {
      await expect(page.getByRole("button", { name: /filters/i })).toBeVisible();
    } else {
      const sidebar = page.locator("aside").first();
      await expect(sidebar).toBeVisible();

      const filterSection = page
        .locator("section")
        .filter({ hasText: /source|language|category|state|salary/i })
        .first();
      await expect(filterSection).toBeVisible();
    }

    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("article")).toHaveCount(5);
  });
});
