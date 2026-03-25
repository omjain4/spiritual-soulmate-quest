import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, User, Calendar, MapPin, Briefcase, Check, AlertCircle, Camera, Sliders, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SelectionCard from "@/components/SelectionCard";
import QuizQuestion from "@/components/QuizQuestion";
import PromptCard from "@/components/PromptCard";
import PromptPicker from "@/components/PromptPicker";
import PreferencesStep from "@/components/PreferencesStep";
import PhotoUploadStep from "@/components/PhotoUploadStep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { basicInfoSchema, BasicInfoFormData } from "@/lib/validations";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { useToast } from "@/hooks/use-toast";

const TOTAL_STEPS = 8;

const sects = [
  { id: "digambar", title: "Digambar", description: "Sky-clad tradition", icon: "🕉️" },
  { id: "shwetambar-sthanakvasi", title: "Shwetambar - Sthanakvasi", description: "Non-idol worshipping", icon: "🙏" },
  { id: "shwetambar-murtipujak", title: "Shwetambar - Murtipujak", description: "Idol worshipping", icon: "🛕" },
  { id: "shwetambar-terapanthi", title: "Shwetambar - Terapanthi", description: "Reform movement", icon: "✨" },
];

const quizQuestions = [
  {
    question: "Do you follow Chauvihar (eating before sunset)?",
    options: [
      { id: "always", label: "Always", emoji: "🌅" },
      { id: "mostly", label: "Mostly", emoji: "⭐" },
      { id: "sometimes", label: "Sometimes", emoji: "🌙" },
      { id: "rarely", label: "Rarely", emoji: "🌃" },
    ],
  },
  {
    question: "What are your dietary preferences?",
    options: [
      { id: "strict-jain", label: "Strict Jain (No root vegetables)", emoji: "🥬" },
      { id: "jain-veg", label: "Jain Vegetarian", emoji: "🥗" },
      { id: "vegetarian", label: "Vegetarian", emoji: "🥦" },
      { id: "flexible", label: "Flexible", emoji: "🍽️" },
    ],
  },
  {
    question: "How often do you visit the temple?",
    options: [
      { id: "daily", label: "Daily", emoji: "🛕" },
      { id: "weekly", label: "Weekly", emoji: "📅" },
      { id: "monthly", label: "On special occasions", emoji: "🎉" },
      { id: "rarely", label: "Rarely", emoji: "🏠" },
    ],
  },
];



