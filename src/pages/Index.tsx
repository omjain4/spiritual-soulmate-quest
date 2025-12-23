import { motion } from "framer-motion";
import { Heart, ArrowRight, Shield, Users, Sparkles, TrendingUp, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");

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
      
      {/* Hero Section - Desktop */}
      <section className="relative overflow-hidden pt-32 md:pt-40">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
          <div className="absolute -right-32 top-32 h-[500px] w-[500px] rounded-full bg-sage/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-saffron-light/30 blur-3xl" />
          
          {/* Geometric Pattern */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="jainPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#jainPattern)" />
          </svg>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-4 inline-block rounded-full bg-saffron-light px-4 py-1.5 text-sm font-medium text-primary">
                🙏 Trusted by 10,000+ Jain Families
              </span>
              
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="text-gradient-saffron">Values First.</span>
                <br />
                Matches Second.
              </h1>
              
              <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
                The only matrimonial platform that matches you based on spiritual compatibility, 
                family values, and the Jain way of life.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <motion.button
                  onClick={() => navigate("/auth")}
                  className="btn-saffron flex items-center justify-center gap-2 px-8 py-4 text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                <button
                  onClick={() => navigate("/discover")}
                  className="btn-sage flex items-center justify-center gap-2 px-8 py-4 text-lg"
                >
                  Browse Profiles
                </button>
              </div>

              {/* Stats Row */}
              <div className="mt-12 flex flex-wrap gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Successful Matches</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-sage">92%</div>
                  <div className="text-sm text-muted-foreground">Match Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.9★</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </motion.div>

            {/* Right - 1:1 Tracker Widget */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassCard elevated className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-sage" />
                    <span className="text-sm font-medium text-sage-dark">Live Waiting Room</span>
                  </div>
                  <span className="rounded-full bg-sage-light px-2 py-1 text-xs font-medium text-sage-dark">
                    Real-time
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-5xl font-bold text-gradient-saffron">{waitingRoomStats.ratio}</div>
                  <p className="mt-1 text-sm text-muted-foreground">Gender Ratio (M:F)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-saffron-light p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{waitingRoomStats.males.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Males Waiting</p>
                  </div>
                  <div className="rounded-xl bg-sage-light p-4 text-center">
                    <div className="text-2xl font-bold text-sage-dark">{waitingRoomStats.females.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Females Waiting</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-sage" />
                    <span className="text-sm">Average Wait Time</span>
                  </div>
                  <span className="font-semibold">{waitingRoomStats.avgWait}</span>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  We maintain a 1:1 ratio for quality matches
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold md:text-4xl">Why Choose Jain Jodi?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built specifically for the Jain community with values at its core
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full transition-all hover:shadow-glow">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-light text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold md:text-4xl">Success Stories</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sage">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">"{t.quote}"</p>
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
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard elevated className="py-12">
              <h2 className="text-3xl font-bold">Ready to Find Your Match?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of Jain families who found their perfect match
              </p>
              <motion.button
                onClick={() => navigate("/auth")}
                className="btn-saffron mt-8 px-10 py-4 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav activeId={activeNav} onNavigate={(id) => { setActiveNav(id); if (id !== "home") navigate(`/${id}`); }} />
      </div>
    </div>
  );
};

export default Index;
