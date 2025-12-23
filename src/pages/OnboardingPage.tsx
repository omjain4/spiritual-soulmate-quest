import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import ProgressBar from "@/components/ProgressBar";
import SelectionCard from "@/components/SelectionCard";
import QuizQuestion from "@/components/QuizQuestion";
import PromptCard from "@/components/PromptCard";

const TOTAL_STEPS = 5;

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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to Jain Jodi
              </h2>
              <p className="mt-2 text-muted-foreground">
                Let's set up your profile to find your perfect match
              </p>
            </div>

            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-saffron-light">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="h-16 w-16 text-primary" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                This will take about 3 minutes
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Select your Jain sect
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-sage" />
                  Complete the Jain Rating quiz
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-sage" />
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
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Select your Sect
              </h2>
              <p className="mt-2 text-muted-foreground">
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

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Jain Rating Quiz
                </h2>
              </div>
              <p className="mt-2 text-muted-foreground">
                Question {currentQuizIndex + 1} of {quizQuestions.length}
              </p>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`,
                }}
              />
            </div>

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
                className="text-sm text-primary"
              >
                ← Previous question
              </button>
            )}
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
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Your Prompts
              </h2>
              <p className="mt-2 text-muted-foreground">
                Let others know who you are
              </p>
            </div>

            {editingPrompt ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-sm font-medium text-foreground">
                  {prompts.find((p) => p.id === editingPrompt)?.prompt}
                </p>
                <textarea
                  value={tempPromptAnswer}
                  onChange={(e) => setTempPromptAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="input-glass min-h-24 resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPrompt(null)}
                    className="btn-sage flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePromptSave}
                    className="btn-saffron flex-1"
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

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <motion.div
              className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-saffron-glow"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <span className="text-5xl font-bold text-white">
                {calculateRating()}%
              </span>
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Your Jain Rating
              </h2>
              <p className="mt-2 text-muted-foreground">
                Based on your spiritual practices and values
              </p>
            </div>

            <GlassCard className="text-left">
              <h3 className="font-semibold">Profile Summary</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  • Sect:{" "}
                  <span className="text-foreground">
                    {sects.find((s) => s.id === selectedSect)?.title || "Not selected"}
                  </span>
                </li>
                <li>
                  • Quiz completed:{" "}
                  <span className="text-foreground">
                    {Object.keys(quizAnswers).length}/{quizQuestions.length} questions
                  </span>
                </li>
                <li>
                  • Prompts answered:{" "}
                  <span className="text-foreground">
                    {Object.values(promptAnswers).filter((a) => a).length}/{prompts.length}
                  </span>
                </li>
              </ul>
            </GlassCard>
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
        return selectedSect !== null;
      case 3:
        return currentQuizIndex === quizQuestions.length - 1 && 
               quizAnswers[currentQuizIndex] !== undefined;
      case 4:
        return !editingPrompt;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="app-container relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-saffron/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sage/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <div className="flex-1 px-4">
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </div>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-6 pb-safe">
          <motion.button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-saffron flex w-full items-center justify-center gap-2 disabled:opacity-50"
            whileHover={canProceed() ? { scale: 1.02 } : {}}
            whileTap={canProceed() ? { scale: 0.98 } : {}}
          >
            <span>{currentStep === TOTAL_STEPS ? "Start Exploring" : "Continue"}</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
