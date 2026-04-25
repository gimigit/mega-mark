-- Mega-Mark - Supabase Database Schema
-- Agricultural Machinery Marketplace for Europe

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE condition_type AS ENUM ('new', 'used', 'refurbished');
CREATE TYPE listing_type AS ENUM ('sale', 'rent', 'lease');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'pending', 'sold', 'archived', 'deleted');
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'dealer', 'admin');
CREATE TYPE message_status AS ENUM ('unread', 'read', 'archived');
CREATE TYPE price_type AS ENUM ('fixed', 'negotiable', 'on_request', 'auction');

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  vat_number TEXT,
  role user_role DEFAULT 'buyer',
  avatar_url TEXT,
  bio TEXT,
  location_country TEXT,
  location_region TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_dealer BOOLEAN DEFAULT FALSE,
  verification_level TEXT DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'premium', 'verified')),
  verified_brands UUID[] DEFAULT '{}'::UUID[],
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  listings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_es TEXT,
  name_pl TEXT,
  name_ro TEXT,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MANUFACTURERS / BRANDS
-- ============================================

CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  logo_url TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTINGS (Main equipment listings)
-- ============================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_de TEXT,
  title_fr TEXT,
  title_es TEXT,
  description TEXT NOT NULL,
  description_de TEXT,
  description_fr TEXT,
  description_es TEXT,
  listing_type listing_type DEFAULT 'sale',
  price DECIMAL(12,2),
  price_type price_type DEFAULT 'fixed',
  currency TEXT DEFAULT 'EUR',
  price_history JSONB DEFAULT '[]',
  year INTEGER,
  hours INTEGER,
  mileage INTEGER,
  power_hp INTEGER,
  engine_type TEXT,
  transmission TEXT,
  weight_kg INTEGER,
  condition condition_type DEFAULT 'used',
  status listing_status DEFAULT 'draft',
is_featured BOOLEAN DEFAULT FALSE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  buyer_protection BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
   inquiries_count INTEGER DEFAULT 0,
   favorites_count INTEGER DEFAULT 0,
  location_country TEXT NOT NULL,
  location_region TEXT,
  location_city TEXT,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  images JSONB DEFAULT '[]'::JSONB,
  specs JSONB DEFAULT '{}'::JSONB,
  videos JSONB DEFAULT '[]'::JSONB,
  documents JSONB DEFAULT '[]'::JSONB,
  export_countries TEXT[] DEFAULT '{}'::TEXT[],
  video_url TEXT,
  expires_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE listings IS 'Main equipment marketplace listings - tractors, combines, harvesters, etc.';

-- ============================================
-- FAVORITES / WATCHLIST
-- ============================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- MESSAGES / INQUIRIES
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ,
  buyer_unread INTEGER DEFAULT 0,
  seller_unread INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status message_status DEFAULT 'unread',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS / RATINGS
-- ============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, listing_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEARCH HISTORY
-- ============================================

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::JSONB,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- API KEYS (for dealer/dealer integrations)
-- ============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '["read"]'::JSONB,
  rate_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_manufacturer ON listings(manufacturer_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_type ON listings(listing_type);
CREATE INDEX idx_listings_country ON listings(location_country);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_year ON listings(year);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_featured ON listings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_listings_location ON listings USING GIST (
  (point(location_lng::FLOAT, location_lat::FLOAT))
) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
CREATE INDEX idx_listings_search ON listings USING GIN (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);
CREATE INDEX idx_favorites_created ON favorites(created_at DESC);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_id);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE INDEX idx_manufacturers_slug ON manufacturers(slug);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings SET views_count = views_count + 1 WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update conversation unread counts
CREATE OR REPLACE FUNCTION update_conversation_unread()
RETURNS TRIGGER AS $$
DECLARE
  v_conv RECORD;
BEGIN
  SELECT * INTO v_conv FROM conversations WHERE id = NEW.conversation_id;
  IF v_conv.buyer_id = NEW.sender_id THEN
    UPDATE conversations SET seller_unread = seller_unread + 1, last_message_preview = LEFT(NEW.content, 100), last_message_at = NOW() WHERE id = NEW.conversation_id;
  ELSE
    UPDATE conversations SET buyer_unread = buyer_unread + 1, last_message_preview = LEFT(NEW.content, 100), last_message_at = NOW() WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_unread();

-- Update favorites count on listing
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET favorites_count = favorites_count + 1 WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_favorite_change
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Update seller listings count
CREATE OR REPLACE FUNCTION update_seller_listings_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE profiles SET listings_count = listings_count + 1 WHERE id = NEW.seller_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE profiles SET listings_count = GREATEST(0, listings_count - 1) WHERE id = OLD.seller_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE profiles SET listings_count = listings_count + 1 WHERE id = NEW.seller_id;
    ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE profiles SET listings_count = GREATEST(0, listings_count - 1) WHERE id = NEW.seller_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_listing_status_change
  AFTER INSERT OR UPDATE OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_seller_listings_count();

