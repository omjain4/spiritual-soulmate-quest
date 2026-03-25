import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  profile_id: string;
  user_id: string;
  name: string;
  date_of_birth: string | null;
  gender: string | null;
  location: string | null;
  photos: string[] | null;
  sect: string | null;
  dietary_preference: string | null;
  interests: string[] | null;
  bio: string | null;
  occupation: string | null;
  education: string | null;
  jain_rating: number;
  is_verified: boolean;
  prompts: { question: string; answer: string }[];
  match_score: number;
}

export interface Preferences {
  min_age: number;
  max_age: number;
  preferred_gender: string | null;
  preferred_locations: string[];
  preferred_sects: string[];
  preferred_dietary: string[];
  preferred_communities: string[];
  gotra: string | null;
  exclude_gotra: boolean;
}

export const useProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchRecommendedProfiles = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_recommended_profiles', {
        current_user_id: user.id,
        limit_count: 20
      });

      if (error) throw error;

      const formattedProfiles: Profile[] = (data || []).map((p: any) => ({
        ...p,
        prompts: Array.isArray(p.prompts) ? p.prompts : []
      }));

      setProfiles(formattedProfiles);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecommendedProfiles();
  }, [fetchRecommendedProfiles]);

  const likeProfile = async (targetUserId: string, message?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('likes')
        .insert({ from_user_id: user.id, to_user_id: targetUserId });

      if (error) throw error;

      if (message) {
        let convId;
        const { data: existing } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${targetUserId}),and(participant1_id.eq.${targetUserId},participant2_id.eq.${user.id})`)
          .maybeSingle();

        if (existing) {
          convId = existing.id;
        } else {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({ participant1_id: user.id, participant2_id: targetUserId })
            .select("id")
            .single();
          if (newConv) convId = newConv.id;
        }

        if (convId) {
          await supabase.from("messages").insert({
            conversation_id: convId,
            sender_id: user.id,
            content: message
          });
          await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", convId);
        }
      }

      // Check if it's a match
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (matchData) {
        toast({
          title: "It's a match! 💕",
          description: "You both liked each other. Start a conversation!",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error liking profile:', error);
      return false;
    }
  };

  const skipProfile = async (targetUserId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('skipped_profiles')
        .insert({ user_id: user.id, skipped_user_id: targetUserId });
    } catch (error) {
      console.error('Error skipping profile:', error);
    }
  };

  const saveProfile = async (targetUserId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_profiles')
        .insert({ user_id: user.id, saved_user_id: targetUserId });

      if (error && error.code !== '23505') throw error;

      toast({
        title: "Profile saved! 🔖",
        description: "You can find this profile in your saved list.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const unsaveProfile = async (targetUserId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', user.id)
        .eq('saved_user_id', targetUserId);
    } catch (error) {
      console.error('Error unsaving profile:', error);
    }
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousProfile = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentProfile = profiles[currentIndex] || null;

  return {
    profiles,
    currentProfile,
    currentIndex,
    loading,
    likeProfile,
    skipProfile,
    saveProfile,
    unsaveProfile,
    nextProfile,
    previousProfile,
    refetch: fetchRecommendedProfiles,
    hasMore: currentIndex < profiles.length - 1,
    isEmpty: !loading && profiles.length === 0
  };
};

export const useLikes = () => {
  const { user } = useAuth();
  const [receivedLikes, setReceivedLikes] = useState<any[]>([]);
  const [sentLikes, setSentLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch received likes
      const { data: received } = await supabase
        .from('likes')
        .select('id, from_user_id, is_super_like, created_at')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch sent likes  
      const { data: sent } = await supabase
        .from('likes')
        .select('id, to_user_id, is_super_like, created_at')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false });

      // Get unique user IDs to fetch profiles
      const fromUserIds = (received || []).map(l => l.from_user_id);
      const toUserIds = (sent || []).map(l => l.to_user_id);
      const allUserIds = [...new Set([...fromUserIds, ...toUserIds])];

      // Fetch all profiles at once
      let profilesMap: Record<string, any> = {};
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, photos, location, jain_rating, date_of_birth')
          .in('user_id', allUserIds);

        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as Record<string, any>);
      }

      // Map profiles to likes
      const receivedWithProfiles = (received || []).map(like => ({
        ...like,
        profiles: profilesMap[like.from_user_id] || null
      }));

      const sentWithProfiles = (sent || []).map(like => ({
        ...like,
        profiles: profilesMap[like.to_user_id] || null
      }));

      setReceivedLikes(receivedWithProfiles);
      setSentLikes(sentWithProfiles);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  return { receivedLikes, sentLikes, loading, refetch: fetchLikes };
};

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('matched_at', { ascending: false });

      if (data) {
        // Fetch profile details for each match
        const matchedUserIds = data.map(m =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', matchedUserIds);

        const matchesWithProfiles = data.map(match => {
          const matchedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const profile = profiles?.find(p => p.user_id === matchedUserId);
          return { ...match, profile };
        });

        setMatches(matchesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, refetch: fetchMatches };
};

export const usePreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = async (prefs: Partial<Preferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          ...prefs
        });

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...prefs } : prefs as Preferences);
      toast({
        title: "Preferences saved!",
        description: "Your matching preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
    }
  };

  return { preferences, loading, savePreferences, refetch: fetchPreferences };
};
