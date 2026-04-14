-- saved_searches table for user saved search alerts
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  keyword TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  country TEXT,
  condition TEXT,
  price_min INTEGER,
  price_max INTEGER,
  year_min INTEGER,
  year_max INTEGER,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  listing_type TEXT,
  notify_email BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_created ON saved_searches(created_at DESC);

-- Add unique constraint per user
ALTER TABLE saved_searches ADD CONSTRAINT unique_user_search_name UNIQUE (user_id, name);

-- RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);