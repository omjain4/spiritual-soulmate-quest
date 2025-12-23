import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Filter, LayoutGrid, Layers } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProfileCardSkeleton } from "@/components/SkeletonLoader";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 pt-20 md:pt-32">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-saffron md:text-3xl">Discover</h1>
            <p className="text-sm text-muted-foreground">Find your perfect match</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle - Desktop Only */}
            <div className="hidden rounded-xl bg-muted p-1 md:flex">
              <button
                onClick={() => setViewMode("card")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  viewMode === "card" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Layers className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground">
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
          /* Grid View - Desktop */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer"
              >
                <div className="profile-card overflow-hidden transition-all hover:shadow-glow">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-primary to-saffron-glow px-3 py-1 text-sm font-semibold text-white">
                      {profile.rating}%
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="text-sm text-white/80">{profile.location}</p>
                      <span className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                        {profile.sect}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Card View - Mobile/Swipe Style */
          <div className="mx-auto max-w-md pb-8">
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
