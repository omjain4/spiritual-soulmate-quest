import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Share2, Gift, Zap, TrendingUp, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const WaitlistPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 27, seconds: 45 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return prev;
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const referralCode = "JAIN2025";
  const referralLink = `https://jainjodi.com/invite/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-saffron-glow text-2xl font-bold text-white shadow-glow md:h-20 md:w-20 md:text-3xl">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="mt-2 text-xs text-muted-foreground md:text-sm">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pt-20 md:pt-32">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center gap-4 md:hidden">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Waitlist Status</h1>
        </div>

        {/* Position Card */}
        <GlassCard elevated className="relative overflow-hidden text-center">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sage/10" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Your Position</span>
            </div>
            
            <motion.div
              className="my-6 text-7xl font-bold text-gradient-saffron md:text-8xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              #247
            </motion.div>

            <p className="text-muted-foreground">in the 22-25 age bracket</p>
          </div>
        </GlassCard>

        {/* Countdown Timer */}
        <GlassCard className="mt-6 text-center">
          <h3 className="mb-4 font-semibold">Estimated Time to Access</h3>
          <div className="flex justify-center gap-3 md:gap-4">
            <TimeBlock value={timeLeft.days} label="Days" />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <GlassCard className="text-center">
            <Users className="mx-auto h-8 w-8 text-primary" />
            <div className="mt-2 text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Total in Queue</p>
          </GlassCard>
          <GlassCard className="text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-sage" />
            <div className="mt-2 text-2xl font-bold">1.05:1</div>
            <p className="text-xs text-muted-foreground">M:F Ratio</p>
          </GlassCard>
        </div>

        {/* Skip the Line */}
        <GlassCard elevated className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-light">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Skip the Line</h3>
              <p className="text-sm text-muted-foreground">
                Refer 3 friends to move up 50 positions!
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
            <p className="mb-2 text-xs text-muted-foreground">Your Referral Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-lg bg-card px-3 py-2 text-sm">
                <span className="truncate">{referralLink}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="btn-sage flex flex-1 items-center justify-center gap-2 py-2">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button
              onClick={() => navigate("/premium")}
              className="btn-saffron flex flex-1 items-center justify-center gap-2 py-2"
            >
              <Zap className="h-4 w-4" /> Fast-Track
            </button>
          </div>
        </GlassCard>

        {/* Referral Progress */}
        <GlassCard className="mt-6">
          <h3 className="mb-4 font-semibold">Referral Progress</h3>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">1 of 3 referrals</span>
            <span className="font-medium text-primary">+17 positions</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-saffron-glow"
              initial={{ width: 0 }}
              animate={{ width: "33%" }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            2 more referrals to unlock priority access!
          </p>
        </GlassCard>
      </div>

      <div className="md:hidden">
        <BottomNav activeId={activeNav} onNavigate={(id) => { setActiveNav(id); navigate(`/${id === "home" ? "" : id}`); }} />
      </div>
    </div>
  );
};

export default WaitlistPage;
