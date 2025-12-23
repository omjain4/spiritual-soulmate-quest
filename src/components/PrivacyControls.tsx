import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Briefcase, 
  Image, 
  Lock, 
  Unlock, 
  ChevronRight,
  Check
} from "lucide-react";
import GlassCard from "./GlassCard";

interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface PrivacyControlsProps {
  onSave?: (settings: Record<string, boolean>) => void;
}

const PrivacyControls = ({ onSave }: PrivacyControlsProps) => {
  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: "hide_photos",
      label: "Hide Photos",
      description: "Only vetted matches can see your photos",
      icon: <Image className="h-5 w-5" />,
      enabled: false,
    },
    {
      id: "hide_workplace",
      label: "Hide Workplace",
      description: "Don't show where you work publicly",
      icon: <Briefcase className="h-5 w-5" />,
      enabled: true,
    },
    {
      id: "hide_location",
      label: "Approximate Location",
      description: "Show city only, not exact location",
      icon: <Eye className="h-5 w-5" />,
      enabled: true,
    },
    {
      id: "verified_only",
      label: "Verified Matches Only",
      description: "Only show to verified profiles",
      icon: <Shield className="h-5 w-5" />,
      enabled: false,
    },
  ]);

  const [expanded, setExpanded] = useState(false);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = () => {
    const settingsMap = settings.reduce(
      (acc, s) => ({ ...acc, [s.id]: s.enabled }),
      {}
    );
    onSave?.(settingsMap);
  };

  const enabledCount = settings.filter((s) => s.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-light">
            <Shield className="h-5 w-5 text-sage-dark" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Privacy Shield</h3>
            <p className="text-xs text-muted-foreground">
              {enabledCount} of {settings.length} protections active
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Settings List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <GlassCard className="space-y-3">
              {settings.map((setting, index) => (
                <motion.div
                  key={setting.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        setting.enabled ? "bg-sage-light text-sage-dark" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {setting.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      setting.enabled ? "bg-sage" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
                      animate={{ left: setting.enabled ? "calc(100% - 26px)" : "2px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {setting.enabled ? (
                        <Lock className="m-1 h-4 w-4 text-sage" />
                      ) : (
                        <Unlock className="m-1 h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  </button>
                </motion.div>
              ))}

              <motion.button
                onClick={handleSave}
                className="btn-sage flex w-full items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="h-4 w-4" />
                Save Privacy Settings
              </motion.button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrivacyControls;
