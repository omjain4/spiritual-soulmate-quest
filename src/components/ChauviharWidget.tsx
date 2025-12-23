import { motion } from "framer-motion";
import { Sunset, Leaf, Moon, Sun } from "lucide-react";

interface ChauviharWidgetProps {
  chauviharLevel: "strict" | "moderate" | "flexible" | "none";
  dietaryPreference: "strict-jain" | "jain-veg" | "vegetarian" | "flexible";
}

const ChauviharWidget = ({
  chauviharLevel,
  dietaryPreference,
}: ChauviharWidgetProps) => {
  const chauviharConfig = {
    strict: {
      label: "Strict Chauvihar",
      icon: <Sunset className="h-5 w-5" />,
      color: "text-primary",
      bg: "bg-saffron-light",
      description: "Eats before sunset daily",
    },
    moderate: {
      label: "Mostly Follows",
      icon: <Sun className="h-5 w-5" />,
      color: "text-sage-dark",
      bg: "bg-sage-light",
      description: "Follows on most days",
    },
    flexible: {
      label: "Occasionally",
      icon: <Moon className="h-5 w-5" />,
      color: "text-muted-foreground",
      bg: "bg-muted",
      description: "Sometimes follows",
    },
    none: {
      label: "No Preference",
      icon: <Moon className="h-5 w-5" />,
      color: "text-muted-foreground",
      bg: "bg-muted",
      description: "No specific practice",
    },
  };

  const dietConfig = {
    "strict-jain": {
      label: "Strict Jain",
      items: ["No Root Vegetables", "No Onion/Garlic", "No Night Eating"],
      emoji: "🥬",
    },
    "jain-veg": {
      label: "Jain Vegetarian",
      items: ["No Root Vegetables", "Pure Vegetarian"],
      emoji: "🥗",
    },
    vegetarian: {
      label: "Vegetarian",
      items: ["Pure Vegetarian"],
      emoji: "🥦",
    },
    flexible: {
      label: "Flexible",
      items: ["Vegetarian Preference"],
      emoji: "🍽️",
    },
  };

  const chauvihar = chauviharConfig[chauviharLevel];
  const diet = dietConfig[dietaryPreference];

  return (
    <div className="space-y-4">
      {/* Chauvihar Status */}
      <motion.div
        className={`flex items-center gap-3 rounded-xl p-4 ${chauvihar.bg}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-card ${chauvihar.color}`}>
          {chauvihar.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${chauvihar.color}`}>
              {chauvihar.label}
            </span>
            <Sunset className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">{chauvihar.description}</p>
        </div>
      </motion.div>

      {/* Dietary Preferences */}
      <motion.div
        className="rounded-xl border border-border bg-card p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-sage" />
          <span className="font-medium">Dietary Practices</span>
          <span className="text-xl">{diet.emoji}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {diet.items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-sage-dark"
            >
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ChauviharWidget;
