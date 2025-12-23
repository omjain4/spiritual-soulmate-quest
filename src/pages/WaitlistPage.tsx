import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Share2, Gift, Zap, TrendingUp, Copy, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const WaitlistPage = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 27, seconds: 45 });

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
      <motion.div 
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-2xl font-bold text-white shadow-glow md:h-20 md:w-20 md:text-3xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {value.toString().padStart(2, "0")}
      </motion.div>
      <span className="mt-2 text-xs font-medium text-muted-foreground md:text-sm">{label}</span>
    </div>
  );

  return (
    <div className="page-container">
      <Navbar />

      <div className="content-container">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center gap-4 md:hidden">
          <button onClick={() => navigate(-1)} className="icon-btn">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Waitlist Status</h1>
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Position Card */}
          <motion.div 
            className="section-card relative overflow-hidden text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-primary opacity-10" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-secondary opacity-10" />
            
            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                <Clock className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Your Position</p>
              
              <motion.div
                className="my-4 text-7xl font-bold text-gradient-primary md:text-8xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                #247
              </motion.div>

              <p className="text-muted-foreground">in the 22-25 age bracket</p>
            </div>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div 
            className="section-card mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-6 text-lg font-semibold">Estimated Time to Access</h3>
            <div className="flex justify-center gap-3 md:gap-4">
              <TimeBlock value={timeLeft.days} label="Days" />
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <TimeBlock value={timeLeft.minutes} label="Minutes" />
              <TimeBlock value={timeLeft.seconds} label="Seconds" />
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <motion.div 
              className="section-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-3 text-3xl font-bold">1,247</div>
              <p className="text-sm text-muted-foreground">Total in Queue</p>
            </motion.div>
            <motion.div 
              className="section-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="mt-3 text-3xl font-bold">1.05:1</div>
              <p className="text-sm text-muted-foreground">M:F Ratio</p>
            </motion.div>
          </div>

          {/* Skip the Line */}
          <motion.div 
            className="section-card mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                <Gift className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Skip the Line</h3>
                <p className="text-sm text-muted-foreground">
                  Refer 3 friends to move up 50 positions!
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-muted/50 p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Your Referral Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 overflow-hidden rounded-xl bg-card px-4 py-3 text-sm border border-border">
                  <span className="truncate block">{referralLink}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white transition-transform hover:scale-105"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button className="btn-outline flex flex-1 items-center justify-center gap-2">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button
                onClick={() => navigate("/premium")}
                className="btn-primary flex flex-1 items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" /> Fast-Track
              </button>
            </div>
          </motion.div>

          {/* Referral Progress */}
          <motion.div 
            className="section-card mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Referral Progress</h3>
              <span className="badge-primary">+17 positions</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: "33%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">1 of 3 referrals</span>
              <span className="font-medium text-primary">2 more to unlock priority!</span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPage;
