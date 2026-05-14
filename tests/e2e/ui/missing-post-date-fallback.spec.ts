import { test, expect } from "../fixtures";

test.describe("UI — missing post_date fallback", () => {
  test("renders italic fallback for jobs with null post_date (en)", async ({
    page,
  }) => {
    // Mock the list endpoint to return a fixture with one null post_date
    await page.route("**/api/v1/jobs?**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: 1,
              record_id: "rec-1",
              title: "Job with date",
              company: "Company A",
              location_city: "Atlanta",
              location_state: "GA",
              salary_min: null,
              salary_max: null,
              salary_unit: null,
              salary_currency: null,
              language: "english",
              post_date: "2026-05-10",
              source: "indeed",
            },
            {
              id: 2,
              record_id: "rec-2",
              title: "Job without date",
              company: "Company B",
              location_city: "Boston",
              location_state: "MA",
              salary_min: null,
              salary_max: null,
              salary_unit: null,
              salary_currency: null,
              language: "english",
              post_date: null,
              source: "linkedin",
            },
          ],
          facets: {
            source: {},
            language: {},
            job_category: {},
            location_state: {},
            salary_bucket: {},
          },
          next_cursor: null,
          total_estimated: 2,
        }),
      });
    });

    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    // Job with date shows relative time
    const jobWithDate = page.locator("article").filter({ hasText: "Job with date" }).first();
    await expect(jobWithDate).toContainText(/ago|today/i);

    // Job without date shows italic fallback
    const jobWithoutDate = page.locator("article").filter({ hasText: "Job without date" }).first();
    const fallbackSpan = jobWithoutDate.locator("span.italic");
    await expect(fallbackSpan).toContainText("Posting date not listed");
  });

  test("renders italic fallback for jobs with null post_date (ko)", async ({
    page,
  }) => {
    // Mock the list endpoint
    await page.route("**/api/v1/jobs?**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: 1,
              record_id: "rec-1",
              title: "공고",
              company: "회사",
              location_city: null,
              location_state: null,
              salary_min: null,
              salary_max: null,
              salary_unit: null,
              salary_currency: null,
              language: "korean",
              post_date: null,
              source: "indeed",
            },
          ],
          facets: {
            source: {},
            language: {},
            job_category: {},
            location_state: {},
            salary_bucket: {},
          },
          next_cursor: null,
          total_estimated: 1,
        }),
      });
    });

    await page.goto("/ko/jobs");
    await page.waitForLoadState("networkidle");

    const jobCard = page.locator("article").first();
    const fallbackSpan = jobCard.locator("span.italic");
    await expect(fallbackSpan).toContainText("등록일 미기재");
  });
});
