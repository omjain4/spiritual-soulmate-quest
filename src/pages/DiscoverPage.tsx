import { useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Filter, LayoutGrid, Layers, Heart, X, MessageCircle, Sparkles, Bookmark, RotateCcw } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProfileCardSkeleton } from "@/components/SkeletonLoader";
import { useToast } from "@/hooks/use-toast";

const initialProfiles = [
  {
    id: 1,
    name: "Priya",
    age: 25,
    location: "Mumbai, Maharashtra",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    rating: 92,
    sect: "Shwetambar - Murtipujak",
    prompts: [
      { question: "My favorite Tirth is...", answer: "Palitana - the serenity there is unmatched! 🛕" },
      { question: "On Sundays, I usually...", answer: "Temple in the morning, family lunch, and reading in the evening" },
    ],
  },
  {
    id: 2,
    name: "Ananya",
    age: 27,
    location: "Ahmedabad, Gujarat",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    rating: 88,
    sect: "Digambar",
    prompts: [
      { question: "A value I hold dear is...", answer: "Ahimsa - in thoughts, words, and actions 🙏" },
      { question: "I'm looking for someone who...", answer: "Values tradition but embraces modern thinking" },
    ],
  },
  {
    id: 3,
    name: "Kavya",
    age: 24,
    location: "Bangalore, Karnataka",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
    rating: 85,
    sect: "Shwetambar - Sthanakvasi",
    prompts: [
      { question: "My favorite Tirth is...", answer: "Shikharji - the ultimate pilgrimage destination ✨" },
      { question: "On Sundays, I usually...", answer: "Pratikraman followed by cooking Jain food with family" },
    ],
  },
  {
    id: 4,
    name: "Meera",
    age: 26,
    location: "Jaipur, Rajasthan",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    rating: 90,
    sect: "Shwetambar - Terapanthi",
    prompts: [
      { question: "A value I hold dear is...", answer: "Aparigraha - living simply and mindfully" },
      { question: "On weekends you'll find me...", answer: "At meditation camps or volunteering" },
    ],
  },
  {
    id: 5,
    name: "Neha",
    age: 25,
    location: "Pune, Maharashtra",
    imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
    rating: 87,
    sect: "Shwetambar - Murtipujak",
    prompts: [
      { question: "My favorite Tirth is...", answer: "Ranakpur temples for their architecture 🏛️" },
      { question: "A value I hold dear is...", answer: "Compassion towards all living beings" },
    ],
  },
];

