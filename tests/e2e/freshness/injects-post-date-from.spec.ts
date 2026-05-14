import { test, expect } from "../fixtures";
import { freshnessCutoff } from "@/lib/date";

test.describe("Freshness injection", () => {
  test("injects post_date_from on /jobs and /jobs?q=...", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/v1/jobs")) requests.push(url);
    });

    // Navigate to /en/jobs (fixture already did this, but re-navigate to capture requests)
    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    const cutoff = freshnessCutoff();
    const listRequests = requests.filter((u) => u.includes("/api/v1/jobs?"));
    expect(listRequests.length).toBeGreaterThan(0);
    for (const url of listRequests) {
      expect(url).toContain(`post_date_from=${cutoff}`);
    }
  });

  test("does NOT inject post_date_from on /api/v1/jobs/suggest", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/v1/jobs/suggest")) requests.push(url);
    });

    // Trigger a suggest request via the search bar
    await page.goto("/en/jobs");
    const searchInput = page.getByPlaceholder(/search|검색/i).first();
    await searchInput.fill("nurse");
    await page.waitForTimeout(500); // debounce
    await page.waitForLoadState("networkidle");

    const suggestRequests = requests.filter((u) => u.includes("/api/v1/jobs/suggest"));
    for (const url of suggestRequests) {
      expect(url).not.toContain("post_date_from");
    }
  });
});
