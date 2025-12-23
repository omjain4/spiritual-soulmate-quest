import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "badge" | "image";
}

const SkeletonLoader = ({ className, variant = "text" }: SkeletonLoaderProps) => {
  const baseClass = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-lg";
  
  const variants = {
    text: "h-4 w-full",
    card: "h-48 w-full rounded-2xl",
    avatar: "h-16 w-16 rounded-full",
    badge: "h-6 w-20 rounded-full",
    image: "aspect-[3/4] w-full rounded-3xl",
  };

  return <div className={cn(baseClass, variants[variant], className)} />;
};

export const ProfileCardSkeleton = () => (
  <div className="profile-card mb-6 overflow-hidden">
    <SkeletonLoader variant="image" />
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader className="h-6 w-32" />
        <SkeletonLoader variant="badge" />
      </div>
      <SkeletonLoader className="h-4 w-48" />
      <div className="space-y-2 rounded-xl bg-muted/30 p-4">
        <SkeletonLoader className="h-3 w-24" />
        <SkeletonLoader className="h-5 w-full" />
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
