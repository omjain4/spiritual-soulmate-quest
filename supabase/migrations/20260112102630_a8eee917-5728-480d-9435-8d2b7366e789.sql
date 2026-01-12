-- Ensure realtime is enabled for call signaling table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_object THEN
    -- publication may not exist in some setups; ignore and rely on default realtime config
    NULL;
END$$;