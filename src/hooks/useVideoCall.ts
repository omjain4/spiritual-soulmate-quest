import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCallRingtone } from "@/hooks/useCallRingtone";

interface VideoCall {
  id: string;
  caller_id: string;
  callee_id: string;
  conversation_id: string;
  status: "pending" | "ringing" | "accepted" | "rejected" | "ended" | "missed";
  call_type?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  ice_candidates?: RTCIceCandidateInit[];
  created_at: string;
  started_at?: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
};

type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";

const coerceCall = (raw: any): VideoCall => ({
  ...raw,
  status: raw.status as VideoCall["status"],
  call_type: raw.call_type as string | undefined,
  offer: raw.offer as RTCSessionDescriptionInit | undefined,
  answer: raw.answer as RTCSessionDescriptionInit | undefined,
  ice_candidates: (raw.ice_candidates as RTCIceCandidateInit[] | null) ?? undefined,
});

const isOfferAudioOnly = (offer?: RTCSessionDescriptionInit) => {
  const sdp = offer?.sdp;
  if (!sdp) return false;
  return !sdp.includes("m=video");
};

const RING_TIMEOUT_MS = 30000; // 30 seconds before marking as missed

export const useVideoCall = (conversationId: string | null, otherUserId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startRingtone, stopRingtone } = useCallRingtone();

  const [callState, setCallState] = useState<CallState>("idle");
  const [currentCall, setCurrentCall] = useState<VideoCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);


  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callIdRef = useRef<string | null>(null);
  const handledIceCountRef = useRef<number>(0);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);


  // Add to call history
  const addToCallHistory = useCallback(async (
    call: VideoCall,
    status: "answered" | "missed" | "rejected",
    durationSeconds: number = 0
  ) => {
    try {
      await supabase.from("call_history").insert({
        call_id: call.id,
        caller_id: call.caller_id,
        callee_id: call.callee_id,
        conversation_id: call.conversation_id,
        call_type: call.call_type || (isOfferAudioOnly(call.offer) ? "audio" : "video"),
        status,
        started_at: call.started_at || null,
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      });
    } catch (error) {
      console.error("Error adding to call history:", error);
    }
  }, []);

  // Create missed call notification
  const createMissedCallNotification = useCallback(async (call: VideoCall) => {
    if (!user || call.callee_id !== user.id) return;

    try {
      // Get caller profile for notification
      const { data: callerProfile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", call.caller_id)
        .single();

      await supabase.from("notifications").insert({
        user_id: call.callee_id,
        from_user_id: call.caller_id,
        conversation_id: call.conversation_id,
        type: "missed_call",
        title: "Missed Call",
        description: `You missed a ${call.call_type || "video"} call from ${callerProfile?.name || "someone"}`,
      });

      // Also show browser notification if tab is in background
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        new Notification("Missed Call", {
          body: `You missed a ${call.call_type || "video"} call from ${callerProfile?.name || "someone"}`,
          icon: "/favicon.ico",
          tag: `missed-call-${call.id}`,
        });
      }
    } catch (error) {
      console.error("Error creating missed call notification:", error);
    }
  }, [user]);

  const cleanup = useCallback(() => {
    stopRingtone();

    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);

    remoteStream?.getTracks().forEach((t) => t.stop());
    setRemoteStream(null);

    setIsMuted(false);
    setIsVideoOff(false);
    setIsAudioOnly(false);

    handledIceCountRef.current = 0;
    callIdRef.current = null;
    callStartTimeRef.current = null;
    setCurrentCall(null);
  }, [localStream, remoteStream, stopRingtone]);

  const startLocalStream = useCallback(
    async (audioOnly: boolean) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: !audioOnly,
          audio: true,
        });
        setLocalStream(stream);
        setIsAudioOnly(audioOnly);
        setIsVideoOff(audioOnly);
        return stream;
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: audioOnly ? "Microphone Error" : "Camera/Microphone Error",
          description: `Unable to access ${audioOnly ? "microphone" : "camera or microphone"}. Please check permissions.`,
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // End a call
  const endCall = useCallback(async () => {
    const callId = callIdRef.current;
    const call = currentCall;

    if (callId) {
      await supabase
        .from("video_calls")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", callId);
    }

    // Calculate duration and add to history
    if (call && callStartTimeRef.current) {
      const durationSeconds = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000);
      await addToCallHistory(call, "answered", durationSeconds);
    }

    cleanup();
    setCallState("ended");
    setTimeout(() => setCallState("idle"), 700);
  }, [cleanup, currentCall, addToCallHistory]);

  const endCallRef = useRef(endCall);
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  const createPeerConnectionBound = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        const [s] = event.streams;
        if (s) setRemoteStream(s);
      };

      pc.onicecandidate = async (event) => {
        const callId = callIdRef.current;
        if (!event.candidate || !callId) return;

        const { data: callData, error: readError } = await supabase
          .from("video_calls")
          .select("ice_candidates")
          .eq("id", callId)
          .maybeSingle();

        if (readError) return;

        const existing = (callData?.ice_candidates as unknown as RTCIceCandidateInit[] | null) ?? [];
        const next = [...existing, event.candidate.toJSON()];

        await supabase
          .from("video_calls")
          .update({ ice_candidates: next as unknown as any[] })
          .eq("id", callId);
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "connected") setCallState("connected");
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          void endCallRef.current();
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    []
  );

  // Start call (caller)
  const startCall = useCallback(
    async (audioOnly: boolean = false) => {
      if (!user || !conversationId || !otherUserId) return;

      const stream = await startLocalStream(audioOnly);
      if (!stream) return;

      setCallState("calling");

      const { data: call, error } = await supabase
        .from("video_calls")
        .insert({
          caller_id: user.id,
          callee_id: otherUserId,
          conversation_id: conversationId,
          status: "ringing",
          call_type: audioOnly ? "audio" : "video",
        })
        .select()
        .single();

      if (error || !call) {
        console.error("Error creating call:", error);
        cleanup();
        setCallState("idle");
        return;
      }

      const typedCall = coerceCall(call);
      callIdRef.current = typedCall.id;
      setCurrentCall(typedCall);

      const pc = createPeerConnectionBound(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await supabase.from("video_calls").update({ offer: offer as unknown as any }).eq("id", typedCall.id);

      // Set timeout for missed call
      ringTimeoutRef.current = setTimeout(async () => {
        if (callState === "calling") {
          await supabase
            .from("video_calls")
            .update({ status: "missed" })
            .eq("id", typedCall.id);
          await addToCallHistory(typedCall, "missed");
          cleanup();
          setCallState("idle");
          toast({
            title: "No answer",
            description: "The call was not answered.",
          });
        }
      }, RING_TIMEOUT_MS);

      toast({
        title: "Calling…",
        description: "Waiting for the other person to answer.",
      });
    },
    [user, conversationId, otherUserId, startLocalStream, cleanup, createPeerConnectionBound, toast, callState, addToCallHistory]
  );

  // Answer call (callee)
  const answerCall = useCallback(async () => {
    if (!user || !currentCall) return;
    if (!currentCall.offer) {
      toast({
        title: "Still connecting…",
        description: "Please wait a moment and try again.",
      });
      return;
    }

    stopRingtone();

    const audioOnly = isOfferAudioOnly(currentCall.offer);
    const stream = await startLocalStream(audioOnly);
    if (!stream) return;

    callIdRef.current = currentCall.id;
    callStartTimeRef.current = new Date();

    const pc = createPeerConnectionBound(stream);
    await pc.setRemoteDescription(new RTCSessionDescription(currentCall.offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await supabase
      .from("video_calls")
      .update({
        answer: answer as unknown as any,
        status: "accepted",
        started_at: new Date().toISOString(),
      })
      .eq("id", currentCall.id);

    setCallState("connected");
  }, [user, currentCall, startLocalStream, createPeerConnectionBound, toast, stopRingtone]);

  const rejectCall = useCallback(async () => {
    if (!currentCall) return;

    stopRingtone();

    await supabase.from("video_calls").update({ status: "rejected" }).eq("id", currentCall.id);
    await addToCallHistory(currentCall, "rejected");
    cleanup();
    setCallState("idle");
  }, [currentCall, cleanup, stopRingtone, addToCallHistory]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    localStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((v) => !v);
  }, [localStream]);

  // Toggle video (only relevant for video calls)
  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsVideoOff((v) => !v);
  }, [localStream]);

  // 1) Listen for incoming calls for this user (even if no conversation is currently selected)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`video-calls-incoming-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "video_calls",
          filter: `callee_id=eq.${user.id}`,
        },
        (payload) => {
          const call = coerceCall(payload.new);
          callIdRef.current = call.id;
          setCurrentCall(call);
          setCallState("ringing");

          // Start ringtone and vibration
          startRingtone();

          // Set timeout for missed call (callee side)
          ringTimeoutRef.current = setTimeout(async () => {
            stopRingtone();
            await supabase
              .from("video_calls")
              .update({ status: "missed" })
              .eq("id", call.id);
            await addToCallHistory(call, "missed");
            await createMissedCallNotification(call);
            cleanup();
            setCallState("idle");
          }, RING_TIMEOUT_MS);

          // Show toast
          toast({
            title: "Incoming call",
            description: "Tap to answer or reject.",
          });

          // Show browser notification if tab is in background
          if (document.hidden && "Notification" in window && Notification.permission === "granted") {
            new Notification("Incoming Call", {
              body: `You have an incoming ${call.call_type || "video"} call`,
              icon: "/favicon.ico",
              tag: `incoming-call-${call.id}`,
              requireInteraction: true,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, startRingtone, stopRingtone, cleanup, addToCallHistory, createMissedCallNotification]);

  // 2) Subscribe to the *active call* by ID (so updates work even if conversationId is not active)
  useEffect(() => {
    if (!user) return;

    const activeCallId = currentCall?.id ?? callIdRef.current;
    if (!activeCallId) return;

    handledIceCountRef.current = 0;

    const channel = supabase
      .channel(`video-call-${activeCallId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "video_calls",
          filter: `id=eq.${activeCallId}`,
        },
        async (payload) => {
          const call = coerceCall(payload.new);
          setCurrentCall(call);

          // Caller receives callee answer
          if (call.status === "accepted" && call.answer && call.caller_id === user.id) {
            if (ringTimeoutRef.current) {
              clearTimeout(ringTimeoutRef.current);
              ringTimeoutRef.current = null;
            }
            callStartTimeRef.current = new Date();
            const pc = peerConnectionRef.current;
            if (pc && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
              setCallState("connected");
            }
          }

          // End states
          if (call.status === "rejected" || call.status === "ended" || call.status === "missed") {
            stopRingtone();
            if (ringTimeoutRef.current) {
              clearTimeout(ringTimeoutRef.current);
              ringTimeoutRef.current = null;
            }
            await endCall();
            return;
          }

          // ICE candidates (add only new ones)
          const candidates = call.ice_candidates ?? [];
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription && candidates.length > handledIceCountRef.current) {
            const next = candidates.slice(handledIceCountRef.current);
            for (const c of next) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              } catch (e) {
                console.error("Error adding ICE candidate:", e);
              }
            }
            handledIceCountRef.current = candidates.length;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentCall?.id, stopRingtone]);

  return {
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
  };
};
