import { test } from "@playwright/test";

test("Health Check", async ({ page }) => {
  await page.goto("http://localhost:3000/");
});
