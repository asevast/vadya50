import { expect, test } from "@playwright/test";

const mockSuccess = {
  id: "1",
  slug: "test-media",
  share_url: "http://localhost:3004/congratulations/test-media",
  created_at: new Date().toISOString(),
};

test.describe("Медиа", () => {
  test("аудио загрузка показывает запись и позволяет отправить", async ({ page }) => {

    await page.route("**/api/congratulations", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(mockSuccess),
      });
    });

    await page.goto("/");
    await page.getByTestId("tab-audio").click({ force: true });

    await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('[data-testid="audio-file"]');
      if (!input) throw new Error("audio-file input not found");
      const file = new File([new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])], "test.wav", {
        type: "audio/wav",
      });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Wait for the delete button to appear (React re-render)
    await expect(page.getByTestId("audio-delete")).toBeVisible({ timeout: 5000 });

    await page.fill("#author_name", "Тест аудио");
    await page.getByRole("button", { name: "Отправить" }).click();

    await expect(page.getByText("Поздравление отправлено!")).toBeVisible();
  });

  test("видео загрузка показывает превью и позволяет отправить", async ({ page }) => {
    await page.route("**/api/congratulations", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(mockSuccess),
      });
    });

    await page.goto("/");
    await page.getByTestId("tab-video").click({ force: true });

    await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>('[data-testid="video-file"]');
      if (!input) throw new Error("video-file input not found");
      const file = new File([new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])], "test.mp4", {
        type: "video/mp4",
      });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Wait for the video preview to appear (React re-render)
    await expect(page.getByTestId("video-preview")).toBeVisible({ timeout: 5000 });

    await page.fill("#author_name", "Тест видео");
    await page.getByRole("button", { name: "Отправить" }).click();

    await expect(page.getByText("Поздравление отправлено!")).toBeVisible();
  });
});

test.describe("Стена", () => {
  test("стена поздравлений отображает карточки и фильтры", async ({ page }) => {
    await page.route("**/api/congratulations**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          congratulations: [
            {
              id: "1",
              slug: "aaa11111",
              author_name: "Алексей",
              type: "text",
              message: "Тестовое сообщение",
              media_url: null,
              views_count: 1,
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.goto("/wall");
    await expect(page.getByRole("heading", { name: "Стена поздравлений" })).toBeVisible();
    await expect(page.getByText("Алексей")).toBeVisible();

    await page.getByRole("tab", { name: "Видео" }).click();
    await expect(page.getByRole("tab", { name: "Видео" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
