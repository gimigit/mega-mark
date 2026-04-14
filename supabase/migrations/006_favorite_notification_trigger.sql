-- Auto-generate notifications when someone favorites a listing
-- This notifies the seller that their listing was favorited

CREATE OR REPLACE FUNCTION public.handle_new_favorite()
RETURNS TRIGGER AS $$
DECLARE
  seller_id UUID;
  listing_title TEXT;
BEGIN
  -- Get the seller_id and title from the listing
  SELECT seller_id, title INTO seller_id, listing_title
  FROM public.listings
  WHERE id = NEW.listing_id;
  
  IF seller_id IS NOT NULL THEN
    -- Insert notification for the seller
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      seller_id,
      'listing_favorite',
      'Anunț favorizat',
      'Anunțul tău a fost adăugat la favorite',
      jsonb_build_object(
        'listing_id', NEW.listing_id,
        'favorited_by', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_favorite_added ON public.favorites;

-- Create trigger
CREATE TRIGGER on_favorite_added
  AFTER INSERT ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_favorite();
