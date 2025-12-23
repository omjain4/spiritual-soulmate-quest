import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, BadgeCheck, Camera, Users, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
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
    { id: "2", name: "Priya Shah", relationship: "Samaj Member", status: "pending" as const, date: "2025-01-20" },
  ];

  return (
    <div className="app-container min-h-screen pb-8">
      <div className="sticky top-0 z-40 bg-background/80 p-4 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Trust & Safety</h1>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Trust Score */}
        <GlassCard elevated className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-light">
            <Shield className="h-8 w-8 text-sage-dark" />
          </div>
          <h2 className="text-2xl font-bold">Trust Score: 75%</h2>
          <p className="text-sm text-muted-foreground">Complete verification to boost visibility</p>
        </GlassCard>

        {/* Stepper */}
        <Stepper steps={verificationSteps} currentStep={currentStep} onStepClick={setCurrentStep} />

        {/* Step Content */}
        {currentStep === 0 && (
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">ID Verification</h3>
            </div>
            {idVerified ? (
              <div className="rounded-xl bg-sage-light p-4 text-center">
                <BadgeCheck className="mx-auto h-12 w-12 text-sage" />
                <p className="mt-2 font-medium text-sage-dark">Verified!</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Upload Aadhar or Government ID</p>
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                  <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Tap to upload document</p>
                </div>
                <button onClick={() => { setIdVerified(true); setCurrentStep(1); }} className="btn-saffron w-full">
                  Simulate Verification
                </button>
              </>
            )}
          </GlassCard>
        )}

        {currentStep === 1 && (
          <GlassCard>
            <LivenessCheck onComplete={() => { setSelfieVerified(true); setCurrentStep(2); }} onSkip={() => setCurrentStep(2)} />
          </GlassCard>
        )}

        {currentStep === 2 && (
          <GlassCard>
            <VouchCard requests={mockVouchRequests} />
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default TrustSafetyPage;
