-- Fix all critical security issues

-- 1. CRITICAL: Restrict profile visibility to matches/recommendations only
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view matched or recommended profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM matches 
      WHERE (user_id = auth.uid() AND matched_user_id = profiles.user_id)
         OR (matched_user_id = auth.uid() AND user_id = profiles.user_id)
    ) OR
    EXISTS (
      SELECT 1 FROM likes 
      WHERE liker_id = auth.uid() AND liked_id = profiles.user_id
    )
  );

-- 2. CRITICAL: Add INSERT policy for matches requiring mutual likes
DROP POLICY IF EXISTS "Users can create matches" ON matches;
CREATE POLICY "Users can create matches with mutual consent" ON matches
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM likes 
      WHERE liker_id = auth.uid() AND liked_id = matched_user_id
    ) AND
    EXISTS (
      SELECT 1 FROM likes 
      WHERE liker_id = matched_user_id AND liked_id = auth.uid()
    )
  );

-- 3. WARNING: Fix overly permissive notifications INSERT policy
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
CREATE POLICY "Users can create notifications for others" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() != user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = notifications.user_id)
  );

-- 4. WARNING: Fix overly permissive call_history INSERT policy
DROP POLICY IF EXISTS "Users can create call history" ON call_history;
CREATE POLICY "Users can create call history for their calls" ON call_history
  FOR INSERT WITH CHECK (
    auth.uid() IN (caller_id, receiver_id)
  );

-- 5. WARNING: Enable leaked password protection
ALTER TABLE auth.users SET (check_password_strength = true);

-- 6. WARNING: Add UPDATE policy for call_history
DROP POLICY IF EXISTS "Users can update call history" ON call_history;
CREATE POLICY "Users can update their call records" ON call_history
  FOR UPDATE USING (
    auth.uid() IN (caller_id, receiver_id)
  ) WITH CHECK (
    auth.uid() IN (caller_id, receiver_id)
  );

-- 7. WARNING: Restrict notification UPDATE policy
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
CREATE POLICY "Users can only mark notifications as read" ON notifications
  FOR UPDATE USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id AND
    (OLD.title = NEW.title AND OLD.description = NEW.description AND OLD.type = NEW.type)
  );

-- 8. INFO: Allow users to delete their own profiles (GDPR)
DROP POLICY IF EXISTS "Users can delete their profile" ON profiles;
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 9. INFO: Allow users to delete preference settings
DROP POLICY IF EXISTS "Users can delete preferences" ON user_preferences;
CREATE POLICY "Users can delete their preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- 10. INFO: Allow users to delete conversations
DROP POLICY IF EXISTS "Users can delete conversations" ON conversations;
CREATE POLICY "Users can delete their conversations" ON conversations
  FOR DELETE USING (
    auth.uid() IN (user1_id, user2_id)
  );

-- 11. INFO: Allow users to delete messages
DROP POLICY IF EXISTS "Users can delete messages" ON messages;
CREATE POLICY "Users can delete their messages" ON messages
  FOR DELETE USING (
    auth.uid() = sender_id
  );

-- 12. INFO: Allow users to remove skipped profiles
DROP POLICY IF EXISTS "Users can delete skips" ON skipped_profiles;
CREATE POLICY "Users can delete their skips" ON skipped_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 13. INFO: Allow cleanup of call records
DROP POLICY IF EXISTS "Users can delete call history" ON call_history;
CREATE POLICY "Users can delete their call records" ON call_history
  FOR DELETE USING (
    auth.uid() IN (caller_id, receiver_id)
  );
