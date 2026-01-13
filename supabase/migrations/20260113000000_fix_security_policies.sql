-- Fix critical security issues in profiles and matches tables

-- 1. Fix profiles table - restrict public access to sensitive data
-- Drop the insecure policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure policy: only authenticated users can view profiles
-- This prevents unauthenticated access to sensitive personal information
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Add DELETE policy for matches table to allow users to unmatch
-- This is critical for user safety - users must be able to remove unwanted matches
CREATE POLICY "Users can delete own matches" ON public.matches
  FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);
