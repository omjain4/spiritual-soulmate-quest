import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
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

const RING_TIMEOUT_MS = 30000;
const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const useVideoCall = (conversationId: string | null, otherUserId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const currentCallRef = useRef<VideoCall | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    remoteStreamRef.current = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  // Ringtone functions using refs (no state dependencies)
  const startRingtone = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(RINGTONE_URL);
      audioRef.current.volume = 0.7;
    }

    const playRing = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    playRing();
    ringIntervalRef.current = setInterval(playRing, 2000);

    if ("vibrate" in navigator) {
      navigator.vibrate([300, 200, 300]);
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }, []);

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
  const createMissedCallNotification = useCallback(async (call: VideoCall, userId: string) => {
    if (call.callee_id !== userId) return;

    try {
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
  }, []);

  // Cleanup function using refs
  const cleanup = useCallback(() => {
    stopRingtone();

    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);

    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    setRemoteStream(null);

    setIsMuted(false);
    setIsVideoOff(false);
    setIsAudioOnly(false);

    handledIceCountRef.current = 0;
    callIdRef.current = null;
    callStartTimeRef.current = null;
    setCurrentCall(null);
  }, [stopRingtone]);

  const startLocalStream = useCallback(
    async (audioOnly: boolean) => {
      try {
        console.log("Requesting media access:", { audioOnly });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: audioOnly ? false : { width: 1280, height: 720 },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        console.log("Media stream obtained:", stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
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

  // End a call - use ref for cleanup
  const endCall = useCallback(async () => {
    const callId = callIdRef.current;
    const call = currentCallRef.current;

    if (callId) {
      await supabase
        .from("video_calls")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", callId);
    }

    if (call && callStartTimeRef.current) {
      const durationSeconds = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000);
      await addToCallHistory(call, "answered", durationSeconds);
    }

    cleanup();
    setCallState("ended");
    setTimeout(() => setCallState("idle"), 700);
  }, [cleanup, addToCallHistory]);

  const endCallRef = useRef(endCall);
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  const createPeerConnectionBound = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => {
        console.log("Adding local track:", track.kind, track.enabled);
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        const [s] = event.streams;
        if (s) {
          console.log("Setting remote stream with tracks:", s.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
          setRemoteStream(s);
          
          // Ensure audio tracks are enabled
          s.getAudioTracks().forEach(track => {
            track.enabled = true;
            console.log("Audio track enabled:", track.id);
          });
        }
      };

      pc.onicecandidate = async (event) => {
        const callId = callIdRef.current;
        if (!event.candidate || !callId) return;

        console.log("Generated ICE candidate:", event.candidate.candidate);

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
        console.log("ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          setCallState("connected");
        }
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          void endCallRef.current();
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    []
  );

  // Start call (caller)
  const startCall = useCallback(
    async (audioOnly: boolean = false) => {
      if (!user || !conversationId || !otherUserId) {
        console.error("Missing required data for call:", { user: !!user, conversationId, otherUserId });
        return;
      }

      const stream = await startLocalStream(audioOnly);
      if (!stream) return;

      setCallState("calling");

      try {
        console.log("Creating call...", { caller_id: user.id, callee_id: otherUserId, conversation_id: conversationId });
        
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

        if (error) {
          console.error("Error creating call:", error);
          cleanup();
          setCallState("idle");
          toast({
            title: "Call failed",
            description: "Unable to start the call. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!call) {
          console.error("No call data returned");
          cleanup();
          setCallState("idle");
          return;
        }

        console.log("Call created successfully:", call);
        const typedCall = coerceCall(call);
        callIdRef.current = typedCall.id;
        setCurrentCall(typedCall);

        const pc = createPeerConnectionBound(stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Update the call with the offer
        const { error: updateError } = await supabase
          .from("video_calls")
          .update({ offer: offer as unknown as any })
          .eq("id", typedCall.id);

        if (updateError) {
          console.error("Error updating call with offer:", updateError);
        }

        ringTimeoutRef.current = setTimeout(async () => {
          console.log("Call timeout - no answer");
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
        }, RING_TIMEOUT_MS);

        toast({
          title: "Calling…",
          description: "Waiting for the other person to answer.",
        });
      } catch (error) {
        console.error("Unexpected error starting call:", error);
        cleanup();
        setCallState("idle");
        toast({
          title: "Call failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, conversationId, otherUserId, startLocalStream, cleanup, createPeerConnectionBound, toast, addToCallHistory]
  );

  // Answer call (callee)
  const answerCall = useCallback(async () => {
    const call = currentCallRef.current;
    if (!user || !call) return;
    if (!call.offer) {
      toast({
        title: "Still connecting…",
        description: "Please wait a moment and try again.",
      });
      return;
    }

    console.log("Answering call:", call.id);
    stopRingtone();
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }

    const audioOnly = isOfferAudioOnly(call.offer);
    console.log("Call type:", audioOnly ? "audio" : "video");
    const stream = await startLocalStream(audioOnly);
    if (!stream) return;

    callIdRef.current = call.id;
    callStartTimeRef.current = new Date();

    const pc = createPeerConnectionBound(stream);
    console.log("Setting remote description (offer)");
    await pc.setRemoteDescription(new RTCSessionDescription(call.offer));

    console.log("Creating answer");
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    console.log("Sending answer to database");
    await supabase
      .from("video_calls")
      .update({
        answer: answer as unknown as any,
        status: "accepted",
        started_at: new Date().toISOString(),
      })
      .eq("id", call.id);

    // Process any ICE candidates that arrived before we set remote description
    if (call.ice_candidates && call.ice_candidates.length > 0) {
      console.log("Adding existing ICE candidates:", call.ice_candidates.length);
      for (const candidate of call.ice_candidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      }
      handledIceCountRef.current = call.ice_candidates.length;
    }

    setCallState("connected");
  }, [user, startLocalStream, createPeerConnectionBound, toast, stopRingtone]);

  const rejectCall = useCallback(async () => {
    const call = currentCallRef.current;
    if (!call) return;

    stopRingtone();
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }

    await supabase.from("video_calls").update({ status: "rejected" }).eq("id", call.id);
    await addToCallHistory(call, "rejected");
    cleanup();
    setCallState("idle");
  }, [cleanup, stopRingtone, addToCallHistory]);

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((v) => !v);
  }, []);

  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsVideoOff((v) => !v);
  }, []);

  // Listen for incoming calls
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
        async (payload) => {
          const call = coerceCall(payload.new);
          
          // Only process if this is a new incoming call and we're the callee
          if (call.status === "ringing" && call.callee_id === user.id && call.caller_id !== user.id) {
            console.log("Incoming call received:", payload.new);
            callIdRef.current = call.id;
            setCurrentCall(call);
            setCallState("ringing");

            startRingtone();

            // Get caller info for better notification
            const { data: callerProfile } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("user_id", call.caller_id)
              .single();

            ringTimeoutRef.current = setTimeout(async () => {
              stopRingtone();
              await supabase
                .from("video_calls")
                .update({ status: "missed" })
                .eq("id", call.id);
              await addToCallHistory(call, "missed");
              await createMissedCallNotification(call, user.id);
              cleanup();
              setCallState("idle");
            }, RING_TIMEOUT_MS);

            toast({
              title: "Incoming call",
              description: `${callerProfile?.name || "Someone"} is calling you`,
              duration: 10000,
            });

            // Show browser notification
            if ("Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("Incoming Call", {
                  body: `${callerProfile?.name || "Someone"} is calling you`,
                  icon: callerProfile?.avatar_url || "/favicon.ico",
                  tag: `incoming-call-${call.id}`,
                  requireInteraction: true,
                });
              } else if (Notification.permission === "default") {
                Notification.requestPermission();
              }
            }

            if ("vibrate" in navigator) {
              navigator.vibrate([500, 200, 500, 200, 500]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, startRingtone, stopRingtone, cleanup, addToCallHistory, createMissedCallNotification]);

  // Subscribe to active call updates
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

          if (call.status === "accepted" && call.answer && call.caller_id === user.id) {
            if (ringTimeoutRef.current) {
              clearTimeout(ringTimeoutRef.current);
              ringTimeoutRef.current = null;
            }
            callStartTimeRef.current = new Date();
            const pc = peerConnectionRef.current;
            if (pc && !pc.currentRemoteDescription) {
              console.log("Setting remote description (answer)");
              await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
              
              // Add any ICE candidates that arrived
              if (call.ice_candidates && call.ice_candidates.length > handledIceCountRef.current) {
                const newCandidates = call.ice_candidates.slice(handledIceCountRef.current);
                console.log("Adding ICE candidates after answer:", newCandidates.length);
                for (const c of newCandidates) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(c));
                  } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                  }
                }
                handledIceCountRef.current = call.ice_candidates.length;
              }
              
              setCallState("connected");
            }
          }

          if (call.status === "rejected" || call.status === "ended" || call.status === "missed") {
            stopRingtone();
            if (ringTimeoutRef.current) {
              clearTimeout(ringTimeoutRef.current);
              ringTimeoutRef.current = null;
            }
            cleanup();
            setCallState("ended");
            setTimeout(() => setCallState("idle"), 700);
            return;
          }

          const candidates = call.ice_candidates ?? [];
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription && candidates.length > handledIceCountRef.current) {
            const next = candidates.slice(handledIceCountRef.current);
            console.log("Processing new ICE candidates:", next.length);
            for (const c of next) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
                console.log("Added ICE candidate successfully");
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
  }, [user, currentCall?.id, stopRingtone, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRingtone();
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
    };
  }, [stopRingtone]);

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
