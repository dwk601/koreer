import { test, expect } from "../fixtures";

test.describe("UI — JobCard overlay click", () => {
  test("clicking card center navigates to detail page", async ({ page }) => {
    // Mock the list endpoint
    await page.route("**/api/v1/jobs?**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: 123,
              record_id: "rec-123",
              title: "Senior Engineer",
              company: "Tech Corp",
              location_city: "San Francisco",
              location_state: "CA",
              salary_min: 120000,
              salary_max: 160000,
              salary_unit: "annual",
              salary_currency: "USD",
              language: "english",
              post_date: "2026-05-10",
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

    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    const jobCard = page.locator("article").first();
    const cardBox = await jobCard.boundingBox();
    if (!cardBox) throw new Error("Card bounding box not found");

    // Click at the center of the card
    const centerX = cardBox.x + cardBox.width / 2;
    const centerY = cardBox.y + cardBox.height / 2;

    await page.mouse.click(centerX, centerY);
    await page.waitForURL(/\/en\/jobs\/123/);

    expect(page.url()).toContain("/en/jobs/123");
  });

  test("clicking bottom-right source area navigates to detail page", async ({
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
              id: 456,
              record_id: "rec-456",
              title: "Product Manager",
              company: "StartUp Inc",
              location_city: "New York",
              location_state: "NY",
              salary_min: 100000,
              salary_max: 140000,
              salary_unit: "annual",
              salary_currency: "USD",
              language: "english",
              post_date: "2026-05-12",
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
          total_estimated: 1,
        }),
      });
    });

    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    const jobCard = page.locator("article").first();
    const cardBox = await jobCard.boundingBox();
    if (!cardBox) throw new Error("Card bounding box not found");

    // Click at bottom-right area (source label area)
    const clickX = cardBox.x + cardBox.width - 10;
    const clickY = cardBox.y + cardBox.height - 10;

    await page.mouse.click(clickX, clickY);
    await page.waitForURL(/\/en\/jobs\/456/);

    expect(page.url()).toContain("/en/jobs/456");
  });
});
