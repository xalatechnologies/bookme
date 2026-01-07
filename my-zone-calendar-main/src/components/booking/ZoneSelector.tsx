import { cn } from "@/lib/utils";
import { Zone } from "@/types/booking";
import { Users } from "lucide-react";

interface ZoneSelectorProps {
  zones: Zone[];
  selectedZone: string;
  onZoneSelect: (zoneId: string) => void;
}

export function ZoneSelector({ zones, selectedZone, onZoneSelect }: ZoneSelectorProps) {
  const getZoneColorClasses = (zone: Zone, isSelected: boolean) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border-2";
    
    if (isSelected) {
      switch (zone.color) {
        case 'a':
          return cn(baseClasses, "bg-zone-a text-white border-zone-a shadow-md");
        case 'b':
          return cn(baseClasses, "bg-zone-b text-white border-zone-b shadow-md");
        case 'c':
          return cn(baseClasses, "bg-zone-c text-white border-zone-c shadow-md");
      }
    }
    
    return cn(baseClasses, "bg-card text-foreground border-border hover:border-muted-foreground/30");
  };

  return (
    <div className="flex flex-wrap gap-3">
      {zones.map((zone) => (
        <button
          key={zone.id}
          onClick={() => onZoneSelect(zone.id)}
          className={getZoneColorClasses(zone, selectedZone === zone.id)}
        >
          <Users className="w-4 h-4" />
          <span>{zone.name}</span>
          <span className={cn(
            "px-2 py-0.5 rounded text-xs",
            selectedZone === zone.id 
              ? "bg-white/20" 
              : "bg-muted"
          )}>
            {zone.size}
          </span>
        </button>
      ))}
    </div>
  );
}
