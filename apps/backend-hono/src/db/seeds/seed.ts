/**
 * Runner de seeds. Selecciona el conjunto según --env.
 * Comandos: pnpm run seed:dev | seed:test | seed:prod
 *
 * Regla mandatory: NUNCA ejecutar seed dev/test contra producción.
 * Ver ai-software-governance/03_Database/Seeds_Strategy.md
 */
import { createDb } from "../client.js";
import { seedProduction } from "./prod_catalogos.js";
import { seedDevelopment } from "./dev_dataset.js";
import { seedTest } from "./test_fixtures.js";

type Env = "production" | "development" | "test";

function parseEnv(): Env {
  const idx = process.argv.indexOf("--env");
  const value = idx >= 0 ? process.argv[idx + 1] : process.env.APP_ENV;
  if (value !== "production" && value !== "development" && value !== "test") {
    throw new Error(`--env inválido: "${value}" (usa production|development|test)`);
  }
  return value;
}

async function main() {
  const env = parseEnv();
  const url =
    env === "production" ? process.env.NEON_DATABASE_URL : process.env.DATABASE_URL;

  if (env !== "production" && process.env.NEON_DATABASE_URL === url && url) {
    throw new Error("Bloqueado: seed dev/test apuntando a la BD de producción.");
  }

  const db = createDb(url ?? "");

  switch (env) {
    case "production":
      await seedProduction(db);
      break;
    case "development":
      await seedDevelopment(db);
      break;
    case "test":
      await seedTest(db);
      break;
  }
  console.log(`Seed "${env}" completado.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
