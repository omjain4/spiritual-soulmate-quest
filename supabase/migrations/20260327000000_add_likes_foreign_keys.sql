-- Add missing foreign key constraints to likes table
ALTER TABLE public.likes
  ADD CONSTRAINT likes_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT likes_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add missing foreign key constraints to other tables that reference auth.users
ALTER TABLE public.preferences
  ADD CONSTRAINT preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT matches_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.saved_profiles
  ADD CONSTRAINT saved_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT saved_profiles_saved_user_id_fkey FOREIGN KEY (saved_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.skipped_profiles
  ADD CONSTRAINT skipped_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT skipped_profiles_skipped_user_id_fkey FOREIGN KEY (skipped_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
