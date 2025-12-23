import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Filter, LayoutGrid, Layers, Heart, X, MessageCircle, Sparkles } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProfileCardSkeleton } from "@/components/SkeletonLoader";

const mockProfiles = [
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
];

const DiscoverPage = () => {
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [isLoading, setIsLoading] = useState(false);

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
          <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "mx-auto max-w-md"}>
            {[1, 2, 3].map((i) => (
              <ProfileCardSkeleton key={i} />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockProfiles.map((profile, index) => (
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
                    
                    {/* Rating Badge */}
                    <div className="absolute right-4 top-4">
                      <div className="flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1.5 text-sm font-bold text-white shadow-glow">
                        <Sparkles className="h-3.5 w-3.5" />
                        {profile.rating}%
                      </div>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-2xl font-bold text-white">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="mt-1 text-sm text-white/80">{profile.location}</p>
                      <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {profile.sect}
                      </span>
                    </div>

                    {/* Action Buttons */}
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
          /* Card View */
          <div className="mx-auto max-w-md space-y-6">
            {mockProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProfileCard
                  name={profile.name}
                  age={profile.age}
                  location={profile.location}
                  imageUrl={profile.imageUrl}
                  rating={profile.rating}
                  sect={profile.sect}
                  prompts={profile.prompts}
                  onLike={() => console.log("Liked", profile.name)}
                  onPass={() => console.log("Passed", profile.name)}
                  onComment={() => console.log("Comment on", profile.name)}
                />
              </motion.div>
            ))}
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
