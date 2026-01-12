import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CallHistoryEntry {
  id: string;
  call_id: string;
  caller_id: string;
  callee_id: string;
  conversation_id: string;
  call_type: "audio" | "video";
  status: "answered" | "missed" | "rejected";
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  created_at: string;
  // Joined profile data
  other_user?: {
    id: string;
    name: string;
    avatar_url: string | null;
    photos: string[] | null;
  };
  is_outgoing: boolean;
}

export const useCallHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: callHistory = [], isLoading, error } = useQuery({
    queryKey: ["call-history", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("call_history")
        .select("*")
        .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profiles for all users in call history
      const userIds = new Set<string>();
      data.forEach((call) => {
        if (call.caller_id !== user.id) userIds.add(call.caller_id);
        if (call.callee_id !== user.id) userIds.add(call.callee_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, photos")
        .in("user_id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

      return data.map((call): CallHistoryEntry => {
        const isOutgoing = call.caller_id === user.id;
        const otherUserId = isOutgoing ? call.callee_id : call.caller_id;
        const otherProfile = profileMap.get(otherUserId);

        return {
          id: call.id,
          call_id: call.call_id,
          caller_id: call.caller_id,
          callee_id: call.callee_id,
          conversation_id: call.conversation_id,
          call_type: call.call_type as "audio" | "video",
          status: call.status as "answered" | "missed" | "rejected",
          started_at: call.started_at,
          ended_at: call.ended_at,
          duration_seconds: call.duration_seconds || 0,
          created_at: call.created_at,
          is_outgoing: isOutgoing,
          other_user: otherProfile
            ? {
                id: otherProfile.user_id,
                name: otherProfile.name,
                avatar_url: otherProfile.avatar_url,
                photos: otherProfile.photos,
              }
            : undefined,
        };
      });
    },
    enabled: !!user,
    staleTime: 30000,
  });

  const addToHistory = useMutation({
    mutationFn: async (entry: {
      call_id: string;
      caller_id: string;
      callee_id: string;
      conversation_id: string;
      call_type: string;
      status: string;
      started_at?: string | null;
      ended_at?: string | null;
      duration_seconds?: number;
    }) => {
      const { error } = await supabase.from("call_history").insert(entry);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-history"] });
    },
  });

  return {
    callHistory,
    isLoading,
    error,
    addToHistory: addToHistory.mutate,
  };
};
