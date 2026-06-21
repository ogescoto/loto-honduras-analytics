/**
 * Runner de seeds. Selecciona el conjunto según --env.
 * Comandos: pnpm run seed:dev | seed:test | seed:prod
 *
 * Corre en Node (tsx): usa postgres-js para Postgres local/CI y Neon para prod.
 * Regla mandatory: NUNCA ejecutar seed dev/test contra producción.
 * Ver ai-software-governance/03_Database/Seeds_Strategy.md
 */
import { createDb, type Database } from "../client.js";
import { createSeedDb } from "./seed-db.js";
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

  if (env === "production") {
    const url = process.env.NEON_DATABASE_URL ?? "";
    const db = createDb(url);
    await seedProduction(db);
    console.log('Seed "production" completado.');
    return;
  }

  // dev/test: Postgres estándar vía postgres-js.
  const url = process.env.DATABASE_URL;
  if (process.env.NEON_DATABASE_URL && process.env.NEON_DATABASE_URL === url) {
    throw new Error("Bloqueado: seed dev/test apuntando a la BD de producción.");
  }

  const { db, close } = createSeedDb(url ?? "");
  try {
    if (env === "development") await seedDevelopment(db as unknown as Database);
    else await seedTest(db as unknown as Database);
    console.log(`Seed "${env}" completado.`);
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
