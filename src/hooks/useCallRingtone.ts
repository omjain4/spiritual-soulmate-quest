import { useEffect, useRef, useCallback } from "react";

const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const RING_INTERVAL_MS = 2000;

export const useCallRingtone = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRingtone = useCallback(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(RINGTONE_URL);
      audioRef.current.volume = 0.7;
    }

    // Play ringtone in a loop
    const playRing = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    };

    playRing();
    intervalRef.current = setInterval(playRing, RING_INTERVAL_MS);

    // Start vibration if supported (for mobile)
    if ("vibrate" in navigator) {
      const vibrate = () => {
        navigator.vibrate([300, 200, 300]);
      };
      vibrate();
      vibrationIntervalRef.current = setInterval(vibrate, RING_INTERVAL_MS);
    }
  }, []);

  const stopRingtone = useCallback(() => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }

    // Stop vibration
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, [stopRingtone]);

  return { startRingtone, stopRingtone };
};
