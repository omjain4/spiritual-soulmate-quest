import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/discover");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMethod === "phone" && !showOtp) {
      setShowOtp(true);
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/discover");
      } else {
        await signup(email, password, name || "User");
        toast({
          title: "Account created!",
          description: "Let's complete your profile.",
        });
        navigate("/onboarding");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      {/* Background decoration */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-saffron/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />

      {/* Logo */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gradient-saffron">Jain Jodi</h1>
        <p className="mt-2 text-muted-foreground">Find your soulmate, the Jain way</p>
      </motion.div>

      {/* Auth Card */}
      <GlassCard elevated className="w-full max-w-sm">
        {/* Toggle */}
        <div className="mb-6 flex rounded-xl bg-muted p-1">
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Auth method toggle */}
        <div className="mb-6 flex gap-3">
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all ${
              authMethod === "phone"
                ? "border-primary bg-saffron-light text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
            onClick={() => {
              setAuthMethod("phone");
              setShowOtp(false);
            }}
          >
            <Phone className="h-4 w-4" />
            Phone
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all ${
              authMethod === "email"
                ? "border-primary bg-saffron-light text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
            onClick={() => {
              setAuthMethod("email");
              setShowOtp(false);
            }}
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {authMethod === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                {!showOtp ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center rounded-xl border border-border bg-muted px-3 text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="input-glass flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Enter OTP
                    </label>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <input
                          key={i}
                          type="text"
                          maxLength={1}
                          className="input-glass h-12 w-10 text-center text-lg font-semibold"
                          value={otp[i] || ""}
                          onChange={(e) => {
                            const newOtp = otp.split("");
                            newOtp[i] = e.target.value;
                            setOtp(newOtp.join(""));
                            if (e.target.value && e.target.nextElementSibling) {
                              (e.target.nextElementSibling as HTMLInputElement).focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      OTP sent to +91 {phone}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="input-glass"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-glass"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="input-glass pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="btn-saffron flex w-full items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? "Continue" : "Create Account"}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Social auth */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-4 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium transition-colors hover:bg-muted">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium transition-colors hover:bg-muted">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Terms */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="#" className="text-primary underline">
          Terms
        </a>{" "}
        &{" "}
        <a href="#" className="text-primary underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default AuthPage;
