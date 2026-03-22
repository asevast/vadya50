import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  webServer: {
    command: "npm run dev -- -p 3004",
    url: "http://localhost:3004",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  use: {
    baseURL: "http://localhost:3004",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      browserName: "chromium",
      permissions: ["microphone", "camera"],
      launchOptions: {
        args: [
          "--use-fake-device-for-media-stream",
          "--use-fake-ui-for-media-stream",
          "--use-file-for-fake-audio-capture=./e2e/fixtures/fake-audio.wav",
          "--use-file-for-fake-video-capture=./e2e/fixtures/fake-video.y4m",
        ],
      },
    },
    {
      name: "chromium-android",
      use: { ...devices["Pixel 5"] },
      browserName: "chromium",
      permissions: ["microphone", "camera"],
      launchOptions: {
        args: [
          "--use-fake-device-for-media-stream",
          "--use-fake-ui-for-media-stream",
          "--use-file-for-fake-audio-capture=./e2e/fixtures/fake-audio.wav",
          "--use-file-for-fake-video-capture=./e2e/fixtures/fake-video.y4m",
        ],
      },
    },
    {
      name: "webkit-iphone",
      use: { ...devices["iPhone 12"] },
      browserName: "webkit",
    },
  ],
});
