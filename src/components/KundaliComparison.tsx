import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

interface GunaMatch {
  category: string;
  obtained: number;
  maximum: number;
}

interface KundaliComparisonProps {
  matchName: string;
  overallScore: number;
  gunaMatches: GunaMatch[];
}

const KundaliComparison = ({
  matchName,
  overallScore,
  gunaMatches,
}: KundaliComparisonProps) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return "text-secondary";
    if (percentage >= 50) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Kundali Match</h3>
        </div>
        <span className="text-sm text-muted-foreground">with {matchName}</span>
      </div>

      {/* Circular Progress */}
      <div className="relative mx-auto h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={251}
            initial={{ strokeDashoffset: 251 }}
            animate={{
              strokeDashoffset: 251 - (251 * overallScore) / 100,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--sage))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-gradient-saffron"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {overallScore}%
          </motion.span>
          <span className="text-xs text-muted-foreground">Guna Match</span>
        </div>
      </div>

      {/* Score interpretation */}
      <div className="text-center">
        {overallScore >= 75 ? (
          <div className="flex items-center justify-center gap-2 text-secondary">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-medium">Excellent Match!</span>
          </div>
        ) : overallScore >= 50 ? (
          <p className="font-medium text-primary">Good Compatibility</p>
        ) : (
          <p className="font-medium text-muted-foreground">Moderate Match</p>
        )}
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Ashta Koota Breakdown
        </h4>
        {gunaMatches.map((guna, index) => {
          const percentage = (guna.obtained / guna.maximum) * 100;
          return (
            <motion.div
              key={guna.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span>{guna.category}</span>
                <span className={getScoreColor(percentage)}>
                  {guna.obtained}/{guna.maximum}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      percentage >= 75
                        ? "hsl(var(--sage))"
                        : percentage >= 50
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground))",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
        <span className="font-medium">Total Gunas</span>
        <span className="text-lg font-bold text-primary">
          {gunaMatches.reduce((sum, g) => sum + g.obtained, 0)}/
          {gunaMatches.reduce((sum, g) => sum + g.maximum, 0)}
        </span>
      </div>
    </div>
  );
};

export default KundaliComparison;
