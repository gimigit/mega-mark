-- Subscriptions table for user subscription plans
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'free', 'seller', 'dealer', 'enterprise'
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_profile ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = profile_id);

-- Listing boosts table for featured listings and top positions
CREATE TABLE IF NOT EXISTS listing_boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  boost_type TEXT NOT NULL, -- 'featured_7d', 'featured_14d', 'top_position'
  quantity INTEGER DEFAULT 1,
  stripe_payment_intent_id TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listing_boosts_listing ON listing_boosts(listing_id);
CREATE INDEX idx_listing_boosts_profile ON listing_boosts(profile_id);
CREATE INDEX idx_listing_boosts_expires ON listing_boosts(expires_at);

-- RLS for listing_boosts
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listing boosts"
  ON listing_boosts FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own listing boosts"
  ON listing_boosts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own listing boosts"
  ON listing_boosts FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own listing boosts"
  ON listing_boosts FOR DELETE
  USING (auth.uid() = profile_id);