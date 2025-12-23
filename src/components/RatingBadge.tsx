import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RatingBadge = ({ rating, size = "md", className }: RatingBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <div className={cn("rating-badge", sizeClasses[size], className)}>
      <Sparkles className={cn("h-3 w-3", size === "lg" && "h-4 w-4")} />
      <span>{rating}%</span>
    </div>
  );
};

export default RatingBadge;
