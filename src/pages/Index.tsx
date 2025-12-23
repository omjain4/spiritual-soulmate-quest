import { motion } from "framer-motion";
import { Heart, ArrowRight, Shield, Users, Sparkles, TrendingUp, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  // Live stats for 1:1 tracker
  const waitingRoomStats = {
    males: 1247,
    females: 1189,
    ratio: "1.05:1",
    avgWait: "3 days",
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Jain Rating System",
      description: "Find matches based on spiritual compatibility and values",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Profiles",
      description: "Every profile is manually verified for authenticity",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Family Collaboration",
      description: "Parents can participate in the search process",
    },
  ];

  const testimonials = [
    { name: "Priya & Rahul", location: "Mumbai", quote: "Found my soulmate who shares the same values" },
    { name: "Ananya & Vikram", location: "Ahmedabad", quote: "Our families connected instantly" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Hinge Style */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=1920&q=80"
            alt="Couple"
            className="h-full w-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 pb-16 pt-32 md:px-12 lg:px-20">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center md:justify-start"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sage" />
              10,000+ Jain Families Trust Us
            </span>
          </motion.div>

          {/* Main Hero Content */}
          <div className="flex flex-1 flex-col items-center justify-center text-center md:items-start md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-5xl font-light leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl"
            >
              Designed to be
              <br />
              <span className="font-normal italic text-saffron-glow">deleted.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 max-w-md text-lg font-light text-white/80 md:text-xl"
            >
              The dating app for Jains looking for something real. 
              Values first. Matches second.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <button
                onClick={() => navigate("/auth")}
                className="group flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-foreground transition-all hover:scale-105 hover:bg-white/90"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("/how-it-works")}
                className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                How It Works
              </button>
            </motion.div>
          </div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-8 border-t border-white/10 pt-8 md:justify-start md:gap-12"
          >
            <div>
              <div className="text-3xl font-light text-white md:text-4xl">500+</div>
              <div className="mt-1 text-sm text-white/60">Successful Matches</div>
            </div>
            <div>
              <div className="text-3xl font-light text-white md:text-4xl">92%</div>
              <div className="mt-1 text-sm text-white/60">Match Rate</div>
            </div>
            <div>
              <div className="text-3xl font-light text-white md:text-4xl">4.9★</div>
              <div className="mt-1 text-sm text-white/60">User Rating</div>
            </div>
            <div>
              <div className="text-3xl font-light text-saffron-glow md:text-4xl">{waitingRoomStats.ratio}</div>
              <div className="mt-1 text-sm text-white/60">Gender Ratio</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1"
          >
            <div className="h-2 w-1 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-8 text-center md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold md:text-4xl">Why Choose Jain Jodi?</h2>
            <p className="mt-3 text-base text-muted-foreground md:mt-4 md:text-lg">
              Built specifically for the Jain community with values at its core
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full transition-all hover:shadow-glow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-light text-primary md:h-14 md:w-14">
                    {feature.icon}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold md:mt-4 md:text-xl">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-8 text-center md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold md:text-4xl">Success Stories</h2>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sage md:h-12 md:w-12">
                    <Star className="h-5 w-5 text-white md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium md:text-lg">"{t.quote}"</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      — {t.name}, {t.location}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard elevated className="py-8 md:py-12">
              <h2 className="text-2xl font-bold md:text-3xl">Ready to Find Your Match?</h2>
              <p className="mt-3 text-base text-muted-foreground md:mt-4 md:text-lg">
                Join thousands of Jain families who found their perfect match
              </p>
              <motion.button
                onClick={() => navigate("/auth")}
                className="btn-saffron mt-6 px-8 py-3 text-base md:mt-8 md:px-10 md:py-4 md:text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
