import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Check if on homepage for transparent navbar
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        { href: "/likes", label: "Likes", icon: Heart },
        { href: "/waitlist", label: "Waitlist", icon: Clock },
      ]
    : [
        { href: "/about", label: "About", icon: Heart },
        { href: "/how-it-works", label: "How It Works", icon: Heart },
      ];

  // Navbar style based on scroll and page
  const navbarBg = isHomePage && !scrolled 
    ? "bg-transparent" 
    : "bg-background/80 backdrop-blur-xl border-b border-border/50";

  const textColor = isHomePage && !scrolled 
    ? "text-white" 
    : "text-foreground";

  const logoColor = isHomePage && !scrolled 
    ? "text-white" 
    : "text-foreground";

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={`fixed left-0 right-0 top-0 z-50 hidden transition-all duration-300 md:block ${navbarBg}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isHomePage && !scrolled ? "bg-white/10 backdrop-blur-sm" : "bg-primary/10"}`}>
              <Heart className={`h-5 w-5 ${isHomePage && !scrolled ? "text-white" : "text-primary"}`} fill="currentColor" />
            </div>
            <span className={`font-serif text-xl font-light ${logoColor}`}>Jain Jodi</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? isHomePage && !scrolled ? "text-white" : "text-primary"
                    : isHomePage && !scrolled ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="navIndicator"
                    className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full ${isHomePage && !scrolled ? "bg-white" : "bg-primary"}`}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isHomePage && !scrolled ? "bg-white/10 text-white hover:bg-white/20" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                </button>

                {/* Messages */}
                <Link
                  to="/chat"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isHomePage && !scrolled ? "bg-white/10 text-white hover:bg-white/20" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>

                {/* Profile */}
                <button
                  onClick={handleProfileClick}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/20 transition-transform hover:scale-105"
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
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isHomePage && !scrolled ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-destructive"}`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all hover:scale-105 ${
                  isHomePage && !scrolled 
                    ? "bg-white text-foreground" 
                    : "bg-foreground text-background"
                }`}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Header */}
      <motion.nav
        className={`fixed left-0 right-0 top-0 z-50 md:hidden transition-all duration-300 ${navbarBg}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isHomePage && !scrolled ? "bg-white/10" : "bg-primary/10"}`}>
              <Heart className={`h-4 w-4 ${isHomePage && !scrolled ? "text-white" : "text-primary"}`} fill="currentColor" />
            </div>
            <span className={`font-serif text-lg font-light ${logoColor}`}>Jain Jodi</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button className={`relative flex h-9 w-9 items-center justify-center rounded-full ${isHomePage && !scrolled ? "bg-white/10 text-white" : "bg-muted text-muted-foreground"}`}>
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-9 w-9 items-center justify-center rounded-full ${isHomePage && !scrolled ? "bg-white/10 text-white" : "bg-muted text-foreground"}`}
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
              className="overflow-hidden border-b border-border bg-background"
            >
              <div className="space-y-1 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <hr className="my-3 border-border" />
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
                    <hr className="my-3 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-3 border-border" />
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
                    >
                      <LogIn className="h-5 w-5" /> Get Started
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