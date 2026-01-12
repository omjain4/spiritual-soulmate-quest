import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface IncomingCall {
  id: string;
  caller_id: string;
  callee_id: string;
  conversation_id: string;
  call_type: string;
  status: string;
  caller_name?: string;
  caller_avatar?: string;
}

const GlobalCallNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`global-calls-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "video_calls",
          filter: `callee_id=eq.${user.id}`,
        },
        async (payload) => {
          const call = payload.new as any;
          
          if (call.status === "ringing") {
            // Fetch caller profile
            const { data: callerProfile } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("user_id", call.caller_id)
              .single();

            setIncomingCall({
              ...call,
              caller_name: callerProfile?.name,
              caller_avatar: callerProfile?.avatar_url,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "video_calls",
          filter: `callee_id=eq.${user.id}`,
        },
        (payload) => {
          const call = payload.new as any;
          
          // Clear notification if call is no longer ringing
          if (call.status !== "ringing") {
            setIncomingCall(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAnswer = async () => {
    if (!incomingCall) return;
    
    // Navigate to chat page with the conversation
    navigate(`/chat?userId=${incomingCall.caller_id}`);
    setIncomingCall(null);
  };

  const handleReject = async () => {
    if (!incomingCall) return;

    await supabase
      .from("video_calls")
      .update({ status: "rejected" })
      .eq("id", incomingCall.id);

    setIncomingCall(null);
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform"
        >
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <img
                  src={incomingCall.caller_avatar || "/placeholder.svg"}
                  alt={incomingCall.caller_name || "Caller"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {incomingCall.caller_name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Incoming {incomingCall.call_type || "video"} call
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                onClick={handleReject}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={handleAnswer}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {incomingCall.call_type === "audio" ? (
                  <Phone className="h-5 w-5" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalCallNotification;