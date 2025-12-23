import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InterestStamp {
  id: string;
  label: string;
  emoji: string;
  color: "saffron" | "sage" | "muted";
}

interface InterestStampsProps {
  stamps: InterestStamp[];
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  readonly?: boolean;
}

const InterestStamps = ({
  stamps,
  selectedIds = [],
  onToggle,
  readonly = false,
}: InterestStampsProps) => {
  const colorClasses = {
    saffron: {
      selected: "bg-saffron-light border-primary text-primary",
      unselected: "border-border bg-card text-muted-foreground hover:border-primary/30",
    },
    sage: {
      selected: "bg-sage-light border-sage text-sage-dark",
      unselected: "border-border bg-card text-muted-foreground hover:border-sage/30",
    },
    muted: {
      selected: "bg-muted border-foreground text-foreground",
      unselected: "border-border bg-card text-muted-foreground hover:border-foreground/30",
    },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {stamps.map((stamp, index) => {
        const isSelected = selectedIds.includes(stamp.id);
        const colors = colorClasses[stamp.color];

        return (
          <motion.button
            key={stamp.id}
            onClick={() => !readonly && onToggle?.(stamp.id)}
            disabled={readonly}
            className={cn(
              "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
              isSelected ? colors.selected : colors.unselected,
              readonly && "cursor-default"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={!readonly ? { scale: 1.05 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
          >
            <span className="text-lg">{stamp.emoji}</span>
            <span>{stamp.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

// Predefined interest stamps for Jain community
export const defaultInterestStamps: InterestStamp[] = [
  { id: "pilgrimage", label: "Pilgrimage Enthusiast", emoji: "🛕", color: "saffron" },
  { id: "volunteer", label: "Volunteer", emoji: "🤝", color: "sage" },
  { id: "vegan", label: "Vegan", emoji: "🌱", color: "sage" },
  { id: "business", label: "Business Background", emoji: "💼", color: "muted" },
  { id: "meditation", label: "Meditation Practice", emoji: "🧘", color: "saffron" },
  { id: "charity", label: "Charity Focused", emoji: "💝", color: "saffron" },
  { id: "traditional", label: "Traditional Values", emoji: "🙏", color: "saffron" },
  { id: "modern", label: "Modern Outlook", emoji: "✨", color: "muted" },
  { id: "fitness", label: "Fitness Enthusiast", emoji: "💪", color: "sage" },
  { id: "reader", label: "Avid Reader", emoji: "📚", color: "muted" },
  { id: "travel", label: "Travel Lover", emoji: "✈️", color: "sage" },
  { id: "music", label: "Music Enthusiast", emoji: "🎵", color: "muted" },
];

export default InterestStamps;
