import { motion } from "framer-motion";
import { Heart, ArrowRight, Shield, Users, Sparkles, TrendingUp, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/GlassCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/discover", { replace: true });
    }
  }, [user, navigate]);

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
      <section className="relative bg-foreground px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium uppercase tracking-widest text-white/50">Why Jain Jodi</span>
            <h2 className="mt-4 font-serif text-4xl font-light text-white md:text-5xl lg:text-6xl">
              Built for <span className="italic text-saffron-glow">meaningful</span> connections
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-saffron-glow transition-all group-hover:border-saffron-glow/30 group-hover:bg-saffron-glow/10">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">{feature.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">How It Works</span>
              <h2 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl">
                Find your <span className="italic text-primary">soulmate</span> in 3 steps
              </h2>
              <div className="mt-10 space-y-8">
                {[
                  { step: "01", title: "Create Profile", desc: "Share your values, beliefs, and what you're looking for" },
                  { step: "02", title: "Get Matched", desc: "Our algorithm finds compatible matches based on spiritual alignment" },
                  { step: "03", title: "Connect", desc: "Start meaningful conversations with verified profiles" },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6"
                  >
                    <span className="font-serif text-4xl font-light text-primary/30">{item.step}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1523251343397-9225e4cb6319?w=800&q=80"
                  alt="Happy couple"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-5 shadow-xl md:-left-12"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light">
                    <Heart className="h-6 w-6 text-sage-dark" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-foreground">500+</div>
                    <div className="text-sm text-muted-foreground">Matches Made</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Success Stories</span>
            <h2 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl">
              Real connections, <span className="italic text-primary">real love</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-card p-8 md:p-10"
              >
                <div className="flex gap-1 text-saffron-glow">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5" fill="currentColor" />
                  ))}
                </div>
                <p className="mt-6 font-serif text-xl font-light leading-relaxed text-foreground md:text-2xl">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-sage" />
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-foreground px-6 py-24 md:px-12 md:py-32 lg:px-20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-saffron-glow blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl font-light text-white md:text-5xl lg:text-6xl">
              Ready to find <span className="italic text-saffron-glow">the one?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-white/60">
              Join thousands of Jain singles who found their perfect match through meaningful connections.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <motion.button
                onClick={() => navigate("/auth")}
                className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-foreground transition-all hover:scale-105"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Today
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <button
                onClick={() => navigate("/about")}
                className="rounded-full border border-white/20 px-8 py-4 text-base font-medium text-white transition-all hover:bg-white/10"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
