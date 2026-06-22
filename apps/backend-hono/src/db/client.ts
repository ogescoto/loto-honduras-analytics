/**
 * Cliente de BD con selección de driver según el entorno:
 * - Desarrollo (Postgres en Docker): driver postgres-js (TCP).
 * - Producción (Neon serverless): driver Neon HTTP.
 *
 * La selección es por la cadena de conexión: si apunta a Neon, usa Neon;
 * en cualquier otro caso, Postgres estándar.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

export type Database = ReturnType<typeof drizzleNeon<typeof schema>>;

function isNeon(url: string): boolean {
  return url.includes("neon.tech") || url.includes("neon.database");
}

export function createDb(connectionString: string): Database {
  if (!connectionString) {
    // Fail-fast: una variable obligatoria ausente debe romper con mensaje claro.
    throw new Error(
      "Falta la cadena de conexión a la base de datos (NEON_DATABASE_URL / DATABASE_URL).",
    );
  }

  if (isNeon(connectionString)) {
    const sql = neon(connectionString);
    return drizzleNeon(sql, { schema });
  }

  // Desarrollo local: Postgres en Docker vía TCP.
  const client = postgres(connectionString, { max: 1 });
  return drizzlePg(client, { schema }) as unknown as Database;
}
