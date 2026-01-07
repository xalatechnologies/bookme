import { 
  Monitor, 
  Presentation, 
  Wifi, 
  Coffee, 
  Video, 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  MapPin,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const facilities = [
  { icon: Presentation, label: "Projektor" },
  { icon: Monitor, label: "Tavle" },
  { icon: Wifi, label: "WiFi" },
  { icon: Coffee, label: "Kaffe/te" },
  { icon: Video, label: "Video konferanse" },
];

const additionalServices = [
  { label: "Ekstra tid", description: "Forleng bookingen med 30 minutter", price: "+200 kr" },
  { label: "Utstyr", description: "Inkluderer ballnett, musikanlegg og annet utstyr", price: "+150 kr" },
  { label: "Vaktmesterhjelp", description: "Hjelp med oppsett og nedrigg av utstyr", price: "+300 kr" },
  { label: "Sikkerhet", description: "Vaktmester til stede under hele arrangementet", price: "+500 kr" },
];

const openingHours = [
  { day: "Mandag-Fredag", hours: "08:00 - 22:00" },
  { day: "Lørdag", hours: "09:00 - 20:00" },
  { day: "Søndag", hours: "10:00 - 18:00" },
];

export function VenueDetails() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Beskrivelse</h3>
          <p className="text-muted-foreground">
            Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for 
            bedriftsmøter og presentasjoner.
          </p>
        </div>

        {/* Capacity */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Kapasitet</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>Maks tillatt: 25 personer</span>
          </div>
        </div>

        {/* Facilities */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Fasiliteter</h3>
          <div className="grid grid-cols-2 gap-3">
            {facilities.map((facility) => (
              <div 
                key={facility.label}
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-secondary-foreground"
              >
                <facility.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{facility.label}</span>
              </div>
            ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Tilleggstjenester</h3>
            <div className="space-y-2">
              {additionalServices.map((service) => (
                <div 
                  key={service.label}
                  className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">{service.label}</span>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">{service.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
      <div className="space-y-6">
        {/* Contact info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Kontaktinformasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">E-post</div>
                <a href="mailto:kontakt@digilist.no" className="text-primary hover:underline">
                  kontakt@digilist.no
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Telefon</div>
                <a href="tel:+4712345678" className="text-primary hover:underline">
                  +47 12 34 56 78
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lokasjon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2006.1234567890!2d10.2134567!3d59.7456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTnCsDQ0JzQ0LjQiTiAxMMKwMTInNDguNCJF!5e0!3m2!1sno!2sno!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kart over lokasjon"
              />
            </div>
          </CardContent>
        </Card>

        {/* Opening hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Åpningstider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openingHours.map((item) => (
                <div key={item.day} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.day}</span>
                  <span className="font-medium text-primary">{item.hours}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
