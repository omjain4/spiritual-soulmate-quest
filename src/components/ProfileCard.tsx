import { motion } from "framer-motion";
import { Heart, MessageCircle, X, MapPin } from "lucide-react";
import RatingBadge from "./RatingBadge";
import PromptCard from "./PromptCard";

interface ProfileCardProps {
  name: string;
  age: number;
  location: string;
  imageUrl: string;
  rating: number;
  sect: string;
  prompts: { question: string; answer: string }[];
  onLike?: () => void;
  onPass?: () => void;
  onComment?: () => void;
}

const ProfileCard = ({
  name,
  age,
  location,
  imageUrl,
  rating,
  sect,
  prompts,
  onLike,
  onPass,
  onComment,
}: ProfileCardProps) => {
  return (
    <motion.div
      className="profile-card mb-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Rating badge */}
        <div className="absolute right-4 top-4">
          <RatingBadge rating={rating} size="md" />
        </div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {name}, {age}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{location}</span>
              </div>
              <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {sect}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prompts section */}
      <div className="space-y-3 p-4">
        {prompts.map((prompt, index) => (
          <div key={index} className="relative">
            <PromptCard
              prompt={prompt.question}
              answer={prompt.answer}
            />
            <button
              onClick={onComment}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-saffron-light text-primary shadow-sm transition-transform hover:scale-110"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 p-6 pt-2">
        <motion.button
          className="fab-secondary"
          onClick={onPass}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-6 w-6 text-muted-foreground" />
        </motion.button>
        <motion.button
          className="fab-primary"
          onClick={onLike}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className="h-6 w-6 text-white" />
        </motion.button>
        <motion.button
          className="fab-secondary"
          onClick={onComment}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="h-6 w-6 text-muted-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
