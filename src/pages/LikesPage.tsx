import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, MessageCircle, Sparkles, Eye, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface LikeProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  rating: number;
  likedAt: string;
  isBlurred: boolean;
}

const mockLikes: LikeProfile[] = [
  {
    id: "1",
    name: "Ananya",
    age: 25,
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    rating: 92,
    likedAt: "2 hours ago",
    isBlurred: false,
  },
  {
    id: "2",
    name: "Kavya",
    age: 24,
    location: "Ahmedabad",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    rating: 88,
    likedAt: "5 hours ago",
    isBlurred: true,
  },
  {
    id: "3",
    name: "Meera",
    age: 26,
    location: "Bangalore",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
    rating: 90,
    likedAt: "1 day ago",
    isBlurred: true,
  },
  {
    id: "4",
    name: "Priya",
    age: 23,
    location: "Delhi",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
    rating: 85,
    likedAt: "2 days ago",
    isBlurred: true,
  },
];

const LikesPage = () => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(mockLikes);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const handleLikeBack = (id: string) => {
    setLikes(likes.filter((l) => l.id !== id));
  };

  const handleReject = (id: string) => {
    setLikes(likes.filter((l) => l.id !== id));
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-primary md:text-4xl">Likes</h1>
          <p className="mt-1 text-muted-foreground">People who are interested in you</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-muted p-1.5">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "received" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Heart className="mr-2 inline h-4 w-4" />
            Received ({likes.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "sent" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sent (12)
          </button>
        </div>

        {/* Premium Banner */}
        <motion.div
          className="mb-6 overflow-hidden rounded-2xl bg-gradient-primary p-5 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Eye className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">See Who Likes You</h3>
              <p className="text-sm text-white/80">Upgrade to Premium to reveal all admirers</p>
            </div>
            <button 
              onClick={() => navigate("/premium")}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary"
            >
              Upgrade
            </button>
          </div>
        </motion.div>

        {/* Likes Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {likes.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-sm"
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className={`h-full w-full object-cover ${profile.isBlurred ? "blur-lg" : ""}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Blurred overlay for premium */}
                  {profile.isBlurred && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                      <Crown className="h-8 w-8 text-white" />
                      <p className="mt-2 text-sm font-medium text-white">Premium Only</p>
                    </div>
                  )}

                  {/* Rating */}
                  {!profile.isBlurred && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gradient-primary px-2 py-1 text-xs font-bold text-white">
                      <Sparkles className="h-3 w-3" />
                      {profile.rating}%
                    </div>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-lg font-bold text-white">
                      {profile.isBlurred ? "???" : `${profile.name}, ${profile.age}`}
                    </h3>
                    <p className="text-xs text-white/80">{profile.isBlurred ? "---" : profile.location}</p>
                    <p className="mt-1 text-xs text-white/60">{profile.likedAt}</p>
                  </div>
                </div>

                {/* Action buttons */}
                {!profile.isBlurred && (
                  <div className="flex border-t border-border">
                    <button
                      onClick={() => handleReject(profile.id)}
                      className="flex flex-1 items-center justify-center gap-1 py-3 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => handleLikeBack(profile.id)}
                      className="flex flex-1 items-center justify-center gap-1 py-3 text-sm text-primary transition-colors hover:bg-rose-light"
                    >
                      <Heart className="h-4 w-4" fill="currentColor" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {likes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Heart className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No likes yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep swiping to get more matches!
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="btn-primary mt-6"
            >
              Start Discovering
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LikesPage;
