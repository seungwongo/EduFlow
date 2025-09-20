-- Add missing columns to seminars table
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS level text CHECK (level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS format text CHECK (format IN ('online', 'offline', 'hybrid'));
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS online_link text;
ALTER TABLE seminars ADD COLUMN IF NOT EXISTS curriculum jsonb;