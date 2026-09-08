import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Los E2E (Playwright) se corren con `test:e2e`, no con vitest.
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
  },
});
