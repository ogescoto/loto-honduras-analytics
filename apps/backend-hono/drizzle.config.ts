import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // En local apunta a Postgres (Docker); en prod a Neon.
    url: process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL ?? "",
  },
});
