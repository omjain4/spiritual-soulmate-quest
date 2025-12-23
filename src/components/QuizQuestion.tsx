import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizOption {
  id: string;
  label: string;
  emoji?: string;
}

interface QuizQuestionProps {
  question: string;
  options: QuizOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const QuizQuestion = ({
  question,
  options,
  selectedId,
  onSelect,
}: QuizQuestionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-foreground">{question}</h2>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {options.map((option, index) => (
            <motion.button
              key={option.id}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all",
                selectedId === option.id
                  ? "border-primary bg-saffron-light"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted"
              )}
              onClick={() => onSelect(option.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                {option.emoji && (
                  <span className="text-2xl">{option.emoji}</span>
                )}
                <span className="font-medium">{option.label}</span>
              </div>
              {selectedId === option.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuizQuestion;
