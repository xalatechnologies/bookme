import { cn } from "@/lib/utils";

interface LegendItem {
  label: string;
  colorClass: string;
  borderClass?: string;
}

const legendItems: LegendItem[] = [
  { label: "Ledig", colorClass: "bg-[hsl(var(--slot-available))]" },
  { label: "Opptatt", colorClass: "bg-[hsl(var(--slot-booked))]" },
  { label: "Valgt", colorClass: "bg-[hsl(var(--slot-selected))]", borderClass: "ring-2 ring-[hsl(var(--slot-selected))] ring-offset-1" },
  { label: "Ikke tilgjengelig", colorClass: "bg-[hsl(var(--slot-unavailable))]" },
];

export function SlotLegend() {
  return (
    <div className="flex flex-wrap items-center gap-6 p-4 bg-white rounded-xl border border-border shadow-sm">
      <span className="text-sm font-semibold text-foreground">Forklaring</span>
      <div className="flex flex-wrap items-center gap-4">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn(
              "w-5 h-5 rounded-md",
              item.colorClass,
              item.borderClass
            )} />
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
