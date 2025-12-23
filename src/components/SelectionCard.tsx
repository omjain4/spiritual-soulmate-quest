import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SelectionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

const SelectionCard = ({
  title,
  description,
  icon,
  selected = false,
  onClick,
}: SelectionCardProps) => {
  return (
    <motion.div
      className={cn("selection-card", selected && "selected")}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-light text-primary">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <motion.div
          initial={false}
          animate={{
            scale: selected ? 1 : 0,
            opacity: selected ? 1 : 0,
          }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
        >
          <Check className="h-4 w-4 text-primary-foreground" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SelectionCard;
