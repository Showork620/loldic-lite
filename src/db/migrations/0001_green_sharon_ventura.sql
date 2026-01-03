CREATE TABLE "role_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"riot_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "role_items" CASCADE;--> statement-breakpoint
ALTER TABLE "additional_tags" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "maps" integer[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "basic_stats" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "ability_stats" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "updated_patch" text;--> statement-breakpoint
ALTER TABLE "unavailable_items" ADD COLUMN "updated_patch" text;--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN "stats";