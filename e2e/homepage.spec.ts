import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display hero title", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/главная-герой.png", fullPage: true });
    await expect(page.locator("h1")).toContainText("Вадя принимает поздравления");
  });

  test("should display congratulation form", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h2")).toContainText("Вадя принимает");
  });

  test("should have tabs for text, audio, video", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("tab", { name: "Текст" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Аудио" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Видео" })).toBeVisible();
  });

  test("should scroll to form on CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Поздравить" }).click();
    await expect(page.locator("#congratulation-form")).toBeInViewport();
  });

  test("should clear form on reset", async ({ page }) => {
    await page.goto("/");
    await page.fill("#author_name", "Иван");
    await page.getByTestId("message-editor").click();
    await page.getByTestId("message-editor").fill("Тестовое сообщение");
    await page.getByRole("button", { name: "Очистить" }).click();
    await expect(page.locator("#author_name")).toHaveValue("");
  });

  test("should submit text and show success modal", async ({ page }) => {
    await page.route("**/api/congratulations", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "1",
          slug: "test1234",
          share_url: "http://localhost:3004/congratulations/test1234",
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/");
    await page.fill("#author_name", "Иван");
    await page.getByTestId("message-editor").click();
    await page.getByTestId("message-editor").fill("Тестовое сообщение");
    const ожиданиеОтвета = page.waitForResponse("**/api/congratulations");
    await page.getByTestId("submit-button").click({ force: true });
    await ожиданиеОтвета;

    await expect(page.getByText("Поздравление отправлено!")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("http://localhost:3004/congratulations/test1234")).toBeVisible();
  });

  test("video record button should be disabled if recorder unsupported", async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error
      window.MediaRecorder = undefined;
    });
    await page.goto("/");
    await page.getByTestId("tab-video").click({ force: true });
    await expect(page.getByTestId("video-record")).toBeDisabled();
  });
});
