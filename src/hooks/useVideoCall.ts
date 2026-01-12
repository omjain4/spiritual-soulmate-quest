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
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useVideoCall = (conversationId: string | null, otherUserId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [callState, setCallState] = useState<"idle" | "calling" | "ringing" | "connected" | "ended">("idle");
  const [currentCall, setCurrentCall] = useState<VideoCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Get user media
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Camera/Microphone Error",
        description: "Unable to access camera or microphone. Please check permissions.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
  }, [localStream]);

  // Create peer connection
  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate && currentCall?.id) {
          // Store ICE candidate in database
          const { data: callData } = await supabase
            .from("video_calls")
            .select("ice_candidates")
            .eq("id", currentCall.id)
            .single();

          const existingCandidates = (callData?.ice_candidates as unknown as RTCIceCandidateInit[] | null) || [];
          
          await supabase
            .from("video_calls")
            .update({
              ice_candidates: [...existingCandidates, event.candidate.toJSON()] as unknown as any[],
            })
            .eq("id", currentCall.id);
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "connected") {
          setCallState("connected");
        } else if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          endCall();
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    },
    [currentCall?.id]
  );

  // Start a call
  const startCall = useCallback(async () => {
    if (!user || !conversationId || !otherUserId) return;

    const stream = await startLocalStream();
    if (!stream) return;

    setCallState("calling");

    // Create call record
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
      stopLocalStream();
      setCallState("idle");
      return;
    }

    const typedCall: VideoCall = {
      ...call,
      status: call.status as VideoCall["status"],
      offer: call.offer as unknown as RTCSessionDescriptionInit | undefined,
      answer: call.answer as unknown as RTCSessionDescriptionInit | undefined,
      ice_candidates: call.ice_candidates as unknown as RTCIceCandidateInit[] | undefined,
    };

    setCurrentCall(typedCall);

    // Create peer connection and offer
    const pc = createPeerConnection(stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Update call with offer
    await supabase
      .from("video_calls")
      .update({ offer: offer as unknown as any })
      .eq("id", call.id);

    toast({
      title: "Calling...",
      description: "Waiting for the other person to answer.",
    });
  }, [user, conversationId, otherUserId, startLocalStream, stopLocalStream, createPeerConnection, toast]);

  // Answer a call
  const answerCall = useCallback(async () => {
    if (!currentCall || !user) return;

    const stream = await startLocalStream();
    if (!stream) return;

    setCallState("connected");

    const pc = createPeerConnection(stream);

    // Set remote description from offer
    if (currentCall.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(currentCall.offer));
    }

    // Add pending ICE candidates
    for (const candidate of pendingCandidatesRef.current) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidatesRef.current = [];

    // Create answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Update call with answer
    await supabase
      .from("video_calls")
      .update({
        answer: answer as unknown as any,
        status: "accepted",
        started_at: new Date().toISOString(),
      })
      .eq("id", currentCall.id);
  }, [currentCall, user, startLocalStream, createPeerConnection]);

  // Reject a call
  const rejectCall = useCallback(async () => {
    if (!currentCall) return;

    await supabase
      .from("video_calls")
      .update({ status: "rejected" })
      .eq("id", currentCall.id);

    setCurrentCall(null);
    setCallState("idle");
  }, [currentCall]);

  // End a call
  const endCall = useCallback(async () => {
    if (currentCall) {
      await supabase
        .from("video_calls")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", currentCall.id);
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    stopLocalStream();
    remoteStream?.getTracks().forEach((track) => track.stop());
    setRemoteStream(null);
    setCurrentCall(null);
    setCallState("ended");

    setTimeout(() => setCallState("idle"), 1000);
  }, [currentCall, stopLocalStream, remoteStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff(!isVideoOff);
  }, [localStream, isVideoOff]);

  // Subscribe to call updates
  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase
      .channel(`video-calls-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_calls",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const rawCall = payload.new as any;
          const call: VideoCall = {
            ...rawCall,
            status: rawCall.status as VideoCall["status"],
            offer: rawCall.offer as RTCSessionDescriptionInit | undefined,
            answer: rawCall.answer as RTCSessionDescriptionInit | undefined,
            ice_candidates: rawCall.ice_candidates as RTCIceCandidateInit[] | undefined,
          };

          // Incoming call
          if (payload.eventType === "INSERT" && call.callee_id === user.id) {
            setCurrentCall(call);
            setCallState("ringing");
            toast({
              title: "Incoming Call 📞",
              description: "Someone is calling you!",
            });
          }

          // Call updated
          if (payload.eventType === "UPDATE") {
            setCurrentCall(call);

            // Handle answer from callee
            if (call.status === "accepted" && call.answer && call.caller_id === user.id) {
              const pc = peerConnectionRef.current;
              if (pc && pc.signalingState !== "stable") {
                await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
              }
              setCallState("connected");
            }

            // Handle rejection
            if (call.status === "rejected" || call.status === "ended") {
              endCall();
            }

            // Handle ICE candidates
            if (call.ice_candidates && call.ice_candidates.length > 0) {
              const pc = peerConnectionRef.current;
              if (pc && pc.remoteDescription) {
                for (const candidate of call.ice_candidates) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                  }
                }
              } else {
                pendingCandidatesRef.current = call.ice_candidates;
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId, toast, endCall]);

  return {
    callState,
    currentCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
};