const DiscoverPage = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<number[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = useCallback((swipeDirection: "left" | "right") => {
    if (!currentProfile) return;
    
    setDirection(swipeDirection);
    
    if (swipeDirection === "right") {
      setLikedProfiles((prev) => [...prev, currentProfile.id]);
      toast({
        title: `You liked ${currentProfile.name}! ❤️`,
        description: "We'll let them know you're interested.",
      });
    }
    
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  }, [currentProfile, toast]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe("right");
    } else if (info.offset.x < -threshold) {
      handleSwipe("left");
    }
  };

  const handleSave = () => {
    if (!currentProfile) return;
    setSavedProfiles((prev) => [...prev, currentProfile.id]);
    toast({
      title: "Profile saved! 🔖",
      description: `${currentProfile.name} has been added to your saved profiles.`,
    });
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setLikedProfiles((prev) => prev.filter((id) => id !== profiles[currentIndex - 1].id));
    }
  };

  const cardVariants = {
    enter: { x: 300, opacity: 0, scale: 0.9 },
    center: { x: 0, opacity: 1, scale: 1 },
    exitLeft: { x: -300, opacity: 0, scale: 0.9, rotate: -10 },
    exitRight: { x: 300, opacity: 0, scale: 0.9, rotate: 10 },
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-container">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary md:text-4xl">Discover</h1>
            <p className="mt-1 text-muted-foreground">Find your perfect match</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle - Desktop Only */}
            <div className="hidden rounded-2xl bg-muted p-1.5 md:flex">
              <button
                onClick={() => setViewMode("card")}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  viewMode === "card" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Layers className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
            <button className="icon-btn">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="mx-auto max-w-md">
            <ProfileCardSkeleton />
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer group"
              >
                <div className="profile-card overflow-hidden transition-all group-hover:shadow-glow">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute right-4 top-4">
                      <div className="flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1.5 text-sm font-bold text-white shadow-glow">
                        <Sparkles className="h-3.5 w-3.5" />
                        {profile.rating}%
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-2xl font-bold text-white">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="mt-1 text-sm text-white/80">{profile.location}</p>
                      <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {profile.sect}
                      </span>
                    </div>

                    <div className="absolute bottom-5 right-5 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-lg transition-transform hover:scale-110">
                        <X className="h-5 w-5" />
                      </button>
                      <button className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow transition-transform hover:scale-110">
                        <Heart className="h-5 w-5" fill="white" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Swipe Card View */
          <div className="mx-auto max-w-md">
            <div className="relative h-[600px] md:h-[650px]">
              <AnimatePresence mode="wait">
                {currentProfile ? (
                  <motion.div
                    key={currentProfile.id}
                    className="absolute inset-0"
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit={direction === "left" ? "exitLeft" : "exitRight"}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ cursor: "grabbing" }}
                  >
                    <div className="profile-card h-full overflow-hidden">
                      <div className="relative h-full">
                        <img
                          src={currentProfile.imageUrl}
                          alt={currentProfile.name}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Swipe indicators */}
                        <motion.div
                          className="absolute left-4 top-4 rounded-xl bg-red-500 px-4 py-2 text-lg font-bold text-white opacity-0"
                          style={{ opacity: direction === "left" ? 1 : 0 }}
                        >
                          NOPE
                        </motion.div>
                        <motion.div
                          className="absolute right-4 top-4 rounded-xl bg-green-500 px-4 py-2 text-lg font-bold text-white opacity-0"
                          style={{ opacity: direction === "right" ? 1 : 0 }}
                        >
                          LIKE
                        </motion.div>

                        {/* Rating Badge */}
                        <div className="absolute right-4 top-4">
                          <div className="flex items-center gap-1 rounded-full bg-gradient-primary px-4 py-2 text-sm font-bold text-white shadow-glow">
                            <Sparkles className="h-4 w-4" />
                            {currentProfile.rating}% Match
                          </div>
                        </div>

                        {/* Profile Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h2 className="text-3xl font-bold text-white">
                            {currentProfile.name}, {currentProfile.age}
                          </h2>
                          <p className="mt-1 text-white/80">{currentProfile.location}</p>
                          <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                            {currentProfile.sect}
                          </span>

                          {/* Prompts */}
                          <div className="mt-4 space-y-2">
                            {currentProfile.prompts.slice(0, 1).map((prompt, idx) => (
                              <div key={idx} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                                <p className="text-xs text-white/70">{prompt.question}</p>
                                <p className="mt-1 text-sm text-white">{prompt.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full flex-col items-center justify-center text-center"
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                      <Heart className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold">No more profiles</h3>
                    <p className="mt-2 text-muted-foreground">Check back later for more matches!</p>
                    <button
                      onClick={() => {
                        setProfiles(initialProfiles);
                        setCurrentIndex(0);
                        setLikedProfiles([]);
                      }}
                      className="btn-primary mt-6"
                    >
                      Start Over
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            {currentProfile && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <motion.button
                  onClick={handleUndo}
                  disabled={currentIndex === 0}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-muted/80 disabled:opacity-30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RotateCcw className="h-5 w-5" />
                </motion.button>

                <motion.button
                  onClick={() => handleSwipe("left")}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-500 shadow-lg transition-all hover:bg-red-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-8 w-8" />
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-blue-500 transition-all hover:bg-blue-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bookmark className="h-5 w-5" />
                </motion.button>

                <motion.button
                  onClick={() => handleSwipe("right")}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className="h-8 w-8" fill="white" />
                </motion.button>

                <motion.button
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-purple-500 transition-all hover:bg-purple-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle className="h-5 w-5" />
                </motion.button>
              </div>
            )}

            {/* Progress indicator */}
            {currentProfile && (
              <div className="mt-4 flex justify-center gap-1">
                {profiles.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 w-8 rounded-full transition-colors ${
                      idx < currentIndex
                        ? "bg-primary"
                        : idx === currentIndex
                        ? "bg-primary/50"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Desktop Only */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default DiscoverPage;
