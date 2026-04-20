CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description_text" text,
	"parent_category_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visibility" varchar(16) DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_categories" (
	"content_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "content_categories_content_id_category_id_pk" PRIMARY KEY("content_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "content_photos" (
	"content_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"relation_role" varchar(32) DEFAULT 'inline' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"caption_text" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "content_photos_content_id_photo_id_pk" PRIMARY KEY("content_id","photo_id")
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar(32) NOT NULL,
	"sub_type" varchar(32),
	"slug" varchar(200),
	"title" text,
	"excerpt_text" text,
	"comment_text" text,
	"visibility" varchar(16) DEFAULT 'public' NOT NULL,
	"status" varchar(16) DEFAULT 'published' NOT NULL,
	"published_at" timestamp with time zone,
	"body_format" varchar(16) DEFAULT 'json' NOT NULL,
	"body_text" text NOT NULL,
	"cover_photo_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_key" text NOT NULL,
	"large_key" text NOT NULL,
	"thumb_key" text NOT NULL,
	"original_filename" text,
	"mime_type" varchar(100),
	"width" integer,
	"height" integer,
	"file_size_bytes" bigint,
	"comment_text" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"location_text" text,
	"taken_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "categories_parent_sort_idx" ON "categories" USING btree ("parent_category_id","sort_order");--> statement-breakpoint
CREATE INDEX "categories_visibility_idx" ON "categories" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "content_categories_category_idx" ON "content_categories" USING btree ("category_id","sort_order");--> statement-breakpoint
CREATE INDEX "content_categories_content_idx" ON "content_categories" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "content_categories_primary_idx" ON "content_categories" USING btree ("content_id","is_primary");--> statement-breakpoint
CREATE INDEX "content_photos_content_sort_idx" ON "content_photos" USING btree ("content_id","sort_order");--> statement-breakpoint
CREATE INDEX "content_photos_photo_idx" ON "content_photos" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "content_photos_role_idx" ON "content_photos" USING btree ("relation_role");--> statement-breakpoint
CREATE INDEX "contents_type_published_idx" ON "contents" USING btree ("content_type","published_at");--> statement-breakpoint
CREATE INDEX "contents_visibility_published_idx" ON "contents" USING btree ("visibility","published_at");--> statement-breakpoint
CREATE INDEX "contents_status_published_idx" ON "contents" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "contents_slug_idx" ON "contents" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "photos_taken_at_idx" ON "photos" USING btree ("taken_at");--> statement-breakpoint
CREATE INDEX "photos_created_at_idx" ON "photos" USING btree ("created_at");