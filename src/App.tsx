import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DiscoverPage from "./pages/DiscoverPage";
import PremiumPage from "./pages/PremiumPage";
import TrustSafetyPage from "./pages/TrustSafetyPage";
import FamilyModePage from "./pages/FamilyModePage";
import ProfilePage from "./pages/ProfilePage";
import WaitlistPage from "./pages/WaitlistPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/trust-safety" element={<TrustSafetyPage />} />
          <Route path="/family-mode" element={<FamilyModePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/waitlist" element={<WaitlistPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
