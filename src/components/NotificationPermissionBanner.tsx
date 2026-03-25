import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const DISMISSED_KEY = "notification_banner_dismissed";

const NotificationPermissionBanner = () => {
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  });

  if (!isSupported || permission === "granted" || permission === "denied" || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      handleDismiss();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed left-0 right-0 top-20 z-40 mx-auto max-w-md px-4 md:top-24"
      >
        <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Enable Notifications</p>
            <p className="text-xs text-muted-foreground">Get alerts for new matches and messages</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPermissionBanner;