type FieldErrors = Partial<Record<keyof BasicInfoFormData, string>>;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { uploadPhoto, uploading } = usePhotoUpload();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    location: "",
    occupation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedSect, setSelectedSect] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedPrompts, setSelectedPrompts] = useState<{ question: string; answer: string }[]>([]);
  const [isPromptPickerOpen, setIsPromptPickerOpen] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

  // Preferences state
  const [preferences, setPreferences] = useState({
    minAge: 21,
    maxAge: 35,
    preferredGender: "",
    preferredLocations: [] as string[],
    preferredSects: [] as string[],
    preferredDietary: [] as string[],
    excludeGotra: true,
  });

  // Check if user needs onboarding
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate("/discover");
    }
  }, [profile, navigate]);

  // Pre-fill from existing profile
  useEffect(() => {
    if (profile) {
      const nameParts = profile.name?.split(" ") || ["", ""];
      setBasicInfo({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        gender: profile.gender || "",
        birthDate: profile.date_of_birth || "",
        location: profile.location || "",
        occupation: profile.occupation || "",
      });
      if (profile.photos?.length) {
        setPhotos(profile.photos);
      }
    }
  }, [profile]);

  const validateBasicInfo = (): boolean => {
    try {
      basicInfoSchema.parse(basicInfo);
      setFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: FieldErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof BasicInfoFormData;
          errors[field] = err.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleInputChange = (field: keyof BasicInfoFormData, value: string) => {
    setBasicInfo({ ...basicInfo, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = async () => {
    if (currentStep === 2 && !validateBasicInfo()) return;
    if (currentStep === 6 && photos.length === 0) {
      toast({
        title: "Add at least one photo",
        description: "Please upload at least one photo to continue.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      await saveOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizAnswer = (id: string) => {
    setQuizAnswers({ ...quizAnswers, [currentQuizIndex]: id });
    setTimeout(() => {
      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1);
      }
    }, 300);
  };



  const calculateRating = () => {
    let score = 0;
    if (selectedSect) score += 20;
    score += Object.keys(quizAnswers).length * 10;
    score += selectedPrompts.filter(p => p.answer).length * 10;
    if (photos.length >= 3) score += 20;
    return Math.min(score, 100);
  };

  const handlePhotoUpload = async (file: Blob): Promise<string | null> => {
    return await uploadPhoto(file, 'profile.jpg');
  };

  const saveOnboarding = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const promptsData = selectedPrompts.filter(p => p.answer);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: `${basicInfo.firstName} ${basicInfo.lastName}`.trim(),
          gender: basicInfo.gender,
          date_of_birth: basicInfo.birthDate,
          location: basicInfo.location,
          occupation: basicInfo.occupation,
          sect: selectedSect,
          dietary_preference: quizAnswers[1] || null,
          chauvihar_level: quizAnswers[0] || null,
          temple_frequency: quizAnswers[2] || null,
          jain_rating: calculateRating(),
          photos,
          main_photo_index: mainPhotoIndex,
          prompts: promptsData,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Save preferences
      const { error: prefError } = await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          min_age: preferences.minAge,
          max_age: preferences.maxAge,
          preferred_gender: preferences.preferredGender || (basicInfo.gender === 'male' ? 'female' : 'male'),
          preferred_locations: preferences.preferredLocations,
          preferred_sects: preferences.preferredSects,
          preferred_dietary: preferences.preferredDietary,
          exclude_gotra: preferences.excludeGotra,
        });

      if (prefError) throw prefError;

      await refreshProfile();

      toast({
        title: "Profile complete! 🎉",
        description: "Let's find your perfect match.",
      });

      navigate("/discover");
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const stepInfo = [
    { title: "Welcome", icon: Sparkles },
    { title: "Basic Info", icon: User },
    { title: "Sect", icon: Check },
    { title: "Quiz", icon: Sparkles },
    { title: "Prompts", icon: User },
    { title: "Photos", icon: Camera },
    { title: "Preferences", icon: Sliders },
    { title: "Complete", icon: Check },
  ];

  const renderFieldError = (field: keyof BasicInfoFormData) => {
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                Welcome to Jain Jodi
              </h2>
              <p className="mt-3 text-muted-foreground">
                Let's set up your profile to find your perfect match
              </p>
            </div>

            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Sparkles className="h-16 w-16 text-primary" />
              </motion.div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-4 text-center text-sm text-muted-foreground">This will take about 5 minutes</p>
              <ul className="space-y-3">
                {[
                  { icon: User, text: "Tell us about yourself" },
                  { icon: Check, text: "Select your Jain sect" },
                  { icon: Sparkles, text: "Complete the Jain Rating quiz" },
                  { icon: Camera, text: "Upload your photos" },
                  { icon: Sliders, text: "Set your preferences" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">Basic Information</h2>
              <p className="mt-3 text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={basicInfo.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`rounded-xl ${fieldErrors.firstName ? "border-destructive" : ""}`}
                    />
                    {renderFieldError("firstName")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={basicInfo.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`rounded-xl ${fieldErrors.lastName ? "border-destructive" : ""}`}
                    />
                    {renderFieldError("lastName")}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Gender
                  </Label>
                  <Select value={basicInfo.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className={`rounded-xl ${fieldErrors.gender ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderFieldError("gender")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date of Birth
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={basicInfo.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className={`rounded-xl ${fieldErrors.birthDate ? "border-destructive" : ""}`}
                  />
                  {renderFieldError("birthDate")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Current Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={basicInfo.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className={`rounded-xl ${fieldErrors.location ? "border-destructive" : ""}`}
                  />
                  {renderFieldError("location")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Occupation
                  </Label>
                  <Input
                    id="occupation"
                    placeholder="e.g., Software Engineer"
                    value={basicInfo.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    className={`rounded-xl ${fieldErrors.occupation ? "border-destructive" : ""}`}
                  />
                  {renderFieldError("occupation")}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">Select your Sect</h2>
              <p className="mt-3 text-muted-foreground">Choose the tradition you follow</p>
            </div>

            <div className="space-y-3">
              {sects.map((sect) => (
                <SelectionCard
                  key={sect.id}
                  title={sect.title}
                  description={sect.description}
                  icon={<span className="text-xl">{sect.icon}</span>}
                  selected={selectedSect === sect.id}
                  onClick={() => setSelectedSect(sect.id)}
                />
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">Jain Rating Quiz</h2>
              </div>
              <p className="text-muted-foreground">Question {currentQuizIndex + 1} of {quizQuestions.length}</p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <AnimatePresence mode="wait">
                <QuizQuestion
                  key={currentQuizIndex}
                  question={quizQuestions[currentQuizIndex].question}
                  options={quizQuestions[currentQuizIndex].options}
                  selectedId={quizAnswers[currentQuizIndex]}
                  onSelect={handleQuizAnswer}
                />
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-2">
              {quizQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuizIndex(idx)}
                  className={`h-2 w-8 rounded-full transition-colors ${idx === currentQuizIndex ? "bg-primary" : idx < currentQuizIndex && quizAnswers[idx] ? "bg-primary/50" : "bg-muted"}`}
                />
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">Your Vibe</h2>
              <p className="mt-3 text-muted-foreground">Pick up to 3 prompts to show your personality</p>
            </div>

            <div className="space-y-3">
              {selectedPrompts.map((prompt, index) => (
                <PromptCard
                  key={index}
                  prompt={prompt.question}
                  answer={prompt.answer}
                  onEdit={() => setIsPromptPickerOpen(true)}
                />
              ))}

              {selectedPrompts.length < 3 && (
                <button
                  onClick={() => setIsPromptPickerOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="text-xl">+</span>
                  <span className="font-medium">{selectedPrompts.length === 0 ? 'Choose your first prompt' : 'Add another prompt'}</span>
                </button>
              )}
            </div>

            <PromptPicker
              open={isPromptPickerOpen}
              onOpenChange={setIsPromptPickerOpen}
              currentPrompts={selectedPrompts}
              onSave={setSelectedPrompts}
            />
          </motion.div>
        );

      case 6:
        return (
          <PhotoUploadStep
            key="step6"
            photos={photos}
            mainPhotoIndex={mainPhotoIndex}
            onPhotosChange={setPhotos}
            onMainPhotoChange={setMainPhotoIndex}
            maxPhotos={6}
            uploading={uploading}
            onUploadPhoto={handlePhotoUpload}
          />
        );

      case 7:
        return (
          <PreferencesStep
            key="step7"
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        );

      case 8:
        return (
          <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="text-center">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-12 w-12 text-primary" />
              </motion.div>
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">You're all set!</h2>
              <p className="mt-3 text-muted-foreground">Your profile is ready. Let's find your match.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">Your Jain Rating</span>
              </div>
              <div className="text-5xl font-light text-primary">{calculateRating()}%</div>
              <p className="mt-2 text-sm text-muted-foreground">Based on your profile completeness</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-light">{photos.length}</div>
                <div className="text-sm text-muted-foreground">Photos</div>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <div className="text-2xl font-light">{selectedPrompts.filter(p => p.answer).length}</div>
                <div className="text-sm text-muted-foreground">Prompts</div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-xl px-6 pb-24 pt-28 md:pt-32">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
            <span>{stepInfo[currentStep - 1].title}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          {currentStep > 1 && (
            <button onClick={handleBack} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-4 font-medium transition-colors hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
          )}
          <motion.button
            onClick={handleNext}
            disabled={isSaving || (currentStep === 6 && photos.length === 0)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-4 font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : currentStep === TOTAL_STEPS ? (
              <>Start Discovering</>
            ) : (
              <>
                Continue
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
