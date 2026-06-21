/**
 * Seed de PRODUCCIÓN — solo catálogos/datos estructurales. Idempotente.
 * PROHIBIDO: datos ficticios, usuarios de prueba, credenciales por defecto.
 * Ver ai-software-governance/03_Database/Seeds_Strategy.md
 */
import type { Database } from "../client.js";

export async function seedProduction(_db: Database): Promise<void> {
  // Loto Honduras Analytics no requiere catálogos fijos en BD por ahora:
  // los tipos de juego viven como enum (game_type) y los roles como texto.
  // Si en el futuro se añaden catálogos (p.ej. tabla de configuración global),
  // insertarlos aquí de forma idempotente (ON CONFLICT DO NOTHING).
  void _db;
}
