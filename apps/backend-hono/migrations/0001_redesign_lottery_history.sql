ALTER TABLE "lottery_history" DROP CONSTRAINT "lottery_history_draw_number_unique";--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "session_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "numbers" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "signs" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "lottery_history" ADD COLUMN "draw_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "lottery_history" DROP COLUMN "draw_number";--> statement-breakpoint
ALTER TABLE "lottery_history" DROP COLUMN "winning_numbers";--> statement-breakpoint
ALTER TABLE "lottery_history" DROP COLUMN "draw_timestamp";--> statement-breakpoint
ALTER TABLE "lottery_history" ADD CONSTRAINT "lottery_history_session_id_unique" UNIQUE("session_id");--> statement-breakpoint
ALTER TABLE "public"."game_patterns" ALTER COLUMN "game" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."lottery_history" ALTER COLUMN "game" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."game_type";--> statement-breakpoint
CREATE TYPE "public"."game_type" AS ENUM('diaria_11am', 'diaria_3pm', 'diaria_9pm', 'pega3_11am', 'pega3_3pm', 'pega3_9pm', 'premia2_11am', 'premia2_3pm', 'premia2_9pm', 'juga3_11am', 'juga3_3pm', 'juga3_9pm', 'super_premio');--> statement-breakpoint
ALTER TABLE "public"."game_patterns" ALTER COLUMN "game" SET DATA TYPE "public"."game_type" USING "game"::"public"."game_type";--> statement-breakpoint
ALTER TABLE "public"."lottery_history" ALTER COLUMN "game" SET DATA TYPE "public"."game_type" USING "game"::"public"."game_type";