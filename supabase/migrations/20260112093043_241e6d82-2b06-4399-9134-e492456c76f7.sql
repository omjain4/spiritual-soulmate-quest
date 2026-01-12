-- Create notifications table for real-time notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'super_like', 'match', 'message')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  from_user_id UUID,
  conversation_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to auto-create notification on like
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  liker_name TEXT;
  liker_photo TEXT;
BEGIN
  -- Get liker's name
  SELECT name, (photos)[1] INTO liker_name, liker_photo 
  FROM profiles 
  WHERE user_id = NEW.from_user_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, description, from_user_id)
  VALUES (
    NEW.to_user_id,
    CASE WHEN NEW.is_super_like THEN 'super_like' ELSE 'like' END,
    CASE WHEN NEW.is_super_like THEN 'Super Like! ⭐' ELSE 'New Like! 💕' END,
    COALESCE(liker_name, 'Someone') || ' liked your profile',
    NEW.from_user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for like notifications
CREATE TRIGGER on_like_create_notification
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.create_like_notification();

-- Create function to auto-create notification on match
CREATE OR REPLACE FUNCTION public.create_match_notification()
RETURNS TRIGGER AS $$
DECLARE
  user1_name TEXT;
  user2_name TEXT;
BEGIN
  -- Get names
  SELECT name INTO user1_name FROM profiles WHERE user_id = NEW.user1_id;
  SELECT name INTO user2_name FROM profiles WHERE user_id = NEW.user2_id;
  
  -- Notify both users
  INSERT INTO notifications (user_id, type, title, description, from_user_id)
  VALUES 
    (NEW.user1_id, 'match', 'It''s a Match! 💕', 'You matched with ' || COALESCE(user2_name, 'someone'), NEW.user2_id),
    (NEW.user2_id, 'match', 'It''s a Match! 💕', 'You matched with ' || COALESCE(user1_name, 'someone'), NEW.user1_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for match notifications
CREATE TRIGGER on_match_create_notification
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.create_match_notification();

-- Create function to auto-create notification on message
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  recipient_id UUID;
  conv RECORD;
BEGIN
  -- Get conversation details
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;
  
  -- Determine recipient
  recipient_id := CASE 
    WHEN conv.participant1_id = NEW.sender_id THEN conv.participant2_id
    ELSE conv.participant1_id
  END;
  
  -- Get sender name
  SELECT name INTO sender_name FROM profiles WHERE user_id = NEW.sender_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, description, from_user_id, conversation_id)
  VALUES (
    recipient_id,
    'message',
    'New Message 💬',
    COALESCE(sender_name, 'Someone') || ': ' || COALESCE(LEFT(NEW.content, 50), 'Sent media'),
    NEW.sender_id,
    NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for message notifications
CREATE TRIGGER on_message_create_notification
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.create_message_notification();

-- Add unique constraint for typing indicators
ALTER TABLE public.typing_indicators 
ADD CONSTRAINT typing_indicators_unique UNIQUE (conversation_id, user_id);

-- Add UPDATE policy for conversations (to update last_message_at)
CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Add UPDATE policy for messages (to mark as read)
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.id = messages.conversation_id 
  AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
));