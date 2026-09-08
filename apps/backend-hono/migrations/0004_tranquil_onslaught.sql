-- 0004: Trazabilidad de resultados + fuentes de datos (APROBADO).
-- Nota: el snapshot de drizzle (meta/) está desactualizado; las migraciones
-- 0001-0003 se incorporaron al journal sin regenerar snapshot. Por eso este
-- delta se escribe a mano y NO debe regenerarse con drizzle-kit sin revisar.
CREATE TYPE "public"."source_type" AS ENUM('official', 'manual');--> statement-breakpoint
CREATE TABLE "draw_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"base_url" text NOT NULL,
	"api_format" text DEFAULT 'site-games' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"last_success_at" timestamp,
	"last_error_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "source" "source_type" DEFAULT 'official' NOT NULL;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "verified" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "source_url_id" uuid;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "entered_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD CONSTRAINT "lottery_history_source_url_id_draw_sources_id_fk" FOREIGN KEY ("source_url_id") REFERENCES "public"."draw_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD CONSTRAINT "lottery_history_entered_by_admin_id_users_id_fk" FOREIGN KEY ("entered_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Fuente primaria por defecto (bootstrap; el admin puede agregar más).
INSERT INTO "draw_sources" ("id","name","base_url","api_format","enabled","is_primary")
VALUES ('00000000-0000-4000-8000-000000000001','Loterías de Honduras (oficial)','https://api.loteriasdehonduras.com/honduras','site-games',true,true)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
