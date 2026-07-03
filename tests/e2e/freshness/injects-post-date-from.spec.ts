import { test, expect } from "../fixtures";

test.describe("Freshness promise", () => {
  test("jobs page communicates the 60-day freshness window", async ({ page }) => {
    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/Newest 60 days|last 60 days/i).first()).toBeVisible();
  });

  test("search suggestions use the internal suggest route without adding freshness filters", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/suggest")) requests.push(url);
    });

    await page.goto("/en/jobs");
    const searchInput = page.getByPlaceholder(/search|검색/i).first();
    await searchInput.fill("engineer");
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    expect(requests.length).toBeGreaterThan(0);
    for (const url of requests) {
      expect(url).not.toContain("post_date_from");
    }
  });
});
