import { motion } from "framer-motion";
import { UserPlus, Heart, MessageCircle, Users, Shield, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  {
    number: "01",
    icon: <UserPlus className="h-8 w-8" />,
    title: "Create Your Profile",
    description: "Sign up and complete your profile with photos, bio, and preferences. Our guided onboarding helps you showcase your personality and values.",
    features: ["Add up to 6 photos", "Answer fun prompts", "Set your preferences"],
  },
  {
    number: "02",
    icon: <Shield className="h-8 w-8" />,
    title: "Get Verified",
    description: "Build trust by verifying your profile. Upload your ID, complete a selfie check, and get vouches from community members.",
    features: ["ID verification", "Selfie verification", "Community vouches"],
  },
  {
    number: "03",
    icon: <Heart className="h-8 w-8" />,
    title: "Discover Matches",
    description: "Browse profiles curated for you based on your preferences, sect, and Jain Rating. Swipe right to like, left to pass.",
    features: ["AI-powered matching", "Jain Rating system", "Advanced filters"],
  },
  {
    number: "04",
    icon: <MessageCircle className="h-8 w-8" />,
    title: "Connect & Chat",
    description: "When you match, start a conversation! Break the ice with our conversation starters or jump right in.",
    features: ["Secure messaging", "Video calls", "Ice-breaker prompts"],
  },
  {
    number: "05",
    icon: <Users className="h-8 w-8" />,
    title: "Involve Your Family",
    description: "Enable Family Mode to let your parents and siblings participate in your match search. Collaborate together!",
    features: ["Shared shortlist", "Family suggestions", "Private discussions"],
  },
];

const features = [
  { title: "Jain Rating™", description: "Our unique compatibility score based on values" },
  { title: "Chauvihar Tracker", description: "Understand lifestyle compatibility at a glance" },
  { title: "Verified Profiles", description: "Trust badges for verified members" },
  { title: "Family Mode", description: "Collaborate with your family on matches" },
  { title: "Date Ideas", description: "Jain-friendly date suggestions" },
  { title: "Community Events", description: "Virtual and in-person meetups" },
];

const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-container">
        {/* Hero */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="badge-primary">How It Works</span>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Find Your <span className="text-gradient-primary">Soulmate</span> in 5 Simple Steps
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Jain Jodi makes it easy to find your perfect match while honoring your values and traditions.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className={`flex flex-col gap-8 ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              {/* Visual */}
              <div className="flex-1">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 text-white md:p-12">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                  <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10" />
                  
                  <span className="text-6xl font-bold text-white/20 md:text-8xl">{step.number}</span>
                  <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                    {step.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-center">
                <h2 className="text-2xl font-bold md:text-3xl">{step.title}</h2>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
                <ul className="mt-4 space-y-2">
                  {step.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            What Makes Us <span className="text-gradient-primary">Different</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-20 overflow-hidden rounded-3xl bg-gradient-primary p-8 text-center text-white md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Find Your Match?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Join thousands of Jain singles who have found their life partners on Jain Jodi.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-semibold text-primary shadow-lg transition-transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
