-- ============================================================
-- AgroMark EU — Seed complet (se ruleaza DUPA ce ai conturile)
-- ============================================================
BEGIN;

DO $$
DECLARE
  seller_uuid UUID;
  buyer_uuid UUID;
  listing_uuid UUID;
  cat_uuid UUID;
BEGIN
  -- Gaseste utilizatorii
  SELECT id INTO seller_uuid FROM auth.users WHERE email = 'vanzator@test.eu';
  SELECT id INTO buyer_uuid  FROM auth.users WHERE email = 'cumparator@test.eu';

  IF seller_uuid IS NULL OR buyer_uuid IS NULL THEN
    RAISE NOTICE 'EROARE: Utilizatorii nu exista. Creaza conturile mai intai.';
    RETURN;
  END IF;

  -- Profile seller
  INSERT INTO public.profiles (id, email, full_name, role, location_country, location_region, bio)
  VALUES (seller_uuid, 'vanzator@test.eu', 'Maria Ionescu', 'seller', 'RO', 'Timiș', 'Ferma cu 50 ha, vand utilaje ocazie.')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Maria Ionescu';

  -- Profile buyer
  INSERT INTO public.profiles (id, email, full_name, role, location_country, location_region)
  VALUES (buyer_uuid, 'cumparator@test.eu', 'Ion Popescu', 'buyer', 'DE', 'Bayern')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Ion Popescu';

  -- Categorie
  SELECT id INTO cat_uuid FROM public.categories WHERE slug = 'tractors' LIMIT 1;

  -- Listing
  listing_uuid := gen_random_uuid();
  INSERT INTO public.listings (
    id, seller_id, title, description, price, price_type,
    listing_type, condition, category_id,
    year, hours, location_country, location_region, status,
    created_at, updated_at
  )
  VALUES (
    listing_uuid, seller_uuid,
    'John Deere 6155M — Tractoare',
    'Tractor John Deere 6155M, an 2019, 4.500 ore, stare foarte buna. Dotat cu Front PTO, AutoTrac, aer conditionat.',
    89500, 'fixed', 'sale', 'used', cat_uuid,
    2019, 4500, 'RO', 'Timiș', 'active',
    NOW() - INTERVAL '2 days', NOW()
  );

  -- Mesaj de test
  INSERT INTO public.messages (id, sender_id, receiver_id, listing_id, content, is_read, created_at)
  VALUES (
    gen_random_uuid(), buyer_uuid, seller_uuid, listing_uuid,
    'Buna ziua! Sunt interesat de tractor. Este disponibil pentru livrare in Germania?',
    FALSE, NOW() - INTERVAL '1 hour'
  );

  RAISE NOTICE '';
  RAISE NOTICE '=== SEED COMPLET ===';
  RAISE NOTICE '1. Login ca vanzator@test.eu → Dashboard → Mesaje';
  RAISE NOTICE '2. Login ca cumparator@test.eu → Browse → John Deere → Contacteaza vanzatorul';
END $$;

COMMIT;
