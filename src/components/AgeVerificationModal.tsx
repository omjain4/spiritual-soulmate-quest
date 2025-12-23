import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Calendar, Check, AlertTriangle } from "lucide-react";
import GlassCard from "./GlassCard";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
}

const AgeVerificationModal = ({ isOpen, onVerified }: AgeVerificationModalProps) => {
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleVerify = () => {
    if (!gender || !birthDate || !acceptedTerms) {
      setError("Please complete all fields");
      return;
    }

    const age = calculateAge(birthDate);
    const minAge = gender === "male" ? 21 : 18;

    if (age < minAge) {
      setError(`You must be at least ${minAge} years old to use this app`);
      return;
    }

    onVerified();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            <GlassCard elevated className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-saffron-light">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Age Verification</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  As per Indian Matrimonial Laws (2025)
                </p>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGender("male")}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${
                      gender === "male"
                        ? "border-primary bg-saffron-light"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">👨</span>
                    <p className="mt-1 text-sm font-medium">Male</p>
                    <p className="text-xs text-muted-foreground">Min age: 21</p>
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${
                      gender === "female"
                        ? "border-primary bg-saffron-light"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">👩</span>
                    <p className="mt-1 text-sm font-medium">Female</p>
                    <p className="text-xs text-muted-foreground">Min age: 18</p>
                  </button>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="input-glass pl-10"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted/50 p-4">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  I confirm that I meet the legal age requirements and agree to the{" "}
                  <a href="#" className="text-primary underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary underline">
                    Privacy Policy
                  </a>
                  . I understand that providing false information is a punishable offense.
                </span>
              </label>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                onClick={handleVerify}
                className="btn-saffron flex w-full items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="h-5 w-5" />
                <span>Verify & Continue</span>
              </motion.button>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeVerificationModal;
