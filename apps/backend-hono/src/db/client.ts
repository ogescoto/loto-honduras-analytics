/**
 * Cliente de BD para el runtime edge (Cloudflare Worker): Neon serverless.
 * Para seeds/migraciones en Node, ver `seeds/seed-db.ts` (postgres-js).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(connectionString: string): Database {
  if (!connectionString) {
    // Fail-fast: una variable obligatoria ausente debe romper con mensaje claro.
    throw new Error(
      "Falta la cadena de conexión a la base de datos (NEON_DATABASE_URL / DATABASE_URL).",
    );
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}
