-- Enable password checks for leaked passwords
-- This is done through auth config, not SQL migration
-- Adding comment for documentation purposes

-- Note: Leaked password protection needs to be enabled through Supabase Auth settings
-- This migration adds additional password security by storing password updated timestamp

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP WITH TIME ZONE;