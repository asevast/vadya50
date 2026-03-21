-- Create enum type for congratulation types
CREATE TYPE congratulation_type AS ENUM ('text', 'audio', 'video');

-- Create table for congratulations
CREATE TABLE congratulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL DEFAULT nanoui(8),
  author_name TEXT NOT NULL,
  type congratulation_type NOT NULL,
  message TEXT,
  media_url TEXT,
  media_key TEXT,
  duration_sec INTEGER,
  thumbnail_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_congratulations_slug ON congratulations(slug);
CREATE INDEX idx_congratulations_type ON congratulations(type);
CREATE INDEX idx_congratulations_created_at_desc ON congratulations(created_at DESC);

-- Create Storage buckets (will be created via Supabase API, but documenting here)
-- Required buckets:
-- - congratulations-audio
-- - congratulations-video

-- Enable Row Level Security
ALTER TABLE congratulations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can read approved congratulations
CREATE POLICY "Public can read approved congratulations"
  ON congratulations FOR SELECT
  USING (is_approved = TRUE);

-- RLS Policy: Public can insert congratulations
CREATE POLICY "Public can insert congratulations"
  ON congratulations FOR INSERT
  WITH CHECK (TRUE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_congratulations_updated_at
  BEFORE UPDATE ON congratulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
