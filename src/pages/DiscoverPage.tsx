import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Filter, LayoutGrid, Layers, Heart, X, MessageCircle, Sparkles, Bookmark, RotateCcw, Eye, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import FilterModal from "@/components/FilterModal";
import NotificationPermissionBanner from "@/components/NotificationPermissionBanner";
import { useToast } from "@/hooks/use-toast";
import { useProfiles, Profile } from "@/hooks/useProfiles";
import { useNavigate } from "react-router-dom";

const DiscoverPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    profiles,
    currentProfile,
    currentIndex,
    loading,
    likeProfile,
    skipProfile,
    saveProfile,
    nextProfile,
    previousProfile,
    refetch,
    isEmpty
  } = useProfiles();

  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [profilePhotoIndex, setProfilePhotoIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: [18, 50] as [number, number],
    locations: [] as string[],
    sects: [] as string[],
    dietary: [] as string[],
  });

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter profiles based on selected filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      // Age filter
      const age = calculateAge(profile.date_of_birth);
      if (age !== null && (age < filters.ageRange[0] || age > filters.ageRange[1])) {
        return false;
      }

      // Location filter
      if (filters.locations.length > 0 && profile.location) {
        if (!filters.locations.some((loc) => profile.location?.toLowerCase().includes(loc.toLowerCase()))) {
          return false;
        }
      }

      // Sect filter
      if (filters.sects.length > 0 && profile.sect) {
        if (!filters.sects.includes(profile.sect)) {
          return false;
        }
      }

      // Dietary filter
      if (filters.dietary.length > 0 && profile.dietary_preference) {
        const dietaryMap: Record<string, string[]> = {
          "Strict Jain (No root vegetables)": ["strict-jain"],
          "Jain Vegetarian": ["jain-veg"],
          "Vegetarian": ["vegetarian"],
          "Flexible": ["flexible"],
        };
        const allowedPrefs = filters.dietary.flatMap((d) => dietaryMap[d] || []);
        if (!allowedPrefs.includes(profile.dietary_preference)) {
          return false;
        }
      }

      return true;
    });
  }, [profiles, filters]);

  const currentFilteredProfile = filteredProfiles[currentIndex] || null;
  const getProfilePhotos = (profile: Profile) => profile.photos?.length ? profile.photos : ['/placeholder.svg'];
  const getMainPhoto = (profile: Profile) => {
    const photos = getProfilePhotos(profile);
    return photos[0] || '/placeholder.svg';
  };

  const handleSwipe = useCallback(async (swipeDirection: "left" | "right") => {
    if (!currentProfile) return;
    
    setDirection(swipeDirection);
    
    if (swipeDirection === "right") {
      const isMatch = await likeProfile(currentProfile.user_id);
      if (!isMatch) {
        toast({
          title: `You liked ${currentProfile.name}! ❤️`,
          description: "We'll let them know you're interested.",
        });
      }
    } else {
      await skipProfile(currentProfile.user_id);
    }
    
    setTimeout(() => {
      nextProfile();
      setDirection(null);
    }, 300);
  }, [currentProfile, likeProfile, skipProfile, nextProfile, toast]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) handleSwipe("right");
    else if (info.offset.x < -threshold) handleSwipe("left");
  };

  const handleSave = async () => {
    if (!currentProfile) return;
    await saveProfile(currentProfile.user_id);
  };

  const handleUndo = () => {
    previousProfile();
  };

  const cardVariants = {
    enter: { x: 300, opacity: 0, scale: 0.9 },
    center: { x: 0, opacity: 1, scale: 1 },
    exitLeft: { x: -300, opacity: 0, scale: 0.9, rotate: -10 },
    exitRight: { x: 300, opacity: 0, scale: 0.9, rotate: 10 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <NotificationPermissionBanner />
      
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
            <button 
              onClick={() => setShowFilters(true)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                filters.locations.length > 0 || filters.sects.length > 0 || filters.dietary.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {isEmpty || filteredProfiles.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={filters.locations.length > 0 || filters.sects.length > 0 || filters.dietary.length > 0 
              ? "No matches with current filters" 
              : "No profiles yet"}
            description={filters.locations.length > 0 || filters.sects.length > 0 || filters.dietary.length > 0
              ? "Try adjusting your filters to see more profiles"
              : "We're looking for matches based on your preferences. Check back soon!"}
            action={{ 
              label: filters.locations.length > 0 || filters.sects.length > 0 || filters.dietary.length > 0 
                ? "Clear Filters" 
                : "Refresh", 
              onClick: filters.locations.length > 0 || filters.sects.length > 0 || filters.dietary.length > 0
                ? () => setFilters({ ageRange: [18, 50], locations: [], sects: [], dietary: [] })
                : refetch 
            }}
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile, index) => (
              <motion.div key={profile.profile_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group cursor-pointer">
                <div className="overflow-hidden rounded-2xl bg-card transition-all hover:shadow-xl">
                  <div className="relative aspect-[3/4]">
                    <img src={getMainPhoto(profile)} alt={profile.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute right-3 top-3">
                      <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"><Sparkles className="h-3 w-3" />{profile.match_score}%</div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-2xl font-medium text-white">{profile.name}{calculateAge(profile.date_of_birth) && `, ${calculateAge(profile.date_of_birth)}`}</h3>
                      <p className="mt-1 text-sm text-white/70">{profile.location || "Location not set"}</p>
                      {profile.sect && <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{profile.sect}</span>}
                    </div>
                    <div className="absolute bottom-5 right-5 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => { setViewingProfile(profile); setProfilePhotoIndex(0); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-110"><Eye className="h-5 w-5" /></button>
                      <button onClick={() => skipProfile(profile.user_id)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition-transform hover:scale-110"><X className="h-6 w-6" /></button>
                      <button onClick={() => likeProfile(profile.user_id)} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110"><Heart className="h-6 w-6" fill="white" /></button>
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
                  {currentFilteredProfile ? (
                    <motion.div key={currentFilteredProfile.profile_id} className="absolute inset-0" variants={cardVariants} initial="enter" animate="center" exit={direction === "left" ? "exitLeft" : "exitRight"} transition={{ type: "spring", stiffness: 300, damping: 30 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8} onDragEnd={handleDragEnd} whileDrag={{ cursor: "grabbing" }}>
                      <div className="h-full overflow-hidden rounded-3xl bg-card shadow-2xl">
                        <div className="relative h-full">
                          <img src={getMainPhoto(currentFilteredProfile)} alt={currentFilteredProfile.name} className="h-full w-full object-cover" draggable={false} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <motion.div className="absolute left-6 top-6 rounded-xl bg-red-500 px-4 py-2 text-lg font-bold text-white" style={{ opacity: direction === "left" ? 1 : 0 }}>NOPE</motion.div>
                          <motion.div className="absolute right-6 top-6 rounded-xl bg-green-500 px-4 py-2 text-lg font-bold text-white" style={{ opacity: direction === "right" ? 1 : 0 }}>LIKE</motion.div>
                          <div className="absolute right-4 top-4"><div className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"><Sparkles className="h-4 w-4" />{currentFilteredProfile.match_score}% Match</div></div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h2 className="font-serif text-4xl font-light text-white">{currentFilteredProfile.name}{calculateAge(currentFilteredProfile.date_of_birth) && `, ${calculateAge(currentFilteredProfile.date_of_birth)}`}</h2>
                            <p className="mt-1 text-white/70">{currentFilteredProfile.location || "Location not set"}</p>
                            {currentFilteredProfile.sect && <span className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">{currentFilteredProfile.sect}</span>}
                            <div className="mt-4 space-y-2">
                              {currentFilteredProfile.prompts?.slice(0, 1).map((prompt, idx) => (
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
                    <EmptyState
                      icon={Heart}
                      title="No more profiles"
                      description="Check back later for more matches!"
                      action={{ label: "Start Over", onClick: refetch }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side Actions - Desktop */}
              <div className="hidden flex-col gap-4 md:flex">
                <motion.button onClick={handleSave} className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-blue-500 transition-all hover:bg-blue-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Bookmark className="h-6 w-6" /></motion.button>
                <motion.button onClick={() => { if (currentFilteredProfile) { setViewingProfile(currentFilteredProfile); setProfilePhotoIndex(0); } }} className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-muted" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Eye className="h-6 w-6" /></motion.button>
                <motion.button onClick={() => handleSwipe("right")} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Heart className="h-8 w-8" fill="white" /></motion.button>
                <motion.button onClick={() => navigate('/chat')} className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-purple-500 transition-all hover:bg-purple-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><MessageCircle className="h-6 w-6" /></motion.button>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            {currentFilteredProfile && (
              <div className="mt-8 flex items-center justify-center gap-3 md:hidden">
                <motion.button onClick={handleUndo} disabled={currentIndex === 0} className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted disabled:opacity-30" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><RotateCcw className="h-5 w-5" /></motion.button>
                <motion.button onClick={() => handleSwipe("left")} className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-500 shadow-lg transition-all hover:bg-red-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X className="h-7 w-7" /></motion.button>
                <motion.button onClick={handleSave} className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-blue-500 transition-all hover:bg-blue-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Bookmark className="h-5 w-5" /></motion.button>
                <motion.button onClick={() => { setViewingProfile(currentFilteredProfile); setProfilePhotoIndex(0); }} className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-muted" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Eye className="h-5 w-5" /></motion.button>
                <motion.button onClick={() => handleSwipe("right")} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Heart className="h-7 w-7" fill="white" /></motion.button>
                <motion.button onClick={() => navigate('/chat')} className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-purple-500 transition-all hover:bg-purple-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><MessageCircle className="h-5 w-5" /></motion.button>
              </div>
            )}

            {currentFilteredProfile && (
              <div className="mt-6 flex justify-center gap-1.5">
                {filteredProfiles.map((_, idx) => (
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
                
                {/* Photo navigation */}
                {getProfilePhotos(viewingProfile).length > 1 && (
                  <>
                    <div className="absolute left-4 right-4 top-4 flex gap-1">
                      {getProfilePhotos(viewingProfile).map((_, idx) => (
                        <div key={idx} className={`h-1 flex-1 rounded-full ${idx === profilePhotoIndex ? "bg-white" : "bg-white/40"}`} />
                      ))}
                    </div>
                    <button onClick={() => setProfilePhotoIndex(Math.max(0, profilePhotoIndex - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm"><ChevronLeft className="h-6 w-6" /></button>
                    <button onClick={() => setProfilePhotoIndex(Math.min(getProfilePhotos(viewingProfile).length - 1, profilePhotoIndex + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm"><ChevronRight className="h-6 w-6" /></button>
                  </>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-3xl text-white">{viewingProfile.name}{calculateAge(viewingProfile.date_of_birth) && `, ${calculateAge(viewingProfile.date_of_birth)}`}</h2>
                    {viewingProfile.is_verified && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white"><Sparkles className="h-3 w-3" /></div>}
                  </div>
                  <p className="mt-1 text-white/80">{viewingProfile.location}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">{viewingProfile.match_score}% Match</span>
                    {viewingProfile.sect && <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">{viewingProfile.sect}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {viewingProfile.bio && (
                  <div>
                    <h3 className="mb-2 font-medium">About</h3>
                    <p className="text-muted-foreground">{viewingProfile.bio}</p>
                  </div>
                )}

                {viewingProfile.occupation && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>💼</span> {viewingProfile.occupation}
                  </div>
                )}

                {viewingProfile.education && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>🎓</span> {viewingProfile.education}
                  </div>
                )}

                {viewingProfile.prompts?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Prompts</h3>
                    {viewingProfile.prompts.map((prompt, idx) => (
                      <div key={idx} className="rounded-xl bg-muted p-4">
                        <p className="text-xs text-muted-foreground">{prompt.question}</p>
                        <p className="mt-1">{prompt.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {viewingProfile.interests && viewingProfile.interests.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProfile.interests.map((interest, idx) => (
                        <span key={idx} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="sticky bottom-0 flex gap-3 border-t bg-background p-4">
                <button onClick={() => { skipProfile(viewingProfile.user_id); setViewingProfile(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 text-red-500 transition-colors hover:bg-red-50">
                  <X className="h-5 w-5" /> Pass
                </button>
                <button onClick={() => { likeProfile(viewingProfile.user_id); setViewingProfile(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-white transition-colors hover:opacity-90">
                  <Heart className="h-5 w-5" fill="white" /> Like
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <FilterModal
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onApply={setFilters}
      />

      <Footer />
    </div>
  );
};

export default DiscoverPage;
