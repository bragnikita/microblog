import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  numeric,
  timestamp,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

// Note: FK constraints and CHECK constraints are intentionally omitted — Aurora DSQL
// does not support them. Referential integrity and enum validation are enforced at
// the application layer (TypeScript types + Zod). The same migrations run against
// both local Postgres and DSQL (see migration.ts).

// =========================================================
// 1. contents
// Universal holder for microposts, articles, pages, albums, photoreports
// =========================================================
export const contents = pgTable('contents', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Enum values: micropost | article | page | album | photoreport
  contentType: varchar('content_type', { length: 32 }).notNull(),
  // Enum values: link | youtube | gallery | note | …
  subType: varchar('sub_type', { length: 32 }),

  slug: varchar('slug', { length: 200 }).unique(),
  title: text('title'),
  excerptText: text('excerpt_text'),
  commentText: text('comment_text'),

  // Enum values: public | private
  visibility: varchar('visibility', { length: 16 }).notNull().default('public'),
  // Enum values: draft | published | archived
  status: varchar('status', { length: 16 }).notNull().default('published'),

  publishedAt: timestamp('published_at', { withTimezone: true }),
  // Enum values: json | markdown | html | text
  bodyFormat: varchar('body_format', { length: 16 }).notNull().default('json'),
  // JSON stored as text for DSQL compatibility
  bodyText: text('body_text').notNull(),

  // App-level reference to photos.id — no FK for DSQL compatibility
  coverPhotoId: uuid('cover_photo_id'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('contents_type_published_idx').on(table.contentType, table.publishedAt),
  index('contents_visibility_published_idx').on(table.visibility, table.publishedAt),
  index('contents_status_published_idx').on(table.status, table.publishedAt),
  index('contents_slug_idx').on(table.slug),
]);

// =========================================================
// 2. photos
// Reusable image assets
// =========================================================
export const photos = pgTable('photos', {
  id: uuid('id').primaryKey().defaultRandom(),

  originalKey: text('original_key').notNull(),
  largeKey: text('large_key').notNull(),
  thumbKey: text('thumb_key').notNull(),
  originalFilename: text('original_filename'),
  mimeType: varchar('mime_type', { length: 100 }),
  width: integer('width'),
  height: integer('height'),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),

  commentText: text('comment_text'),

  // latitude/longitude must both be set or both be null (enforced at app layer)
  latitude: numeric('latitude', { precision: 9, scale: 6 }),
  longitude: numeric('longitude', { precision: 9, scale: 6 }),
  locationText: text('location_text'),
  takenAt: timestamp('taken_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('photos_taken_at_idx').on(table.takenAt),
  index('photos_created_at_idx').on(table.createdAt),
]);

// =========================================================
// 3. content_photos
// Links any content item to any photo
// =========================================================
export const contentPhotos = pgTable('content_photos', {
  // App-level references — no FK constraints for DSQL compatibility
  contentId: uuid('content_id').notNull(),
  photoId: uuid('photo_id').notNull(),

  // Enum values: inline | gallery | cover | attachment
  relationRole: varchar('relation_role', { length: 32 }).notNull().default('inline'),
  sortOrder: integer('sort_order').notNull().default(0),

  captionText: text('caption_text'),
  isPrimary: boolean('is_primary').notNull().default(false),
}, (table) => [
  primaryKey({ columns: [table.contentId, table.photoId] }),
  index('content_photos_content_sort_idx').on(table.contentId, table.sortOrder),
  index('content_photos_photo_idx').on(table.photoId),
  index('content_photos_role_idx').on(table.relationRole),
]);

// =========================================================
// 4. categories
// Hierarchical taxonomy for navigation and classification
// =========================================================
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),

  slug: varchar('slug', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  descriptionText: text('description_text'),

  // App-level self-reference — no FK constraint for DSQL compatibility
  parentCategoryId: uuid('parent_category_id'),
  sortOrder: integer('sort_order').notNull().default(0),

  // Enum values: public | private
  visibility: varchar('visibility', { length: 16 }).notNull().default('public'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('categories_parent_sort_idx').on(table.parentCategoryId, table.sortOrder),
  index('categories_visibility_idx').on(table.visibility),
]);

// =========================================================
// 5. content_categories
// Assigns content to one or many categories
// =========================================================
export const contentCategories = pgTable('content_categories', {
  // App-level references — no FK constraints for DSQL compatibility
  contentId: uuid('content_id').notNull(),
  categoryId: uuid('category_id').notNull(),

  isPrimary: boolean('is_primary').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
}, (table) => [
  primaryKey({ columns: [table.contentId, table.categoryId] }),
  index('content_categories_category_idx').on(table.categoryId, table.sortOrder),
  index('content_categories_content_idx').on(table.contentId),
  index('content_categories_primary_idx').on(table.contentId, table.isPrimary),
]);
