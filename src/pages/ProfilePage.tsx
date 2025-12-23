import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, User, Shield, Eye, Camera, Edit3, 
  MapPin, Briefcase, GraduationCap, Heart, Sparkles,
  Settings, Lock, Users, ChevronRight, Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import RatingBadge from "@/components/RatingBadge";
import ChauviharWidget from "@/components/ChauviharWidget";
import InterestStamps, { defaultInterestStamps } from "@/components/InterestStamps";
import PromptCard from "@/components/PromptCard";
import PrivacyControls from "@/components/PrivacyControls";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("profile");
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  const profileData = {
    name: "Rahul Jain",
    age: 28,
    location: "Mumbai, Maharashtra",
    occupation: "Software Engineer",
    company: "Tech Corp",
    education: "MBA, IIM Ahmedabad",
    sect: "Shwetambar - Murtipujak",
    jainRating: 88,
    isVerified: true,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    ],
    prompts: [
      { id: "1", prompt: "My favorite Jain recipe is...", answer: "Undhiyu - a Gujarati delicacy" },
      { id: "2", prompt: "A value I live by is...", answer: "Ahimsa in thoughts and actions" },
      { id: "3", prompt: "On weekends you'll find me...", answer: "At the temple or hiking with friends" },
    ],
    interests: ["pilgrimage", "meditation", "fitness", "business"],
  };

  const settingsOptions = [
    { id: "incognito", label: "Incognito Mode", description: "Browse without being seen", enabled: false },
    { id: "family", label: "Family Approval Mode", description: "Parents review matches first", enabled: true },
    { id: "notifications", label: "Push Notifications", description: "Get notified of new matches", enabled: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Navbar />
      
      <div className="mx-auto max-w-4xl px-4 pt-20 md:pt-32">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">My Profile</h1>
          <button onClick={() => navigate("/premium")} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-xl bg-muted p-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === "profile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === "settings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === "profile" ? (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <GlassCard elevated>
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                {/* Photo */}
                <div className="relative">
                  <div className="h-32 w-32 overflow-hidden rounded-2xl">
                    <img src={profileData.photos[0]} alt={profileData.name} className="h-full w-full object-cover" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Camera className="h-5 w-5" />
                  </button>
                  {profileData.isVerified && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-sage text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center gap-3 md:justify-start">
                    <h2 className="text-2xl font-bold">{profileData.name}, {profileData.age}</h2>
                    <RatingBadge rating={profileData.jainRating} size="sm" />
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:justify-start">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {profileData.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" /> {profileData.occupation}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="rounded-full bg-saffron-light px-3 py-1 text-sm font-medium text-primary">
                      {profileData.sect}
                    </span>
                  </div>

                  <motion.button
                    onClick={() => navigate("/onboarding")}
                    className="btn-sage mt-4 flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </motion.button>
                </div>
              </div>
            </GlassCard>

            {/* Photo Gallery */}
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Photos</h3>
                <button className="text-sm text-primary">Manage</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {profileData.photos.map((photo, i) => (
                  <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                <button className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                  <Camera className="h-6 w-6" />
                  <span className="mt-1 text-xs">Add Photo</span>
                </button>
              </div>
            </GlassCard>

            {/* Spiritual Journey */}
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">My Spiritual Journey</h3>
              </div>
              <ChauviharWidget chauviharLevel="moderate" dietaryPreference="strict-jain" />
            </GlassCard>

            {/* Interest Stamps */}
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">My Interests</h3>
                <button className="text-sm text-primary">Edit</button>
              </div>
              <InterestStamps 
                stamps={defaultInterestStamps.slice(0, 8)} 
                selectedIds={profileData.interests} 
                readonly 
              />
            </GlassCard>

            {/* Vibe Cards */}
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">My Vibe</h3>
              </div>
              <div className="space-y-3">
                {profileData.prompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt.prompt} answer={prompt.answer} />
                ))}
              </div>
            </GlassCard>

            {/* Education & Career */}
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Education & Career</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{profileData.occupation}</p>
                    <p className="text-sm text-muted-foreground">{profileData.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{profileData.education}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visibility Settings */}
            <GlassCard>
              <PrivacyControls />
            </GlassCard>

            {/* Settings Toggles */}
            <GlassCard>
              <h3 className="mb-4 font-semibold">Account Settings</h3>
              <div className="space-y-3">
                {settingsOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <div className={`h-6 w-11 rounded-full ${option.enabled ? "bg-primary" : "bg-muted"}`}>
                      <motion.div
                        className="h-5 w-5 rounded-full bg-white shadow-sm"
                        animate={{ x: option.enabled ? 22 : 2 }}
                        style={{ marginTop: 2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Quick Links */}
            <GlassCard>
              <h3 className="mb-4 font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => navigate("/trust-safety")} className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-sage" />
                    <span>Trust & Safety</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <button onClick={() => navigate("/family-mode")} className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Family Mode</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <button onClick={() => navigate("/premium")} className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>Upgrade to Premium</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav activeId={activeNav} onNavigate={(id) => { setActiveNav(id); navigate(`/${id === "home" ? "" : id}`); }} />
      </div>
    </div>
  );
};

export default ProfilePage;
