import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Calendar, ExternalLink } from "lucide-react";

interface DateIdea {
  id: string;
  title: string;
  type: "restaurant" | "event" | "activity";
  image: string;
  location: string;
  date?: string;
  description: string;
  jainFriendly: boolean;
}

interface DateIdeasCarouselProps {
  ideas: DateIdea[];
}

const DateIdeasCarousel = ({ ideas }: DateIdeasCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ideas.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ideas.length) % ideas.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Jain-Friendly Date Ideas</h3>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {ideas.map((idea) => (
            <motion.div
              key={idea.id}
              className="w-full flex-shrink-0"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <img
                  src={idea.image}
                  alt={idea.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Jain Friendly Badge */}
                {idea.jainFriendly && (
                  <div className="absolute right-3 top-3 rounded-full bg-sage px-3 py-1 text-xs font-medium text-white">
                    🌱 Jain Friendly
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                    {idea.type === "restaurant" && "🍽️ Restaurant"}
                    {idea.type === "event" && "🎉 Event"}
                    {idea.type === "activity" && "🎯 Activity"}
                  </span>
                  <h4 className="text-lg font-semibold text-white">{idea.title}</h4>
                  <p className="mt-1 text-sm text-white/80">{idea.description}</p>
                  
                  <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {idea.location}
                    </span>
                    {idea.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {idea.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2">
        {ideas.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-6 bg-primary"
                : "bg-muted hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* View All */}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted py-3 text-sm font-medium transition-colors hover:bg-muted/80">
        View All Date Ideas
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  );
};

// Default date ideas
export const defaultDateIdeas: DateIdea[] = [
  {
    id: "1",
    title: "Jain Rasoi - Pure Veg Restaurant",
    type: "restaurant",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    location: "Mumbai, Maharashtra",
    description: "Authentic Jain cuisine with no onion, garlic, or root vegetables",
    jainFriendly: true,
  },
  {
    id: "2",
    title: "Paryushan Mahotsav 2025",
    type: "event",
    image: "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=600&h=400&fit=crop",
    location: "Palitana, Gujarat",
    date: "Aug 25 - Sep 2",
    description: "Join the grand celebration of Paryushan at Palitana",
    jainFriendly: true,
  },
  {
    id: "3",
    title: "Temple Walk & Darshan",
    type: "activity",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop",
    location: "Ranakpur, Rajasthan",
    description: "Experience the architectural marvel of Ranakpur Jain Temple",
    jainFriendly: true,
  },
];

export default DateIdeasCarousel;
