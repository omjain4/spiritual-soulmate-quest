import { motion } from "framer-motion";

interface TypingIndicatorProps {
  name?: string;
}

const TypingIndicator = ({ name }: TypingIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          className="h-2 w-2 rounded-full bg-muted-foreground"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-2 w-2 rounded-full bg-muted-foreground"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          className="h-2 w-2 rounded-full bg-muted-foreground"
        />
      </div>
      {name && (
        <span className="text-xs text-muted-foreground">{name} is typing...</span>
      )}
    </motion.div>
  );
};

export default TypingIndicator;
