import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  X, 
  Flag, 
  Ban, 
  MessageSquare, 
  ChevronRight,
  Send
} from "lucide-react";
import GlassCard from "./GlassCard";

interface GrievanceReportProps {
  profileName: string;
  onSubmit: (data: ReportData) => void;
  onClose: () => void;
}

interface ReportData {
  reason: string;
  details: string;
  blockUser: boolean;
}

const reportReasons = [
  { id: "inaccurate_jain", label: "Inaccurate Jain Details", icon: "🕉️" },
  { id: "fake_profile", label: "Fake/Misleading Profile", icon: "🎭" },
  { id: "commercial", label: "Commercial Use", icon: "💼" },
  { id: "harassment", label: "Harassment/Inappropriate", icon: "⚠️" },
  { id: "impersonation", label: "Impersonation", icon: "👤" },
  { id: "spam", label: "Spam/Scam", icon: "📧" },
  { id: "underage", label: "Suspected Underage", icon: "🔞" },
  { id: "other", label: "Other", icon: "📝" },
];

const GrievanceReport = ({ profileName, onSubmit, onClose }: GrievanceReportProps) => {
  const [step, setStep] = useState<"reason" | "details" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [blockUser, setBlockUser] = useState(true);

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit({
        reason: selectedReason,
        details,
        blockUser,
      });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/50 backdrop-blur-sm md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <GlassCard className="max-h-[80vh] overflow-y-auto rounded-b-none rounded-t-3xl md:rounded-3xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <Flag className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Report & Block</h3>
                <p className="text-xs text-muted-foreground">{profileName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Reason */}
            {step === "reason" && (
              <motion.div
                key="reason"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">
                  Select a reason for reporting this profile:
                </p>
                
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => {
                        setSelectedReason(reason.id);
                        setStep("details");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{reason.icon}</span>
                        <span className="text-sm font-medium">{reason.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Add Details */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="rounded-xl bg-saffron-light p-3">
                  <p className="text-sm font-medium text-primary">
                    {reportReasons.find((r) => r.id === selectedReason)?.icon}{" "}
                    {reportReasons.find((r) => r.id === selectedReason)?.label}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any additional information that might help us investigate..."
                    className="input-glass min-h-24 resize-none"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <input
                    type="checkbox"
                    checked={blockUser}
                    onChange={(e) => setBlockUser(e.target.checked)}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">Block this user</p>
                    <p className="text-xs text-muted-foreground">
                      They won't be able to see or contact you
                    </p>
                  </div>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("reason")}
                    className="btn-sage flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    className="btn-saffron flex-1"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="rounded-xl bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">Confirm Report</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This action cannot be undone. Our team will review your report within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl bg-muted/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reason</span>
                    <span className="font-medium">
                      {reportReasons.find((r) => r.id === selectedReason)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Block User</span>
                    <span className="font-medium">{blockUser ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("details")}
                    className="btn-sage flex-1"
                  >
                    Back
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-3 font-medium text-destructive-foreground"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="h-4 w-4" />
                    Submit Report
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

export default GrievanceReport;
