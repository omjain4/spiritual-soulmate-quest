import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Zap, Eye, Heart, Star, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import WaitlistCard from "@/components/WaitlistCard";
import BottomNav from "@/components/BottomNav";

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
];

const compatibilityBreakdown = [
  { label: "Spiritual Values", percentage: 92, color: "bg-primary" },
  { label: "Lifestyle Match", percentage: 85, color: "bg-sage" },
  { label: "Family Values", percentage: 88, color: "bg-primary" },
  { label: "Education & Career", percentage: 78, color: "bg-sage" },
];

const PremiumPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("profile");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const handleNavigate = (id: string) => {
    setActiveNav(id);
    if (id === "discover") {
      navigate("/discover");
    }
  };

  return (
    <div className="app-container relative min-h-screen overflow-hidden pb-24">
      {/* Background */}
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
      <div className="absolute -right-32 top-48 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Premium</h1>
        </div>
      </div>

      <div className="relative space-y-6 p-4">
        {/* Premium Hero */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-saffron-glow p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" />
          
          <div className="relative">
            <div className="flex items-center gap-2">
              <Crown className="h-8 w-8" />
              <span className="text-lg font-semibold">Jain Jodi Premium</span>
            </div>
            <p className="mt-2 text-white/80">
              Unlock all features and find your soulmate faster
            </p>
          </div>
        </motion.div>

        {/* Waitlist Status */}
        <WaitlistCard
          position={247}
          ageGroup="22-25"
          maleRatio={60}
          femaleRatio={40}
          estimatedWait="~2 weeks"
          onFastTrack={() => console.log("Fast track clicked")}
        />

        {/* Compatibility Breakdown */}
        <GlassCard elevated>
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Star className="h-5 w-5 text-primary" />
            Your Match Compatibility
          </h3>
          <div className="space-y-4">
            {compatibilityBreakdown.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={`h-full rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Premium Features */}
        <div className="space-y-3">
          <h3 className="font-semibold">Premium Benefits</h3>
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-light text-primary">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="font-semibold">Choose Your Plan</h3>
          
          <div className="grid gap-3">
            <motion.button
              className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                selectedPlan === "yearly"
                  ? "border-primary bg-saffron-light"
                  : "border-border bg-card"
              }`}
              onClick={() => setSelectedPlan("yearly")}
              whileTap={{ scale: 0.98 }}
            >
              {selectedPlan === "yearly" && (
                <div className="absolute right-4 top-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="absolute -right-2 -top-2 rounded-bl-xl bg-primary px-3 py-1 text-xs font-semibold text-white">
                BEST VALUE
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">₹4,999</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Save 58% compared to monthly
              </p>
            </motion.button>

            <motion.button
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                selectedPlan === "monthly"
                  ? "border-primary bg-saffron-light"
                  : "border-border bg-card"
              }`}
              onClick={() => setSelectedPlan("monthly")}
              whileTap={{ scale: 0.98 }}
            >
              {selectedPlan === "monthly" && (
                <div className="absolute right-4 top-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">₹999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Billed monthly, cancel anytime
              </p>
            </motion.button>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          className="btn-saffron w-full py-4 text-lg font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Upgrade to Premium
        </motion.button>

        <p className="text-center text-xs text-muted-foreground">
          7-day money-back guarantee. Cancel anytime.
        </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeId={activeNav} onNavigate={handleNavigate} />
    </div>
  );
};

export default PremiumPage;
