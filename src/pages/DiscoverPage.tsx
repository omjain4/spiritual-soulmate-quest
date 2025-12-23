import { useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Filter, LayoutGrid, Layers, Heart, X, MessageCircle, Sparkles, Bookmark, RotateCcw, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const initialProfiles = [
  {
    id: 1,
    name: "Priya",
    age: 25,
    location: "Mumbai, Maharashtra",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    rating: 92,
    sect: "Shwetambar - Murtipujak",
    prompts: [
      { question: "My favorite Tirth is...", answer: "Palitana - the serenity there is unmatched! 🛕" },
      { question: "On Sundays, I usually...", answer: "Temple in the morning, family lunch, and reading in the evening" },
    ],
  },
  {
    id: 2,
    name: "Ananya",
    age: 27,
    location: "Ahmedabad, Gujarat",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    rating: 88,
    sect: "Digambar",
    prompts: [
      { question: "A value I hold dear is...", answer: "Ahimsa - in thoughts, words, and actions 🙏" },
      { question: "I'm looking for someone who...", answer: "Values tradition but embraces modern thinking" },
    ],
  },
  {
    id: 3,
    name: "Kavya",
    age: 24,
    location: "Bangalore, Karnataka",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
    rating: 85,
    sect: "Shwetambar - Sthanakvasi",
    prompts: [
      { question: "My favorite Tirth is...", answer: "Shikharji - the ultimate pilgrimage destination ✨" },
      { question: "On Sundays, I usually...", answer: "Pratikraman followed by cooking Jain food with family" },
    ],
  },
  {
    id: 4,
    name: "Meera",
    age: 26,
    location: "Jaipur, Rajasthan",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
    rating: 90,
    sect: "Shwetambar - Terapanthi",
    prompts: [
      { question: "A value I hold dear is...", answer: "Aparigraha - living simply and mindfully" },
      { question: "On weekends you'll find me...", answer: "At meditation camps or volunteering" },
    ],
  },
  {
    id: 5,
    name: "Neha",
    age: 25,
    location: "Pune, Maharashtra",
    imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
    rating: 87,
    sect: "Shwetambar - Murtipujak",
    prompts: [
      { question: "My favorite Tirth is...", answer: "Ranakpur temples for their architecture 🏛️" },
      { question: "A value I hold dear is...", answer: "Compassion towards all living beings" },
    ],
  },
];

const DiscoverPage = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [profiles, setProfiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<number[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);
  const [viewingProfile, setViewingProfile] = useState<typeof initialProfiles[0] | null>(null);
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);

  const currentProfile = profiles[currentIndex];

  const getProfilePhotos = (profile: typeof initialProfiles[0]) => [
    profile.imageUrl,
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
  ];

  const handleSwipe = useCallback((swipeDirection: "left" | "right") => {
    if (!currentProfile) return;
    setDirection(swipeDirection);
    if (swipeDirection === "right") {
      setLikedProfiles((prev) => [...prev, currentProfile.id]);
      toast({ title: `You liked ${currentProfile.name}! ❤️`, description: "We'll let them know you're interested." });
    }
    setTimeout(() => { setCurrentIndex((prev) => prev + 1); setDirection(null); }, 300);
  }, [currentProfile, toast]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) handleSwipe("right");
    else if (info.offset.x < -threshold) handleSwipe("left");
  };

  const handleSave = () => {
    if (!currentProfile) return;
    setSavedProfiles((prev) => [...prev, currentProfile.id]);
    toast({ title: "Profile saved! 🔖", description: `${currentProfile.name} has been added to your saved profiles.` });
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setLikedProfiles((prev) => prev.filter((id) => id !== profiles[currentIndex - 1].id));
    }
  };

  const cardVariants = {
    enter: { x: 300, opacity: 0, scale: 0.9 },
    center: { x: 0, opacity: 1, scale: 1 },
    exitLeft: { x: -300, opacity: 0, scale: 0.9, rotate: -10 },
    exitRight: { x: 300, opacity: 0, scale: 0.9, rotate: 10 },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Discover</span>
            <h1 className="mt-2 font-serif text-4xl font-light text-foreground md:text-5xl">Find your <span className="italic text-primary">match</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-full bg-muted p-1 md:flex">
              <button onClick={() => setViewMode("card")} className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${viewMode === "card" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                <Layers className="h-5 w-5" />
              </button>
              <button onClick={() => setViewMode("grid")} className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, index) => (
              <motion.div key={profile.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group cursor-pointer">
                <div className="overflow-hidden rounded-2xl bg-card transition-all hover:shadow-xl">
                  <div className="relative aspect-[3/4]">
                    <img src={profile.imageUrl} alt={profile.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute right-3 top-3">
                      <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"><Sparkles className="h-3 w-3" />{profile.rating}%</div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-2xl font-medium text-white">{profile.name}, {profile.age}</h3>
                      <p className="mt-1 text-sm text-white/70">{profile.location}</p>
                      <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{profile.sect}</span>
                    </div>
                    <div className="absolute bottom-5 right-5 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => { setViewingProfile(profile); setProfilePhotoIndex(0); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-110"><Eye className="h-5 w-5" /></button>
                      <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition-transform hover:scale-110"><X className="h-6 w-6" /></button>
                      <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110"><Heart className="h-6 w-6" fill="white" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <div className="mx-auto flex max-w-4xl items-center justify-center gap-6">
              {/* Left Side Actions - Desktop */}
              <div className="hidden flex-col gap-4 md:flex">
                <motion.button onClick={handleUndo} disabled={currentIndex === 0} className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted disabled:opacity-30" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><RotateCcw className="h-6 w-6" /></motion.button>
                <motion.button onClick={() => handleSwipe("left")} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-500 shadow-lg transition-all hover:bg-red-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X className="h-8 w-8" /></motion.button>
              </div>

              {/* Card */}
              <div className="relative h-[600px] w-full max-w-md md:h-[650px]">
                <AnimatePresence mode="wait">
                  {currentProfile ? (
                    <motion.div key={currentProfile.id} className="absolute inset-0" variants={cardVariants} initial="enter" animate="center" exit={direction === "left" ? "exitLeft" : "exitRight"} transition={{ type: "spring", stiffness: 300, damping: 30 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8} onDragEnd={handleDragEnd} whileDrag={{ cursor: "grabbing" }}>
                      <div className="h-full overflow-hidden rounded-3xl bg-card shadow-2xl">
                        <div className="relative h-full">
                          <img src={currentProfile.imageUrl} alt={currentProfile.name} className="h-full w-full object-cover" draggable={false} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <motion.div className="absolute left-6 top-6 rounded-xl bg-red-500 px-4 py-2 text-lg font-bold text-white" style={{ opacity: direction === "left" ? 1 : 0 }}>NOPE</motion.div>
                          <motion.div className="absolute right-6 top-6 rounded-xl bg-green-500 px-4 py-2 text-lg font-bold text-white" style={{ opacity: direction === "right" ? 1 : 0 }}>LIKE</motion.div>
                          <div className="absolute right-4 top-4"><div className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"><Sparkles className="h-4 w-4" />{currentProfile.rating}% Match</div></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h2 className="font-serif text-4xl font-light text-white">{currentProfile.name}, {currentProfile.age}</h2>
                            <p className="mt-1 text-white/70">{currentProfile.location}</p>
                            <span className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">{currentProfile.sect}</span>
                            <div className="mt-4 space-y-2">
                              {currentProfile.prompts.slice(0, 1).map((prompt, idx) => (
                                <div key={idx} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                  <p className="text-xs text-white/60">{prompt.question}</p>
                                  <p className="mt-1 text-sm text-white">{prompt.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center text-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted"><Heart className="h-12 w-12 text-muted-foreground/50" /></div>
                      <h3 className="mt-6 font-serif text-2xl font-light">No more profiles</h3>
                      <p className="mt-2 text-muted-foreground">Check back later for more matches!</p>
                      <button onClick={() => { setProfiles(initialProfiles); setCurrentIndex(0); setLikedProfiles([]); }} className="mt-8 rounded-full bg-foreground px-8 py-4 font-medium text-background transition-all hover:opacity-90">Start Over</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side Actions - Desktop */}
              <div className="hidden flex-col gap-4 md:flex">
                <motion.button onClick={handleSave} className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-blue-500 transition-all hover:bg-blue-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Bookmark className="h-6 w-6" /></motion.button>
                <motion.button onClick={() => { if (currentProfile) { setViewingProfile(currentProfile); setProfilePhotoIndex(0); } }} className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-muted" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Eye className="h-6 w-6" /></motion.button>
                <motion.button onClick={() => handleSwipe("right")} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Heart className="h-8 w-8" fill="white" /></motion.button>
                <motion.button className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-purple-500 transition-all hover:bg-purple-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><MessageCircle className="h-6 w-6" /></motion.button>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            {currentProfile && (
              <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
                <motion.button onClick={handleUndo} disabled={currentIndex === 0} className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted disabled:opacity-30" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><RotateCcw className="h-5 w-5" /></motion.button>
                <motion.button onClick={() => handleSwipe("left")} className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-500 shadow-lg transition-all hover:bg-red-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X className="h-8 w-8" /></motion.button>
                <motion.button onClick={handleSave} className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-blue-500 transition-all hover:bg-blue-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Bookmark className="h-5 w-5" /></motion.button>
                <motion.button onClick={() => handleSwipe("right")} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Heart className="h-8 w-8" fill="white" /></motion.button>
                <motion.button className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-purple-500 transition-all hover:bg-purple-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><MessageCircle className="h-5 w-5" /></motion.button>
              </div>
            )}

            {currentProfile && (
              <div className="mt-6 flex justify-center gap-1.5">
                {profiles.map((_, idx) => (
                  <div key={idx} className={`h-1.5 w-8 rounded-full transition-colors ${idx < currentIndex ? "bg-primary" : idx === currentIndex ? "bg-primary/50" : "bg-muted"}`} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile View Modal */}
      <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
          {viewingProfile && (
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={getProfilePhotos(viewingProfile)[profilePhotoIndex]} alt={viewingProfile.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {profilePhotoIndex > 0 && (<button onClick={() => setProfilePhotoIndex((prev) => prev - 1)} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"><ChevronLeft className="h-6 w-6" /></button>)}
                {profilePhotoIndex < getProfilePhotos(viewingProfile).length - 1 && (<button onClick={() => setProfilePhotoIndex((prev) => prev + 1)} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"><ChevronRight className="h-6 w-6" /></button>)}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">{getProfilePhotos(viewingProfile).map((_, idx) => (<button key={idx} onClick={() => setProfilePhotoIndex(idx)} className={`h-2 w-8 rounded-full transition-all ${idx === profilePhotoIndex ? "bg-white" : "bg-white/40"}`} />))}</div>
                <div className="absolute right-4 top-4"><div className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"><Sparkles className="h-4 w-4" />{viewingProfile.rating}% Match</div></div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-3xl font-light text-foreground">{viewingProfile.name}, {viewingProfile.age}</h2>
                    <p className="mt-1 text-muted-foreground">{viewingProfile.location}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">{viewingProfile.sect}</span>
                </div>
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">About</h3>
                  {viewingProfile.prompts.map((prompt, idx) => (
                    <div key={idx} className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-muted-foreground">{prompt.question}</p>
                      <p className="mt-2 text-foreground">{prompt.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <motion.button onClick={() => { setViewingProfile(null); handleSwipe("left"); }} className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-500 shadow-lg transition-all hover:bg-red-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X className="h-7 w-7" /></motion.button>
                  <motion.button onClick={() => { setViewingProfile(null); handleSwipe("right"); }} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Heart className="h-8 w-8" fill="white" /></motion.button>
                  <motion.button className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-purple-500 transition-all hover:bg-purple-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><MessageCircle className="h-6 w-6" /></motion.button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="hidden md:block"><Footer /></div>
    </div>
  );
};

export default DiscoverPage;
