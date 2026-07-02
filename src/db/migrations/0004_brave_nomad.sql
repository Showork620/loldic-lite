CREATE TABLE "ddragon_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patch_version" text NOT NULL,
	"riot_id" text NOT NULL,
	"raw" jsonb NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riot_id" text NOT NULL,
	"patch_version" text NOT NULL,
	"change_type" text NOT NULL,
	"changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"patchnote_quote" text,
	"review_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riot_id" text NOT NULL,
	"patch_version" text NOT NULL,
	"data" jsonb NOT NULL,
	"provenance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manual_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"riot_id" text NOT NULL,
	"field_path" text NOT NULL,
	"value" jsonb NOT NULL,
	"effective_from_patch" text NOT NULL,
	"effective_to_patch" text,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patches" (
	"version" text PRIMARY KEY NOT NULL,
	"kind" text DEFAULT 'major' NOT NULL,
	"ddragon_version" text,
	"patchnote_url" text,
	"released_at" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"sort_key" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patchnote_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patch_version" text NOT NULL,
	"url" text NOT NULL,
	"raw_html" text NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patchnote_extracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"patch_version" text NOT NULL,
	"riot_id" text,
	"item_name" text NOT NULL,
	"quoted_text" text NOT NULL,
	"parsed_changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ddragon_snapshots" ADD CONSTRAINT "ddragon_snapshots_patch_version_patches_version_fk" FOREIGN KEY ("patch_version") REFERENCES "public"."patches"("version") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_changes" ADD CONSTRAINT "item_changes_patch_version_patches_version_fk" FOREIGN KEY ("patch_version") REFERENCES "public"."patches"("version") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_states" ADD CONSTRAINT "item_states_patch_version_patches_version_fk" FOREIGN KEY ("patch_version") REFERENCES "public"."patches"("version") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_overrides" ADD CONSTRAINT "manual_overrides_effective_from_patch_patches_version_fk" FOREIGN KEY ("effective_from_patch") REFERENCES "public"."patches"("version") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patchnote_documents" ADD CONSTRAINT "patchnote_documents_patch_version_patches_version_fk" FOREIGN KEY ("patch_version") REFERENCES "public"."patches"("version") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patchnote_extracts" ADD CONSTRAINT "patchnote_extracts_document_id_patchnote_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."patchnote_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patchnote_extracts" ADD CONSTRAINT "patchnote_extracts_patch_version_patches_version_fk" FOREIGN KEY ("patch_version") REFERENCES "public"."patches"("version") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_snapshots_patch_riot" ON "ddragon_snapshots" USING btree ("patch_version","riot_id");--> statement-breakpoint
CREATE INDEX "ix_snapshots_riot" ON "ddragon_snapshots" USING btree ("riot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_changes_riot_patch" ON "item_changes" USING btree ("riot_id","patch_version");--> statement-breakpoint
CREATE INDEX "ix_changes_patch_status" ON "item_changes" USING btree ("patch_version","review_status");--> statement-breakpoint
CREATE INDEX "ix_changes_riot_status" ON "item_changes" USING btree ("riot_id","review_status");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_states_riot_patch" ON "item_states" USING btree ("riot_id","patch_version");--> statement-breakpoint
CREATE INDEX "ix_states_patch" ON "item_states" USING btree ("patch_version");--> statement-breakpoint
CREATE INDEX "ix_overrides_riot" ON "manual_overrides" USING btree ("riot_id","effective_from_patch");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_patchnote_doc" ON "patchnote_documents" USING btree ("patch_version","url");--> statement-breakpoint
CREATE INDEX "ix_extracts_patch" ON "patchnote_extracts" USING btree ("patch_version");--> statement-breakpoint
CREATE INDEX "ix_extracts_riot" ON "patchnote_extracts" USING btree ("riot_id");