import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { messageSchema } from "@/lib/validations";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  last_message?: Message;
}

interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    // Fetch other user profiles for each conversation
    const conversationsWithProfiles = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId = conv.participant1_id === user.id 
          ? conv.participant2_id 
          : conv.participant1_id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .eq("user_id", otherUserId)
          .maybeSingle();

        // Get last message
        const { data: lastMessageData } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...conv,
          other_user: profile ? {
            id: profile.user_id,
            name: profile.name,
            avatar_url: profile.avatar_url,
          } : undefined,
          last_message: lastMessageData || undefined,
        };
      })
    );

    setConversations(conversationsWithProfiles);
    setIsLoading(false);
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      const sanitizedError = String(error?.message || error).replace(/[\r\n]/g, '');
      console.error("Error fetching messages:", sanitizedError);
      return;
    }

    setMessages(data || []);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: string
  ) => {
    if (!user) return false;

    // Validate message data
    const validationResult = messageSchema.safeParse({
      content: content || null,
      media_url: mediaUrl || null,
      media_type: mediaType || null,
    });

    if (!validationResult.success) {
      console.error("Message validation failed:", validationResult.error.errors);
      return false;
    }

    const validatedData = validationResult.data;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: validatedData.content,
      media_url: validatedData.media_url,
      media_type: validatedData.media_type,
    });

    if (error) {
      const sanitizedError = String(error?.message || error).replace(/[\r\n]/g, '');
      console.error("Error sending message:", sanitizedError);
      return false;
    }

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
    return true;
  }, [user]);

  // Upload media
  const uploadMedia = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(fileName, file);

    if (uploadError) {
      const sanitizedError = String(uploadError?.message || uploadError).replace(/[\r\n]/g, '');
      console.error("Error uploading media:", sanitizedError);
      return null;
    }

    // Use signed URL for private bucket (1 hour expiry)
    const { data, error } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(fileName, 3600);

    if (error) {
      const sanitizedError = String(error?.message || error).replace(/[\r\n]/g, '');
      console.error("Error creating signed URL:", sanitizedError);
      return null;
    }

    return data.signedUrl;
  }, [user]);

  // Set typing indicator
  const setTypingStatus = useCallback(async (conversationId: string, typing: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("typing_indicators")
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        is_typing: typing,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "conversation_id,user_id",
      });

    if (error) {
      const sanitizedError = String(error?.message || error).replace(/[\r\n]/g, '');
      console.error("Error setting typing status:", sanitizedError);
    }
  }, [user]);

  // Create or get conversation
  const getOrCreateConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) return existing.id;

    // Create new conversation
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        participant1_id: user.id,
        participant2_id: otherUserId,
      })
      .select("id")
      .single();

    if (error) {
      const sanitizedError = String(error?.message || error).replace(/[\r\n]/g, '');
      console.error("Error creating conversation:", sanitizedError);
      return null;
    }

    return data.id;
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Add to messages if in active conversation
          if (newMessage.conversation_id === activeConversationId) {
            setMessages((prev) => [...prev, newMessage]);
          }
          
          // Refresh conversations to update last message
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel("typing-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
        },
        (payload) => {
          const indicator = payload.new as TypingIndicator;
          if (indicator.user_id !== user.id) {
            setIsTyping((prev) => ({
              ...prev,
              [indicator.user_id]: indicator.is_typing,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [user, activeConversationId, fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, fetchMessages, markAsRead]);

  return {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    isTyping,
    isLoading,
    sendMessage,
    uploadMedia,
    setTypingStatus,
    getOrCreateConversation,
    markAsRead,
    refreshConversations: fetchConversations,
  };
};
