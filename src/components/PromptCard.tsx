import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";

interface PromptCardProps {
  prompt: string;
  answer?: string;
  onEdit?: () => void;
  className?: string;
}

const PromptCard = ({ prompt, answer, onEdit, className }: PromptCardProps) => {
  return (
    <motion.div
      className={cn("prompt-card cursor-pointer", className)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{prompt}</p>
          {answer ? (
            <p className="mt-2 text-lg font-semibold text-foreground">{answer}</p>
          ) : (
            <p className="mt-2 text-lg italic text-muted-foreground/60">
              Tap to answer...
            </p>
          )}
        </div>
        <button className="ml-3 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Edit3 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default PromptCard;
