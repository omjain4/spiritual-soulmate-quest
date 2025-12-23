import { motion } from "framer-motion";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  authRequired?: boolean;
}

interface BottomNavProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

const BottomNav = ({ activeId, onNavigate }: BottomNavProps) => {
  const { isAuthenticated } = useAuth();

  const navItems: NavItem[] = isAuthenticated 
    ? [
        { id: "discover", icon: <Search className="h-6 w-6" />, label: "Discover" },
        { id: "likes", icon: <Heart className="h-6 w-6" />, label: "Likes" },
        { id: "messages", icon: <MessageCircle className="h-6 w-6" />, label: "Chat" },
        { id: "profile", icon: <User className="h-6 w-6" />, label: "Profile" },
      ]
    : [
        { id: "home", icon: <Home className="h-6 w-6" />, label: "Home" },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors",
              activeId === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeId === item.id && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute inset-0 rounded-xl bg-rose-light"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.icon}</span>
            <span className="relative z-10 text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
