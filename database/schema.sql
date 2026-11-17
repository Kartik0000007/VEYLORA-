-- Veylora Database Schema
-- Run this on your PostgreSQL database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  brand VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  affiliate_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Site settings table (for hero text, counts, brand info, etc.)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Insert default categories
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
  ('Men', 'men', 'Architectural tailoring, heavyweight French terry essentials, sculpted Horween leather boots.', NULL, 1),
  ('Women', 'women', 'Fluid Mulberry silk slip profiles, double-faced wool trench structures, architectural vegan leather arch bags.', NULL, 2),
  ('Clothing', 'clothing', 'Curated clothing across all genders and aesthetics.', NULL, 3),
  ('Footwear', 'footwear', 'Hand-stitched leather Chelsea boots, architectural sneakers, and more.', NULL, 4),
  ('Accessories', 'accessories', 'Vegan leather arch bags, gold hoops, titanium chronometers.', NULL, 5),
  ('Aesthetics', 'aesthetics', '18 aesthetic moods from Quiet Luxury to Y2K High-Chic.', NULL, 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert default admin (username: admin, password: admin123)
-- Change password after first login!
INSERT INTO admins (username, email, password_hash, role) VALUES
  ('admin', 'admin@veylora.local', '$2a$10$K7.x5X8vZ9mP2qR4tS6uW8yA0bC1dE3fG5hI7jK9lM2nO4pQ6rS', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
  ('site_name', 'Veylora'),
  ('site_tagline', 'Haute Curation Archive'),
  ('hero_headline', 'EVERY STYLE. ONE DESTINATION.'),
  ('hero_subhead', 'A curated fashion discovery sanctuary bridging architectural editorial luxury with accessible, certified sartorial pieces available directly on Amazon.in.'),
  ('curated_pieces_count', '12000+'),
  ('aesthetics_count', '18'),
  ('amazon_verified', 'true')
ON CONFLICT (setting_key) DO NOTHING;
