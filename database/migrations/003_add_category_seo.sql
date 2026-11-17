-- Migration 003: Add SEO fields to categories
-- Additive only; preserves existing records.

ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_title VARCHAR(200);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_description TEXT;
