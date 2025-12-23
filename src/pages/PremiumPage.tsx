import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Zap, Eye, Heart, Star, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const premiumFeatures = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast-Track Access",
    description: "Skip the waitlist and start matching immediately",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "See Who Likes You",
    description: "View all your admirers without matching first",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Unlimited Likes",
    description: "Like as many profiles as you want, no daily limits",
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Priority Visibility",
    description: "Your profile appears first in discovery feeds",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Advanced Filters",
    description: "Filter by community, education, location & more",
  },
];

const PremiumPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="content-container">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center gap-4 md:hidden">
          <button onClick={() => navigate(-1)} className="icon-btn">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Premium</h1>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Hero Card */}
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />
            
            <div className="relative text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
                <Crown className="h-10 w-10" />
              </div>
              <h1 className="mt-6 text-3xl font-bold md:text-4xl">Jain Jodi Premium</h1>
              <p className="mt-2 text-lg text-white/80">
                Find your soulmate faster with exclusive features
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="section-card flex items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold">Choose Your Plan</h2>
            
            <motion.button
              className={`relative w-full overflow-hidden rounded-2xl border-2 p-5 text-left transition-all ${
                selectedPlan === "yearly"
                  ? "border-primary bg-rose-light"
                  : "border-border bg-card hover:border-primary/30"
              }`}
              onClick={() => setSelectedPlan("yearly")}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute -right-2 -top-2 rounded-bl-2xl bg-gradient-primary px-4 py-1.5 text-xs font-bold text-white">
                BEST VALUE
              </div>
              {selectedPlan === "yearly" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">₹4,999</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Save 58% compared to monthly</p>
            </motion.button>

            <motion.button
              className={`relative w-full rounded-2xl border-2 p-5 text-left transition-all ${
                selectedPlan === "monthly"
                  ? "border-primary bg-rose-light"
                  : "border-border bg-card hover:border-primary/30"
              }`}
              onClick={() => setSelectedPlan("monthly")}
              whileTap={{ scale: 0.98 }}
            >
              {selectedPlan === "monthly" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">₹999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
            </motion.button>
          </div>

          {/* CTA */}
          <motion.button
            className="btn-primary mt-8 w-full py-4 text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Upgrade to Premium
          </motion.button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
