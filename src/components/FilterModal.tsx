import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    ageRange: [number, number];
    locations: string[];
    sects: string[];
    dietary: string[];
  };
  onApply: (filters: FilterModalProps["filters"]) => void;
}

const LOCATIONS = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Ahmedabad",
  "Pune",
  "Jaipur",
  "Surat",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Udaipur",
  "Jodhpur",
];

const SECTS = [
  "Digambar",
  "Shwetambar",
  "Shwetambar Murtipujak",
  "Shwetambar Sthanakvasi",
  "Shwetambar Terapanthi",
];

const DIETARY = [
  "Strict Jain (No root vegetables)",
  "Jain Vegetarian",
  "Vegetarian",
  "Flexible",
];

const FilterModal = ({ open, onOpenChange, filters, onApply }: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleReset = () => {
    setLocalFilters({
      ageRange: [18, 50],
      locations: [],
      sects: [],
      dietary: [],
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const FilterSection = ({
    title,
    id,
    children,
    count,
  }: {
    title: string;
    id: string;
    children: React.ReactNode;
    count?: number;
  }) => (
    <div className="border-b border-border">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-foreground">
          {title}
          {count && count > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            expandedSection === id ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const CheckboxOption = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {checked && <Check className="h-3 w-3" />}
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="font-serif text-2xl font-light">Filters</span>
            <button
              onClick={handleReset}
              className="text-sm font-normal text-primary hover:underline"
            >
              Reset all
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Age Range */}
          <FilterSection title="Age Range" id="age">
            <div className="px-2">
              <div className="mb-4 flex justify-between text-sm text-muted-foreground">
                <span>{localFilters.ageRange[0]} years</span>
                <span>{localFilters.ageRange[1]} years</span>
              </div>
              <Slider
                value={localFilters.ageRange}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, ageRange: value as [number, number] })
                }
                min={18}
                max={60}
                step={1}
                className="w-full"
              />
            </div>
          </FilterSection>

          {/* Location */}
          <FilterSection title="Location" id="location" count={localFilters.locations.length}>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {LOCATIONS.map((location) => (
                <CheckboxOption
                  key={location}
                  label={location}
                  checked={localFilters.locations.includes(location)}
                  onChange={() =>
                    setLocalFilters({
                      ...localFilters,
                      locations: toggleArrayItem(localFilters.locations, location),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          {/* Sect */}
          <FilterSection title="Sect" id="sect" count={localFilters.sects.length}>
            <div className="space-y-1">
              {SECTS.map((sect) => (
                <CheckboxOption
                  key={sect}
                  label={sect}
                  checked={localFilters.sects.includes(sect)}
                  onChange={() =>
                    setLocalFilters({
                      ...localFilters,
                      sects: toggleArrayItem(localFilters.sects, sect),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          {/* Dietary */}
          <FilterSection title="Dietary Preference" id="dietary" count={localFilters.dietary.length}>
            <div className="space-y-1">
              {DIETARY.map((diet) => (
                <CheckboxOption
                  key={diet}
                  label={diet}
                  checked={localFilters.dietary.includes(diet)}
                  onChange={() =>
                    setLocalFilters({
                      ...localFilters,
                      dietary: toggleArrayItem(localFilters.dietary, diet),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full border border-border py-3 font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 rounded-full bg-foreground py-3 font-medium text-background transition-opacity hover:opacity-90"
          >
            Apply Filters
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
