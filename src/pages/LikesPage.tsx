import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles, Eye, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Your Admirers</span>
          <h1 className="mt-2 font-serif text-4xl font-light text-foreground md:text-5xl">
            People who <span className="italic text-primary">like</span> you
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-full bg-muted p-1">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all ${
              activeTab === "received" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Heart className="h-4 w-4" />
            Received ({likes.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
              activeTab === "sent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sent (12)
          </button>
        </div>

        {/* Premium Banner */}
        <motion.div
          className="mb-10 overflow-hidden rounded-2xl bg-foreground p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">See Who Likes You</h3>
                <p className="text-white/60">Upgrade to Premium to reveal all admirers</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/premium")}
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground transition-all hover:scale-105"
            >
              Upgrade Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* Likes Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {likes.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl bg-card"
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${profile.isBlurred ? "blur-lg scale-110" : ""}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Blurred overlay for premium */}
                  {profile.isBlurred && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                        <Crown className="mx-auto h-8 w-8 text-white" />
                        <p className="mt-2 text-sm font-medium text-white">Premium Only</p>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  {!profile.isBlurred && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                      <Sparkles className="h-3 w-3" />
                      {profile.rating}%
                    </div>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-medium text-white">
                      {profile.isBlurred ? "???" : `${profile.name}, ${profile.age}`}
                    </h3>
                    <p className="text-sm text-white/70">{profile.isBlurred ? "---" : profile.location}</p>
                    <p className="mt-1 text-xs text-white/50">{profile.likedAt}</p>
                  </div>
                </div>

                {/* Action buttons */}
                {!profile.isBlurred && (
                  <div className="flex border-t border-border">
                    <button
                      onClick={() => handleReject(profile.id)}
                      className="flex flex-1 items-center justify-center gap-1 py-4 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => handleLikeBack(profile.id)}
                      className="flex flex-1 items-center justify-center gap-1 py-4 text-primary transition-colors hover:bg-primary/5"
                    >
                      <Heart className="h-5 w-5" fill="currentColor" />
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
            className="py-20 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-6 font-serif text-2xl font-light">No likes yet</h3>
            <p className="mt-2 text-muted-foreground">
              Keep swiping to get more matches!
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 font-medium text-background transition-all hover:opacity-90"
            >
              Start Discovering
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LikesPage;