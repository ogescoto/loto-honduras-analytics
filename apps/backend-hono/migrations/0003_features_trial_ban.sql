-- Migración 0003: características analíticas, trial y baneo
-- Cambios:
--   1. payment_method enum: agrega 'trial'
--   2. users: agrega columna banned
--   3. Nueva tabla number_states (estado latente 100 números por juego)
--   4. Nueva tabla feature_compliance (historial de cumplimiento del ganador)

--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'trial';

--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned" boolean NOT NULL DEFAULT false;

--> statement-breakpoint
CREATE TABLE "number_states" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "game"       "game_type" NOT NULL,
  "number"     integer NOT NULL,
  "features"   jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "number_states_game_number_unique" UNIQUE("game","number")
);

--> statement-breakpoint
CREATE TABLE "feature_compliance" (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "game"             "game_type" NOT NULL,
  "session_id"       text NOT NULL,
  "winner_number"    integer NOT NULL,
  "feature_codes"    text[] NOT NULL,
  "recorded_at"      timestamp DEFAULT now() NOT NULL
);
