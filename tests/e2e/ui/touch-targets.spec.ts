import { test, expect } from "../fixtures";

test.describe("UI — touch targets (40px floor, 44px primary)", () => {
  test("home page controls meet touch-target tiers", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    // Header nav links (40px tier)
    const navLinks = page.locator('nav[aria-label="primary"] a');
    const navCount = await navLinks.count();
    for (let i = 0; i < navCount; i++) {
      const link = navLinks.nth(i);
      const box = await link.boundingBox();
      if (box) {
        expect(box.height, `Header nav link ${i} height`).toBeGreaterThanOrEqual(40);
      }
    }

    // Locale switcher buttons (40px tier)
    const localeButtons = page.locator('[role="group"] button');
    const localeCount = await localeButtons.count();
    for (let i = 0; i < localeCount; i++) {
      const btn = localeButtons.nth(i);
      const box = await btn.boundingBox();
      if (box) {
        expect(box.height, `Locale button ${i} height`).toBeGreaterThanOrEqual(40);
      }
    }

    // Hero search submit (44px tier)
    const heroSubmit = page.locator('form[role="search"] button[type="submit"]').first();
    const heroBox = await heroSubmit.boundingBox();
    if (heroBox) {
      expect(heroBox.height, "Hero search submit height").toBeGreaterThanOrEqual(44);
    }

    // Browse-all link (40px tier)
    const browseAll = page.locator('a:has-text("Browse all")');
    const browseBox = await browseAll.boundingBox();
    if (browseBox) {
      expect(browseBox.height, "Browse-all link height").toBeGreaterThanOrEqual(40);
    }
  });

  test("jobs page controls meet touch-target tiers", async ({ page }) => {
    // Mock the list endpoint with filters to force all control families to render
    await page.route("**/api/v1/jobs?**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            record_id: `rec-${i + 1}`,
            title: `Job ${i + 1}`,
            company: `Company ${i + 1}`,
            location_city: "San Francisco",
            location_state: "CA",
            salary_min: 100000,
            salary_max: 150000,
            salary_unit: "annual",
            salary_currency: "USD",
            language: "english",
            post_date: "2026-05-10",
            source: "indeed",
          })),
          facets: {
            source: { indeed: 10, linkedin: 8 },
            language: { english: 15, korean: 3 },
            job_category: { engineering: 12, product: 6 },
            location_state: { CA: 8, NY: 7 },
            salary_bucket: {
              free: 0,
              under_40k: 2,
              "40k_80k": 5,
              "80k_120k": 6,
              over_120k: 2,
            },
          },
          next_cursor: "cursor_123",
          total_estimated: 18,
        }),
      });
    });

    await page.goto("/en/jobs?source=indeed");
    await page.waitForLoadState("networkidle");

    // Compact search submit (44px tier)
    const compactSubmit = page.locator('form[role="search"] button[type="submit"]').first();
    const compactBox = await compactSubmit.boundingBox();
    if (compactBox) {
      expect(compactBox.height, "Compact search submit height").toBeGreaterThanOrEqual(44);
    }

    // FacetSection toggle buttons (40px tier)
    const facetButtons = page.locator('aside button[aria-expanded]');
    const facetCount = await facetButtons.count();
    for (let i = 0; i < facetCount; i++) {
      const btn = facetButtons.nth(i);
      const box = await btn.boundingBox();
      if (box) {
        expect(box.height, `Facet section ${i} height`).toBeGreaterThanOrEqual(40);
      }
    }

    // Filter labels (CheckboxList and RadioList rows) (40px tier)
    const filterLabels = page.locator(
      'aside label:has(input[type="checkbox"]), aside label:has(input[type="radio"])'
    );
    const filterCount = await filterLabels.count();
    for (let i = 0; i < filterCount; i++) {
      const label = filterLabels.nth(i);
      const box = await label.boundingBox();
      if (box) {
        expect(box.height, `Filter label ${i} height`).toBeGreaterThanOrEqual(40);
      }
    }

    // Show more/less buttons (40px tier)
    const showMoreButtons = page.locator('aside button:has-text("Show")');
    const showCount = await showMoreButtons.count();
    for (let i = 0; i < showCount; i++) {
      const btn = showMoreButtons.nth(i);
      const box = await btn.boundingBox();
      if (box) {
        expect(box.height, `Show more/less button ${i} height`).toBeGreaterThanOrEqual(40);
      }
    }

    // Sort select (40px tier)
    const sortSelect = page.locator('select');
    const sortBox = await sortSelect.boundingBox();
    if (sortBox) {
      expect(sortBox.height, "Sort select height").toBeGreaterThanOrEqual(40);
    }

    // Active filter chips (40px tier)
    const chips = page.locator('a:has(svg[viewBox="0 0 10 10"])');
    const chipCount = await chips.count();
    for (let i = 0; i < chipCount; i++) {
      const chip = chips.nth(i);
      const box = await chip.boundingBox();
      if (box) {
        expect(box.height, `Chip ${i} height`).toBeGreaterThanOrEqual(40);
      }
    }

    // Clear filters link (40px tier)
    const clearFilters = page.locator('a:has-text("Clear filters")');
    if (await clearFilters.isVisible()) {
      const clearBox = await clearFilters.boundingBox();
      if (clearBox) {
        expect(clearBox.height, "Clear filters link height").toBeGreaterThanOrEqual(40);
      }
    }

    // Pagination buttons (Next page 44px tier, Back to first 40px tier)
    const paginationLinks = page.locator('nav[aria-label="Pagination"] a');
    const paginationCount = await paginationLinks.count();
    for (let i = 0; i < paginationCount; i++) {
      const link = paginationLinks.nth(i);
      const text = await link.textContent();
      const box = await link.boundingBox();
      if (box) {
        const isNext = text?.includes("Next");
        const minHeight = isNext ? 44 : 40;
        expect(box.height, `Pagination link ${i} (${text}) height`).toBeGreaterThanOrEqual(minHeight);
      }
    }
  });

  test("job detail page controls meet touch-target tiers", async ({ page }) => {
    // Mock the job detail endpoint
    await page.route("**/api/v1/jobs/1", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          record_id: "rec-1",
          title: "Senior Frontend Engineer",
          company: "Acme Inc",
          location_city: "San Francisco",
          location_state: "CA",
          salary_min: 120000,
          salary_max: 160000,
          salary_unit: "annual",
          salary_currency: "USD",
          language: "english",
          post_date: "2026-05-10",
          source: "linkedin",
          job_category: ["engineering"],
          description: "We are looking for a senior frontend engineer...",
        }),
      });
    });

    await page.goto("/en/jobs/1");
    await page.waitForLoadState("networkidle");

    // Back-to-list link (40px tier)
    const backLink = page.locator('a:has-text("Back to list")');
    const backBox = await backLink.boundingBox();
    if (backBox) {
      expect(backBox.height, "Back-to-list link height").toBeGreaterThanOrEqual(40);
    }

    // Apply CTA button (44px tier)
    const applyCta = page.locator('a[href*="apply"], button:has-text("Apply")').first();
    if (await applyCta.isVisible()) {
      const applyBox = await applyCta.boundingBox();
      if (applyBox) {
        expect(applyBox.height, "Apply CTA height").toBeGreaterThanOrEqual(44);
      }
    }
  });
});
