import { Heart, Share2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function VenueHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <Badge variant="secondary" className="mb-2">Møterom</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bragernes Møterom</h1>
        <div className="flex items-center gap-1 text-muted-foreground mt-1">
          <MapPin className="h-4 w-4" />
          <span>Nedre Storgate 15</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Heart className="h-4 w-4" />
          Lik
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Del
        </Button>
      </div>
    </div>
  );
}
