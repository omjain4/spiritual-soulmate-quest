import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Shield, BadgeCheck, Camera, Lock, 
  CheckCircle2, Upload, UserCheck, Users 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Stepper from "@/components/Stepper";
import LivenessCheck from "@/components/LivenessCheck";
import VouchCard from "@/components/VouchCard";

const verificationSteps = [
  { id: "id", title: "ID Verify" },
  { id: "selfie", title: "Selfie" },
  { id: "vouch", title: "Vouch" },
];

const TrustSafetyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [idVerified, setIdVerified] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);

  const mockVouchRequests = [
    { id: "1", name: "Rajesh Mehta", relationship: "Family Friend", status: "verified" as const, date: "2025-01-15" },
    { id: "2", name: "Priya Shah", relationship: "Community Member", status: "pending" as const, date: "2025-01-20" },
  ];

  const trustScore = idVerified && selfieVerified ? 95 : idVerified ? 65 : 35;

  return (
    <div className="page-container">
      <Navbar />
      
      <div className="content-container">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center gap-4 md:hidden">
          <button onClick={() => navigate(-1)} className="icon-btn">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Trust & Safety</h1>
        </div>

        {/* Desktop Header */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-gradient-primary">Trust & Safety</h1>
          <p className="mt-2 text-muted-foreground">Verify your profile to build trust with potential matches</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trust Score Card */}
          <div className="lg:col-span-1">
            <motion.div 
              className="section-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative mx-auto mb-4 h-32 w-32">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={283}
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * trustScore) / 100 }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(340 75% 55%)" />
                      <stop offset="100%" stopColor="hsl(280 60% 60%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{trustScore}%</span>
                </div>
              </div>
              <h2 className="text-xl font-bold">Trust Score</h2>
              <p className="mt-1 text-sm text-muted-foreground">Complete verification to boost your visibility</p>

              <div className="mt-6 space-y-3">
                <div className={`flex items-center gap-3 rounded-xl p-3 ${idVerified ? 'bg-green-50 text-green-700' : 'bg-muted'}`}>
                  {idVerified ? <CheckCircle2 className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5 text-muted-foreground" />}
                  <span className="text-sm font-medium">ID Verified</span>
                </div>
                <div className={`flex items-center gap-3 rounded-xl p-3 ${selfieVerified ? 'bg-green-50 text-green-700' : 'bg-muted'}`}>
                  {selfieVerified ? <CheckCircle2 className="h-5 w-5" /> : <Camera className="h-5 w-5 text-muted-foreground" />}
                  <span className="text-sm font-medium">Selfie Verified</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Verification Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stepper */}
            <Stepper steps={verificationSteps} currentStep={currentStep} onStepClick={setCurrentStep} />

            {/* Step Content */}
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="section-card"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                      <BadgeCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">ID Verification</h3>
                      <p className="text-sm text-muted-foreground">Upload a government-issued ID</p>
                    </div>
                  </div>

                  {idVerified ? (
                    <div className="rounded-2xl bg-green-50 p-6 text-center">
                      <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                      <p className="mt-3 font-semibold text-green-700">Verification Complete!</p>
                      <p className="text-sm text-green-600">Your ID has been verified</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 cursor-pointer">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="mt-4 font-medium">Drop your ID here or click to upload</p>
                        <p className="mt-1 text-sm text-muted-foreground">Aadhar, PAN, Passport, or Driving License</p>
                      </div>
                      <button 
                        onClick={() => { setIdVerified(true); setCurrentStep(1); }} 
                        className="btn-primary w-full"
                      >
                        Verify ID
                      </button>
                    </>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <LivenessCheck 
                  onComplete={() => { setSelfieVerified(true); setCurrentStep(2); }} 
                  onSkip={() => setCurrentStep(2)} 
                />
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Community Vouches</h3>
                      <p className="text-sm text-muted-foreground">Get verified by people who know you</p>
                    </div>
                  </div>
                  <VouchCard requests={mockVouchRequests} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSafetyPage;
