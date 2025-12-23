import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, User, Camera, Edit3, Save, X,
  MapPin, Briefcase, GraduationCap, Heart, Sparkles,
  Settings, Users, ChevronRight, Check, LogOut, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RatingBadge from "@/components/RatingBadge";
import ChauviharWidget from "@/components/ChauviharWidget";
import InterestStamps, { defaultInterestStamps } from "@/components/InterestStamps";
import PromptCard from "@/components/PromptCard";
import PrivacyControls from "@/components/PrivacyControls";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [tempPromptAnswer, setTempPromptAnswer] = useState("");

  const [profileData, setProfileData] = useState({
    name: user?.name || "User",
    firstName: user?.name?.split(" ")[0] || "User",
    lastName: user?.name?.split(" ")[1] || "",
    age: 28,
    birthDate: "1996-05-15",
    gender: "male",
    location: "Mumbai, Maharashtra",
    occupation: "Software Engineer",
    company: "Tech Corp",
    education: "MBA, IIM Ahmedabad",
    sect: "shwetambar-murtipujak",
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
  });

  const [editForm, setEditForm] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    birthDate: profileData.birthDate,
    gender: profileData.gender,
    location: profileData.location,
    occupation: profileData.occupation,
    company: profileData.company,
    education: profileData.education,
    sect: profileData.sect,
  });

  const sects = [
    { id: "digambar", title: "Digambar" },
    { id: "shwetambar-sthanakvasi", title: "Shwetambar - Sthanakvasi" },
    { id: "shwetambar-murtipujak", title: "Shwetambar - Murtipujak" },
    { id: "shwetambar-terapanthi", title: "Shwetambar - Terapanthi" },
  ];

  const settingsOptions = [
    { id: "incognito", label: "Incognito Mode", description: "Browse without being seen", enabled: false },
    { id: "family", label: "Family Approval Mode", description: "Parents review matches first", enabled: true },
    { id: "notifications", label: "Push Notifications", description: "Get notified of new matches", enabled: true },
  ];

  const handleSaveProfile = () => {
    setProfileData({
      ...profileData,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      name: `${editForm.firstName} ${editForm.lastName}`,
      birthDate: editForm.birthDate,
      gender: editForm.gender,
      location: editForm.location,
      occupation: editForm.occupation,
      company: editForm.company,
      education: editForm.education,
      sect: editForm.sect,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      birthDate: profileData.birthDate,
      gender: profileData.gender,
      location: profileData.location,
      occupation: profileData.occupation,
      company: profileData.company,
      education: profileData.education,
      sect: profileData.sect,
    });
    setIsEditing(false);
  };

  const handlePromptEdit = (promptId: string) => {
    const prompt = profileData.prompts.find(p => p.id === promptId);
    if (prompt) {
      setEditingPrompt(promptId);
      setTempPromptAnswer(prompt.answer);
    }
  };

  const handlePromptSave = () => {
    if (editingPrompt) {
      setProfileData({
        ...profileData,
        prompts: profileData.prompts.map(p => 
          p.id === editingPrompt ? { ...p, answer: tempPromptAnswer } : p
        ),
      });
      setEditingPrompt(null);
      setTempPromptAnswer("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getSectTitle = (sectId: string) => {
    return sects.find(s => s.id === sectId)?.title || sectId;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Your Profile</span>
            <h1 className="mt-2 font-serif text-4xl font-light text-foreground md:text-5xl">
              {profileData.firstName} {profileData.lastName}
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="mb-10 flex gap-1 rounded-full bg-muted p-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
              activeTab === "profile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
              activeTab === "settings" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === "profile" ? (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Header */}
            <div className="space-y-6 lg:col-span-1">
              <motion.div 
                className="rounded-2xl border border-border bg-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative mx-auto w-fit">
                  <div className="h-32 w-32 overflow-hidden rounded-3xl">
                    <img src={profileData.photos[0]} alt={profileData.name} className="h-full w-full object-cover" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105">
                    <Camera className="h-5 w-5" />
                  </button>
                  {profileData.isVerified && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <h2 className="mt-6 font-serif text-2xl font-light">{profileData.firstName} {profileData.lastName}, {profileData.age}</h2>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <RatingBadge rating={profileData.jainRating} size="sm" />
                </div>
                
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {profileData.location}
                  </span>
                </div>

                <span className="mt-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {getSectTitle(profileData.sect)}
                </span>

                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium transition-colors hover:bg-muted"
                  whileHover={{ scale: 1.01 }}
                >
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </motion.button>
              </motion.div>

              {/* Photo Gallery */}
              <motion.div 
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">Photos</h3>
                  <button className="text-sm font-medium text-primary">Manage</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {profileData.photos.map((photo, i) => (
                    <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  <button className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                    <Camera className="h-6 w-6" />
                    <span className="mt-1 text-xs">Add</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6 lg:col-span-2">
              {/* Spiritual Journey */}
              <motion.div 
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">My Spiritual Journey</h3>
                </div>
                <ChauviharWidget chauviharLevel="moderate" dietaryPreference="strict-jain" />
              </motion.div>

              {/* Interest Stamps */}
              <motion.div 
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">My Interests</h3>
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
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">My Vibe</h3>
                </div>
                <div className="space-y-3">
                  {profileData.prompts.map((prompt) => (
                    <PromptCard 
                      key={prompt.id} 
                      prompt={prompt.prompt} 
                      answer={prompt.answer}
                      onEdit={() => handlePromptEdit(prompt.id)}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Education & Career */}
              <motion.div 
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Education & Career</h3>
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
              className="rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PrivacyControls />
            </motion.div>

            {/* Settings Toggles */}
            <motion.div 
              className="rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="mb-4 font-medium">Account Settings</h3>
              <div className="space-y-3">
                {settingsOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <div className={`flex h-7 w-12 cursor-pointer items-center rounded-full px-1 transition-colors ${option.enabled ? "bg-foreground" : "bg-muted"}`}>
                      <motion.div
                        className={`h-5 w-5 rounded-full shadow-sm ${option.enabled ? "bg-background" : "bg-muted-foreground"}`}
                        animate={{ x: option.enabled ? 18 : 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              className="rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-4 font-medium">Quick Actions</h3>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
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
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-destructive py-4 font-medium text-destructive transition-colors hover:bg-destructive/5"
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

      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  First Name
                </Label>
                <Input
                  id="edit-firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Gender
              </Label>
              <Select
                value={editForm.gender}
                onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date of Birth
              </Label>
              <Input
                id="edit-birthDate"
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-occupation" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Occupation
              </Label>
              <Input
                id="edit-occupation"
                value={editForm.occupation}
                onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                value={editForm.company}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-education" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Education
              </Label>
              <Input
                id="edit-education"
                value={editForm.education}
                onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Sect
              </Label>
              <Select
                value={editForm.sect}
                onValueChange={(value) => setEditForm({ ...editForm, sect: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sect" />
                </SelectTrigger>
                <SelectContent>
                  {sects.map((sect) => (
                    <SelectItem key={sect.id} value={sect.id}>{sect.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCancelEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3 font-medium text-background transition-colors hover:opacity-90"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Modal */}
      <Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium text-foreground">
              {profileData.prompts.find(p => p.id === editingPrompt)?.prompt}
            </p>
            <textarea
              value={tempPromptAnswer}
              onChange={(e) => setTempPromptAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="min-h-24 w-full resize-none rounded-xl border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditingPrompt(null)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handlePromptSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3 font-medium text-background transition-colors hover:opacity-90"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProfilePage;
