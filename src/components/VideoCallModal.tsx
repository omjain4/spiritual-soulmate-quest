import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X } from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  callState: "idle" | "calling" | "ringing" | "connected" | "ended";
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isAudioOnly?: boolean;
  otherUserName?: string;
  otherUserAvatar?: string;
  onAnswer: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

const VideoCallModal = ({
  isOpen,
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  isAudioOnly = false,
  otherUserName,
  otherUserAvatar,
  onAnswer,
  onReject,
  onEnd,
  onToggleMute,
  onToggleVideo,
}: VideoCallModalProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("Setting local video stream");
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true; // Always mute local video to prevent feedback
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && !isAudioOnly) {
      console.log("Setting remote video stream", remoteStream.getTracks().map(t => ({ kind: String(t.kind).replace(/[\r\n]/g, ''), enabled: t.enabled })));
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;
      
      remoteVideoRef.current.play().catch(err => {
        const sanitizedError = String(err?.message || err).replace(/[\r\n]/g, '');
        console.error("Error playing remote stream:", sanitizedError);
        const playOnInteraction = () => {
          remoteVideoRef.current?.play();
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      });
    }
    
    if (remoteAudioRef.current && remoteStream && isAudioOnly) {
      console.log("Setting remote audio stream", remoteStream.getTracks().map(t => ({ kind: String(t.kind).replace(/[\r\n]/g, ''), enabled: t.enabled })));
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = 1.0;
      
      remoteAudioRef.current.play().catch(err => {
        const sanitizedError = String(err?.message || err).replace(/[\r\n]/g, '');
        console.error("Error playing remote audio:", sanitizedError);
        const playOnInteraction = () => {
          remoteAudioRef.current?.play();
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      });
    }
  }, [remoteStream, isAudioOnly]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        {/* Ringing state */}
        {callState === "ringing" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  "0 0 0 20px rgba(34, 197, 94, 0)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-32 w-32 overflow-hidden rounded-full"
            >
              <img
                src={otherUserAvatar || "/placeholder.svg"}
                alt={otherUserName}
                className="h-full w-full object-cover"
              />
            </motion.div>
            <div className="text-center">
              <h2 className="text-2xl font-medium text-white">{otherUserName || "Incoming Call"}</h2>
              <p className="mt-2 text-white/60">is calling you...</p>
            </div>
            <div className="flex gap-6">
              <motion.button
                onClick={onReject}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="h-8 w-8" />
              </motion.button>
              <motion.button
                onClick={onAnswer}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="h-8 w-8" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Calling state */}
        {callState === "calling" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-primary/30"
            >
              <img
                src={otherUserAvatar || "/placeholder.svg"}
                alt={otherUserName}
                className="h-full w-full object-cover"
              />
            </motion.div>
            <div className="text-center">
              <h2 className="text-2xl font-medium text-white">Calling {otherUserName}</h2>
              <p className="mt-2 text-white/60">Waiting for answer...</p>
            </div>
            <motion.button
              onClick={onEnd}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <PhoneOff className="h-8 w-8" />
            </motion.button>
          </motion.div>
        )}

        {/* Connected state */}
        {callState === "connected" && (
          <div className="relative h-full w-full">
            {/* Remote video or audio-only avatar */}
            {isAudioOnly ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                <audio ref={remoteAudioRef} autoPlay />
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-primary/30"
                >
                  <img
                    src={otherUserAvatar || "/placeholder.svg"}
                    alt={otherUserName}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
                <h2 className="mt-6 text-2xl font-medium text-white">{otherUserName}</h2>
                <p className="mt-2 text-white/60">Audio call in progress</p>
              </div>
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            )}

            {/* Local video (picture-in-picture) - only show for video calls */}
            {!isAudioOnly && (
              <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className="absolute bottom-24 right-4 h-40 w-28 overflow-hidden rounded-2xl shadow-lg md:h-48 md:w-36"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff className="h-8 w-8 text-white/50" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Call info */}
            <div className="absolute left-4 top-4 rounded-lg bg-black/40 px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-sm text-white">{otherUserName}</span>
                {isAudioOnly && <span className="text-xs text-white/60">(Audio)</span>}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
              <motion.button
                onClick={onToggleMute}
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                  isMuted ? "bg-red-500" : "bg-white/20 backdrop-blur-sm"
                } text-white`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </motion.button>
              {!isAudioOnly && (
                <motion.button
                  onClick={onToggleVideo}
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    isVideoOff ? "bg-red-500" : "bg-white/20 backdrop-blur-sm"
                  } text-white`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </motion.button>
              )}
              <motion.button
                onClick={onEnd}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Ended state */}
        {callState === "ended" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-medium text-white">Call Ended</h2>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallModal;
