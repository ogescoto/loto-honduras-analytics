import { test, expect } from "@playwright/test";

// @manual-step: El usuario abre la página principal y ve el título del producto.
test("la landing muestra el nombre del producto", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Loto Honduras Analytics",
  );
});
