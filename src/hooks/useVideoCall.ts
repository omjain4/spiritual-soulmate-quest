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
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  ice_candidates?: RTCIceCandidateInit[];
  created_at: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
};

type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";

const coerceCall = (raw: any): VideoCall => ({
  ...raw,
  status: raw.status as VideoCall["status"],
  offer: raw.offer as RTCSessionDescriptionInit | undefined,
  answer: raw.answer as RTCSessionDescriptionInit | undefined,
  ice_candidates: (raw.ice_candidates as RTCIceCandidateInit[] | null) ?? undefined,
});

const isOfferAudioOnly = (offer?: RTCSessionDescriptionInit) => {
  const sdp = offer?.sdp;
  if (!sdp) return false;
  // If the offer SDP has no video m-line, treat it as audio-only.
  return !sdp.includes("m=video");
};

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

  const cleanup = useCallback(() => {
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
    setCurrentCall(null);
  }, [localStream, remoteStream]);

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

  const createPeerConnection = useCallback(
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

        // Append candidate to the stored array
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
        if (pc.iceConnectionState === "connected") {
          setCallState("connected");
        }
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          void endCall();
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    // endCall is declared later but stable via useCallback; safe to reference via function hoisting? Not in TS.
    // We'll re-bind endCall below by using a ref-like call.
    []
  );

  // End a call
  const endCall = useCallback(async () => {
    const callId = callIdRef.current;

    if (callId) {
      await supabase
        .from("video_calls")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", callId);
    }

    cleanup();
    setCallState("ended");
    setTimeout(() => setCallState("idle"), 700);
  }, [cleanup]);

  // Re-bind createPeerConnection's internal endCall usage (because it was created before endCall existed)
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

      toast({
        title: "Calling…",
        description: "Waiting for the other person to answer.",
      });
    },
    [user, conversationId, otherUserId, startLocalStream, cleanup, createPeerConnectionBound, toast]
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

    const audioOnly = isOfferAudioOnly(currentCall.offer);
    const stream = await startLocalStream(audioOnly);
    if (!stream) return;

    callIdRef.current = currentCall.id;

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
  }, [user, currentCall, startLocalStream, createPeerConnectionBound, toast]);

  const rejectCall = useCallback(async () => {
    if (!currentCall) return;

    await supabase.from("video_calls").update({ status: "rejected" }).eq("id", currentCall.id);
    cleanup();
    setCallState("idle");
  }, [currentCall, cleanup]);

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
          toast({
            title: "Incoming call",
            description: "Tap to answer or reject.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

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
            const pc = peerConnectionRef.current;
            if (pc && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
              setCallState("connected");
            }
          }

          // End states
          if (call.status === "rejected" || call.status === "ended") {
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
  }, [user, currentCall?.id]);

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
