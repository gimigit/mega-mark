-- AgroMark EU - Row Level Security Policies
-- Enable RLS on all tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- NOTE: search_history and api_keys are optional; skip if tables don't exist
DO $$ BEGIN
  ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- PROFILES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- LISTINGS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON listings;
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT USING (status IN ('active', 'pending', 'sold'));

DROP POLICY IF EXISTS "Sellers can view own listings" ON listings;
CREATE POLICY "Sellers can view own listings"
  ON listings FOR SELECT USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can delete own listings" ON listings;
CREATE POLICY "Sellers can delete own listings"
  ON listings FOR DELETE USING (auth.uid() = seller_id);

-- ============================================
-- FAVORITES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own favorites" ON favorites;
CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================
-- MESSAGES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid()))
  );

-- ============================================
-- REVIEWS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SEARCH HISTORY POLICIES (optional table)
-- ============================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own search history" ON search_history;
  CREATE POLICY "Users can view own search history" ON search_history FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can create search history" ON search_history;
  CREATE POLICY "Users can create search history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete own search history" ON search_history;
  CREATE POLICY "Users can delete own search history" ON search_history FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- API KEYS POLICIES (optional table)
-- ============================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage own API keys" ON api_keys;
  CREATE POLICY "Users can manage own API keys" ON api_keys FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- CATEGORIES & MANUFACTURERS (read-only for all)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (is_active = true);

ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manufacturers are viewable by everyone" ON manufacturers;
CREATE POLICY "Manufacturers are viewable by everyone"
  ON manufacturers FOR SELECT USING (is_active = true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS TABLE(count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    AND m.sender_id != auth.uid()
    AND m.status = 'unread';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
  active_listings BIGINT,
  total_favorites BIGINT,
  unread_messages BIGINT,
  rating_avg DECIMAL
) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM listings WHERE seller_id = user_uuid AND status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM favorites WHERE user_id = user_uuid)::BIGINT,
    (SELECT COALESCE(SUM(
      CASE WHEN buyer_id = user_uuid THEN buyer_unread ELSE seller_unread END
    ), 0) FROM conversations WHERE buyer_id = user_uuid OR seller_id = user_uuid)::BIGINT,
    COALESCE((SELECT rating_avg FROM profiles WHERE id = user_uuid), 0)::DECIMAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_listings(
  search_query TEXT DEFAULT NULL,
  category_filter UUID DEFAULT NULL,
  manufacturer_filter UUID DEFAULT NULL,
  country_filter TEXT DEFAULT NULL,
  price_min DECIMAL DEFAULT NULL,
  price_max DECIMAL DEFAULT NULL,
  year_min INTEGER DEFAULT NULL,
  year_max INTEGER DEFAULT NULL,
  listing_type_filter listing_type DEFAULT NULL,
  condition_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  price DECIMAL,
  currency TEXT,
  year INTEGER,
  hours INTEGER,
  location_country TEXT,
  location_region TEXT,
  status listing_status,
  listing_type listing_type,
  images JSONB,
  seller_name TEXT,
  seller_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.price,
    l.currency,
    l.year,
    l.hours,
    l.location_country,
    l.location_region,
    l.status,
    l.listing_type,
    l.images,
    p.full_name AS seller_name,
    p.rating_avg AS seller_rating
  FROM listings l
  JOIN profiles p ON p.id = l.seller_id
  WHERE l.status = 'active'
    AND (search_query IS NULL OR l.title ILIKE '%' || search_query || '%' OR l.description ILIKE '%' || search_query || '%')
    AND (category_filter IS NULL OR l.category_id = category_filter)
    AND (manufacturer_filter IS NULL OR l.manufacturer_id = manufacturer_filter)
    AND (country_filter IS NULL OR l.location_country = country_filter)
    AND (price_min IS NULL OR l.price >= price_min)
    AND (price_max IS NULL OR l.price <= price_max)
    AND (year_min IS NULL OR l.year >= year_min)
    AND (year_max IS NULL OR l.year <= year_max)
    AND (listing_type_filter IS NULL OR l.listing_type = listing_type_filter)
    AND (condition_filter IS NULL OR l.condition = condition_filter)
  ORDER BY l.is_featured DESC, l.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
