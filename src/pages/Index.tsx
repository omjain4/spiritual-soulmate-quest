import { motion } from "framer-motion";
import { Heart, ArrowRight, Shield, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Jain Rating System",
      description: "Find matches based on spiritual compatibility",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Profiles",
      description: "Every profile is manually verified for authenticity",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community First",
      description: "Designed exclusively for the Jain community",
    },
  ];

  return (
    <div className="app-container relative min-h-screen overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl" />
      <div className="absolute -right-32 bottom-32 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-saffron-light blur-3xl" />

      <div className="relative flex min-h-screen flex-col px-6 py-12">
        {/* Logo & Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-saffron-glow shadow-glow"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Heart className="h-10 w-10 text-white" fill="white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gradient-saffron">Jain Jodi</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Find your soulmate, the Jain way
          </p>
        </motion.div>

        {/* Hero Image/Illustration */}
        <motion.div
          className="relative mx-auto mb-8 aspect-square w-full max-w-xs"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-saffron-light to-sage-light" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-cream shadow-inner" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-8xl"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
            >
              🙏
            </motion.div>
          </div>
          {/* Floating elements */}
          <motion.div
            className="absolute -left-2 top-1/4 rounded-full bg-saffron-light p-3 shadow-soft"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          >
            <span className="text-2xl">💕</span>
          </motion.div>
          <motion.div
            className="absolute -right-2 top-1/3 rounded-full bg-sage-light p-3 shadow-soft"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}
          >
            <span className="text-2xl">✨</span>
          </motion.div>
          <motion.div
            className="absolute bottom-8 left-8 rounded-full bg-cream p-3 shadow-soft"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, delay: 0.3 }}
          >
            <span className="text-2xl">🛕</span>
          </motion.div>
        </motion.div>

        {/* Features */}
        <div className="mb-8 space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <GlassCard className="flex items-start gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-saffron-light text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          className="mb-8 flex justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">10K+</div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold text-sage">500+</div>
            <div className="text-xs text-muted-foreground">Matches Made</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">92%</div>
            <div className="text-xs text-muted-foreground">Match Rate</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <div className="mt-auto space-y-3">
          <motion.button
            onClick={() => navigate("/auth")}
            className="btn-saffron flex w-full items-center justify-center gap-2 py-4 text-lg font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>

          <motion.button
            onClick={() => navigate("/auth")}
            className="btn-sage w-full py-4 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            I already have an account
          </motion.button>
        </div>

        {/* Footer note */}
        <motion.p
          className="mt-6 text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Trusted by families across India 🇮🇳
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
