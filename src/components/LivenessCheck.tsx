import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, RotateCw, Sparkles } from "lucide-react";

interface LivenessCheckProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const LivenessCheck = ({ onComplete, onSkip }: LivenessCheckProps) => {
  const [stage, setStage] = useState<"ready" | "scanning" | "processing" | "complete">("ready");
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (stage === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStage("processing");
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }

    if (stage === "processing") {
      const timer = setTimeout(() => {
        setStage("complete");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (stage === "complete") {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  const startScan = () => {
    setScanProgress(0);
    setStage("scanning");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Selfie Verification</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Take a quick selfie to verify it's really you
        </p>
      </div>

      {/* Camera Interface */}
      <div className="relative mx-auto aspect-square w-64">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-dashed border-muted"
          animate={{
            rotate: stage === "scanning" ? 360 : 0,
          }}
          transition={{
            duration: 3,
            repeat: stage === "scanning" ? Infinity : 0,
            ease: "linear",
          }}
        />

        {/* Progress ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={283}
            initial={{ strokeDashoffset: 283 }}
            animate={{
              strokeDashoffset: 283 - (283 * scanProgress) / 100,
            }}
          />
        </svg>

        {/* Inner camera area */}
        <div className="absolute inset-4 overflow-hidden rounded-full bg-gradient-to-br from-muted to-muted/50">
          <AnimatePresence mode="wait">
            {stage === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-full flex-col items-center justify-center"
              >
                <Camera className="h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">Camera Ready</p>
              </motion.div>
            )}

            {stage === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-full w-full"
              >
                {/* Simulated face area */}
                <div className="absolute inset-8 rounded-full bg-sage-light" />
                
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{
                    top: ["10%", "90%", "10%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Face detection points */}
                {[
                  { top: "30%", left: "35%" },
                  { top: "30%", left: "65%" },
                  { top: "50%", left: "50%" },
                  { top: "70%", left: "50%" },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-primary"
                    style={pos}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                    transition={{
                      delay: i * 0.2,
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {stage === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RotateCw className="h-10 w-10 text-primary" />
                </motion.div>
                <p className="mt-3 text-sm font-medium">Processing...</p>
              </motion.div>
            )}

            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full flex-col items-center justify-center bg-sage-light"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary"
                >
                  <Check className="h-8 w-8 text-secondary-foreground" />
                </motion.div>
                <p className="mt-3 text-sm font-semibold text-secondary">Verified!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Tips for best results:</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>• Good lighting on your face</li>
              <li>• Look straight at the camera</li>
              <li>• Remove glasses or hats</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onSkip && stage === "ready" && (
          <button onClick={onSkip} className="btn-sage flex-1">
            Skip for now
          </button>
        )}
        {stage === "ready" && (
          <motion.button
            onClick={startScan}
            className="btn-saffron flex flex-1 items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="h-5 w-5" />
            <span>Start Verification</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default LivenessCheck;
