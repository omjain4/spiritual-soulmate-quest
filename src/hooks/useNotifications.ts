import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  type: "like" | "super_like" | "match" | "message";
  title: string;
  description: string;
  from_user_id: string | null;
  conversation_id: string | null;
  is_read: boolean;
  created_at: string;
  from_user?: {
    name: string;
    photos: string[] | null;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch from_user profiles
      const fromUserIds = (data || [])
        .filter((n) => n.from_user_id)
        .map((n) => n.from_user_id);

      let profilesMap: Record<string, { name: string; photos: string[] | null }> = {};

      if (fromUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, photos")
          .in("user_id", fromUserIds);

        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = { name: p.name, photos: p.photos };
          return acc;
        }, {} as Record<string, { name: string; photos: string[] | null }>);
      }

      const notificationsWithProfiles: Notification[] = (data || []).map((n) => ({
        ...n,
        type: n.type as "like" | "super_like" | "match" | "message",
        from_user: n.from_user_id ? profilesMap[n.from_user_id] : undefined,
      }));

      setNotifications(notificationsWithProfiles);
      setUnreadCount(notificationsWithProfiles.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const raw = payload.new as any;
          const newNotification: Notification = {
            ...raw,
            type: raw.type as "like" | "super_like" | "match" | "message",
          };

          // Fetch from_user profile
          if (newNotification.from_user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name, photos")
              .eq("user_id", newNotification.from_user_id)
              .maybeSingle();

            if (profile) {
              newNotification.from_user = profile;
            }
          }

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user) return;

      await supabase.from("notifications").delete().eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    },
    [user]
  );

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
