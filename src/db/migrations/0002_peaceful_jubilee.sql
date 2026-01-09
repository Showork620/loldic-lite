CREATE TABLE "item_manual_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riot_id" text NOT NULL,
	"is_available" boolean NOT NULL,
	"reason" text,
	"updated_patch" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "item_manual_settings_riot_id_unique" UNIQUE("riot_id")
);
--> statement-breakpoint
ALTER TABLE "unavailable_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "unavailable_items" CASCADE;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "price_total" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "price_sell" SET DEFAULT 0;