import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Filter } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import BottomNav from "@/components/BottomNav";
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
];

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("discover");

  const handleNavigate = (id: string) => {
    setActiveNav(id);
    if (id === "profile") {
      navigate("/premium");
    }
  };

  return (
    <div className="app-container relative min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-gradient-saffron">Discover</h1>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground">
              <Filter className="h-5 w-5" />
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="px-4">
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

      {/* Bottom Navigation */}
      <BottomNav activeId={activeNav} onNavigate={handleNavigate} />
    </div>
  );
};

export default DiscoverPage;
