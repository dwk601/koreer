import { test, expect } from "../fixtures";

test.describe("UI — locale-switcher", () => {
  test("active locale button is focusable and not disabled", async ({
    page,
  }) => {
    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    const enButton = page.locator('button[aria-pressed="true"]');
    
    // Should have aria-pressed="true"
    await expect(enButton).toHaveAttribute("aria-pressed", "true");
    
    // Should NOT have disabled attribute
    const isDisabled = await enButton.evaluate((el) =>
      (el as HTMLButtonElement).disabled
    );
    expect(isDisabled).toBe(false);
  });

  test("clicking active locale button does nothing", async ({ page }) => {
    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    const initialUrl = page.url();
    const enButton = page.locator('button[aria-pressed="true"]');
    
    await enButton.click();
    
    // URL should not change
    expect(page.url()).toBe(initialUrl);
  });

  test("clicking inactive locale button navigates", async ({ page }) => {
    await page.goto("/en/jobs");
    await page.waitForLoadState("networkidle");

    const koButton = page.locator('button[aria-pressed="false"]');
    
    await koButton.click();
    await page.waitForURL(/\/ko\/jobs/);
    
    expect(page.url()).toContain("/ko/jobs");
  });
});
