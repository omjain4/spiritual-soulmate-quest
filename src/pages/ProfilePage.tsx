import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, User, Camera, Edit3, Save, X,
  MapPin, Briefcase, GraduationCap, Heart, Sparkles,
  Settings, Users, ChevronRight, Check, LogOut, Calendar, AlertCircle, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RatingBadge from "@/components/RatingBadge";
import ChauviharWidget from "@/components/ChauviharWidget";
import InterestStamps, { defaultInterestStamps } from "@/components/InterestStamps";
import PromptCard from "@/components/PromptCard";
import PrivacyControls from "@/components/PrivacyControls";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotoUploadStep from "@/components/PhotoUploadStep";
import { useAuth } from "@/contexts/AuthContext";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { profileEditSchema, ProfileEditFormData } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type FieldErrors = Partial<Record<keyof ProfileEditFormData, string>>;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { uploadPhoto, uploading, updateProfilePhotos, setMainPhoto } = usePhotoUpload();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPhotos, setIsEditingPhotos] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [tempPromptAnswer, setTempPromptAnswer] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Local state from profile
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [prompts, setPrompts] = useState<{id: string; prompt: string; answer: string}[]>([]);

  useEffect(() => {
    if (profile) {
      setPhotos(profile.photos || []);
      setMainPhotoIndex(profile.main_photo_index || 0);
      const profilePrompts = Array.isArray(profile.prompts) ? profile.prompts : [];
      setPrompts(profilePrompts.map((p: any, i: number) => ({
        id: String(i),
        prompt: p.question || "",
        answer: p.answer || ""
      })));
    }
  }, [profile]);

  const sects = [
    { id: "digambar", title: "Digambar" },
    { id: "shwetambar-sthanakvasi", title: "Shwetambar - Sthanakvasi" },
    { id: "shwetambar-murtipujak", title: "Shwetambar - Murtipujak" },
    { id: "shwetambar-terapanthi", title: "Shwetambar - Terapanthi" },
  ];

  const nameParts = profile?.name?.split(" ") || ["", ""];
  const [editForm, setEditForm] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    birthDate: profile?.date_of_birth || "",
    gender: profile?.gender || "",
    location: profile?.location || "",
    occupation: profile?.occupation || "",
    company: "",
    education: profile?.education || "",
    sect: profile?.sect || "",
  });

  useEffect(() => {
    if (profile) {
      const parts = profile.name?.split(" ") || ["", ""];
      setEditForm({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        birthDate: profile.date_of_birth || "",
        gender: profile.gender || "",
        location: profile.location || "",
        occupation: profile.occupation || "",
        company: "",
        education: profile.education || "",
        sect: profile.sect || "",
      });
    }
  }, [profile]);

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = (): boolean => {
    try {
      profileEditSchema.parse(editForm);
      setFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: FieldErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ProfileEditFormData;
          errors[field] = err.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleInputChange = (field: keyof ProfileEditFormData, value: string) => {
    setEditForm({ ...editForm, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm() || !user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: `${editForm.firstName} ${editForm.lastName}`.trim(),
          date_of_birth: editForm.birthDate,
          gender: editForm.gender,
          location: editForm.location,
          occupation: editForm.occupation,
          education: editForm.education,
          sect: editForm.sect,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      const parts = profile.name?.split(" ") || ["", ""];
      setEditForm({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        birthDate: profile.date_of_birth || "",
        gender: profile.gender || "",
        location: profile.location || "",
        occupation: profile.occupation || "",
        company: "",
        education: profile.education || "",
        sect: profile.sect || "",
      });
    }
    setIsEditing(false);
    setFieldErrors({});
  };

  const handlePromptEdit = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      setEditingPrompt(promptId);
      setTempPromptAnswer(prompt.answer);
    }
  };

  const handlePromptSave = async () => {
    if (!editingPrompt || !user) return;
    
    const updatedPrompts = prompts.map(p => 
      p.id === editingPrompt ? { ...p, answer: tempPromptAnswer } : p
    );
    setPrompts(updatedPrompts);
    
    try {
      await supabase
        .from('profiles')
        .update({
          prompts: updatedPrompts.map(p => ({ question: p.prompt, answer: p.answer }))
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
    
    setEditingPrompt(null);
    setTempPromptAnswer("");
  };

  const handlePhotosChange = async (newPhotos: string[]) => {
    setPhotos(newPhotos);
    await updateProfilePhotos(newPhotos);
  };

  const handleMainPhotoChange = async (index: number) => {
    setMainPhotoIndex(index);
    await setMainPhoto(index);
  };

  const handlePhotoUpload = async (file: Blob): Promise<string | null> => {
    return await uploadPhoto(file, 'profile.jpg');
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getSectTitle = (sectId: string) => {
    return sects.find(s => s.id === sectId)?.title || sectId;
  };

  const renderFieldError = (field: keyof ProfileEditFormData) => {
    if (!fieldErrors[field]) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 flex items-center gap-1 text-xs text-destructive"
      >
        <AlertCircle className="h-3 w-3" />
        {fieldErrors[field]}
      </motion.p>
    );
  };

  const mainPhoto = photos[mainPhotoIndex] || photos[0] || '/placeholder.svg';
  const age = calculateAge(profile?.date_of_birth);

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
              {profile?.name || "User"}
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
                    <img src={mainPhoto} alt={profile?.name} className="h-full w-full object-cover" />
                  </div>
                  <button 
                    onClick={() => setIsEditingPhotos(true)}
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  {profile?.is_verified && (
                    <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <h2 className="mt-6 font-serif text-2xl font-light">{profile?.name}{age && `, ${age}`}</h2>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <RatingBadge rating={profile?.jain_rating || 0} size="sm" />
                </div>
                
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {profile.location}
                    </span>
                  )}
                </div>

                {profile?.sect && (
                  <span className="mt-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    {getSectTitle(profile.sect)}
                  </span>
                )}

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
                  <button 
                    onClick={() => setIsEditingPhotos(true)}
                    className="text-sm font-medium text-primary"
                  >
                    Manage
                  </button>
                </div>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.slice(0, 3).map((photo, i) => (
                      <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <button 
                        onClick={() => setIsEditingPhotos(true)}
                        className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="mt-1 text-xs">Add</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingPhotos(true)}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <Camera className="h-8 w-8" />
                    <span className="mt-2 text-sm">Add photos to your profile</span>
                  </button>
                )}
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
                <ChauviharWidget 
                  chauviharLevel={profile?.chauvihar_level || "moderate"} 
                  dietaryPreference={profile?.dietary_preference || "vegetarian"} 
                />
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
                  selectedIds={profile?.interests || []} 
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
                {prompts.length > 0 ? (
                  <div className="space-y-3">
                    {prompts.map((prompt) => (
                      <PromptCard 
                        key={prompt.id} 
                        prompt={prompt.prompt} 
                        answer={prompt.answer}
                        onEdit={() => handlePromptEdit(prompt.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No prompts added yet. Complete onboarding to add prompts.
                  </p>
                )}
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
                  {profile?.occupation && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">{profile.occupation}</p>
                    </div>
                  )}
                  {profile?.education && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">{profile.education}</p>
                    </div>
                  )}
                  {!profile?.occupation && !profile?.education && (
                    <p className="text-center text-muted-foreground py-4">
                      No education or career info added yet.
                    </p>
                  )}
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
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Privacy Controls</h3>
              </div>
              <PrivacyControls />
            </motion.div>

            {/* Account Actions */}
            <motion.div 
              className="rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive py-3 text-destructive transition-colors hover:bg-destructive/5"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`rounded-xl ${fieldErrors.firstName ? "border-destructive" : ""}`}
                />
                {renderFieldError("firstName")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`rounded-xl ${fieldErrors.lastName ? "border-destructive" : ""}`}
                />
                {renderFieldError("lastName")}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={editForm.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth</Label>
              <Input
                id="birthDate"
                type="date"
                value={editForm.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                className="rounded-xl"
              />
              {renderFieldError("birthDate")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={editForm.occupation}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={editForm.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Sect</Label>
              <Select value={editForm.sect} onValueChange={(value) => handleInputChange("sect", value)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select sect" />
                </SelectTrigger>
                <SelectContent>
                  {sects.map((sect) => (
                    <SelectItem key={sect.id} value={sect.id}>{sect.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3 font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Photos Dialog */}
      <Dialog open={isEditingPhotos} onOpenChange={setIsEditingPhotos}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage Photos</DialogTitle>
          </DialogHeader>

          <PhotoUploadStep
            photos={photos}
            mainPhotoIndex={mainPhotoIndex}
            onPhotosChange={handlePhotosChange}
            onMainPhotoChange={handleMainPhotoChange}
            maxPhotos={6}
            uploading={uploading}
            onUploadPhoto={handlePhotoUpload}
          />
        </DialogContent>
      </Dialog>

      {/* Prompt Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {prompts.find(p => p.id === editingPrompt)?.prompt}
            </p>
            <textarea
              value={tempPromptAnswer}
              onChange={(e) => setTempPromptAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              rows={4}
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingPrompt(null)} className="flex-1 rounded-full border border-border py-2 text-sm hover:bg-muted">Cancel</button>
              <button onClick={handlePromptSave} className="flex-1 rounded-full bg-foreground py-2 text-sm text-background">Save</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProfilePage;
