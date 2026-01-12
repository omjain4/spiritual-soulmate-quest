import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, MapPin, Users, Leaf, Heart } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferencesStepProps {
  preferences: {
    minAge: number;
    maxAge: number;
    preferredGender: string;
    preferredLocations: string[];
    preferredSects: string[];
    preferredDietary: string[];
    excludeGotra: boolean;
  };
  onPreferencesChange: (prefs: PreferencesStepProps['preferences']) => void;
}

const sects = [
  { id: "digambar", title: "Digambar" },
  { id: "shwetambar-sthanakvasi", title: "Shwetambar - Sthanakvasi" },
  { id: "shwetambar-murtipujak", title: "Shwetambar - Murtipujak" },
  { id: "shwetambar-terapanthi", title: "Shwetambar - Terapanthi" },
];

const dietaryOptions = [
  { id: "strict-jain", label: "Strict Jain (No root vegetables)" },
  { id: "jain-veg", label: "Jain Vegetarian" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "flexible", label: "Flexible" },
];

const locations = [
  "Mumbai, Maharashtra",
  "Ahmedabad, Gujarat",
  "Bangalore, Karnataka",
  "Delhi NCR",
  "Jaipur, Rajasthan",
  "Pune, Maharashtra",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
];

const PreferencesStep = ({ preferences, onPreferencesChange }: PreferencesStepProps) => {
  const handleAgeChange = (values: number[]) => {
    onPreferencesChange({
      ...preferences,
      minAge: values[0],
      maxAge: values[1],
    });
  };

  const handleSectToggle = (sectId: string) => {
    const current = preferences.preferredSects;
    const updated = current.includes(sectId)
      ? current.filter(s => s !== sectId)
      : [...current, sectId];
    onPreferencesChange({ ...preferences, preferredSects: updated });
  };

  const handleDietaryToggle = (dietaryId: string) => {
    const current = preferences.preferredDietary;
    const updated = current.includes(dietaryId)
      ? current.filter(d => d !== dietaryId)
      : [...current, dietaryId];
    onPreferencesChange({ ...preferences, preferredDietary: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Your Preferences
          </h2>
        </div>
        <p className="text-muted-foreground">
          Help us find your perfect match
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
        {/* Age Range */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-primary" />
            Age Range: {preferences.minAge} - {preferences.maxAge} years
          </Label>
          <Slider
            value={[preferences.minAge, preferences.maxAge]}
            onValueChange={handleAgeChange}
            min={18}
            max={60}
            step={1}
            className="py-4"
          />
        </div>

        {/* Gender Preference */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Looking for
          </Label>
          <Select
            value={preferences.preferredGender}
            onValueChange={(value) => onPreferencesChange({ ...preferences, preferredGender: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="any">Any</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Preferences */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Preferred Locations
          </Label>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  const current = preferences.preferredLocations;
                  const updated = current.includes(loc)
                    ? current.filter(l => l !== loc)
                    : [...current, loc];
                  onPreferencesChange({ ...preferences, preferredLocations: updated });
                }}
                className={`rounded-full px-3 py-1.5 text-sm transition-all ${
                  preferences.preferredLocations.includes(loc)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {loc.split(",")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Sect Preferences */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            🙏 Preferred Sects
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sects.map((sect) => (
              <button
                key={sect.id}
                onClick={() => handleSectToggle(sect.id)}
                className={`rounded-xl border p-3 text-left text-sm transition-all ${
                  preferences.preferredSects.includes(sect.id)
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {sect.title}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            Dietary Preferences
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dietaryOptions.map((diet) => (
              <button
                key={diet.id}
                onClick={() => handleDietaryToggle(diet.id)}
                className={`rounded-xl border p-3 text-left text-sm transition-all ${
                  preferences.preferredDietary.includes(diet.id)
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gotra Exclusion */}
        <div className="flex items-center space-x-3 rounded-xl bg-muted/50 p-4">
          <Checkbox
            id="excludeGotra"
            checked={preferences.excludeGotra}
            onCheckedChange={(checked) => 
              onPreferencesChange({ ...preferences, excludeGotra: checked as boolean })
            }
          />
          <div>
            <Label htmlFor="excludeGotra" className="cursor-pointer font-medium">
              Exclude same Gotra
            </Label>
            <p className="text-xs text-muted-foreground">
              Filter out profiles with the same Gotra as yours
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PreferencesStep;
