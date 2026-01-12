-- Create preferences table for user matching preferences
CREATE TABLE public.preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 50,
  preferred_gender TEXT,
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_sects TEXT[] DEFAULT '{}',
  preferred_dietary TEXT[] DEFAULT '{}',
  preferred_communities TEXT[] DEFAULT '{}',
  gotra TEXT,
  exclude_gotra BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table to track who liked whom
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  is_super_like BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- Create matches table when two users like each other
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create saved_profiles table for bookmarked profiles
CREATE TABLE public.saved_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  saved_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, saved_user_id)
);

-- Create skipped_profiles table to not show skipped profiles again
CREATE TABLE public.skipped_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skipped_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skipped_user_id)
);

-- Add more profile fields for better matching
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS sect TEXT,
  ADD COLUMN IF NOT EXISTS gotra TEXT,
  ADD COLUMN IF NOT EXISTS chauvihar_level TEXT DEFAULT 'sometimes',
  ADD COLUMN IF NOT EXISTS temple_frequency TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS jain_rating INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prompts JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS main_photo_index INTEGER DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skipped_profiles ENABLE ROW LEVEL SECURITY;

-- Preferences policies
CREATE POLICY "Users can view own preferences" ON public.preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view likes they received" ON public.likes
  FOR SELECT USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

CREATE POLICY "Users can create likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can delete own likes" ON public.likes
  FOR DELETE USING (auth.uid() = from_user_id);

