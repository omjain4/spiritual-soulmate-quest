import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, ThumbsUp, ThumbsDown, MessageSquare, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import PrivacyControls from "@/components/PrivacyControls";
import BottomNav from "@/components/BottomNav";

const mockShortlist = [
  { id: "1", name: "Priya Shah", age: 25, location: "Mumbai", suggestedBy: "Mom", votes: { up: 2, down: 0 }, comment: "Good education, let's talk" },
  { id: "2", name: "Ananya Jain", age: 24, location: "Ahmedabad", suggestedBy: "Dad", votes: { up: 1, down: 1 }, comment: "" },
];

const FamilyModePage = () => {
  const navigate = useNavigate();
  const [isFamilyView, setIsFamilyView] = useState(true);
  const [activeNav, setActiveNav] = useState("home");

  return (
    <div className="app-container min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/80 p-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Family Mode</h1>
          </div>
          <button
            onClick={() => setIsFamilyView(!isFamilyView)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isFamilyView ? "bg-sage-light text-sage-dark" : "bg-muted text-muted-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            {isFamilyView ? "Family View" : "Personal"}
          </button>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Privacy Controls */}
        <PrivacyControls onSave={(settings) => console.log("Saved:", settings)} />

        {/* Shared Shortlist */}
        <GlassCard elevated>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Shared Shortlist</h3>
            <span className="rounded-full bg-saffron-light px-2 py-1 text-xs font-medium text-primary">
              {mockShortlist.length} profiles
            </span>
          </div>

          <div className="space-y-3">
            {mockShortlist.map((profile) => (
              <motion.div key={profile.id} className="rounded-xl border border-border bg-card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{profile.name}, {profile.age}</p>
                    <p className="text-xs text-muted-foreground">{profile.location}</p>
                    <p className="mt-1 text-xs text-sage-dark">Suggested by {profile.suggestedBy}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light text-sage-dark">
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {profile.comment && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 p-2">
                    <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">"{profile.comment}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      <BottomNav activeId={activeNav} onNavigate={(id) => { setActiveNav(id); if (id === "discover") navigate("/discover"); }} />
    </div>
  );
};

export default FamilyModePage;
