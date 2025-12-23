import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Send, Check, Clock, UserPlus } from "lucide-react";
import GlassCard from "./GlassCard";

interface VouchRequest {
  id: string;
  name: string;
  relationship: string;
  status: "pending" | "verified" | "expired";
  date: string;
}

interface VouchCardProps {
  requests?: VouchRequest[];
  onSendRequest?: () => void;
}

const VouchCard = ({ requests = [], onSendRequest }: VouchCardProps) => {
  const [showSendForm, setShowSendForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const relationships = [
    "Family Friend",
    "Samaj Member",
    "Temple Committee",
    "Business Associate",
    "Relative",
  ];

  const handleSend = () => {
    console.log("Sending vouch request to:", { name, phone, relationship });
    setShowSendForm(false);
    setName("");
    setPhone("");
    setRelationship("");
    onSendRequest?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Vouch System</h3>
        </div>
        <span className="rounded-full bg-sage-light px-2 py-1 text-xs font-medium text-sage-dark">
          {requests.filter((r) => r.status === "verified").length} Verified
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Get vouched by family friends or Samaj members to increase your trust score
      </p>

      {/* Existing Requests */}
      {requests.length > 0 && (
        <div className="space-y-2">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{request.name}</p>
                  <p className="text-xs text-muted-foreground">{request.relationship}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {request.status === "verified" && (
                  <span className="flex items-center gap-1 rounded-full bg-sage-light px-2 py-1 text-xs font-medium text-sage-dark">
                    <Check className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {request.status === "pending" && (
                  <span className="flex items-center gap-1 rounded-full bg-saffron-light px-2 py-1 text-xs font-medium text-primary">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Send New Request */}
      {showSendForm ? (
        <GlassCard className="space-y-4">
          <h4 className="font-medium">Send Vouch Request</h4>
          
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Their Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter their full name"
                className="input-glass"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="input-glass"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Relationship
              </label>
              <div className="flex flex-wrap gap-2">
                {relationships.map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setRelationship(rel)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      relationship === rel
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSendForm(false)}
              className="btn-sage flex-1 py-2"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSend}
              disabled={!name || !phone || !relationship}
              className="btn-saffron flex flex-1 items-center justify-center gap-2 py-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="h-4 w-4" />
              Send Request
            </motion.button>
          </div>
        </GlassCard>
      ) : (
        <motion.button
          onClick={() => setShowSendForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <UserPlus className="h-5 w-5" />
          Request a Vouch
        </motion.button>
      )}
    </div>
  );
};

export default VouchCard;
