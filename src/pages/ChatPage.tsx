import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Smile, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import MediaUploadButton from "@/components/MediaUploadButton";
import VideoCallModal from "@/components/VideoCallModal";
import { useChat } from "@/hooks/useChat";
import { useVideoCall } from "@/hooks/useVideoCall";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

// Mock data for demo when not authenticated
const mockMatches = [
  { id: "1", name: "Priya Shah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", lastMessage: "Would love to visit Palit...", time: "2m", unread: 2, online: true },
  { id: "2", name: "Ananya Jain", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", lastMessage: "That sounds wonderful 🙏", time: "1h", unread: 0, online: false },
  { id: "3", name: "Kavya Mehta", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop", lastMessage: "My family would love to mee...", time: "3h", unread: 0, online: true },
];

const mockMessages = [
  { id: "1", sender: "them", text: "Namaste! 🙏 I saw we have a 92% match!", time: "10:30 AM" },
  { id: "2", sender: "me", text: "Namaste! Yes, I noticed that too. Your profile is wonderful!", time: "10:32 AM" },
  { id: "3", sender: "them", text: "Thank you! I loved your answer about Palitana being your favorite tirth", time: "10:33 AM" },
  { id: "4", sender: "me", text: "It's truly a spiritual experience. Have you been there?", time: "10:35 AM" },
  { id: "5", sender: "them", text: "Yes! Multiple times with family. Would love to visit Palitana together!", time: "10:36 AM" },
];

const ChatPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");
  
  const {
    conversations,
    messages: realMessages,
    activeConversationId,
    setActiveConversationId,
    isTyping,
    isLoading,
    sendMessage,
    uploadMedia,
    setTypingStatus,
    getOrCreateConversation,
    refreshConversations,
  } = useChat();

  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [localMessages, setLocalMessages] = useState(mockMessages);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<{
    id: string;
    name: string;
    avatar_url: string | null;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const hasCreatedConversation = useRef(false);

  // For demo mode when not authenticated
  const [selectedMockMatch, setSelectedMockMatch] = useState(mockMatches[0]);

  // Get active conversation for video call
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const otherUserId = activeConversation?.other_user?.id || otherUserProfile?.id || null;

  // Video call hook
  const {
    callState,
    currentCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isAudioOnly,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useVideoCall(activeConversationId, otherUserId);

  // If a call comes in while no chat (or a different chat) is selected, jump to that conversation
  useEffect(() => {
    const syncIncomingCall = async () => {
      if (!isAuthenticated || !currentCall || callState !== "ringing") return;

      if (currentCall.conversation_id && activeConversationId !== currentCall.conversation_id) {
        setActiveConversationId(currentCall.conversation_id);
        await refreshConversations();
      }

      const callerId = currentCall.caller_id;
      if (callerId && callerId !== user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .eq("user_id", callerId)
          .maybeSingle();

        if (profile) {
          setOtherUserProfile({
            id: profile.user_id,
            name: profile.name,
            avatar_url: profile.avatar_url,
          });
        }
      }
    };

    void syncIncomingCall();
  }, [
    isAuthenticated,
    currentCall,
    callState,
    activeConversationId,
    setActiveConversationId,
    refreshConversations,
    user?.id,
  ]);

  // Auto-create conversation when navigating with userId
  useEffect(() => {
    const initConversation = async () => {
      if (!isAuthenticated || !targetUserId || !user || hasCreatedConversation.current) return;
      
      // Don't start a conversation with yourself
      if (targetUserId === user.id) return;
      
      hasCreatedConversation.current = true;
      setIsCreatingConversation(true);

      try {
        // Fetch the other user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .eq("user_id", targetUserId)
          .maybeSingle();

        if (profile) {
          setOtherUserProfile({
            id: profile.user_id,
            name: profile.name,
            avatar_url: profile.avatar_url,
          });
        }

        // Get or create conversation
        const conversationId = await getOrCreateConversation(targetUserId);
        if (conversationId) {
          setActiveConversationId(conversationId);
          await refreshConversations();
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
      } finally {
        setIsCreatingConversation(false);
      }
    };

    initConversation();
  }, [isAuthenticated, targetUserId, user, getOrCreateConversation, setActiveConversationId, refreshConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realMessages, localMessages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!activeConversationId) return;

    setTypingStatus(activeConversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(activeConversationId, false);
    }, 2000);
  }, [activeConversationId, setTypingStatus]);

  const handleSend = async () => {
    if (!message.trim()) return;

    if (isAuthenticated && activeConversationId) {
      const success = await sendMessage(activeConversationId, message);
      if (success) {
        setMessage("");
        setTypingStatus(activeConversationId, false);
      }
    } else {
      // Demo mode
      const newMessage = {
        id: Date.now().toString(),
        sender: "me" as const,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setLocalMessages([...localMessages, newMessage]);
      setMessage("");
    }
  };

  const handleMediaUpload = async (file: File) => {
    if (!isAuthenticated || !activeConversationId) return;

    setIsUploading(true);
    try {
      const mediaUrl = await uploadMedia(file);
      if (mediaUrl) {
        const mediaType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
          ? "audio"
          : "file";

        await sendMessage(activeConversationId, "", mediaUrl, mediaType);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const otherUserTyping = activeConversation?.other_user?.id
    ? isTyping[activeConversation.other_user.id]
    : false;

  const showChatView = isAuthenticated
    ? activeConversationId !== null || isCreatingConversation
    : selectedMockMatch !== null;

  const displayMessages = isAuthenticated ? realMessages : localMessages;

  // Get display info for the active chat
  const displayUser = activeConversation?.other_user || otherUserProfile;
  const displayName = displayUser?.name || "User";
  const displayAvatar = displayUser?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={callState !== "idle"}
        callState={callState}
        otherUserName={displayName}
        otherUserAvatar={displayAvatar}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isAudioOnly={isAudioOnly}
        onAnswer={answerCall}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
      />

      {/* Main container matching navbar max-width */}
      <div className="mx-auto flex max-w-6xl px-6 pt-20 md:pt-24 lg:px-12">
        {/* Match List - Desktop Sidebar / Mobile Full Screen */}
        <div
          className={`flex-shrink-0 border-r border-border bg-card md:w-72 ${
            showChatView ? "hidden md:block" : "block w-full"
          }`}
        >
          <div className="p-6">
            <h2 className="font-serif text-2xl font-light text-foreground">Messages</h2>
            <div className="mt-6 space-y-1">
              {isLoading && isAuthenticated ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              ) : isAuthenticated && conversations.length > 0 ? (
                // Real conversations
                conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                      activeConversationId === conv.id
                        ? "bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 overflow-hidden rounded-full">
                        <img
                          src={
                            conv.other_user?.avatar_url ||
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                          }
                          alt={conv.other_user?.name || "User"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {conv.other_user?.name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conv.last_message_at
                            ? new Date(conv.last_message_at).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {conv.last_message?.content || "Start a conversation"}
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : isAuthenticated && conversations.length === 0 && !isCreatingConversation ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Match with someone to start chatting
                  </p>
                </div>
              ) : !isAuthenticated ? (
                // Mock data for demo
                mockMatches.map((match) => (
                  <motion.button
                    key={match.id}
                    onClick={() => setSelectedMockMatch(match)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                      selectedMockMatch?.id === match.id
                        ? "bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 overflow-hidden rounded-full">
                        <img
                          src={match.avatar}
                          alt={match.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {match.online && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{match.name}</span>
                        <span className="text-xs text-muted-foreground">{match.time}</span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {match.lastMessage}
                      </p>
                    </div>
                    {match.unread > 0 && (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {match.unread}
                      </span>
                    )}
                  </motion.button>
                ))
              ) : null}
            </div>
          </div>
        </div>

        {/* Chat View */}
        <div
          className={`flex min-h-[calc(100vh-5rem)] flex-1 flex-col md:min-h-[calc(100vh-6rem)] ${
            !showChatView ? "hidden md:flex" : "flex"
          }`}
        >
          {isCreatingConversation ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Starting conversation...</p>
              </div>
            </div>
          ) : showChatView ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        setActiveConversationId(null);
                      } else {
                        setSelectedMockMatch(null as any);
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-11 w-11 overflow-hidden rounded-full">
                    <img
                      src={isAuthenticated ? displayAvatar : selectedMockMatch?.avatar}
                      alt={isAuthenticated ? displayName : selectedMockMatch?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {isAuthenticated ? displayName : selectedMockMatch?.name}
                    </p>
                    {otherUserTyping ? (
                      <p className="text-sm text-primary">Typing...</p>
                    ) : (
                      <p className="text-sm text-green-500">
                        {isAuthenticated ? "Online" : selectedMockMatch?.online ? "Online" : "Last seen recently"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCall(true)}
                    disabled={!isAuthenticated || !activeConversationId || callState !== "idle"}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Audio call"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => startCall(false)}
                    disabled={!isAuthenticated || !activeConversationId || callState !== "idle"}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Video call"
                  >
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
                <div className="space-y-4">
                  {isAuthenticated
                    ? realMessages.map((msg) => (
                        <ChatMessage
                          key={msg.id}
                          content={msg.content}
                          mediaUrl={msg.media_url}
                          mediaType={msg.media_type}
                          isOwn={msg.sender_id === user?.id}
                          isRead={msg.is_read}
                          createdAt={msg.created_at}
                        />
                      ))
                    : localMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            msg.sender === "me" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.sender === "me"
                                ? "bg-foreground text-background"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <div
                              className={`mt-1.5 flex items-center justify-end gap-1 text-xs ${
                                msg.sender === "me"
                                  ? "text-background/60"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span>{msg.time}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {otherUserTyping && (
                      <TypingIndicator
                        name={activeConversation?.other_user?.name}
                      />
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  {isAuthenticated && (
                    <MediaUploadButton
                      onUpload={handleMediaUpload}
                      isUploading={isUploading}
                    />
                  )}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="w-full rounded-full border border-border bg-muted/30 px-5 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <motion.button
                    onClick={handleSend}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Send className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-serif text-2xl font-light">Select a conversation</h3>
              <p className="mt-2 text-muted-foreground">
                Choose from your matches to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
