import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, Heart, Search, Clock, User, 
  MessageCircle, Settings, LogOut, Shield, 
  Users, ChevronDown, Bell
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Heart },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/waitlist", label: "Waitlist", icon: Clock },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className="fixed left-0 right-0 top-0 z-50 hidden md:block"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="glass-card-elevated flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-saffron-glow">
                <Heart className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-gradient-saffron">Jain Jodi</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 rounded-xl bg-saffron-light"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </button>

              {/* Messages */}
              <Link
                to="/chat"
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl bg-muted/50 py-2 pl-2 pr-3 transition-colors hover:bg-muted"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-sage">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
                    >
                      <div className="border-b border-border p-4">
                        <p className="font-medium">Rahul Jain</p>
                        <p className="text-sm text-muted-foreground">Premium Member</p>
                      </div>
                      <div className="p-2">
                        <Link to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted">
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                        <Link to="/trust-safety" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted">
                          <Shield className="h-4 w-4" /> Trust & Safety
                        </Link>
                        <Link to="/family-mode" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted">
                          <Users className="h-4 w-4" /> Family Mode
                        </Link>
                        <Link to="/premium" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted">
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <hr className="my-2 border-border" />
                        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Header */}
      <motion.nav
        className="fixed left-0 right-0 top-0 z-50 md:hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur-lg">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-saffron-glow">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gradient-saffron">Jain Jodi</span>
          </Link>

          <div className="flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-lg"
            >
              <div className="space-y-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-saffron-light text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <User className="h-5 w-5" /> My Profile
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <MessageCircle className="h-5 w-5" /> Messages
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
