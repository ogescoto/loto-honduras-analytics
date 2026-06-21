/**
 * Inicialización condicional de la conexión a BD.
 * - Producción/edge: Neon serverless (HTTP/WebSocket).
 * - Local/test: mismo driver apuntando a Postgres en Docker vía DATABASE_URL.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

export type Database = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  if (!connectionString) {
    // Fail-fast: una variable obligatoria ausente debe romper con mensaje claro.
    throw new Error(
      "Falta la cadena de conexión a la base de datos (NEON_DATABASE_URL / DATABASE_URL).",
    );
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}
