import { motion } from "framer-motion";
import { Heart, Shield, Users, Sparkles, Target, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Values First",
    description: "We believe meaningful connections start with shared values and beliefs.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Trust & Safety",
    description: "Every profile is verified to ensure a safe and genuine community.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Family Involvement",
    description: "Unique features that include family in the matchmaking journey.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Cultural Heritage",
    description: "Celebrating Jain traditions while embracing modern connections.",
  },
];

const stats = [
  { number: "50,000+", label: "Active Members" },
  { number: "15,000+", label: "Successful Matches" },
  { number: "98%", label: "Verified Profiles" },
  { number: "1.05:1", label: "Gender Ratio" },
];

const team = [
  {
    name: "Rahul Jain",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
  {
    name: "Priya Shah",
    role: "Head of Community",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    name: "Ankit Mehta",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        {/* Hero */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">About Us</span>
          <h1 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl lg:text-6xl">
            Building <span className="italic text-primary">meaningful</span> connections
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Jain Jodi is the premier matrimonial platform designed exclusively for the Jain community, 
            combining traditional values with modern technology.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          className="mt-20 rounded-3xl bg-foreground p-8 text-center text-background md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <Target className="h-8 w-8" />
          </div>
          <h2 className="mt-6 font-serif text-3xl font-light">Our Mission</h2>
          <p className="mx-auto mt-4 max-w-2xl text-background/70">
            To help Jain individuals find their life partners by creating a platform that respects 
            our cultural heritage, involves families in the journey, and uses intelligent matching 
            based on shared values and lifestyle choices.
          </p>
        </motion.div>

        {/* Values */}
        <div className="mt-20">
          <h2 className="text-center font-serif text-3xl font-light">What We Stand For</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="rounded-2xl border border-border bg-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
                  {value.icon}
                </div>
                <h3 className="mt-4 font-medium">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          className="mt-20 rounded-3xl bg-muted/50 p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid gap-8 text-center md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label}>
                <motion.div
                  className="font-serif text-4xl font-light text-foreground md:text-5xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                >
                  {stat.number}
                </motion.div>
                <p className="mt-2 text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <div className="mt-20">
          <h2 className="text-center font-serif text-3xl font-light">Meet Our Team</h2>
          <p className="mt-2 text-center text-muted-foreground">The people behind Jain Jodi</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                className="rounded-2xl border border-border bg-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
                <h3 className="mt-4 font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-20">
          <h2 className="text-center font-serif text-3xl font-light">Why Choose Jain Jodi?</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Exclusive Jain community platform",
              "AI-powered compatibility matching",
              "Verified profiles with Trust Score",
              "Family Mode for collaborative search",
              "Secure and private conversations",
              "Dedicated relationship support",
            ].map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;