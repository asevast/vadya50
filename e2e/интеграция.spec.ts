import { expect, test } from "@playwright/test";

test.describe("Интеграция с базой данных", () => {
  test("создание текстового поздравления и открытие по ссылке", async ({ page, request }) => {
    test.setTimeout(60000);

    const автор = "Тестовый Автор";
    const сообщение = `Проверка интеграции ${new Date().toISOString()}`;

    const ответ = await request.post("http://localhost:3004/api/congratulations", {
      headers: {
        "x-forwarded-for": "10.0.0.1",
      },
      data: {
        type: "text",
        author_name: автор,
        message: сообщение,
      },
    });

    const статус = ответ.status();
    const тело = (await ответ.json().catch(() => ({}))) as { slug?: string };
    if (статус !== 201 || !тело.slug) {
      throw new Error(`Ошибка API: ${статус} ${JSON.stringify(тело)}`);
    }

    const ссылка = `http://localhost:3004/congratulations/${тело.slug}`;

    const страница = await page.context().newPage();
    await страница.goto(ссылка, { waitUntil: "domcontentloaded" });

    await expect(страница.locator("span.font-medium", { hasText: автор })).toBeVisible();
    await expect(страница.locator("p", { hasText: сообщение })).toBeVisible();
  });
});
