-- Create video call signaling table
CREATE TABLE public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  callee_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'ringing', 'accepted', 'rejected', 'ended', 'missed')),
  offer JSONB,
  answer JSONB,
  ice_candidates JSONB[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own calls"
ON public.video_calls
FOR SELECT
USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can create calls"
ON public.video_calls
FOR INSERT
WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their own calls"
ON public.video_calls
FOR UPDATE
USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Enable realtime for video calls
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;