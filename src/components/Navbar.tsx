import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, Heart, Search, Clock, User, 
  MessageCircle, Shield, Users, Bell, LogOut, LogIn
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, Notification } from "@/hooks/useNotifications";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const isHomePage = location.pathname === "/";

  // Get profile picture - use first photo or avatar_url
  const profilePicture = profile?.photos?.[profile?.main_photo_index || 0] 
    || profile?.avatar_url 
    || "/placeholder.svg";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleProfileClick = () => navigate("/profile");

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setNotificationsOpen(false);
    
    if (notification.type === "message" && notification.conversation_id) {
      navigate("/chat");
    } else if (notification.type === "like" || notification.type === "super_like") {
      navigate("/likes");
    } else if (notification.type === "match") {
      navigate("/likes");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
      case "super_like":
        return "💕";
      case "match":
        return "🎉";
      case "message":
        return "💬";
      default:
        return "🔔";
    }
  };

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

  const navbarBg = isHomePage && !scrolled ? "bg-transparent" : "bg-background/80 backdrop-blur-xl border-b border-border/50";
  const textColor = isHomePage && !scrolled ? "text-white" : "text-foreground";
  const logoColor = isHomePage && !scrolled ? "text-white" : "text-foreground";

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
          <Link to="/" className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isHomePage && !scrolled ? "bg-white/10 backdrop-blur-sm" : "bg-primary/10"}`}>
              <Heart className={`h-5 w-5 ${isHomePage && !scrolled ? "text-white" : "text-primary"}`} fill="currentColor" />
            </div>
            <span className={`font-serif text-xl font-light ${logoColor}`}>Jain Jodi</span>
          </Link>

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

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isHomePage && !scrolled ? "bg-white/10 text-white hover:bg-white/20" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
                      >
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                          <h3 className="font-medium text-foreground">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${!notification.is_read ? "bg-primary/5" : ""}`}
                              >
                                <div className="relative flex-shrink-0">
                                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                                    {notification.from_user?.photos?.[0] ? (
                                      <img src={notification.from_user.photos[0]} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                    )}
                                  </div>
                                  {!notification.is_read && (
                                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                  <p className="truncate text-xs text-muted-foreground">{notification.description}</p>
                                  <p className="mt-1 text-xs text-muted-foreground/70">{formatTimeAgo(notification.created_at)}</p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
                          )}
                        </div>
                        <Link
                          to="/likes"
                          onClick={() => setNotificationsOpen(false)}
                          className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-primary hover:bg-muted/50"
                        >
                          View all activity
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/chat"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isHomePage && !scrolled ? "bg-white/10 text-white hover:bg-white/20" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>

                <button
                  onClick={handleProfileClick}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/20 transition-transform hover:scale-105"
                >
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </button>

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
                  isHomePage && !scrolled ? "bg-white text-foreground" : "bg-foreground text-background"
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
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full ${isHomePage && !scrolled ? "bg-white/10 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h3 className="font-medium text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50 ${!notification.is_read ? "bg-primary/5" : ""}`}
                            >
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                                {notification.from_user?.photos?.[0] ? (
                                  <img src={notification.from_user.photos[0]} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-base">{getNotificationIcon(notification.type)}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{notification.description}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-9 w-9 items-center justify-center rounded-full ${isHomePage && !scrolled ? "bg-white/10 text-white" : "bg-muted text-foreground"}`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

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
                      isActive(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <hr className="my-3 border-border" />
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                      <User className="h-5 w-5" /> My Profile
                    </Link>
                    <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                      <MessageCircle className="h-5 w-5" /> Messages
                    </Link>
                    <Link to="/trust-safety" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                      <Shield className="h-5 w-5" /> Trust & Safety
                    </Link>
                    <hr className="my-3 border-border" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10">
                      <LogOut className="h-5 w-5" /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-3 border-border" />
                    <Link to="/trust-safety" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                      <Shield className="h-5 w-5" /> Trust & Safety
                    </Link>
                    <Link to="/family-mode" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                      <Users className="h-5 w-5" /> Family Mode
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mt-4 flex items-center justify-center gap-2 rounded-full bg-foreground py-3 font-medium text-background"
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
