import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="mt-6 font-serif text-2xl font-light text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 font-medium text-background transition-all hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
