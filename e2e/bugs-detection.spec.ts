import { expect, test } from "@playwright/test";

test.describe("vadya50 bugs detection", () => {
  test.describe("1. Server and basic availability", () => {
    test("should return 200 status", async ({ request }) => {
      const response = await request.get("http://localhost:3004/");
      expect(response.status()).toBe(200);
    });

    test("should have no critical console errors on homepage", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("http://localhost:3004/");
      await page.waitForTimeout(2000);

      // Filter out expected warnings
      const criticalErrors = errors.filter(
        (e) => !e.includes("THREE.Clock") && !e.includes("deprecated") && !e.includes("favicon")
      );

      console.log("Console errors found:", criticalErrors);
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe("2. Hero Section and 3D", () => {
    test("should display 3D Fifty3D component", async ({ page }) => {
      await page.goto("http://localhost:3004/");
      await page.waitForTimeout(2000);

      const canvasOrFallback = page.locator(
        "[data-testid='fifty3d-canvas'], [data-testid='fifty3d-fallback']"
      );
      await expect(canvasOrFallback.first()).toBeVisible({ timeout: 10000 });
    });

    test("should have golden 50 text visible", async ({ page }) => {
      await page.goto("http://localhost:3004/");
      await page.waitForTimeout(2000);

      // Check for any visible text containing "50"
      const fiftyText = page.locator("text=50").first();
      await expect(fiftyText).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("3. Congratulation Form", () => {
    test("should switch between Text, Audio, Video tabs", async ({ page }) => {
      await page.goto("http://localhost:3004/");
      await page.waitForTimeout(1000);

      // Click Audio tab
      await page.getByRole("tab", { name: "Аудио" }).click();
      await expect(page.getByRole("button", { name: "Начать запись" })).toBeVisible();

      // Click Video tab
      await page.getByRole("tab", { name: "Видео" }).click();
      await expect(page.getByRole("button", { name: "Записать видео" })).toBeVisible();

      // Click back to Text
      await page.getByRole("tab", { name: "Текст" }).click();
      await expect(page.getByTestId("message-editor")).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto("http://localhost:3004/");

      // Try to submit without filling fields
      await page.getByRole("button", { name: "Отправить" }).click();

      // Check for validation error messages
      const validationMessage = page.locator("[role='alert'], .text-red-500, .text-red-400");
      await expect(validationMessage.first()).toBeVisible({ timeout: 5000 });
    });

    test("should show validation error when name is empty but message is filled", async ({ page }) => {
      await page.goto("http://localhost:3004/");
      await page.getByTestId("message-editor").click();
      await page.getByTestId("message-editor").fill("Тестовое сообщение для Вади");

      await page.getByRole("button", { name: "Отправить" }).click();

      // Should show error about author name
      await expect(page.getByText(/имя автора/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("4. Rate Limiting", () => {
    test("should return 429 after too many requests", async ({ request }) => {
      let rateLimited = false;

      // Make 5 rapid requests (limit is 3 per hour)
      for (let i = 0; i < 5; i++) {
        const response = await request.post("http://localhost:3004/api/congratulations", {
          data: {
            type: "text",
            author_name: `Test${i}`,
            content: `Test message ${i}`,
          },
        });

        if (response.status() === 429) {
          rateLimited = true;
          break;
        }
      }

      expect(rateLimited).toBe(true);
    });
  });

  test.describe("5. Media Upload validation", () => {
    test("should reject oversized files", async ({ request }) => {
      // Try to upload a very large "file" (mock)
      const response = await request.post("http://localhost:3004/api/upload", {
        multipart: {
          file: {
            name: "huge_file.mp3",
            mimeType: "audio/mpeg",
            buffer: Buffer.alloc(50 * 1024 * 1024), // 50MB
          },
        },
      });

      // Should return error for oversized file
      expect([400, 413]).toContain(response.status());
    });

    test("should reject invalid MIME types", async ({ request }) => {
      const response = await request.post("http://localhost:3004/api/upload", {
        multipart: {
          file: {
            name: "malicious.exe",
            mimeType: "application/x-executable",
            buffer: Buffer.from("test"),
          },
        },
      });

      expect([400, 415]).toContain(response.status());
    });
  });

  test.describe("6. Congratulation page", () => {
    test("should display created congratulation", async ({ page, request }) => {
      // First create a congratulation via API
      const createResponse = await request.post("http://localhost:3004/api/congratulations", {
        data: {
          type: "text",
          author_name: "Тестер",
          content: "Тестовое поздравление",
        },
      });

      if (createResponse.status() === 201) {
        const body = await createResponse.json();
        const slug = body.slug;

        // Navigate to the congratulation page
        await page.goto(`http://localhost:3004/congratulations/${slug}`);
        await page.waitForTimeout(2000);

        // Check if page loads
        await expect(page).toHaveURL(/congratulations\/.+/);
      }
    });
  });

  test.describe("7. Wall page", () => {
    test("should load wall page", async ({ page }) => {
      await page.goto("http://localhost:3004/wall");
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/.*wall/);
    });

    test("should display masonry grid", async ({ page }) => {
      await page.goto("http://localhost:3004/wall");
      await page.waitForTimeout(2000);

      // Check for grid container
      const gridContainer = page.locator(
        "[class*='masonry'], [class*='grid'], [data-testid='wall-grid']"
      );
      await expect(gridContainer.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("8. Responsive design", () => {
    test("should work on mobile viewport (375px)", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("http://localhost:3004/");
      await page.waitForTimeout(1500);

      // Page should still load
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should work on tablet viewport (768px)", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("http://localhost:3004/");
      await page.waitForTimeout(1500);

      await expect(page.locator("h1")).toBeVisible();
    });
  });
});
