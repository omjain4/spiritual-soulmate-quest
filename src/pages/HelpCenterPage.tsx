import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MessageCircle, Phone, Mail, ChevronDown, 
  User, Heart, Shield, CreditCard, Settings, HelpCircle 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  { id: "account", label: "Account & Profile", icon: <User className="h-4 w-4" /> },
  { id: "matching", label: "Matching & Likes", icon: <Heart className="h-4 w-4" /> },
  { id: "safety", label: "Safety & Privacy", icon: <Shield className="h-4 w-4" /> },
  { id: "premium", label: "Premium & Billing", icon: <CreditCard className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

const faqs = [
  {
    category: "account",
    question: "How do I create a profile?",
    answer: "To create a profile, click 'Sign Up' on the homepage, enter your email and password, then follow the onboarding steps to add your photos, bio, and preferences. The process takes about 5 minutes.",
  },
  {
    category: "account",
    question: "How do I edit my profile information?",
    answer: "Go to your Profile page by clicking your avatar in the navbar, then click 'Edit Profile'. You can update your photos, bio, and all other information from there.",
  },
  {
    category: "matching",
    question: "How does the matching algorithm work?",
    answer: "Our algorithm considers your Jain Rating, dietary preferences, sect compatibility, location, and interests to suggest the most compatible matches. The more complete your profile, the better matches you'll receive.",
  },
  {
    category: "matching",
    question: "What happens when I like someone?",
    answer: "When you like someone, they'll be notified (unless you're in Incognito mode). If they like you back, it's a match! You can then start a conversation with them.",
  },
  {
    category: "safety",
    question: "How do I verify my profile?",
    answer: "Go to Trust & Safety from your profile menu. You can verify your identity by uploading a government ID, completing a selfie verification, and getting vouches from community members.",
  },
  {
    category: "safety",
    question: "How do I report or block someone?",
    answer: "On any profile, click the three dots menu and select 'Report' or 'Block'. Blocked users won't be able to see your profile or contact you.",
  },
  {
    category: "premium",
    question: "What features are included in Premium?",
    answer: "Premium includes: See who likes you, unlimited likes, priority visibility, advanced filters, read receipts, and access to premium-only events.",
  },
  {
    category: "premium",
    question: "How do I cancel my subscription?",
    answer: "Go to Settings > Subscription and click 'Cancel Subscription'. You'll continue to have access until the end of your billing period.",
  },
  {
    category: "settings",
    question: "How do I change my notification settings?",
    answer: "Go to Settings > Notifications. You can customize which notifications you receive via push, email, and in-app.",
  },
  {
    category: "settings",
    question: "What is Family Mode?",
    answer: "Family Mode allows you to invite family members to collaborate on your match search. They can suggest profiles, and you can discuss matches together within the app.",
  },
];

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        {/* Hero */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Support</span>
          <h1 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl">
            How can we <span className="italic text-primary">help</span> you?
          </h1>

          {/* Search */}
          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-background py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !selectedCategory ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === category.id 
                  ? "bg-foreground text-background" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.question ? null : faq.question)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      expandedFaq === faq.question ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFaq === faq.question && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredFaqs.length === 0 && (
            <div className="py-16 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 font-medium">No results found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or category
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-20">
          <h2 className="text-center font-serif text-3xl font-light">Still need help?</h2>
          <p className="mt-2 text-center text-muted-foreground">Our support team is here to assist you</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <motion.div
              className="rounded-2xl border border-border bg-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-medium">Live Chat</h3>
              <p className="mt-1 text-sm text-muted-foreground">Chat with our support team</p>
              <button className="mt-4 w-full rounded-full bg-foreground py-3 font-medium text-background transition-all hover:opacity-90">
                Start Chat
              </button>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-border bg-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-medium">Email Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">support@jainjodi.com</p>
              <button className="mt-4 w-full rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted">
                Send Email
              </button>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-border bg-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
                <Phone className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-medium">Phone Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">Mon-Sat, 10am-6pm IST</p>
              <button className="mt-4 w-full rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted">
                +91 1800-XXX-XXXX
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;