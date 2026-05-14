import { test, expect } from "../fixtures";

test.describe("Performance — no redundant facets", () => {
  test("does not call /api/v1/jobs/facets on /jobs page", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/v1/jobs")) requests.push(url);
    });

    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    const listRequests = requests.filter((u) => u.includes("/api/v1/jobs?"));
    const facetRequests = requests.filter((u) => u.includes("/api/v1/jobs/facets?"));

    expect(listRequests.length).toBeGreaterThan(0);
    expect(facetRequests.length).toBe(0);
  });

  test("sidebar and results both render (facets came from list response)", async ({
    page,
  }) => {
    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    // Sidebar is visible
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // At least one filter section is visible
    const filterSection = page.locator("section").filter({ hasText: /source|language|category|state|salary/i }).first();
    await expect(filterSection).toBeVisible();

    // Results count is visible
    const resultsText = page.locator("text=/results|건/i").first();
    await expect(resultsText).toBeVisible();
  });
});
