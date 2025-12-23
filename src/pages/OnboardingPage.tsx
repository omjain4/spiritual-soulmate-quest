import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, User, Calendar, MapPin, Briefcase, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SelectionCard from "@/components/SelectionCard";
import QuizQuestion from "@/components/QuizQuestion";
import PromptCard from "@/components/PromptCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TOTAL_STEPS = 6;

const sects = [
  {
    id: "digambar",
    title: "Digambar",
    description: "Sky-clad tradition",
    icon: "🕉️",
  },
  {
    id: "shwetambar-sthanakvasi",
    title: "Shwetambar - Sthanakvasi",
    description: "Non-idol worshipping",
    icon: "🙏",
  },
  {
    id: "shwetambar-murtipujak",
    title: "Shwetambar - Murtipujak",
    description: "Idol worshipping",
    icon: "🛕",
  },
  {
    id: "shwetambar-terapanthi",
    title: "Shwetambar - Terapanthi",
    description: "Reform movement",
    icon: "✨",
  },
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

const prompts = [
  { id: "tirth", prompt: "My favorite Tirth is...", answer: "" },
  { id: "sundays", prompt: "On Sundays, I usually...", answer: "" },
  { id: "values", prompt: "A value I hold dear is...", answer: "" },
  { id: "looking", prompt: "I'm looking for someone who...", answer: "" },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    location: "",
    occupation: "",
  });
  const [selectedSect, setSelectedSect] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [tempPromptAnswer, setTempPromptAnswer] = useState("");

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/discover");
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

  const handlePromptSave = () => {
    if (editingPrompt) {
      setPromptAnswers({ ...promptAnswers, [editingPrompt]: tempPromptAnswer });
      setEditingPrompt(null);
      setTempPromptAnswer("");
    }
  };

  const calculateRating = () => {
    let score = 0;
    if (selectedSect) score += 20;
    score += Object.keys(quizAnswers).length * 10;
    score += Object.values(promptAnswers).filter((a) => a).length * 10;
    return Math.min(score, 100);
  };

  const stepInfo = [
    { title: "Welcome", icon: Sparkles },
    { title: "Basic Info", icon: User },
    { title: "Sect", icon: Check },
    { title: "Quiz", icon: Sparkles },
    { title: "Prompts", icon: User },
    { title: "Complete", icon: Check },
  ];

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
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="h-16 w-16 text-primary" />
              </motion.div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-4 text-center text-sm text-muted-foreground">
                This will take about 5 minutes
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </span>
                  Tell us about yourself
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </span>
                  Select your Jain sect
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </span>
                  Complete the Jain Rating quiz
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </span>
                  Add your personal prompts
                </li>
              </ul>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                Basic Information
              </h2>
              <p className="mt-3 text-muted-foreground">
                Tell us about yourself
              </p>
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
                      onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={basicInfo.lastName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Gender
                  </Label>
                  <Select
                    value={basicInfo.gender}
                    onValueChange={(value) => setBasicInfo({ ...basicInfo, gender: value })}
                  >
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
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date of Birth
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={basicInfo.birthDate}
                    onChange={(e) => setBasicInfo({ ...basicInfo, birthDate: e.target.value })}
                    className="rounded-xl"
                  />
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
                    onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
                    className="rounded-xl"
                  />
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
                    onChange={(e) => setBasicInfo({ ...basicInfo, occupation: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                Select your Sect
              </h2>
              <p className="mt-3 text-muted-foreground">
                Choose the tradition you follow
              </p>
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
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                  Jain Rating Quiz
                </h2>
              </div>
              <p className="text-muted-foreground">
                Question {currentQuizIndex + 1} of {quizQuestions.length}
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`,
                }}
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

              {currentQuizIndex > 0 && (
                <button
                  onClick={() => setCurrentQuizIndex(currentQuizIndex - 1)}
                  className="mt-4 text-sm font-medium text-primary"
                >
                  ← Previous question
                </button>
              )}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                Your Prompts
              </h2>
              <p className="mt-3 text-muted-foreground">
                Let others know who you are
              </p>
            </div>

            {editingPrompt ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="mb-4 text-sm font-medium text-foreground">
                  {prompts.find((p) => p.id === editingPrompt)?.prompt}
                </p>
                <textarea
                  value={tempPromptAnswer}
                  onChange={(e) => setTempPromptAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="min-h-24 w-full resize-none rounded-xl border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setEditingPrompt(null)}
                    className="flex-1 rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePromptSave}
                    className="flex-1 rounded-full bg-foreground py-3 font-medium text-background transition-colors hover:opacity-90"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt.prompt}
                    answer={promptAnswers[prompt.id]}
                    onEdit={() => {
                      setEditingPrompt(prompt.id);
                      setTempPromptAnswer(promptAnswers[prompt.id] || "");
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
            <motion.div
              className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <span className="text-5xl font-bold text-white">
                {calculateRating()}%
              </span>
            </motion.div>

            <div>
              <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                Your Jain Rating
              </h2>
              <p className="mt-3 text-muted-foreground">
                Based on your spiritual practices and values
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-left">
              <h3 className="mb-4 font-medium">Profile Summary</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">
                    {basicInfo.firstName} {basicInfo.lastName}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground">
                    {basicInfo.location || "Not specified"}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Sect</span>
                  <span className="font-medium text-foreground">
                    {sects.find((s) => s.id === selectedSect)?.title || "Not selected"}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Quiz</span>
                  <span className="font-medium text-foreground">
                    {Object.keys(quizAnswers).length}/{quizQuestions.length} completed
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <span className="text-muted-foreground">Prompts</span>
                  <span className="font-medium text-foreground">
                    {Object.values(promptAnswers).filter((a) => a).length}/{prompts.length} answered
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return basicInfo.firstName && basicInfo.lastName && basicInfo.gender && basicInfo.birthDate;
      case 3:
        return selectedSect !== null;
      case 4:
        return currentQuizIndex === quizQuestions.length - 1 && 
               quizAnswers[currentQuizIndex] !== undefined;
      case 5:
        return !editingPrompt;
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-28 md:px-12 md:pt-32">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Indicators */}
          <div className="mt-4 hidden gap-2 sm:flex">
            {stepInfo.map((step, index) => (
              <div
                key={index}
                className={`flex flex-1 flex-col items-center text-center ${
                  index + 1 <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    index + 1 < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index + 1 === currentStep
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-1 text-xs">{step.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <motion.button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
            whileHover={canProceed() ? { scale: 1.01 } : {}}
            whileTap={canProceed() ? { scale: 0.99 } : {}}
          >
            <span>{currentStep === TOTAL_STEPS ? "Start Exploring" : "Continue"}</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default OnboardingPage;
