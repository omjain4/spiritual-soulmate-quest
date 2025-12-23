import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ThumbsUp, ThumbsDown, MessageSquare, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacyControls from "@/components/PrivacyControls";

const mockShortlist = [
  { 
    id: "1", 
    name: "Priya Shah", 
    age: 25, 
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    suggestedBy: "Mom", 
    votes: { up: 2, down: 0 }, 
    comment: "Good education, let's talk" 
  },
  { 
    id: "2", 
    name: "Ananya Jain", 
    age: 24, 
    location: "Ahmedabad",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    suggestedBy: "Dad", 
    votes: { up: 1, down: 1 }, 
    comment: "" 
  },
  { 
    id: "3", 
    name: "Kavya Mehta", 
    age: 26, 
    location: "Bangalore",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop",
    suggestedBy: "Uncle", 
    votes: { up: 3, down: 0 }, 
    comment: "Great family values" 
  },
];

const familyMembers = [
  { id: "1", name: "Mom", avatar: "👩", active: true },
  { id: "2", name: "Dad", avatar: "👨", active: true },
  { id: "3", name: "Sister", avatar: "👧", active: false },
];

const FamilyModePage = () => {
  const navigate = useNavigate();
  const [isFamilyView, setIsFamilyView] = useState(true);
  const [activeTab, setActiveTab] = useState<"shortlist" | "privacy">("shortlist");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Collaboration</span>
            <h1 className="mt-2 font-serif text-4xl font-light text-foreground md:text-5xl">
              Family <span className="italic text-primary">Mode</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Collaborate with your family on finding the perfect match</p>
          </div>
          <button
            onClick={() => setIsFamilyView(!isFamilyView)}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${
              isFamilyView ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Users className="h-4 w-4" />
            {isFamilyView ? "Family View Active" : "Switch to Family View"}
          </button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Family Members - Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <motion.div 
              className="rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="mb-4 font-medium">Family Members</h3>
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{member.avatar}</span>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${member.active ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  </div>
                ))}
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted">
                <UserPlus className="h-4 w-4" />
                Invite Family
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="mb-4 font-medium">Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="font-serif text-3xl font-light text-foreground">{mockShortlist.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Shortlisted</p>
                </div>
                <div className="text-center">
                  <div className="font-serif text-3xl font-light text-foreground">8</div>
                  <p className="mt-1 text-xs text-muted-foreground">Suggestions</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 rounded-full bg-muted p-1">
              <button
                onClick={() => setActiveTab("shortlist")}
                className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
                  activeTab === "shortlist" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Shared Shortlist
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
                  activeTab === "privacy" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Privacy Settings
              </button>
            </div>

            {activeTab === "shortlist" ? (
              <div className="space-y-4">
                {mockShortlist.map((profile, index) => (
                  <motion.div 
                    key={profile.id} 
                    className="rounded-2xl border border-border bg-card p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex gap-4">
                      <img 
                        src={profile.image} 
                        alt={profile.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium">{profile.name}, {profile.age}</h4>
                            <p className="text-sm text-muted-foreground">{profile.location}</p>
                            <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              Suggested by {profile.suggestedBy}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100">
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100">
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {profile.votes.up}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsDown className="h-3 w-3" /> {profile.votes.down}
                          </span>
                        </div>

                        {profile.comment && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                            <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">"{profile.comment}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PrivacyControls onSave={(settings) => console.log("Saved:", settings)} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FamilyModePage;