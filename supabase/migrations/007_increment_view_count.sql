-- Function to safely increment listing view count
CREATE OR REPLACE FUNCTION public.increment_view_count(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (or use anon if needed)
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO authenticated;
