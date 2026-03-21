import { expect, test } from "@playwright/test";

test.describe("Интеграция с базой данных", () => {
  test("создание текстового поздравления и открытие по ссылке", async ({ page }) => {
    test.setTimeout(60000);

    const автор = "Тестовый Автор";
    const сообщение = `Проверка интеграции ${new Date().toISOString()}`;

    await page.goto("/");
    await page.fill("#author_name", автор);
    await page.locator(".ProseMirror").click();
    await page.keyboard.type(сообщение);
    const ожиданиеОтвета = page.waitForResponse((resp) => {
      return resp.url().includes("/api/congratulations") && resp.request().method() === "POST";
    });

    await page.getByRole("button", { name: "Отправить" }).click();

    const ответ = await ожиданиеОтвета;
    const статус = ответ.status();
    const тело = await ответ.json().catch(() => ({} as { slug?: string }));
    if (статус !== 201) {
      throw new Error(`Ошибка API: ${статус} ${JSON.stringify(тело)}`);
    }

    await expect(page.getByText("Поздравление отправлено!")).toBeVisible({ timeout: 10000 });
    expect(тело.slug).toBeTruthy();
    const ссылка = `http://localhost:3004/congratulations/${тело.slug}`;

    const страница = await page.context().newPage();
    await страница.goto(ссылка, { waitUntil: "domcontentloaded" });

    await expect(страница.locator("span.font-medium", { hasText: автор })).toBeVisible();
    await expect(страница.locator("p", { hasText: сообщение })).toBeVisible();
  });
});
