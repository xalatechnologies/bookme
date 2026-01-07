import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VenueDetails } from "./VenueDetails";
import { ActivityCalendar } from "./ActivityCalendar";

export function VenueTabs() {
  return (
    <Tabs defaultValue="oversikt" className="w-full">
      <TabsList className="w-full h-auto p-0 bg-transparent border-b border-border rounded-none justify-start gap-0">
        <TabsTrigger 
          value="oversikt" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-muted-foreground data-[state=active]:text-foreground"
        >
          Oversikt
        </TabsTrigger>
        <TabsTrigger 
          value="aktivitetskalender" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-muted-foreground data-[state=active]:text-foreground"
        >
          Aktivitetskalender
        </TabsTrigger>
        <TabsTrigger 
          value="retningslinjer" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-muted-foreground data-[state=active]:text-foreground"
        >
          Retningslinjer
        </TabsTrigger>
        <TabsTrigger 
          value="faq" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-muted-foreground data-[state=active]:text-foreground"
        >
          Ofte stilte spørsmål
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="oversikt" className="mt-6">
        <VenueDetails />
      </TabsContent>

      <TabsContent value="aktivitetskalender" className="mt-6">
        <ActivityCalendar />
      </TabsContent>
      
      <TabsContent value="retningslinjer" className="mt-6">
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold mb-3">Retningslinjer for bruk</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>Rommet må ryddes etter bruk</li>
            <li>Mat og drikke er tillatt, men må fjernes etterpå</li>
            <li>Utstyr skal behandles med forsiktighet</li>
            <li>Avbestilling må skje senest 24 timer før</li>
          </ul>
        </div>
      </TabsContent>
      
      <TabsContent value="faq" className="mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Hvordan booker jeg rommet?</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Velg ønsket tidspunkt i kalenderen nedenfor og fyll ut bookingskjemaet.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Kan jeg avbestille?</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Ja, avbestilling er gratis inntil 24 timer før booket tid.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
