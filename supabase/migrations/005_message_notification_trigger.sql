-- Auto-generate notifications for new messages
-- This creates a notification when a message is inserted

CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the receiver
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data
  ) VALUES (
    NEW.receiver_id,
    'new_message',
    'Mesaj nou',
    'Ai primit un mesaj nou',
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'listing_id', NEW.listing_id,
      'message_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;

-- Create trigger
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();
