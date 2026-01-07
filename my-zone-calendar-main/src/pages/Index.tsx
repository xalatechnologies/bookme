import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ImageGallery } from "@/components/venue/ImageGallery";
import { VenueHeader } from "@/components/venue/VenueHeader";
import { VenueTabs } from "@/components/venue/VenueTabs";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

const breadcrumbItems = [
  { label: "Lokaler", href: "/lokaler" },
  { label: "Bragernes Møterom" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Image Gallery */}
        <ImageGallery />
        
        {/* Venue Header */}
        <VenueHeader />
        
        {/* Tabs with content */}
        <VenueTabs />
        
        {/* Booking Calendar */}
        <div className="pt-4 border-t border-border">
          <BookingCalendar />
        </div>
      </main>
    </div>
  );
};

export default Index;
