import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles, Eye, Crown, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { useLikes, useMatches, useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";

const LikesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { receivedLikes, sentLikes, loading: likesLoading, refetch: refetchLikes } = useLikes();
  const { matches, loading: matchesLoading } = useMatches();
  const { likeProfile, skipProfile } = useProfiles();
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "matches">("received");

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const handleLikeBack = async (userId: string) => {
    await likeProfile(userId);
    refetchLikes();
  };

  const handleReject = async (userId: string) => {
    await skipProfile(userId);
    refetchLikes();
  };

  const loading = likesLoading || matchesLoading;

  const renderLikeCard = (like: any, isReceived: boolean) => {
    const profile = isReceived ? like.profiles : like.profiles;
    const userId = isReceived ? like.from_user_id : like.to_user_id;
    
    if (!profile) return null;
    
    const photo = profile.photos?.[0] || '/placeholder.svg';
    const age = calculateAge(profile.date_of_birth);
    
    return (
      <motion.div
        key={like.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, x: -100 }}
        className="group relative overflow-hidden rounded-2xl bg-card"
      >
        <div className="relative aspect-[3/4]">
          <img
            src={photo}
            alt={profile.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Rating */}
          {profile.jain_rating && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              {profile.jain_rating}%
            </div>
          )}

          {/* Super like indicator */}
          {like.is_super_like && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white">
              ⭐ Super Like
            </div>
          )}

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-medium text-white">
              {profile.name}{age && `, ${age}`}
            </h3>
            <p className="text-sm text-white/70">{profile.location || "---"}</p>
            <p className="mt-1 text-xs text-white/50">{formatTimeAgo(like.created_at)}</p>
          </div>
        </div>

        {/* Action buttons - only for received likes */}
        {isReceived && (
          <div className="flex border-t border-border">
            <button
              onClick={() => handleReject(userId)}
              className="flex flex-1 items-center justify-center gap-1 py-4 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-px bg-border" />
            <button
              onClick={() => handleLikeBack(userId)}
              className="flex flex-1 items-center justify-center gap-1 py-4 text-primary transition-colors hover:bg-primary/5"
            >
              <Heart className="h-5 w-5" fill="currentColor" />
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const handleStartChat = async (matchedUserId: string) => {
    navigate(`/chat?userId=${matchedUserId}`);
  };

  const renderMatchCard = (match: any) => {
    const profile = match.profile;
    if (!profile) return null;
    
    const photo = profile.photos?.[0] || '/placeholder.svg';
    const age = calculateAge(profile.date_of_birth);
    const matchedUserId = match.user1_id === user?.id ? match.user2_id : match.user1_id;
    
    return (
      <motion.div
        key={match.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card"
        onClick={() => handleStartChat(matchedUserId)}
      >
        <div className="relative aspect-[3/4]">
          <img
            src={photo}
            alt={profile.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Match badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">
            💕 Match
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-medium text-white">
              {profile.name}{age && `, ${age}`}
            </h3>
            <p className="text-sm text-white/70">{profile.location || "---"}</p>
            <p className="mt-2 text-xs text-white/50">{formatTimeAgo(match.matched_at)}</p>
          </div>
        </div>

        <div className="flex border-t border-border">
          <button className="flex flex-1 items-center justify-center gap-2 py-4 text-primary transition-colors hover:bg-primary/5">
            Start Chat <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-12 md:pt-32 lg:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Your Admirers</span>
          <h1 className="mt-2 font-serif text-4xl font-light text-foreground md:text-5xl">
            People who <span className="italic text-primary">like</span> you
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-full bg-muted p-1">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all ${
              activeTab === "received" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Heart className="h-4 w-4" />
            Received ({receivedLikes.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 rounded-full py-3 text-sm font-medium transition-all ${
              activeTab === "sent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sent ({sentLikes.length})
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all ${
              activeTab === "matches" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            💕 Matches ({matches.length})
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Likes Grid */}
            {activeTab === "received" && (
              receivedLikes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <AnimatePresence>
                    {receivedLikes.map((like) => renderLikeCard(like, true))}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No likes yet"
                  description="Keep swiping to get more matches!"
                  action={{ label: "Start Discovering", onClick: () => navigate("/discover") }}
                />
              )
            )}

            {activeTab === "sent" && (
              sentLikes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <AnimatePresence>
                    {sentLikes.map((like) => renderLikeCard(like, false))}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No likes sent"
                  description="Start discovering profiles and send likes!"
                  action={{ label: "Start Discovering", onClick: () => navigate("/discover") }}
                />
              )
            )}

            {activeTab === "matches" && (
              matches.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <AnimatePresence>
                    {matches.map((match) => renderMatchCard(match))}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No matches yet"
                  description="When you and someone else both like each other, you'll see them here!"
                  action={{ label: "Start Discovering", onClick: () => navigate("/discover") }}
                />
              )
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LikesPage;
