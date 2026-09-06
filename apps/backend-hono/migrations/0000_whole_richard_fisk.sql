CREATE TYPE "public"."game_type" AS ENUM('diaria', 'pega3', 'premia2', 'super_premio');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('stripe', 'cash_presencial');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_type" text NOT NULL,
	"game" "game_type" NOT NULL,
	"target_numbers" integer[] NOT NULL,
	"metadata" jsonb NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lottery_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game" "game_type" NOT NULL,
	"draw_number" integer NOT NULL,
	"winning_numbers" integer[] NOT NULL,
	"draw_timestamp" timestamp NOT NULL,
	"inserted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lottery_history_draw_number_unique" UNIQUE("draw_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_pattern_ids" uuid[] NOT NULL,
	"description" text NOT NULL,
	"cross_data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp NOT NULL,
	"registered_by_admin_id" uuid,
	"receipt_number" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_registered_by_admin_id_users_id_fk" FOREIGN KEY ("registered_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
