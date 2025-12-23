import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Zap, Eye, Heart, Star, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        <div className="mx-auto max-w-3xl">
          {/* Hero Card */}
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-foreground p-8 text-background md:p-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
            
            <div className="relative text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
                <Crown className="h-10 w-10" />
              </div>
              <h1 className="mt-6 font-serif text-4xl font-light md:text-5xl">
                Jain Jodi <span className="italic text-saffron-glow">Premium</span>
              </h1>
              <p className="mt-3 text-lg text-background/70">
                Find your soulmate faster with exclusive features
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mt-12 space-y-4">
            <h2 className="font-serif text-2xl font-light">Choose Your Plan</h2>
            
            <motion.button
              className={`relative w-full overflow-hidden rounded-2xl border-2 p-6 text-left transition-all ${
                selectedPlan === "yearly"
                  ? "border-foreground bg-foreground/5"
                  : "border-border bg-card hover:border-foreground/30"
              }`}
              onClick={() => setSelectedPlan("yearly")}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute -right-2 -top-2 rounded-bl-xl bg-foreground px-4 py-1.5 text-xs font-bold text-background">
                BEST VALUE
              </div>
              {selectedPlan === "yearly" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-6 w-6 text-foreground" />
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl font-light">₹4,999</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Save 58% compared to monthly</p>
            </motion.button>

            <motion.button
              className={`relative w-full rounded-2xl border-2 p-6 text-left transition-all ${
                selectedPlan === "monthly"
                  ? "border-foreground bg-foreground/5"
                  : "border-border bg-card hover:border-foreground/30"
              }`}
              onClick={() => setSelectedPlan("monthly")}
              whileTap={{ scale: 0.99 }}
            >
              {selectedPlan === "monthly" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-6 w-6 text-foreground" />
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl font-light">₹999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
            </motion.button>
          </div>

          {/* CTA */}
          <motion.button
            className="group mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 font-medium text-background transition-all hover:opacity-90"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Upgrade to Premium
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PremiumPage;