-- Update review stats
CREATE OR REPLACE FUNCTION update_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET
    rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewed_id = NEW.reviewed_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewed_id = NEW.reviewed_id)
  WHERE id = NEW.reviewed_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_review_stats();

-- ============================================
-- SEED DATA: Categories
-- ============================================

INSERT INTO categories (slug, name, name_de, name_fr, name_es, name_pl, name_ro, icon, sort_order) VALUES
  ('tractors', 'Tractors', 'Traktoren', 'Tracteurs', 'Tractores', 'Ciągniki', 'Tractoare', '🚜', 1),
  ('combines', 'Combine Harvesters', 'Mähdrescher', 'Moissonneuses-batteuses', 'Cosechadoras', 'Kombajny', 'Combine', '🌾', 2),
  ('harvesters', 'Harvesters', 'Erntegeräte', 'Ensileuses', 'Cosechadoras', 'Kombajny', 'Recoltoare', '🌽', 3),
  ('sprayers', 'Sprayers', 'Sprühgeräte', 'Pulvérisateurs', 'Pulverizadores', 'Opryskiwacze', 'Stropitori', '💧', 4),
  ('seeders', 'Seeders & Planters', 'Sämaschinen', 'Semoirs', 'Sembradoras', 'Siewniki', 'Semănători', '🌱', 5),
  ('plows', 'Plows & Tillage', 'Pflüge & Bodenbearbeitung', 'Charrues', 'Arados', 'Pługi', 'Pluguri', '🌍', 6),
  ('balers', 'Balers', 'Ballenpressen', 'Presses', 'Envolvedoras', 'Prasy', 'Prese', '📦', 7),
  ('loaders', 'Front Loaders', 'Frontlader', 'Chargeurs', 'Cargadores', 'Ładowacze', 'Încărcătoare', '🚜', 8),
  ('trailers', 'Trailers & Carts', 'Anhänger', 'Remorques', 'Remolques', 'Przyczepy', 'Remorci', '🚛', 9),
  ('construction', 'Construction Equipment', 'Baugeräte', 'Engins de chantier', 'Maquinaria construcción', 'Maszyny budowlane', 'Utilaje construcții', '🏗️', 10),
  ('other', 'Other Equipment', 'Sonstige Geräte', 'Autres équipements', 'Otros equipos', 'Inne maszyny', 'Alte echipamente', '⚙️', 11);

-- ============================================
-- SEED DATA: Manufacturers
-- ============================================

INSERT INTO manufacturers (slug, name, country, logo_url) VALUES
  ('john-deere', 'John Deere', 'USA', NULL),
  ('case-ih', 'Case IH', 'USA', NULL),
  ('new-holland', 'New Holland', 'USA', NULL),
  ('fendt', 'Fendt', 'Germany', NULL),
  ('massey-ferguson', 'Massey Ferguson', 'UK', NULL),
  ('claas', 'Claas', 'Germany', NULL),
  ('kubota', 'Kubota', 'Japan', NULL),
  ('deutz-fahr', 'Deutz-Fahr', 'Germany', NULL),
  ('valtra', 'Valtra', 'Finland', NULL),
  ('jcb', 'JCB', 'UK', NULL),
  ('valmet', 'Valmet', 'Finland', NULL),
  ('steyr', 'Steyr', 'Austria', NULL),
  ('mccormick', 'McCormick', 'Italy', NULL),
  ('zetor', 'Zetor', 'Czech Republic', NULL),
  ('belarus', 'Belarus', 'Belarus', NULL),
  ('versatile', 'Versatile', 'Canada', NULL),
  ('poettinger', 'Pöttinger', 'Austria', NULL),
  ('lemken', 'Lemken', 'Germany', NULL),
  ('kverneland', 'Kverneland', 'Norway', NULL),
  ('other', 'Other / Unknown', NULL, NULL);

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================
-- Note: RLS policies for storage.objects are defined in storage.sql
-- These are referenced here for documentation purposes:
--
-- listings bucket policies:
--   - Public SELECT (anyone can view images)
--   - Authenticated INSERT (upload to own folder: listings/{user_id}/*)
--   - Owner UPDATE (update own images)
--   - Owner DELETE (delete own images)
--
-- The bucket must be created in Supabase Dashboard:
--   Storage → New Bucket → Name: 'listings', Public: true
--   File size limit: 5MB
--   Allowed types: image/jpeg, image/png, image/webp
