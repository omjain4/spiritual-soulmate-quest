import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MessageCircle, Phone, Mail, ChevronDown, 
  User, Heart, Shield, CreditCard, Settings, HelpCircle 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  { id: "account", label: "Account & Profile", icon: <User className="h-5 w-5" /> },
  { id: "matching", label: "Matching & Likes", icon: <Heart className="h-5 w-5" /> },
  { id: "safety", label: "Safety & Privacy", icon: <Shield className="h-5 w-5" /> },
  { id: "premium", label: "Premium & Billing", icon: <CreditCard className="h-5 w-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
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
    <div className="page-container">
      <Navbar />

      <div className="content-container">
        {/* Hero */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold md:text-4xl">How can we help you?</h1>
          <p className="mt-2 text-muted-foreground">
            Search our help center or browse categories below
          </p>

          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-12"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !selectedCategory ? "bg-gradient-primary text-white shadow-glow" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
                  ? "bg-gradient-primary text-white shadow-glow" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                className="section-card"
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
            <div className="py-12 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 font-semibold">No results found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or category
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold">Still need help?</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Our support team is here to assist you
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <motion.div
              className="section-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold">Live Chat</h3>
              <p className="mt-1 text-sm text-muted-foreground">Chat with our support team</p>
              <button className="btn-primary mt-4 w-full">Start Chat</button>
            </motion.div>

            <motion.div
              className="section-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold">Email Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">support@jainjodi.com</p>
              <button className="btn-outline mt-4 w-full">Send Email</button>
            </motion.div>

            <motion.div
              className="section-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                <Phone className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold">Phone Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">Mon-Sat, 10am-6pm IST</p>
              <button className="btn-outline mt-4 w-full">+91 1800-XXX-XXXX</button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;
