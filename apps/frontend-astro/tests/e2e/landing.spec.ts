import { test, expect } from "@playwright/test";

// @manual-step: El usuario abre la página principal y ve el Dashboard con la navegación.
test("la landing muestra el Dashboard y la navegación", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dashboard");
  await expect(page.getByRole("link", { name: "Premium" })).toBeVisible();
});
