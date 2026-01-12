-- Add call_type column to video_calls table to distinguish audio/video calls
ALTER TABLE public.video_calls ADD COLUMN IF NOT EXISTS call_type text DEFAULT 'video';

-- Add call_history table for tracking call history with missed/answered status
CREATE TABLE IF NOT EXISTS public.call_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id uuid NOT NULL REFERENCES public.video_calls(id) ON DELETE CASCADE,
  caller_id uuid NOT NULL,
  callee_id uuid NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  call_type text NOT NULL DEFAULT 'video',
  status text NOT NULL, -- 'answered', 'missed', 'rejected'
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  duration_seconds integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for call_history
CREATE POLICY "Users can view their own call history" 
ON public.call_history 
FOR SELECT 
USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "System can insert call history" 
ON public.call_history 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for call_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_history;