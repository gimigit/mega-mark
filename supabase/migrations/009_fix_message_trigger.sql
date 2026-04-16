-- Fix handle_new_message trigger for new schema (conversations + messages)
-- Old trigger used receiver_id/listing_id which don't exist in new messages table

CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_receiver_id UUID;
BEGIN
  SELECT CASE
    WHEN c.buyer_id = NEW.sender_id THEN c.seller_id
    ELSE c.buyer_id
  END INTO v_receiver_id
  FROM conversations c WHERE c.id = NEW.conversation_id;

  IF v_receiver_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      v_receiver_id,
      'new_message',
      'Mesaj nou',
      'Ai primit un mesaj nou',
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'message_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();
