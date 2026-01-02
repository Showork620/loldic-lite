--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riot_id" text NOT NULL,
	"name_ja" text NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"abilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"plaintext_ja" text NOT NULL,
	"price_total" integer NOT NULL,
	"price_sell" integer NOT NULL,
	"image_path" text NOT NULL,
	"patch_status" text,
	"search_tags" text[] DEFAULT '{}' NOT NULL,
	"role_categories" text[],
	"popular_champions" text[],
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"build_from" text[] DEFAULT '{}' NOT NULL,
	"build_into" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "items_riot_id_unique" UNIQUE("riot_id")
);
--> statement-breakpoint
CREATE TABLE "unavailable_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riot_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unavailable_items_riot_id_unique" UNIQUE("riot_id")
);
CREATE TABLE "additional_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riot_id" text NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"riot_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
