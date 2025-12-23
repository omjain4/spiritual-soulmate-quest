import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, Heart, Search, Clock, User, 
  MessageCircle, Shield, Users, Bell, LogOut, LogIn
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  // Nav links based on auth state
  const navLinks = isAuthenticated
    ? [
        { href: "/discover", label: "Discover", icon: Search },
        { href: "/waitlist", label: "Waitlist", icon: Clock },
      ]
    : [{ href: "/", label: "Home", icon: Heart }];

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
              {isAuthenticated ? (
                <>
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

                  {/* Profile */}
                  <button
                    onClick={handleProfileClick}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-sage transition-transform hover:scale-105"
                  >
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="btn-saffron flex items-center gap-2 px-4 py-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
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
        <div className="flex items-center justify-between bg-background/90 px-4 py-3 backdrop-blur-lg">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-saffron-glow">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gradient-saffron">Jain Jodi</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
            )}
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

                {isAuthenticated ? (
                  <>
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
                    <Link
                      to="/trust-safety"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      <Shield className="h-5 w-5" /> Trust & Safety
                    </Link>
                    <Link
                      to="/family-mode"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      <Users className="h-5 w-5" /> Family Mode
                    </Link>
                    <hr className="my-2 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-2 border-border" />
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                    >
                      <LogIn className="h-5 w-5" /> Login / Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
