-- Migration 002: Add product metadata fields for affiliate and SEO
-- Additive only; preserves existing records.

ALTER TABLE products ADD COLUMN IF NOT EXISTS target_audience VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS aesthetic VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_source VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_network VARCHAR(50) DEFAULT 'Amazon Associates';
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available';
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_price_verified TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_content_update TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title VARCHAR(200);
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;

CREATE INDEX IF NOT EXISTS idx_products_aesthetic ON products(aesthetic);
CREATE INDEX IF NOT EXISTS idx_products_target_audience ON products(target_audience);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability_status);
CREATE INDEX IF NOT EXISTS idx_products_last_price_verified ON products(last_price_verified);
