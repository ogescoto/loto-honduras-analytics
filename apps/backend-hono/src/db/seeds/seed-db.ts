/**
 * Conexión a BD para seeds/migraciones en Node (postgres-js).
 * No se usa en el Worker (que usa Neon serverless): postgres-js requiere TCP.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema.js";
import type { Database } from "../client.js";

export function createSeedDb(connectionString: string): {
  db: Database;
  close: () => Promise<void>;
} {
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL para los seeds.");
  }
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema }) as unknown as Database;
  return { db, close: () => client.end() };
}
