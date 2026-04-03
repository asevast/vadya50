import { expect, test } from "@playwright/test";

test.describe("Supabase Studio Check", () => {
  test("Studio loads at localhost:54323", async ({ page }) => {
    await page.goto("http://localhost:54323", { timeout: 30000 });

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Take screenshot
    await page.screenshot({ path: "test-results/studio-homepage.png", fullPage: true });

    // Check page title
    const title = await page.title();
    console.log("Page title:", title);

    // Check for Supabase Studio indicators
    const url = page.url();
    console.log("Current URL:", url);

    // Look for login form or dashboard
    const hasLogin = await page
      .getByRole("textbox", { name: /email/i })
      .isVisible()
      .catch(() => false);
    const hasDashboard = await page
      .getByText("Project")
      .isVisible()
      .catch(() => false);

    console.log("Has login form:", hasLogin);
    console.log("Has dashboard:", hasDashboard);

    // Get page content summary
    const bodyText = await page.evaluate(
      () => document.body?.innerText?.substring(0, 500) || "No body text"
    );
    console.log("Page content preview:", bodyText);

    expect(url).toContain("54323");
  });

  test("Check API health", async ({ request }) => {
    const response = await request.get("http://localhost:54323");
    console.log("API Status:", response.status());
    console.log("API Headers:", await response.headers());
  });
});
