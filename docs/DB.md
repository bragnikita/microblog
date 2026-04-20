```sql
-- For local PostgreSQL, enable pgcrypto if you want gen_random_uuid().
-- Aurora DSQL supports UUID, but local Postgres may need this extension.
CREATE EXTENSION IF NOT EXISTS pgcrypto;





-- =========================================================
-- 1. contents
-- Universal holder for microposts, articles, pages, albums, photoreports
-- =========================================================
CREATE TABLE contents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    content_type        VARCHAR(32) NOT NULL,   -- micropost, article, page, album, photoreport
    sub_type            VARCHAR(32),            -- link, youtube, gallery, note, etc.

    slug                VARCHAR(200) UNIQUE,
    title               TEXT,
    excerpt_text        TEXT,
    comment_text        TEXT,

    visibility          VARCHAR(16) NOT NULL DEFAULT 'public',   -- public, private
    status              VARCHAR(16) NOT NULL DEFAULT 'published', -- draft, published, archived

    published_at        TIMESTAMPTZ,
    body_format         VARCHAR(16) NOT NULL DEFAULT 'json',     -- json, markdown, html, text
    body_text           TEXT NOT NULL,                           -- JSON stored as text for DSQL

    cover_photo_id      UUID,                                    -- app-level reference to photos.id

    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (content_type IN ('micropost', 'article', 'page', 'album', 'photoreport')),
    CHECK (visibility IN ('public', 'private')),
    CHECK (status IN ('draft', 'published', 'archived')),
    CHECK (body_format IN ('json', 'markdown', 'html', 'text'))
);

CREATE INDEX contents_type_published_idx
    ON contents (content_type, published_at DESC);

CREATE INDEX contents_visibility_published_idx
    ON contents (visibility, published_at DESC);

CREATE INDEX contents_status_published_idx
    ON contents (status, published_at DESC);

CREATE INDEX contents_slug_idx
    ON contents (slug);





-- =========================================================
-- 2. photos
-- Reusable image assets
-- =========================================================
CREATE TABLE photos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    original_key    TEXT NOT NULL,
    large_key TEXT NOT NULL,
    thumb_key TEXT NOT NULL,
    original_filename   TEXT,
    mime_type           VARCHAR(100),
    width               INTEGER,
    height              INTEGER,
    file_size_bytes     BIGINT,

    comment_text        TEXT,

    latitude            NUMERIC(9,6),
    longitude           NUMERIC(9,6),
    location_text       TEXT,
    taken_at            TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR
        (latitude IS NOT NULL AND longitude IS NOT NULL)
    )
);

CREATE INDEX photos_taken_at_idx
    ON photos (taken_at DESC);

CREATE INDEX photos_created_at_idx
    ON photos (created_at DESC);





-- =========================================================
-- 3. content_photos
-- Links any content item to any photo
-- =========================================================
CREATE TABLE content_photos (
    content_id          UUID NOT NULL,
    photo_id            UUID NOT NULL,

    relation_role       VARCHAR(32) NOT NULL DEFAULT 'inline',   -- inline, gallery, cover, attachment
    sort_order          INTEGER NOT NULL DEFAULT 0,

    caption_text        TEXT,
    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (content_id, photo_id),

    CHECK (relation_role IN ('inline', 'gallery', 'cover', 'attachment'))
);

CREATE INDEX content_photos_content_sort_idx
    ON content_photos (content_id, sort_order);

CREATE INDEX content_photos_photo_idx
    ON content_photos (photo_id);

CREATE INDEX content_photos_role_idx
    ON content_photos (relation_role);





-- =========================================================
-- 4. categories
-- Hierarchical taxonomy for navigation and classification
-- =========================================================
CREATE TABLE categories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug                VARCHAR(120) NOT NULL UNIQUE,
    name                VARCHAR(120) NOT NULL,
    description_text    TEXT,

    parent_category_id  UUID,                  -- app-level self-reference
    sort_order          INTEGER NOT NULL DEFAULT 0,

    visibility          VARCHAR(16) NOT NULL DEFAULT 'public',

    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (visibility IN ('public', 'private'))
);

CREATE INDEX categories_parent_sort_idx
    ON categories (parent_category_id, sort_order);

CREATE INDEX categories_visibility_idx
    ON categories (visibility);





-- =========================================================
-- 5. content_categories
-- Assign content to one or many categories
-- =========================================================
CREATE TABLE content_categories (
    content_id          UUID NOT NULL,
    category_id         UUID NOT NULL,

    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order          INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (content_id, category_id)
);

CREATE INDEX content_categories_category_idx
    ON content_categories (category_id, sort_order);

CREATE INDEX content_categories_content_idx
    ON content_categories (content_id);

CREATE INDEX content_categories_primary_idx
    ON content_categories (content_id, is_primary);
```