import { motion } from "framer-motion";
import { Users, TrendingUp, Clock, Zap } from "lucide-react";
import GlassCard from "./GlassCard";

interface WaitlistCardProps {
  position: number;
  ageGroup: string;
  maleRatio: number;
  femaleRatio: number;
  estimatedWait: string;
  onFastTrack?: () => void;
}

const WaitlistCard = ({
  position,
  ageGroup,
  maleRatio,
  femaleRatio,
  estimatedWait,
  onFastTrack,
}: WaitlistCardProps) => {
  return (
    <GlassCard elevated className="space-y-6">
      {/* Position display */}
      <div className="text-center">
        <motion.div
          className="text-6xl font-bold text-gradient-saffron"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          #{position}
        </motion.div>
        <p className="mt-2 text-muted-foreground">Your position in line</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-sage-light p-4">
          <div className="flex items-center gap-2 text-sage-dark">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Age Group</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-foreground">{ageGroup}</p>
        </div>

        <div className="rounded-xl bg-saffron-light p-4">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Gender Ratio</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {maleRatio}:{femaleRatio}
          </p>
        </div>
      </div>

      {/* Estimated wait */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Estimated Wait</p>
            <p className="font-semibold">{estimatedWait}</p>
          </div>
        </div>
      </div>

      {/* Fast track button */}
      <motion.button
        className="btn-saffron flex w-full items-center justify-center gap-2"
        onClick={onFastTrack}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Zap className="h-5 w-5" />
        <span>Fast-Track Access</span>
      </motion.button>

      <p className="text-center text-xs text-muted-foreground">
        Skip the wait with Premium membership
      </p>
    </GlassCard>
  );
};

export default WaitlistCard;
