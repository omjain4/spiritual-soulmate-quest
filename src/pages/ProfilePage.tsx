import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, User, Camera, Edit3, 
  MapPin, Briefcase, GraduationCap, Heart, Sparkles,
  Settings, Users, ChevronRight, Check, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RatingBadge from "@/components/RatingBadge";
import ChauviharWidget from "@/components/ChauviharWidget";
import InterestStamps, { defaultInterestStamps } from "@/components/InterestStamps";
import PromptCard from "@/components/PromptCard";
import PrivacyControls from "@/components/PrivacyControls";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  const profileData = {
    name: user?.name || "User",
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="content-container">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <button onClick={() => navigate(-1)} className="icon-btn">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">My Profile</h1>
          <button onClick={() => navigate("/premium")} className="icon-btn">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-muted p-1.5">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "profile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "settings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === "profile" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Header */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                className="section-card text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative mx-auto w-fit">
                  <div className="h-32 w-32 overflow-hidden rounded-3xl">
                    <img src={profileData.photos[0]} alt={profileData.name} className="h-full w-full object-cover" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-white shadow-lg">
                    <Camera className="h-5 w-5" />
                  </button>
                  {profileData.isVerified && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <h2 className="mt-4 text-2xl font-bold">{profileData.name}, {profileData.age}</h2>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <RatingBadge rating={profileData.jainRating} size="sm" />
                </div>
                
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {profileData.location}
                  </span>
                </div>

                <span className="mt-3 inline-block badge-primary">
                  {profileData.sect}
                </span>

                <motion.button
                  onClick={() => navigate("/onboarding")}
                  className="btn-outline mt-4 w-full flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </motion.button>
              </motion.div>

              {/* Photo Gallery */}
              <motion.div 
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Photos</h3>
                  <button className="text-sm font-medium text-primary">Manage</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {profileData.photos.map((photo, i) => (
                    <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  <button className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Camera className="h-6 w-6" />
                    <span className="mt-1 text-xs">Add</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Spiritual Journey */}
              <motion.div 
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">My Spiritual Journey</h3>
                </div>
                <ChauviharWidget chauviharLevel="moderate" dietaryPreference="strict-jain" />
              </motion.div>

              {/* Interest Stamps */}
              <motion.div 
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">My Interests</h3>
                  <button className="text-sm font-medium text-primary">Edit</button>
                </div>
                <InterestStamps 
                  stamps={defaultInterestStamps.slice(0, 8)} 
                  selectedIds={profileData.interests} 
                  readonly 
                />
              </motion.div>

              {/* Vibe Cards */}
              <motion.div 
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">My Vibe</h3>
                </div>
                <div className="space-y-3">
                  {profileData.prompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt.prompt} answer={prompt.answer} />
                  ))}
                </div>
              </motion.div>

              {/* Education & Career */}
              <motion.div 
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Education & Career</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{profileData.occupation}</p>
                      <p className="text-sm text-muted-foreground">{profileData.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium">{profileData.education}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Privacy Settings */}
            <motion.div 
              className="section-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PrivacyControls />
            </motion.div>

            {/* Settings Toggles */}
            <motion.div 
              className="section-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="mb-4 font-semibold">Account Settings</h3>
              <div className="space-y-3">
                {settingsOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <div className={`flex h-7 w-12 cursor-pointer items-center rounded-full px-1 transition-colors ${option.enabled ? "bg-gradient-primary" : "bg-muted"}`}>
                      <motion.div
                        className="h-5 w-5 rounded-full bg-white shadow-sm"
                        animate={{ x: option.enabled ? 18 : 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              className="section-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-4 font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => navigate("/trust-safety")} className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                      <User className="h-5 w-5" />
                    </div>
                    <span>Trust & Safety</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <button onClick={() => navigate("/family-mode")} className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <span>Family Mode</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <button onClick={() => navigate("/premium")} className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span>Upgrade to Premium</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>

            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-destructive bg-destructive/5 py-4 font-semibold text-destructive transition-colors hover:bg-destructive/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
