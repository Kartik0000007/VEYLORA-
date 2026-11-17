-- Migration 001: Add token_version and password_changed_at to admins
-- Supports token invalidation after password change.

ALTER TABLE admins ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