-- Matches policies
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Saved profiles policies
CREATE POLICY "Users can view saved profiles" ON public.saved_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save profiles" ON public.saved_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave profiles" ON public.saved_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Skipped profiles policies
CREATE POLICY "Users can view skipped profiles" ON public.skipped_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can skip profiles" ON public.skipped_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to calculate match score between two users
CREATE OR REPLACE FUNCTION public.calculate_match_score(
  viewer_id UUID,
  target_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_profile profiles%ROWTYPE;
  target_profile profiles%ROWTYPE;
  viewer_prefs preferences%ROWTYPE;
  score INTEGER := 50;
  target_age INTEGER;
BEGIN
  -- Get profiles
  SELECT * INTO viewer_profile FROM profiles WHERE user_id = viewer_id;
  SELECT * INTO target_profile FROM profiles WHERE user_id = target_id;
  SELECT * INTO viewer_prefs FROM preferences WHERE user_id = viewer_id;
  
  IF viewer_profile IS NULL OR target_profile IS NULL THEN
    RETURN 50;
  END IF;
  
  -- Calculate age
  IF target_profile.date_of_birth IS NOT NULL THEN
    target_age := EXTRACT(YEAR FROM age(target_profile.date_of_birth::date));
    
    -- Age preference match (+15 points)
    IF viewer_prefs IS NOT NULL AND target_age >= COALESCE(viewer_prefs.min_age, 18) 
       AND target_age <= COALESCE(viewer_prefs.max_age, 50) THEN
      score := score + 15;
    END IF;
  END IF;
  
  -- Location match (+10 points)
  IF viewer_profile.location IS NOT NULL AND target_profile.location IS NOT NULL 
     AND viewer_profile.location = target_profile.location THEN
    score := score + 10;
  END IF;
  
  -- Sect match (+15 points)
  IF viewer_profile.sect IS NOT NULL AND target_profile.sect IS NOT NULL 
     AND viewer_profile.sect = target_profile.sect THEN
    score := score + 15;
  END IF;
  
  -- Dietary preference match (+10 points)
  IF viewer_profile.dietary_preference IS NOT NULL AND target_profile.dietary_preference IS NOT NULL 
     AND viewer_profile.dietary_preference = target_profile.dietary_preference THEN
    score := score + 10;
  END IF;
  
  -- Shared interests (up to +20 points)
  IF viewer_profile.interests IS NOT NULL AND target_profile.interests IS NOT NULL THEN
    score := score + LEAST(20, (
      SELECT COUNT(*) * 5 
      FROM unnest(viewer_profile.interests) vi 
      WHERE vi = ANY(target_profile.interests)
    )::INTEGER);
  END IF;
  
  -- Gotra exclusion check (-50 if same gotra and exclusion enabled)
  IF viewer_prefs IS NOT NULL AND viewer_prefs.exclude_gotra 
     AND viewer_profile.gotra IS NOT NULL AND target_profile.gotra IS NOT NULL 
     AND viewer_profile.gotra = target_profile.gotra THEN
    score := score - 50;
  END IF;
  
  -- Verified profile bonus (+5)
  IF target_profile.is_verified THEN
    score := score + 5;
  END IF;
  
  -- Jain rating similarity bonus (up to +10)
  IF viewer_profile.jain_rating IS NOT NULL AND target_profile.jain_rating IS NOT NULL THEN
    score := score + (10 - ABS(viewer_profile.jain_rating - target_profile.jain_rating) / 10);
  END IF;
  
  RETURN GREATEST(0, LEAST(100, score));
END;
$$;

-- Create function to get recommended profiles with smart scoring
CREATE OR REPLACE FUNCTION public.get_recommended_profiles(
  current_user_id UUID,
  limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
  profile_id UUID,
  user_id UUID,
  name TEXT,
  date_of_birth DATE,
  gender TEXT,
  location TEXT,
  photos TEXT[],
  sect TEXT,
  dietary_preference TEXT,
  interests TEXT[],
  bio TEXT,
  occupation TEXT,
  education TEXT,
  jain_rating INTEGER,
  is_verified BOOLEAN,
  prompts JSONB,
  match_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_gender TEXT;
  preferred_gender TEXT;
BEGIN
  -- Get current user's gender and preferences
  SELECT p.gender INTO current_gender FROM profiles p WHERE p.user_id = current_user_id;
  SELECT pref.preferred_gender INTO preferred_gender FROM preferences pref WHERE pref.user_id = current_user_id;
  
  -- Default opposite gender matching if no preference set
  IF preferred_gender IS NULL THEN
    preferred_gender := CASE 
      WHEN current_gender = 'male' THEN 'female'
      WHEN current_gender = 'female' THEN 'male'
      ELSE NULL
    END;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.user_id,
    p.name,
    p.date_of_birth,
    p.gender,
    p.location,
    p.photos,
    p.sect,
    p.dietary_preference,
    p.interests,
    p.bio,
    p.occupation,
    p.education,
    p.jain_rating,
    p.is_verified,
    p.prompts,
    calculate_match_score(current_user_id, p.user_id) as match_score
  FROM profiles p
  WHERE p.user_id != current_user_id
    AND p.onboarding_completed = true
    AND (preferred_gender IS NULL OR p.gender = preferred_gender)
    -- Exclude already liked profiles
    AND NOT EXISTS (
      SELECT 1 FROM likes l WHERE l.from_user_id = current_user_id AND l.to_user_id = p.user_id
    )
    -- Exclude already skipped profiles
    AND NOT EXISTS (
      SELECT 1 FROM skipped_profiles sp WHERE sp.user_id = current_user_id AND sp.skipped_user_id = p.user_id
    )
    -- Exclude already matched profiles
    AND NOT EXISTS (
      SELECT 1 FROM matches m 
      WHERE (m.user1_id = current_user_id AND m.user2_id = p.user_id)
         OR (m.user2_id = current_user_id AND m.user1_id = p.user_id)
    )
  ORDER BY calculate_match_score(current_user_id, p.user_id) DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Create function to check and create match when mutual like
CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the other user has already liked current user
  IF EXISTS (
    SELECT 1 FROM likes 
    WHERE from_user_id = NEW.to_user_id 
      AND to_user_id = NEW.from_user_id
  ) THEN
    -- Create a match (ensure consistent ordering)
    INSERT INTO matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.from_user_id, NEW.to_user_id),
      GREATEST(NEW.from_user_id, NEW.to_user_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-matching
CREATE TRIGGER on_like_check_match
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_create_match();

-- Add updated_at trigger for preferences
CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();